import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { pointsData } from "./points"; 
import { points2EIA, AREAS_2EIA, LIMITS_2EIA_GEOJSON } from "./points2EIA";
import './App.css';

const API_KEYS = ["YHlTRP429Wo5PZXGJklr", "YS0YNd7SKoqGfXhdY8Bx", "R13imFP2SenJH9JsgVkN"];
const INITIAL_CENTER = [-47.6, -22.0];
const MAP_DECLINATION = 20;

const normalize = (s) => {
  try { return String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase(); }
  catch (e) { return String(s || '').toLowerCase(); }
};

const getPointsByKeyword = (keyword) => pointsData.filter(p => normalize(p.info).includes(normalize(keyword))).map(p => p.name);

const AREAS = {
  Capricornio: getPointsByKeyword('Capricornio'), 
  Aquarius: getPointsByKeyword('Aquarius'), 
  Peixes: getPointsByKeyword('Peixes'),
  Taurus: getPointsByKeyword('Taurus'),
  Tobogã: getPointsByKeyword('Tobogã'),
  'Capricórnio W': getPointsByKeyword('Capricórnio W'),
  'Aquárius W': getPointsByKeyword('Aquárius W'),
  'Peixes W': getPointsByKeyword('Peixes W'),
  'Libra Alta': getPointsByKeyword('Libra Alta'),
  'Virgem Alta': getPointsByKeyword('Virgem Alta'),
  'Gêmeos Alta': getPointsByKeyword('Gêmeos Alta'),
  'Tráfego AFA': getPointsByKeyword('Tráfego AFA')
};

const AREA_LIMITS = {
  Capricornio: ['Trevo Aguaí Anhanguera', 'Leme', 'Araras', 'Cordeirópolis', 'Ipeúna', 'Lagoa na SP-225', 'Itirapina', 'Analândia'],
  Aquarius: ['Trevo Aguaí Anhanguera', 'Analândia', 'Itirapina', 'Lagoa na SP-225', 'Fazenda Brotas', 'Américo Brasiliense', 'Descalvado', 'Porto Ferreira'],
  Peixes: ['Porto Ferreira', 'Pedágio São Simão', 'Rincão', 'Américo Brasiliense', 'Descalvado'],
  Taurus: ['Porto Ferreira', 'Pedágio São Simão', 'Santa Cruz da Esperança', 'Fazenda da Serra', 'Mococa', 'Santa Rosa do Viterbo', 'Santa Rita do Passa Quatro'],
  Tobogã: ['Trevo Aguaí Anhanguera', 'Analândia', 'Descalvado', 'Porto Ferreira'],
  'Capricórnio W': ['Cordeirópolis', 'Ipeúna', 'Lagoa na SP-225', 'Brotas', 'Iracemápolis'],
  'Aquárius W': ['Lagoa na SP-225', 'Brotas', 'Matão', 'Araraquara', 'Américo Brasiliense', 'Fazenda Brotas'],
  'Peixes W': ['Pedágio São Simão', 'Guatapará', 'Matão', 'Araraquara', 'Américo Brasiliense', 'Rincão'],
  'Libra Alta': ['Santa Cruz das Palmeiras', 'Tambaú', 'Santa Rosa do Viterbo', 'Mococa', 'São Sebastião da Grama', 'Casa Branca'],
  'Virgem Alta': ['Santa Cruz das Palmeiras', 'Casa Branca', 'São Sebastião da Grama', 'São João da Boa Vista', 'Aguaí', 'Ponte na Aguaí sobre Rio Mogi'],
  'Gêmeos Alta': ['Ponte na Aguaí sobre Rio Mogi', 'Casa Branca', 'São João da Boa Vista', 'Mogi-guaçu', 'Conchal']
};

const STATIC_ROUTES = { /* Mantendo padrão original para não quebrar limites antigos */
  '30-52': [[-47.4721, -21.8490], [-47.4824, -21.8350], [-47.4851, -21.8317], [-47.4863, -21.8300], [-47.4876, -21.8282], [-47.4882, -21.8274], [-47.4890, -21.8265], [-47.4897, -21.8257], [-47.4903, -21.8248], [-47.4910, -21.8239], [-47.4918, -21.8231], [-47.4924, -21.8225], [-47.4929, -21.8216], [-47.4933, -21.8211], [-47.4937, -21.8205], [-47.4946, -21.8196], [-47.4956, -21.8187], [-47.4965, -21.8178], [-47.4967, -21.8174], [-47.4970, -21.8168], [-47.4973, -21.8158], [-47.4976, -21.8138], [-47.5017, -21.8066], [-47.5071, -21.8001], [-47.5145, -21.7944], [-47.5705, -21.7509], [-47.5817, -21.7389], [-47.5882, -21.7228], [-47.5989, -21.6928], [-47.6043, -21.6777], [-47.6071, -21.6700], [-47.6084, -21.6622], [-47.6108, -21.6463], [-47.6136, -21.6308], [-47.6155, -21.6199], [-47.6163, -21.6133], [-47.6181, -21.6088], [-47.6284, -21.5785], [-47.6380, -21.5516], [-47.6425, -21.5245], [-47.6398, -21.4714], [-47.6495, -21.4424], [-47.6543, -21.4273], [-47.6643, -21.4144]]
};

const getAreaColor = (areaName) => {
  if (areaName.includes('W')) return '#9c27b0';
  if (areaName.includes('Alta')) return '#f44336';
  return '#2196f3';
};

export default function App() {
  const [selectedSquadron, setSelectedSquadron] = useState(null); // '1EIA' ou '2EIA'
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef(new Map());
  
  const compassPointerRef = useRef(null);
  const bearingTextRef = useRef(null);
  const pitchInputRef = useRef(null);
  const bearingInputRef = useRef(null);

  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [mapError, setMapError] = useState(false);
  const activeKey = API_KEYS[currentKeyIndex];

  const [guessed, setGuessed] = useState([]);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [answer, setAnswer] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [randomMode, setRandomMode] = useState(false);
  const [areaMode, setAreaMode] = useState(false);
  const [randomAreaSequence, setRandomAreaSequence] = useState(false);
  const [blindMode, setBlindMode] = useState(false);
  const [showTerrain, setShowTerrain] = useState(false);
  const [boundaryMode, setBoundaryMode] = useState('progressive'); 
  const [showKey, setShowKey] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [hintTrigger, setHintTrigger] = useState(0);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  
  // Controle Seguro de Dados: Previne crash se o import do points2EIA.js falhar
  const activePointsData = (selectedSquadron === '1EIA' ? pointsData : points2EIA) || [];
  const activeAreas = (selectedSquadron === '1EIA' ? AREAS : AREAS_2EIA) || {};
  const areaList = Object.keys(activeAreas);

  const [selectedArea, setSelectedArea] = useState('');
  const [areaIndex, setAreaIndex] = useState(0);
  const [areaPointIndex, setAreaPointIndex] = useState(0);
  const [areaQueue, setAreaQueue] = useState([]);

  const normalizeStr = (s) => {
    try { return String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase(); }
    catch (e) { return String(s || '').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase(); }
  };

  const nameToPointId = useCallback((name) => {
    const norm = normalizeStr(name);
    const p = activePointsData.find(pt => normalizeStr(pt.name) === norm || (pt.aliases || []).some(a => normalizeStr(a) === norm));
    return p ? p.id : null;
  }, [activePointsData]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
  };

  const getSortedAreaIds = useCallback((areaName) => {
    const allNames = activeAreas[areaName] || [];
    const limitNames = (selectedSquadron === '1EIA' ? AREA_LIMITS[areaName] : []) || [];
    const limitIds = limitNames.map(n => nameToPointId(n)).filter(Boolean);
    const allIds = allNames.map(n => nameToPointId(n)).filter(Boolean);
    const internalIds = allIds.filter(id => !limitIds.includes(id));
    return [...limitIds, ...internalIds];
  }, [nameToPointId, activeAreas, selectedSquadron]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    if(selectedArea) {
      setAreaQueue(getSortedAreaIds(selectedArea));
      setAreaPointIndex(0);
    }
  }, [selectedArea, getSortedAreaIds]);

  useEffect(() => {
    if (!isMapLoaded || !map.current) return;
    map.current.setTerrain(showTerrain ? { 'source': 'terrain', 'exaggeration': 1.1 } : null);
  }, [showTerrain, isMapLoaded]);

  useEffect(() => { 
    if(!selectedSquadron || showIntro) return;
    const id = setInterval(() => setElapsedTime(Math.floor((Date.now() - startTime) / 1000)), 1000); 
    return () => clearInterval(id); 
  }, [startTime, selectedSquadron, showIntro]);

  // Atualização de Limites Geográficos
  useEffect(() => {
    if (!isMapLoaded || !map.current || !selectedSquadron) return;

    if (selectedSquadron === '1EIA') {
        Object.entries(AREA_LIMITS).forEach(([areaName, limitNames]) => {
            const source = map.current.getSource(`source-${areaName}`);
            if (!source) return;
            const limitIds = limitNames.map(name => nameToPointId(name)).filter(Boolean);
            if (limitIds.length < 2) { source.setData({ type: 'FeatureCollection', features: [] }); return; }

            const features = [];
            for (let i = 0; i < limitIds.length; i++) {
                const id1 = limitIds[i]; const id2 = limitIds[(i + 1) % limitIds.length];
                const p1 = activePointsData.find(p => p.id === id1); const p2 = activePointsData.find(p => p.id === id2);

                if (p1 && p2) {
                    let isVisible = boundaryMode === 'all' || (boundaryMode === 'progressive' && guessed.includes(id1) && guessed.includes(id2));
                    if (isVisible) {
                        const routeKey = `${id1}-${id2}`; const reverseRouteKey = `${id2}-${id1}`;
                        let geometryCoordinates = STATIC_ROUTES[routeKey] || (STATIC_ROUTES[reverseRouteKey] ? [...STATIC_ROUTES[reverseRouteKey]].reverse() : [p1.coords, p2.coords]);
                        features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: geometryCoordinates } });
                    }
                }
            }
            source.setData({ 'type': 'FeatureCollection', 'features': features });
        });
    } else if (selectedSquadron === '2EIA') {
        const source2eia = map.current.getSource('source-2eia-limits');
        if (source2eia) {
            let features = [];
            if (boundaryMode !== 'none') {
                 LIMITS_2EIA_GEOJSON.forEach(coords => {
                     features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords } });
                 });
            }
            source2eia.setData({ 'type': 'FeatureCollection', 'features': features });
        }
    }
  }, [isMapLoaded, guessed, boundaryMode, nameToPointId, selectedSquadron, activePointsData]);

  // Inicialização do Mapa
  useEffect(() => {
    if (mapError || !selectedSquadron) return; 
    if (map.current) { map.current.remove(); map.current = null; setIsMapLoaded(false); }

    const initMap = async () => {
      try {
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: `https://api.maptiler.com/maps/satellite/style.json?key=${activeKey}`,
          center: INITIAL_CENTER,
          zoom: 8.5,
          pitch: 60,
          bearing: 130 - MAP_DECLINATION,
          maxPitch: 85, 
        });

        map.current.on('error', (e) => {
            if (e.error && (e.error.status === 403 || e.error.status === 429 || e.error.message?.includes('Forbidden'))) {
                if (currentKeyIndex < API_KEYS.length - 1) setCurrentKeyIndex(prev => prev + 1);
                else setMapError(true);
            }
        });

        map.current.on('load', () => {
          map.current.addSource('terrain', { "type": "raster-dem", "url": `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${activeKey}`, "tileSize": 512 });

          if (selectedSquadron === '1EIA') {
              Object.keys(AREA_LIMITS).forEach(areaName => {
                  map.current.addSource(`source-${areaName}`, { 'type': 'geojson', 'data': { 'type': 'FeatureCollection', 'features': [] } });
                  map.current.addLayer({
                    'id': `layer-${areaName}`, 'type': 'line', 'source': `source-${areaName}`,
                    'layout': { 'line-join': 'round', 'line-cap': 'round' },
                    'paint': { 'line-color': getAreaColor(areaName), 'line-width': 3, 'line-opacity': 0.6 }
                  });
              });
          } else if (selectedSquadron === '2EIA') {
              map.current.addSource('source-2eia-limits', { 'type': 'geojson', 'data': { 'type': 'FeatureCollection', 'features': [] } });
              map.current.addLayer({
                'id': 'layer-2eia-limits', 'type': 'line', 'source': 'source-2eia-limits',
                'layout': { 'line-join': 'round', 'line-cap': 'round' },
                'paint': { 'line-color': '#d32f2f', 'line-width': 3, 'line-opacity': 0.8 }
              });
          }

          activePointsData.forEach(point => {
            const el = document.createElement('div');
            el.style.cssText = 'width:0px;height:0px;display:flex;align-items:center;justify-content:center;overflow:visible;';
            const content = document.createElement('div');
            content.style.cssText = 'width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;transition:width 0.3s, height 0.3s;';
            const hint = document.createElement('div');
            hint.style.cssText = 'position:absolute;width:100%;height:100%;background-color:rgba(255,255,255,0.8);border-radius:50%;transform:scale(0.5);opacity:0;pointer-events:none;';
            const dot = document.createElement('div');
            dot.style.cssText = 'width:12px;height:12px;background-color:red;border-radius:50%;box-shadow:0 0 5px rgba(0,0,0,0.6);transition:opacity 0.2s ease;';
            
            content.appendChild(hint); content.appendChild(dot); el.appendChild(content);

            content.addEventListener('click', (e) => { e.stopPropagation(); setCurrentPoint(point); setAnswer(''); setFeedback(null); });
            const marker = new maplibregl.Marker({ element: el, anchor: 'center', pitchAlignment: 'viewport', rotationAlignment: 'viewport' }).setLngLat(point.coords).addTo(map.current);

            const labelEl = document.createElement('div');
            labelEl.textContent = point.name;
            labelEl.style.cssText = 'color:white;font-weight:bold;text-shadow:0 0 5px rgba(0,0,0,0.8);white-space:nowrap;pointer-events:none;display:none;padding:2px 6px;border-radius:4px;background:rgba(0,0,0,0.6);';
            const labelMarker = new maplibregl.Marker({ element: labelEl, anchor: 'bottom', pitchAlignment: 'viewport', rotationAlignment: 'viewport' }).setLngLat(point.coords).addTo(map.current);

            markersRef.current.set(point.id, { marker, content, dot, hint, labelMarker, labelEl, point });
          });

          setIsMapLoaded(true);

          map.current.on('move', () => {
            if (!map.current) return;
            const p = Math.round(map.current.getPitch());
            const b = Math.round(((map.current.getBearing() + MAP_DECLINATION) + 360) % 360);
            
            if (pitchInputRef.current) pitchInputRef.current.value = p;
            if (bearingInputRef.current) bearingInputRef.current.value = b;
            if (compassPointerRef.current) compassPointerRef.current.style.transform = `translateX(-50%) rotate(${b}deg)`;
            if (bearingTextRef.current) bearingTextRef.current.innerText = `${b}°`;
          });
        });
      } catch (error) { console.error("Falha ao iniciar mapa:", error); }
    };

    initMap();
    return () => {
      markersRef.current.forEach(({ marker, labelMarker }) => { try { marker.remove(); labelMarker.remove(); } catch (e) {} });
      markersRef.current.clear();
      if (map.current) map.current.remove();
      map.current = null;
    };
  }, [currentKeyIndex, activeKey, selectedSquadron, activePointsData]);

  useEffect(() => {
    if (!isMapLoaded) return;
    markersRef.current.forEach((rec, id) => {
      const { content, dot, hint, labelEl, labelMarker, point } = rec;
      if (!dot || !content) return;
      const isGuessed = guessed.includes(id);
      const isCurrent = currentPoint && currentPoint.id === id;

      dot.style.backgroundColor = isGuessed ? 'green' : (isCurrent ? 'yellow' : (showKey ? 'orange' : 'red'));
      content.style.width = blindMode ? '80px' : '40px';
      content.style.height = blindMode ? '80px' : '40px';
      dot.style.opacity = (blindMode && !isGuessed) ? '0' : '1';

      if (hint) {
          if (isCurrent && hintTrigger > 0) {
              hint.classList.remove('animate-pulse-hint'); void hint.offsetWidth; hint.classList.add('animate-pulse-hint');
          } else { hint.classList.remove('animate-pulse-hint'); }
      }

      if (labelEl) {
        if (isGuessed || showKey) {
          labelEl.style.display = '';
          labelEl.style.fontSize = `${Math.max(10, Math.round((map.current?.getZoom() || 10) * 1.2))}px`;
          labelMarker.setLngLat(point.coords);
        } else { labelEl.style.display = 'none'; }
      }
    });
  }, [guessed, currentPoint, showKey, blindMode, hintTrigger, isMapLoaded]);

  // Controles
  const revealAll = (show) => { setShowKey(show); markersRef.current.forEach((rec) => { if (rec.labelEl) rec.labelEl.style.display = show ? '' : 'none'; }); };
  const resetGame = () => { 
      setGuessed([]); setCurrentPoint(null); setAnswer(''); setFeedback(null); 
      setStartTime(Date.now()); setFinalTime(0); setShowCompletion(false); setShowKey(false); 
      if (map.current) {
          map.current.flyTo({ center: INITIAL_CENTER, zoom: 9.5, pitch: 60, bearing: 130 - MAP_DECLINATION }); 
          if (compassPointerRef.current) compassPointerRef.current.style.transform = `translateX(-50%) rotate(130deg)`;
          if (bearingTextRef.current) bearingTextRef.current.innerText = `130°`;
          if (pitchInputRef.current) pitchInputRef.current.value = 60;
          if (bearingInputRef.current) bearingInputRef.current.value = 130;
      }
      markersRef.current.forEach((rec) => { if (rec.labelEl) rec.labelEl.style.display = 'none'; }); 
  };
  
  const adjustPitch = (val) => { const p = Math.max(0, Math.min(85, Number(val))); if (map.current) map.current.setPitch(p); };
  const adjustBearing = (val) => { const b = (Number(val) + 360) % 360; if (map.current) map.current.setBearing(b - MAP_DECLINATION); };
  
  const startManualMode = () => { setAreaMode(false); setRandomMode(false); };
  const startAreaMode = () => {
    setAreaMode(true); setRandomMode(false);
    const ids = getSortedAreaIds(selectedArea);
    setAreaQueue(ids); setAreaPointIndex(0);
    if (ids.length) { 
        let startP = activePointsData.find(pt => pt.id === (randomAreaSequence ? ids.filter(id => !guessed.includes(id))[0] : ids[0]));
        if (startP) { setCurrentPoint(startP); if (map.current) map.current.flyTo({ center: startP.coords }); }
    }
  };
  const startRandomMode = () => {
    setRandomMode(true); setAreaMode(false);
    if (!currentPoint) {
        const rem = activePointsData.filter(p => !guessed.includes(p.id));
        const next = rem.length ? rem[Math.floor(Math.random() * rem.length)] : null;
        if (next) { setCurrentPoint(next); setAnswer(''); if (map.current) map.current.flyTo({ center: next.coords }); }
    }
  };
  
  const handleCompletion = () => { setFinalTime(elapsedTime); setShowCompletion(true); };

  const moveToPoint = (direction) => {
      if (!currentPoint) return;
      let targetPoint = null;
      const sortedPoints = [...activePointsData].sort((a, b) => a.name.localeCompare(b.name));

      if (areaMode) {
          if (randomAreaSequence && direction === 'next') {
              const rem = areaQueue.filter(id => !guessed.includes(id) && id !== currentPoint.id);
              if (rem.length) targetPoint = activePointsData.find(p => p.id === rem[Math.floor(Math.random() * rem.length)]);
          } else {
              const idx = areaQueue.indexOf(currentPoint.id);
              const newIdx = direction === 'next' ? idx + 1 : idx - 1;
              if (newIdx >= 0 && newIdx < areaQueue.length) {
                  targetPoint = activePointsData.find(p => p.id === areaQueue[newIdx]);
                  setAreaPointIndex(newIdx);
              }
          }
      } else {
          const idx = sortedPoints.findIndex(p => p.id === currentPoint.id);
          const newIdx = direction === 'next' ? (idx === sortedPoints.length - 1 ? 0 : idx + 1) : (idx === 0 ? sortedPoints.length - 1 : idx - 1);
          targetPoint = sortedPoints[newIdx];
      }
      
      if (targetPoint) { setCurrentPoint(targetPoint); setAnswer(''); setFeedback(null); if (map.current) map.current.flyTo({ center: targetPoint.coords }); }
  };

  const checkAnswer = () => {
    const normalized = normalizeStr(answer);
    if (currentPoint && currentPoint.aliases.map(a => normalizeStr(a)).includes(normalized)) {
      setFeedback(null);
      const updated = Array.from(new Set([...guessed, currentPoint.id]));
      setGuessed(updated);
      const rec = markersRef.current.get(currentPoint.id);
      if (rec && rec.labelEl) rec.labelEl.style.display = '';

      if (areaMode && areaQueue.length) {
        let nextPoint = null;
        if (randomAreaSequence) {
            const rem = areaQueue.filter(id => !updated.includes(id));
            if (rem.length) nextPoint = activePointsData.find(p => p.id === rem[Math.floor(Math.random() * rem.length)]);
        } else {
            const nextIdx = areaPointIndex + 1;
            if (nextIdx < areaQueue.length) { setAreaPointIndex(nextIdx); nextPoint = activePointsData.find(p => p.id === areaQueue[nextIdx]); }
        }

        if (nextPoint) {
             setCurrentPoint(nextPoint); setAnswer(''); if (map.current) map.current.flyTo({ center: nextPoint.coords });
        } else {
             const nextAreaIdx = (areaList.indexOf(selectedArea) + 1) % areaList.length;
             setAreaIndex(nextAreaIdx); setSelectedArea(areaList[nextAreaIdx]); 
             const nextIds = getSortedAreaIds(areaList[nextAreaIdx]);
             const avail = nextIds.filter(id => !updated.includes(id));
             if (avail.length) {
                 const firstPoint = activePointsData.find(p => p.id === (randomAreaSequence ? avail[Math.floor(Math.random() * avail.length)] : avail[0]));
                 setCurrentPoint(firstPoint || null); setAnswer(''); if (map.current && firstPoint) map.current.flyTo({ center: firstPoint.coords });
             } else { handleCompletion(); setCurrentPoint(null); }
        }
      } else if (randomMode) {
        const rem = activePointsData.filter(p => !updated.includes(p.id));
        const next = rem.length ? rem[Math.floor(Math.random() * rem.length)] : null;
        if (next) { setCurrentPoint(next); setAnswer(''); if (map.current) map.current.flyTo({ center: next.coords }); }
        else { handleCompletion(); setCurrentPoint(null); setAnswer(''); }
      } else { setCurrentPoint(null); setAnswer(''); }
    } else { setFeedback('error'); }
  };

  useEffect(() => {
      const handleKeyDown = (e) => {
          if (e.key === 'ArrowRight') moveToPoint('next');
          else if (e.key === 'ArrowLeft') moveToPoint('prev');
          else if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); revealAll(!showKey); }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPoint, areaMode, randomAreaSequence, areaQueue, showKey, activePointsData]);

  const missingPoints = activePointsData.filter(p => !guessed.includes(p.id)).sort((a,b)=>a.name.localeCompare(b.name));
  const answeredPoints = activePointsData.filter(p => guessed.includes(p.id)).sort((a,b)=>a.name.localeCompare(b.name));

  // TELA DE SELEÇÃO INICIAL
  if (!selectedSquadron) {
    return (
      <div className="home-screen">
        <h1 className="sq-title">SELECIONE O ESQUADRÃO</h1>
        <button className="sq-btn eia1" onClick={() => { setSelectedSquadron('1EIA'); setSelectedArea(Object.keys(AREAS)[0]); }}>1º EIA</button>
        <button className="sq-btn eia2" onClick={() => { setSelectedSquadron('2EIA'); setSelectedArea(Object.keys(AREAS_2EIA)[0]); }}>2º EIA</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      {mapError && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', textAlign: 'center', padding: '20px' }}>
          <div style={{ background: '#333', padding: '30px', borderRadius: '12px', maxWidth: '400px' }}>
            <h2 style={{ color: '#ff5252', marginTop: 0 }}>⚠️ Erro no Mapa</h2>
            <p>Limite de visualizações excedido.</p>
          </div>
        </div>
      )}

      {showCompletion && (
          <div className="completion-popup">
              <button onClick={() => setShowCompletion(false)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#999' }}>✕</button>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Parabéns! ↗️🔥</div>
              <div style={{ fontSize: '16px', color: '#555' }}>tempo: <b>{formatTime(finalTime)}</b></div>
          </div>
      )}

      {/* TELA DE INTRODUÇÃO E IMAGENS */}
      {showIntro && !mapError && (
        <div style={{ position: 'absolute', inset: 0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', justifyContent:'center', alignItems:'center' }}>
          <div style={{ background:'white', padding:'20px', borderRadius:'10px', width: '90%', maxWidth:'460px', textAlign:'left', lineHeight:1.4 }}>
            <h3 style={{ marginTop: 0, textAlign: 'center' }}>Atalhos do Jogo:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', alignItems: 'center', marginBottom: 20 }}>
                <b>Enter</b><span>Confirmar</span>
                <b>➜</b><span>Próximo</span>
                <b>⬅</b><span>Anterior</span>
                <b>Ctrl + Espaço</b><span>Gabarito</span>
            </div>
            
            <div style={{ fontSize: '14px', fontStyle: 'italic', textAlign: 'center', margin: '20px 0', color: '#555' }}>
               "Mil cairão ao teu lado, e dez mil à tua direita..."
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '20px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src="URL_FOTO_MOTA_AQUI" alt="Mota" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#eee' }} />
                  <span style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '6px' }}>#MOTA</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src="URL_FOTO_SIRIUS_AQUI" alt="Sirius 11" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#eee' }} />
                  <span style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '6px' }}>#SIRIUS11</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src="URL_FOTO_CENTAURUS_AQUI" alt="Centaurus 25" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '6px', backgroundColor: '#eee' }} />
                  <span style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '6px' }}>#CENTAURUS25</span>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'space-between' }}>
                <button onClick={() => { setSelectedSquadron(null); }} style={{ padding:'10px 20px', background:'#f44336', color:'white', borderRadius:6, border:'none', cursor: 'pointer' }}>Voltar</button>
                <button onClick={() => { setShowIntro(false); setStartTime(Date.now()); }} style={{ padding:'10px 20px', background:'#4caf50', color:'white', borderRadius:6, border:'none', cursor: 'pointer', fontWeight: 'bold' }}>Começar</button>
            </div>
          </div>
        </div>
      )}

      {/* O MAPA É RENDERIZADO AQUI, MAS FICA ESCONDIDO ATRÁS DA INTRO */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {!mapError && !showIntro && (
        <>
          <div className="hud-controls">
            <div style={{ fontSize:11 }}>Pitch</div>
            <input ref={pitchInputRef} type="range" min="0" max="85" defaultValue="60" onChange={(e) => adjustPitch(e.target.value)} style={{ width:80 }} />
            <div style={{ fontSize:11 }}>Proa</div>
            <input ref={bearingInputRef} type="range" min="0" max="360" defaultValue="130" onChange={(e) => adjustBearing(e.target.value)} style={{ width:80 }} />
          </div>

          <div className="compass-container">
            <div className="compass-circle"><div ref={compassPointerRef} className="compass-pointer" style={{ transform: 'translateX(-50%) rotate(130deg)' }} /></div>
            <div ref={bearingTextRef} style={{ fontSize:12, marginTop: 4 }}>130°</div>
          </div>

          {currentPoint && (
            <div className="quiz-panel">
              <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', fontWeight: 'bold' }}>{currentPoint.info || "Ponto Isolado"}</div>
              <label style={{ fontWeight: 'bold', fontSize: 13 }}>Nome do ponto</label>
              <input type="text" value={answer} onChange={(e) => { setAnswer(e.target.value); if(feedback) setFeedback(null); }} onKeyDown={(e) => e.key === 'Enter' && checkAnswer()} style={{ padding:'6px', borderRadius:4, border: feedback === 'error' ? '1px solid red' : '1px solid #ccc' }} autoFocus />
              {feedback === 'error' && <div style={{ color: 'red', fontSize: '11px', marginTop: -4, fontWeight: 'bold' }}>Incorreto</div>}
              <button onClick={checkAnswer} style={{ padding:'6px 12px', borderRadius:4, backgroundColor:'#4caf50', color:'white', border:'none', cursor:'pointer' }}>Responder</button>
            </div>
          )}

          <div className="bottom-bar scrollbar-hide">
            <div onClick={startManualMode} className={`toggle-btn ${(!randomMode && !areaMode) ? 'active' : 'inactive'}`}><b>Manual</b></div>
            <div onClick={() => randomMode ? startManualMode() : startRandomMode()} className={`toggle-btn ${randomMode ? 'active' : 'inactive'}`}><b>Aleatório</b></div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink: 0 }}>
                <div onClick={() => areaMode ? startManualMode() : startAreaMode()} className={`toggle-btn ${areaMode ? 'active' : 'inactive'}`}><b>Áreas</b></div>
                {areaMode && <label style={{ display:'flex', alignItems:'center', gap:4, fontSize: 12, cursor:'pointer' }}><input type="checkbox" checked={randomAreaSequence} onChange={(e) => setRandomAreaSequence(e.target.checked)} />Seq. Aleatória</label>}
                <select value={selectedArea} onChange={(e)=> setSelectedArea(e.target.value)} style={{ padding:'6px', borderRadius:4, maxWidth: '120px' }}>{areaList.map(a => <option key={a} value={a}>{a}</option>)}</select>
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:4, marginLeft: 10, cursor:'pointer', borderLeft: '1px solid #ddd', paddingLeft: 10 }}><input type="checkbox" checked={blindMode} onChange={(e) => setBlindMode(e.target.checked)} /><b>Às Cegas</b></label>
            <button onClick={() => setHintTrigger(p => p + 1)} style={{ opacity: blindMode ? 1 : 0, pointerEvents: blindMode ? 'auto' : 'none', padding: '6px 12px', borderRadius: 4, border: '1px solid #2196f3', backgroundColor: '#e3f2fd', color: '#1976d2', cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}>Dica</button>
            
            <div style={{ display:'flex', alignItems: 'center', border: '1px solid #ffcc80', borderRadius: 6, overflow: 'hidden', height: '28px', backgroundColor: 'white' }}>
                <div style={{ padding: '0 8px', fontSize: 11, background: '#fff3e0', color: '#e65100', display: 'flex', alignItems: 'center', height: '100%', fontWeight: 'bold' }}>Limites</div>
                {['all', 'progressive', 'none'].map(mode => (
                    <div key={mode} onClick={() => setBoundaryMode(mode)} style={{ padding: '0 8px', fontSize: 12, cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center',
