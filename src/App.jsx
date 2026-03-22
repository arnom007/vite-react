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

const STATIC_ROUTES = { 
  '30-52': [[-47.4721, -21.8490], [-47.4824, -21.8350], [-47.4851, -21.8317], [-47.4863, -21.8300], [-47.4876, -21.8282], [-47.4882, -21.8274], [-47.4890, -21.8265], [-47.4897, -21.8257], [-47.4903, -21.8248], [-47.4910, -21.8239], [-47.4918, -21.8231], [-47.4924, -21.8225], [-47.4929, -21.8216], [-47.4933, -21.8211], [-47.4937, -21.8205], [-47.4946, -21.8196], [-47.4956, -21.8187], [-47.4965, -21.8178], [-47.4967, -21.8174], [-47.4970, -21.8168], [-47.4973, -21.8158], [-47.4976, -21.8138], [-47.5017, -21.8066], [-47.5071, -21.8001], [-47.5145, -21.7944], [-47.5705, -21.7509], [-47.5817, -21.7389], [-47.5882, -21.7228], [-47.5989, -21.6928], [-47.6043, -21.6777], [-47.6071, -21.6700], [-47.6084, -21.6622], [-47.6108, -21.6463], [-47.6136, -21.6308], [-47.6155, -21.6199], [-47.6163, -21.6133], [-47.6181, -21.6088], [-47.6284, -21.5785], [-47.6380, -21.5516], [-47.6425, -21.5245], [-47.6398, -21.4714], [-47.6495, -21.4424], [-47.6543, -21.4273], [-47.6643, -21.4144]]
};

// Coordenadas do Polígono "Portal"
const PORTAL_POLYGON = [
  [
    [-47.16914347914692, -21.99297174739045],
    [-47.16870416218156, -22.00160035264108],
    [-47.16826484521619, -22.01022895789171],
    [-47.13148231484859, -22.01195918773471],
    [-47.10240314608033, -21.98439323601293],
    [-47.10038336233617, -21.97945155992694],
    [-47.1040661233358, -21.96891946073817],
    [-47.10827258413079, -21.95787903478974],
    [-47.11930404088337, -21.94807397207867],
    [-47.16914347914692, -21.99297174739045]
  ]
];

const getAreaColor = (areaName) => {
  if (areaName.includes('W')) return '#9c27b0';
  if (areaName.includes('Alta') || ['Libra', 'Virgem', 'Gêmeos'].includes(areaName)) return '#f44336';
  return '#2196f3';
};

export default function App() {
  const [selectedSquadron, setSelectedSquadron] = useState(null);
  
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
  
  const activePointsData = (selectedSquadron === '1EIA' ? pointsData : points2EIA) || [];
  const activeAreas = (selectedSquadron === '1EIA' ? AREAS : AREAS_2EIA) || {};
  const activeAreaLimits = (selectedSquadron === '1EIA' ? AREA_LIMITS : AREA_LIMITS_2EIA) || {};
  const areaList = Object.keys(activeAreas);

  const [selectedArea, setSelectedArea] = useState('');
  const [areaQueue, setAreaQueue] = useState([]);

  const normalizeStr = (s) => {
    try { return String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase(); }
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
    const limitNames = activeAreaLimits[areaName] || [];
    
    const limitIds = limitNames.map(n => nameToPointId(n)).filter(Boolean);
    const allIds = allNames.map(n => nameToPointId(n)).filter(Boolean);
    
    const internalIds = [];
    const referenceIds = [];
    
    allIds.forEach(id => {
      if (!limitIds.includes(id)) {
        const pointObj = activePointsData.find(p => p.id === id);
        if (pointObj && pointObj.type === 'reference') {
          referenceIds.push(id);
        } else {
          internalIds.push(id);
        }
      }
    });

    return [...limitIds, ...internalIds, ...referenceIds];
  }, [nameToPointId, activeAreas, activeAreaLimits, activePointsData]);

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

  // Atualização Universal de Limites Geográficos e Portal
  useEffect(() => {
    if (!isMapLoaded || !map.current || !selectedSquadron) return;

    Object.entries(activeAreaLimits).forEach(([areaName, limitNames]) => {
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

    // Linha vermelha extra do 1EIA
    if (selectedSquadron === '1EIA') {
        const extraSource = map.current.getSource('source-extra-red');
        if (extraSource) {
            const p1 = activePointsData.find(p => p.id === 63); 
            const p2 = activePointsData.find(p => p.id === 30); 
            let features = [];
            if (p1 && p2 && (boundaryMode === 'all' || (boundaryMode === 'progressive' && guessed.includes(63) && guessed.includes(30)))) {
                 features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [p1.coords, p2.coords] } });
            }
            extraSource.setData({ 'type': 'FeatureCollection', 'features': features });
        }
    }

    // LÓGICA DO POLÍGONO DO PORTAL
    const sourcePortal = map.current.getSource('source-portal');
    if (sourcePortal) {
        // Nomes dos pontos necessários para desbloquear a área
        const reqNames = ['Venda Branca', 'Ponte sobre o Rio Jaguari Mirim', 'Trevo da estrada de Aguaí', 'Vírgula', 'Areal'];
        // Busca os IDs reais baseados nos nomes
        const portalReqIds = reqNames.map(name => nameToPointId(name)).filter(Boolean);
        
        // Verifica se todos foram encontrados e se todos estão na lista "guessed" (adivinhados)
        const showPortal = portalReqIds.length === 5 && portalReqIds.every(id => guessed.includes(id));
        
        if (showPortal) {
            sourcePortal.setData({
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: PORTAL_POLYGON
                    }
                }]
            });
        } else {
            sourcePortal.setData({ type: 'FeatureCollection', features: [] });
        }
    }

  }, [isMapLoaded, guessed, boundaryMode, nameToPointId, selectedSquadron, activePointsData, activeAreaLimits]);

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

          // Renderização Universal de Áreas
          Object.keys(activeAreaLimits).forEach(areaName => {
              map.current.addSource(`source-${areaName}`, { 'type': 'geojson', 'data': { 'type': 'FeatureCollection', 'features': [] } });
              map.current.addLayer({
                'id': `layer-${areaName}`, 'type': 'line', 'source': `source-${areaName}`,
                'layout': { 'line-join': 'round', 'line-cap': 'round' },
                'paint': { 'line-color': getAreaColor(areaName), 'line-width': 3, 'line-opacity': 0.6 }
              });
          });

          // Camada do Polígono do Portal
          map.current.addSource('source-portal', { 'type': 'geojson', 'data': { 'type': 'FeatureCollection', 'features': [] } });
          map.current.addLayer({
            'id': 'layer-portal-fill', 'type': 'fill', 'source': 'source-portal',
            'paint': { 'fill-color': '#007cf5', 'fill-opacity': 0.25 }
          });
          map.current.addLayer({
            'id': 'layer-portal-line', 'type': 'line', 'source': 'source-portal',
            'paint': { 'line-color': '#007cf5', 'line-width': 2 }
          });

          // Camadas extras do 1EIA e 2EIA
          if (selectedSquadron === '1EIA') {
              map.current.addSource('source-extra-red', { 'type': 'geojson', 'data': { 'type': 'FeatureCollection', 'features': [] } });
              map.current.addLayer({
                'id': 'layer-extra-red', 'type': 'line', 'source': 'source-extra-red',
                'layout': { 'line-join': 'round', 'line-cap': 'round' },
                'paint': { 'line-color': '#f44336', 'line-width': 3, 'line-opacity': 0.6 }
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
            el.className = 'marker-root';
            el.style.cssText = 'width:0px;height:0px;display:flex;align-items:center;justify-content:center;overflow:visible;';
            
            const content = document.createElement('div');
            content.className = 'marker-content';
            content.style.cssText = 'width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;transition:width 0.3s, height 0.3s;';
            
            const hint = document.createElement('div');
            hint.className = 'hint-pulse';
            hint.style.cssText = 'position:absolute;width:100%;height:100%;background-color:rgba(255,255,255,0.8);border-radius:50%;transform:scale(0.5);opacity:0;pointer-events:none;';
            
            const dot = document.createElement('div');
            dot.className = 'marker-dot';
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

          let lastUpdate = 0;
          map.current.on('move', () => {
            const now = Date.now();
            if (now - lastUpdate < 50) return; 
            lastUpdate = now;
            if (!map.current) return;
            const p = Math.round(map.current.getPitch());
            const b = Math.round(((map.current.getBearing() + MAP_DECLINATION) + 360) % 360);
            
            if (pitchInputRef.current) pitchInputRef.current.value = p;
            if (bearingInputRef.current) bearingInputRef.current.value = b;
            
            if (compassPointerRef.current) {
                compassPointerRef.current.style.transform = `rotate(${-b}deg)`;
            }
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

  // Atualização Visual Dinâmica dos Pontos
  useEffect(() => {
    if (!isMapLoaded) return;
    markersRef.current.forEach((rec, id) => {
      const { content, dot, hint, labelEl, labelMarker, point } = rec;
      if (!dot || !content) return;
      
      const isGuessed = guessed.includes(id);
      const isCurrent = currentPoint && currentPoint.id === id;

      if (point.type === 'reference') {
          dot.style.backgroundColor = isCurrent ? 'yellow' : '#9c27b0';
          dot.style.border = '2px solid white';
          dot.style.width = '14px';
          dot.style.height = '14px';
          
          const shouldShowRef = isCurrent || isGuessed || showKey;
          dot.style.opacity = shouldShowRef ? '1' : '0';
          content.style.pointerEvents = shouldShowRef ? 'auto' : 'none';
      } else {
          dot.style.backgroundColor = isGuessed ? 'green' : (isCurrent ? 'yellow' : (showKey ? 'orange' : 'red'));
          dot.style.opacity = (blindMode && !isGuessed && !isCurrent) ? '0' : '1';
          content.style.pointerEvents = 'auto';
          dot.style.border = 'none';
          dot.style.width = '12px';
          dot.style.height = '12px';
      }
      
      content.style.width = blindMode ? '80px' : '40px';
      content.style.height = blindMode ? '80px' : '40px';

      if (hint) {
          if (isCurrent && hintTrigger > 0) {
              hint.classList.remove('animate-pulse-hint'); void hint.offsetWidth; hint.classList.add('animate-pulse-hint');
          } else { hint.classList.remove('animate-pulse-hint'); }
      }

      if (labelEl) {
        const currentZoom = map.current?.getZoom() || 10;
        const shouldShowLabelByZoom = currentZoom >= 8 || isCurrent;

        if (point.type === 'reference') {
            if ((isCurrent || (isGuessed && showKey)) && shouldShowLabelByZoom) {
                labelEl.style.display = '';
                const minFontSize = 10;
                const maxFontSize = 16;
                const calculatedSize = Math.round(currentZoom * 1.2);
                labelEl.style.fontSize = `${Math.min(Math.max(calculatedSize, minFontSize), maxFontSize)}px`;
                labelMarker.setLngLat(point.coords);
            } else {
                labelEl.style.display = 'none';
            }
        } else {
            if ((isGuessed || showKey) && shouldShowLabelByZoom) {
                labelEl.style.display = '';
                const minFontSize = 10;
                const maxFontSize = 16;
                const calculatedSize = Math.round(currentZoom * 1.2);
                labelEl.style.fontSize = `${Math.min(Math.max(calculatedSize, minFontSize), maxFontSize)}px`;
                labelMarker.setLngLat(point.coords);
            } else {
                 labelEl.style.display = 'none'; 
            }
        }
      }
    });
  }, [guessed, currentPoint, showKey, blindMode, hintTrigger, isMapLoaded]);

  const revealAll = (show) => { setShowKey(show); markersRef.current.forEach((rec) => { if (rec.labelEl && rec.point.type !== 'reference') rec.labelEl.style.display = show ? '' : 'none'; }); };
  
  const resetGame = () => { 
      setGuessed([]); setCurrentPoint(null); setAnswer(''); setFeedback(null); 
      setStartTime(Date.now()); setFinalTime(0); setShowCompletion(false); setShowKey(false); 
      if (map.current) {
          map.current.flyTo({ center: INITIAL_CENTER, zoom: 8.5, pitch: 60, bearing: 130 - MAP_DECLINATION }); 
          if (compassPointerRef.current) compassPointerRef.current.style.transform = `rotate(-130deg)`;
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
    setAreaQueue(ids);
    if (ids.length) { 
        let startP = activePointsData.find(pt => pt.id === (randomAreaSequence ? ids.filter(id => !guessed.includes(id))[0] : ids[0]));
        if (startP) { setCurrentPoint(startP); if (map.current) map.current.flyTo({ center: startP.coords }); }
    }
  };
  
  const startRandomMode = () => {
    setRandomMode(true); setAreaMode(false);
    if (!currentPoint) {
        const rem = activePointsData.filter(p => !guessed.includes(p.id) && p.type !== 'reference');
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
              }
          }
      } else {
          const idx = sortedPoints.findIndex(p => p.id === currentPoint.id);
          const newIdx = direction === 'next' ? (idx === sortedPoints.length - 1 ? 0 : idx + 1) : (idx === 0 ? sortedPoints.length - 1 : idx - 1);
          targetPoint = sortedPoints[newIdx];
      }
      
      if (targetPoint) { setCurrentPoint(targetPoint); setAnswer(''); setFeedback(null); if (map.current) map.current.flyTo({ center: targetPoint.coords }); }
  };

  const processCorrectAnswer = () => {
      setFeedback(null);
      const updated = Array.from(new Set([...guessed, currentPoint.id]));
      setGuessed(updated);
      const rec = markersRef.current.get(currentPoint.id);
      if (rec && rec.labelEl) rec.labelEl.style.display = '';

      if (areaMode && areaQueue.length) {
        let nextPoint = null;
        if (randomAreaSequence) {
            const rem = areaQueue.filter(id => !updated.includes(id));
            if (rem.length) {
                const normalRem = rem.filter(id => {
                    const pt = activePointsData.find(p => p.id === id);
                    return pt && pt.type !== 'reference';
                });
                
                if (normalRem.length > 0) {
                     nextPoint = activePointsData.find(p => p.id === normalRem[Math.floor(Math.random() * normalRem.length)]);
                } else {
                     nextPoint = activePointsData.find(p => p.id === rem[0]);
                }
            }
        } else {
            const idx = areaQueue.indexOf(currentPoint.id);
            const nextIdx = idx + 1;
            if (nextIdx < areaQueue.length) {
                nextPoint = activePointsData.find(p => p.id === areaQueue[nextIdx]); 
            }
        }

        if (nextPoint) {
             setCurrentPoint(nextPoint); setAnswer(''); if (map.current) map.current.flyTo({ center: nextPoint.coords });
        } else {
             const nextAreaIdx = (areaList.indexOf(selectedArea) + 1) % areaList.length;
             const nextAreaName = areaList[nextAreaIdx];
             setSelectedArea(nextAreaName); 
             
             const nextIds = getSortedAreaIds(nextAreaName);
             setAreaQueue(nextIds);
             
             if (nextIds.length) {
                 const firstPoint = activePointsData.find(p => p.id === (randomAreaSequence ? nextIds.filter(id => !updated.includes(id))[0] || nextIds[0] : nextIds[0]));
                 setCurrentPoint(firstPoint || null); setAnswer(''); if (map.current && firstPoint) map.current.flyTo({ center: firstPoint.coords });
             } else { handleCompletion(); setCurrentPoint(null); }
        }
      } else if (randomMode) {
        const rem = activePointsData.filter(p => !updated.includes(p.id) && p.type !== 'reference'); 
        const next = rem.length ? rem[Math.floor(Math.random() * rem.length)] : null;
        if (next) { setCurrentPoint(next); setAnswer(''); if (map.current) map.current.flyTo({ center: next.coords }); }
        else { handleCompletion(); setCurrentPoint(null); setAnswer(''); }
      } else { setCurrentPoint(null); setAnswer(''); }
  };

  const checkAnswer = () => {
    if (currentPoint && currentPoint.type === 'reference') {
       processCorrectAnswer();
       return;
    }

    const normalized = normalizeStr(answer);
    if (currentPoint && currentPoint.aliases.map(a => normalizeStr(a)).includes(normalized)) {
      processCorrectAnswer();
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

  const missingPoints = activePointsData.filter(p => !guessed.includes(p.id) && p.type !== 'reference').sort((a,b)=>a.name.localeCompare(b.name));
  const answeredPoints = activePointsData.filter(p => guessed.includes(p.id) && p.type !== 'reference').sort((a,b)=>a.name.localeCompare(b.name));

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

      {showIntro && !mapError && (
        <div style={{ position: 'absolute', inset: 0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', justifyContent:'center', alignItems:'center' }}>
          <div style={{ background:'white', padding:'30px 20px', borderRadius:'10px', width: '90%', maxWidth:'460px', textAlign:'left', lineHeight:1.4 }}>
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

            <div style={{ display:'flex', justifyContent:'space-between', marginTop: '30px' }}>
                <button onClick={() => { setSelectedSquadron(null); }} style={{ padding:'10px 20px', background:'#f44336', color:'white', borderRadius:6, border:'none', cursor: 'pointer' }}>Voltar</button>
                <button onClick={() => { setShowIntro(false); setStartTime(Date.now()); }} style={{ padding:'10px 20px', background:'#4caf50', color:'white', borderRadius:6, border:'none', cursor: 'pointer', fontWeight: 'bold' }}>Começar</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '40px', opacity: 0.35 }}>
              <div style={{ width: '55px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src="athos.png" alt="23/021" style={{ maxWidth: '100%', height: '35px', width: 'auto', objectFit: 'contain' }} />
                  <span style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '6px', color: '#999', letterSpacing: '0.5px' }}>#MTA</span>
              </div>
              <div style={{ width: '55px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src="sirius.png" alt="Sirius 11" style={{ maxWidth: '100%', height: '35px', width: 'auto', objectFit: 'contain' }} />
                  <span style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '6px', color: '#999', letterSpacing: '0.5px' }}>#SIRIUS11</span>
              </div>
              <div style={{ width: '55px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src="centaurus.png" alt="Centaurus 25" style={{ maxWidth: '100%', height: '35px', width: 'auto', objectFit: 'contain' }} />
                  <span style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '6px', color: '#999', letterSpacing: '0.5px' }}>#CENTAURUS</span>
              </div>
            </div>

          </div>
        </div>
      )}

      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {!mapError && !showIntro && (
        <>
          <div className="hud-controls">
            <div style={{ fontSize:11 }}>Pitch</div>
            <input ref={pitchInputRef} type="range" min="0" max="85" defaultValue="60" onChange={(e) => adjustPitch(e.target.value)} style={{ width:80 }} />
            <div style={{ fontSize:11 }}>Proa</div>
            <input ref={bearingInputRef} type="range" min="0" max="360" defaultValue="130" onChange={(e) => adjustBearing(e.target.value)} style={{ width:80 }} />
          </div>

          <div className="compass-container" style={{ minWidth: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}>
            <div className="compass-circle" style={{ width: 60, height: 60, border: '2px solid rgba(0,0,0,0.2)', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', position: 'relative', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
              
              {/* Lubber Line - Linha Laranja Fixa no Topo */}
              <div style={{ position: 'absolute', top: -2, left: 'calc(50% - 2px)', width: 4, height: 8, background: '#ff9800', zIndex: 10, borderRadius: 2 }} />
              
              <div ref={compassPointerRef} style={{ position: 'absolute', inset: 0, zIndex: 2, transform: 'rotate(-130deg)', transformOrigin: 'center center', transition: 'transform 0.1s ease-out' }}>
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                  <line x1="50" y1="6" x2="50" y2="12" stroke="#333" strokeWidth="2" />
                  <line x1="50" y1="88" x2="50" y2="94" stroke="#333" strokeWidth="2" />
                  <line x1="6" y1="50" x2="12" y2="50" stroke="#333" strokeWidth="2" />
                  <line x1="88" y1="50" x2="94" y2="50" stroke="#333" strokeWidth="2" />
                  
                  <line x1="50" y1="6" x2="50" y2="10" stroke="#666" strokeWidth="1.5" transform="rotate(45 50 50)" />
                  <line x1="50" y1="6" x2="50" y2="10" stroke="#666" strokeWidth="1.5" transform="rotate(135 50 50)" />
                  <line x1="50" y1="6" x2="50" y2="10" stroke="#666" strokeWidth="1.5" transform="rotate(225 50 50)" />
                  <line x1="50" y1="6" x2="50" y2="10" stroke="#666" strokeWidth="1.5" transform="rotate(315 50 50)" />
                  
                  {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map(deg => (
                    <line key={deg} x1="50" y1="6" x2="50" y2="9" stroke="#aaa" strokeWidth="1" transform={`rotate(${deg} 50 50)`} />
                  ))}
                  
                  <text x="50" y="24" fontSize="14" textAnchor="middle" fill="#d32f2f" fontWeight="bold" fontFamily="Arial">N</text>
                  <text x="50" y="85" fontSize="12" textAnchor="middle" fill="#333" fontWeight="bold" fontFamily="Arial">S</text>
                  <text x="82" y="54" fontSize="12" textAnchor="middle" fill="#333" fontWeight="bold" fontFamily="Arial">E</text>
                  <text x="18" y="54" fontSize="12" textAnchor="middle" fill="#333" fontWeight="bold" fontFamily="Arial">W</text>

                  <polygon points="46,50 54,50 50,28" fill="#f44336" stroke="#b71c1c" strokeWidth="1" />
                  <polygon points="46,50 54,50 50,72" fill="#e0e0e0" stroke="#9e9e9e" strokeWidth="1" />
                  <circle cx="50" cy="50" r="4" fill="#333" />
                  <circle cx="50" cy="50" r="1.5" fill="white" />
                </svg>
              </div>
            </div>
            
            <div ref={bearingTextRef} style={{ fontSize:13, marginTop: 6, fontWeight: 'bold', background: 'rgba(255,255,255,0.8)', padding: '2px 8px', borderRadius: 4 }}>130°</div>
          </div>

          {currentPoint && (
            <div className="quiz-panel" style={{ backgroundColor: currentPoint.type === 'reference' ? '#fff9c4' : 'white' }}>
              <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', fontWeight: 'bold' }}>{currentPoint.info || "Ponto Isolado"}</div>
              
              {currentPoint.type === 'reference' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2', borderBottom: '2px solid #bbdefb', paddingBottom: '4px' }}>
                        {currentPoint.name}
                    </div>
                    {currentPoint.description && (
                        <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.4' }}>
                            {currentPoint.description}
                        </div>
                    )}
                    <button onClick={checkAnswer} style={{ padding:'8px 12px', marginTop: '4px', borderRadius:4, backgroundColor:'#1976d2', color:'white', border:'none', cursor:'pointer', fontWeight: 'bold' }}>Entendido / Próximo ➜</button>
                </div>
              ) : (
                <>
                  <label style={{ fontWeight: 'bold', fontSize: 13 }}>Nome do ponto</label>
                  <input type="text" value={answer} onChange={(e) => { setAnswer(e.target.value); if(feedback) setFeedback(null); }} onKeyDown={(e) => e.key === 'Enter' && checkAnswer()} style={{ padding:'6px', borderRadius:4, border: feedback === 'error' ? '1px solid red' : '1px solid #ccc' }} autoFocus />
                  {feedback === 'error' && <div style={{ color: 'red', fontSize: '11px', marginTop: -4, fontWeight: 'bold' }}>Incorreto</div>}
                  <button onClick={checkAnswer} style={{ padding:'6px 12px', borderRadius:4, backgroundColor:'#4caf50', color:'white', border:'none', cursor:'pointer' }}>Responder</button>
                </>
              )}
            </div>
          )}

          <div className="bottom-bar scrollbar-hide">
            <div onClick={startManualMode} className={`toggle-btn ${(!randomMode && !areaMode) ? 'active' : 'inactive'}`}><b>Manual</b></div>
            <div onClick={() => randomMode ? startManualMode() : startRandomMode()} className={`toggle-btn ${randomMode ? 'active' : 'inactive'}`}><b>Aleatório</b></div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink: 0 }}>
                <div onClick={() => areaMode ? startManualMode() : startAreaMode()} className={`toggle-btn ${areaMode ? 'active' : 'inactive'}`}><b>Áreas</b></div>
                {areaMode && <label style={{ display:'flex', alignItems:'center', gap:4, fontSize: 12, cursor:'pointer' }}><input type="checkbox" checked={randomAreaSequence} onChange={(e) => setRandomAreaSequence(e.target.checked)} />Seq. Aleatória</label>}
                
                <select 
                    value={selectedArea} 
                    onChange={(e)=> {
                        const newArea = e.target.value;
                        setSelectedArea(newArea);
                        
                        const newQueue = getSortedAreaIds(newArea);
                        setAreaQueue(newQueue);

                        if (areaMode) {
                            if (newQueue.length > 0) {
                                let startP;
                                if (randomAreaSequence) {
                                    const un = newQueue.filter(id => !guessed.includes(id));
                                    startP = activePointsData.find(pt => pt.id === (un.length > 0 ? un[0] : newQueue[0]));
                                } else {
                                    startP = activePointsData.find(pt => pt.id === newQueue[0]);
                                }
                                if (startP) {
                                    setCurrentPoint(startP);
                                    setAnswer('');
                                    setFeedback(null);
                                    if (map.current) map.current.flyTo({ center: startP.coords });
                                }
                            }
                        }
                    }} 
                    style={{ padding:'6px', borderRadius:4, maxWidth: '120px' }}>
                    {areaList.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:4, marginLeft: 10, cursor:'pointer', borderLeft: '1px solid #ddd', paddingLeft: 10 }}><input type="checkbox" checked={blindMode} onChange={(e) => setBlindMode(e.target.checked)} /><b>Às Cegas</b></label>
            <button onClick={() => setHintTrigger(p => p + 1)} style={{ opacity: blindMode ? 1 : 0, pointerEvents: blindMode ? 'auto' : 'none', padding: '6px 12px', borderRadius: 4, border: '1px solid #2196f3', backgroundColor: '#e3f2fd', color: '#1976d2', cursor: 'pointer', fontWeight: 'bold', fontSize: 12 }}>Dica</button>
            
            <div style={{ display:'flex', alignItems: 'center', border: '1px solid #ffcc80', borderRadius: 6, overflow: 'hidden', height: '28px', backgroundColor: 'white' }}>
                <div style={{ padding: '0 8px', fontSize: 11, background: '#fff3e0', color: '#e65100', display: 'flex', alignItems: 'center', height: '100%', fontWeight: 'bold' }}>Limites</div>
                {['all', 'progressive', 'none'].map(mode => (
                    <div key={mode} onClick={() => setBoundaryMode(mode)} style={{ padding: '0 8px', fontSize: 12, cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center', backgroundColor: boundaryMode === mode ? '#ffe0b2' : 'white', fontWeight: boundaryMode === mode ? 'bold' : 'normal', color: '#e65100' }}>
                        {mode === 'all' ? 'Todos' : mode === 'progressive' ? 'Progr.' : 'Off'}
                    </div>
                ))}
            </div>

            <button onClick={resetGame} style={{ padding:'6px 10px', borderRadius:4, border:'none', background:'#f44336', color:'white', marginLeft: 'auto' }}>Recomeçar</button>
            <div style={{ minWidth:180, marginLeft: 10 }}>
              <select style={{ width:'100%', padding:6, borderRadius:4 }} onChange={(e)=>{ const pt=activePointsData.find(p=>p.id===Number(e.target.value) || p.id===e.target.value); if(pt && map.current) map.current.flyTo({ center:pt.coords, zoom:16 }); }} value="">
                <option value="">-- Ir para ponto --</option>
                {!areaMode ? (
                  <>
                    {missingPoints.length > 0 && <optgroup label="Faltantes">{missingPoints.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}</optgroup>}
                    {answeredPoints.length > 0 && <optgroup label="Respondidos">{answeredPoints.map(pt => <option key={pt.id} value={pt.id}>{pt.name} ✅</option>)}</optgroup>}
                  </>
                ) : (
                  <>
                    {Object.entries(activeAreas).map(([areaName, areaPointsNames]) => {
                        const areaPointsIds = areaPointsNames.map(n => nameToPointId(n)).filter(Boolean);
                        const areaMissing = areaPointsIds.filter(id => !guessed.includes(id)).sort((a,b) => activePointsData.find(p=>p.id===a)?.name.localeCompare(activePointsData.find(p=>p.id===b)?.name));
                        const areaGuessed = areaPointsIds.filter(id => guessed.includes(id)).sort((a,b) => activePointsData.find(p=>p.id===a)?.name.localeCompare(activePointsData.find(p=>p.id===b)?.name));
                        return (
                            <optgroup key={areaName} label={areaName}>
                                {areaMissing.map(id => <option key={id} value={id}>{activePointsData.find(p => p.id === id)?.name}</option>)}
                                {areaGuessed.map(id => <option key={id} value={id}>{activePointsData.find(p => p.id === id)?.name} ✅</option>)}
                            </optgroup>
                        );
                    })}
                  </>
                )}
              </select>
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:4, marginLeft: 10 }}><input type="checkbox" checked={showKey} onChange={(e)=> revealAll(e.target.checked)} /> Gabarito</label>
            <label style={{ display:'flex', alignItems:'center', gap:4, marginLeft: 10 }}><input type="checkbox" checked={showTerrain} onChange={(e)=> setShowTerrain(e.target.checked)} /> Relevo</label>
          </div>
        </>
      )}
    </div>
  );
}
