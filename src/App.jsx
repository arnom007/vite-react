import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { pointsData } from "./points"; // Importa os dados

// Lista de chaves API para rotação/fallback
const API_KEYS = [
  "YHlTRP429Wo5PZXGJklr", // Key 1
  "YS0YNd7SKoqGfXhdY8Bx", // Key 2
  "R13imFP2SenJH9JsgVkN"  // Key 3
];

const INITIAL_CENTER = [-47.6, -22.0];

// Usa os dados importados
const points = pointsData;

// Helpers
const normalize = (s) => {
  try { return String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase(); }
  catch (e) { return String(s || '').toLowerCase(); }
};

const getPointsByKeyword = (keyword) => {
  return points
    .filter(p => normalize(p.info).includes(normalize(keyword)))
    .map(p => p.name);
};

// Áreas e Limites
const AREAS = {
  Capricornio: getPointsByKeyword('Capricornio'), 
  Aquarius: getPointsByKeyword('Aquarius'), 
  Peixes: getPointsByKeyword('Peixes'),
  Taurus: getPointsByKeyword('Taurus'),
  'Tráfego AFA': getPointsByKeyword('Tráfego AFA')
};

const AREA_LIMITS = {
  Capricornio: ['Trevo Aguaí Anhanguera', 'Leme', 'Araras', 'Cordeirópolis', 'Ipeúna', 'Lagoa na SP-225', 'Itirapina', 'Analândia'],
  Aquarius: ['Trevo Aguaí Anhanguera', 'Analândia', 'Itirapina', 'Lagoa na SP-225', 'Fazenda Brotas', 'Américo Brasiliense', 'Descalvado', 'Porto Ferreira'],
  Peixes: ['Porto Ferreira', 'Pedágio São Simão', 'Rincão', 'Américo Brasiliense', 'Descalvado'],
  Taurus: ['Porto Ferreira', 'Pedágio São Simão', 'Santa Cruz da Esperança', 'Fazenda da Serra', 'Mococa', 'Santa Rosa do Viterbo', 'Santa Rita do Passa Quatro']
};

const STATIC_ROUTES = {
  '30-52': [ // Porto Ferreira <-> Pedágio São Simão (IDs atualizados)
    [-47.4833, -21.8570], [-47.4950, -21.8400], [-47.5120, -21.8150], [-47.5350, -21.7800],
    [-47.5500, -21.7400], [-47.5650, -21.7000], [-47.5800, -21.6600], [-47.6000, -21.6000],
    [-47.6200, -21.5400], [-47.6400, -21.4800], [-47.6550, -21.4400], [-47.6642, -21.4144]
  ]
};

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef(new Map());

  // Estado da Chave API
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [mapError, setMapError] = useState(false);

  const activeKey = API_KEYS[currentKeyIndex];

  // Estados do Jogo
  const MAP_DECLINATION = 20;
  const [guessed, setGuessed] = useState([]);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [answer, setAnswer] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pitch, setPitch] = useState(60);
  const [bearing, setBearing] = useState(130);
  const [randomMode, setRandomMode] = useState(false);
  const [areaMode, setAreaMode] = useState(false);
  const [randomAreaSequence, setRandomAreaSequence] = useState(false);
  const [blindMode, setBlindMode] = useState(false);
  const [showTerrain, setShowTerrain] = useState(false);
  const [boundaryMode, setBoundaryMode] = useState('progressive'); 
  const [showKey, setShowKey] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showFullInstructions, setShowFullInstructions] = useState(false);
  const [hintTrigger, setHintTrigger] = useState(0);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const [selectedArea, setSelectedArea] = useState('Capricornio');
  const [areaPointIndex, setAreaPointIndex] = useState(0);
  const [areaQueue, setAreaQueue] = useState([]);

  // Helpers
  const normalizeStr = (s) => {
    try { return String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase(); }
    catch (e) { return String(s || '').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase(); }
  };

  const nameToPointId = (name) => {
    const norm = normalizeStr(name);
    const p = points.find(pt => normalizeStr(pt.name) === norm || (pt.aliases || []).some(a => normalizeStr(a) === norm));
    return p ? p.id : null;
  };

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

  const getPointInfo = (point) => point ? (point.info || "Ponto Isolado") : "";

  // Helper de ordenação de áreas
  const getSortedAreaIds = (areaName) => {
    const allNames = AREAS[areaName] || [];
    const limitNames = AREA_LIMITS[areaName] || [];
    const limitIds = limitNames.map(n => nameToPointId(n)).filter(Boolean);
    const allIds = allNames.map(n => nameToPointId(n)).filter(Boolean);
    const internalIds = allIds.filter(id => !limitIds.includes(id));
    return [...limitIds, ...internalIds];
  };

  // Efeitos
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    const sortedIds = getSortedAreaIds(selectedArea);
    setAreaQueue(sortedIds);
    setAreaPointIndex(0);
  }, [selectedArea]);

  useEffect(() => {
    if (!isMapLoaded || !map.current) return;
    if (showTerrain) {
        map.current.setTerrain({ 'source': 'terrain', 'exaggeration': 1.1 });
    } else {
        map.current.setTerrain(null);
    }
  }, [showTerrain, isMapLoaded]);

  useEffect(() => { const id = setInterval(() => setElapsedTime(Math.floor((Date.now() - startTime) / 1000)), 1000); return () => clearInterval(id); }, [startTime]);

  // Layer Update Logic (Boundaries)
  useEffect(() => {
    if (!isMapLoaded || !map.current) return;

    const updateLayer = (areaName, limitNames) => {
        const source = map.current.getSource(`source-${areaName}`);
        if (!source) return;

        const limitIds = limitNames.map(name => nameToPointId(name)).filter(Boolean);
        if (limitIds.length < 2) {
             source.setData({ type: 'FeatureCollection', features: [] });
             return;
        }

        const features = [];
        for (let i = 0; i < limitIds.length; i++) {
            const id1 = limitIds[i];
            const id2 = limitIds[(i + 1) % limitIds.length];
            const p1 = points.find(p => p.id === id1);
            const p2 = points.find(p => p.id === id2);

            if (p1 && p2) {
                let isVisible = false;
                if (boundaryMode === 'all') isVisible = true;
                else if (boundaryMode === 'none') isVisible = false;
                else if (boundaryMode === 'progressive') isVisible = guessed.includes(id1) && guessed.includes(id2);

                if (isVisible) {
                    const routeKey = `${id1}-${id2}`;
                    const reverseRouteKey = `${id2}-${id1}`;
                    let geometryCoordinates = [p1.coords, p2.coords]; 

                    if (STATIC_ROUTES[routeKey]) geometryCoordinates = STATIC_ROUTES[routeKey];
                    else if (STATIC_ROUTES[reverseRouteKey]) geometryCoordinates = [...STATIC_ROUTES[reverseRouteKey]].reverse();

                    features.push({
                        type: 'Feature',
                        geometry: { type: 'LineString', coordinates: geometryCoordinates }
                    });
                }
            }
        }
        source.setData({ 'type': 'FeatureCollection', 'features': features });
    };

    Object.entries(AREA_LIMITS).forEach(([areaName, limitNames]) => updateLayer(areaName, limitNames));
  }, [isMapLoaded, guessed, boundaryMode]);

  // MAP INITIALIZATION
  useEffect(() => {
    if (mapError) return; // Se já falhou todas, não tenta mais

    // Limpa mapa anterior se existir (ao trocar chave)
    if (map.current) {
        map.current.remove();
        map.current = null;
        setIsMapLoaded(false);
    }

    const initMap = async () => {
      try {
        console.log(`Inicializando mapa com chave index ${currentKeyIndex}...`);
        
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: `https://api.maptiler.com/maps/satellite/style.json?key=${activeKey}`,
          center: INITIAL_CENTER,
          zoom: 9.5, 
          pitch,
          bearing: bearing - MAP_DECLINATION,
          maxPitch: 85, 
        });

        // Handler de Erro de Carregamento (Troca de Chave)
        map.current.on('error', (e) => {
            // Verifica se é erro de acesso/permissão ou estilo
            if (e.error && (e.error.status === 403 || e.error.status === 429 || (e.error.message && e.error.message.includes('Forbidden')))) {
                console.warn(`Erro na chave ${currentKeyIndex}:`, e.error);
                if (currentKeyIndex < API_KEYS.length - 1) {
                    setCurrentKeyIndex(prev => prev + 1);
                } else {
                    setMapError(true);
                }
            }
        });

        map.current.on('load', () => {
          console.log("Mapa carregado com sucesso!");
          map.current.addSource('terrain', {
              "type": "raster-dem",
              "url": `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${activeKey}`,
              "tileSize": 512
          });

          Object.keys(AREA_LIMITS).forEach(areaName => {
              map.current.addSource(`source-${areaName}`, {
                'type': 'geojson',
                'data': { 'type': 'FeatureCollection', 'features': [] }
              });
              map.current.addLayer({
                'id': `layer-${areaName}`,
                'type': 'line',
                'source': `source-${areaName}`,
                'layout': { 'line-join': 'round', 'line-cap': 'round' },
                'paint': { 'line-color': '#ffffff', 'line-width': 2, 'line-opacity': 0.3 }
              });
          });

          points.forEach(point => {
            const el = document.createElement('div');
            el.className = 'marker-root';
            el.style.cssText = 'width:0px;height:0px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:visible;';
            
            const content = document.createElement('div');
            content.className = 'marker-content';
            content.style.cssText = 'width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;transition:width 0.3s, height 0.3s;';

            const hint = document.createElement('div');
            hint.className = 'hint-pulse';
            hint.style.cssText = 'position:absolute;width:100%;height:100%;background-color:rgba(255,255,255,0.8);border-radius:50%;transform:scale(0.5);opacity:0;pointer-events:none;';

            const dot = document.createElement('div');
            dot.className = 'marker-dot';
            dot.style.cssText = 'width:12px;height:12px;background-color:red;border-radius:50%;box-shadow:0 0 5px rgba(0,0,0,0.6);transition:opacity 0.2s ease;';
            
            content.appendChild(hint);
            content.appendChild(dot);
            el.appendChild(content);

            content.addEventListener('click', (e) => {
              e.stopPropagation();
              setCurrentPoint(point);
              setAnswer('');
              setFeedback(null);
            });

            const marker = new maplibregl.Marker({ element: el, anchor: 'center', pitchAlignment: 'viewport', rotationAlignment: 'viewport' })
              .setLngLat(point.coords)
              .addTo(map.current);

            const labelEl = document.createElement('div');
            labelEl.className = 'label';
            labelEl.textContent = point.name;
            labelEl.style.cssText = 'color:white;font-weight:bold;text-shadow:0 0 5px rgba(0,0,0,0.8);white-space:nowrap;pointer-events:none;display:none;padding:2px 6px;border-radius:4px;background:rgba(0,0,0,0.6);';

            const labelMarker = new maplibregl.Marker({ element: labelEl, anchor: 'bottom', pitchAlignment: 'viewport', rotationAlignment: 'viewport' })
              .setLngLat(point.coords)
              .addTo(map.current);

            markersRef.current.set(point.id, { marker, content, dot, hint, labelMarker, labelEl, point });
          });

          setIsMapLoaded(true);

          let lastUpdate = 0;
          map.current.on('move', () => {
            const now = Date.now();
            if (now - lastUpdate < 100) return; 
            lastUpdate = now;
            if (!map.current) return;
            const p = Math.round(map.current.getPitch());
            const b = Math.round(((map.current.getBearing() + MAP_DECLINATION) + 360) % 360);
            setPitch(p);
            setBearing(b);
          });
        });

      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    };

    initMap();

    return () => {
      markersRef.current.forEach(({ marker, labelMarker }) => {
        try { marker.remove(); } catch (e) {}
        try { labelMarker.remove(); } catch (e) {}
      });
      markersRef.current.clear();
      if (map.current) map.current.remove();
      map.current = null;
    };
  }, [currentKeyIndex]); // Recria o mapa se o índice da chave mudar

  // Marker Update Logic
  useEffect(() => {
    if (!isMapLoaded) return;

    markersRef.current.forEach((rec, id) => {
      const { content, dot, hint, labelEl, labelMarker, point } = rec;
      if (!dot || !content) return;

      let color = 'red';
      const isGuessed = guessed.includes(id);
      const isCurrent = currentPoint && currentPoint.id === id;

      if (isGuessed) color = 'green';
      else if (isCurrent) color = 'yellow';
      else if (showKey) color = 'orange';

      dot.style.backgroundColor = color;

      if (blindMode) {
          content.style.width = '80px';
          content.style.height = '80px';
          dot.style.opacity = isGuessed ? '1' : '0';
      } else {
          content.style.width = '40px';
          content.style.height = '40px';
          dot.style.opacity = '1';
      }

      if (hint) {
          if (isCurrent && hintTrigger > 0) {
              hint.classList.remove('animate-pulse-hint');
              void hint.offsetWidth; 
              hint.classList.add('animate-pulse-hint');
          } else {
              hint.classList.remove('animate-pulse-hint');
          }
      }

      if (labelEl) {
        if (guessed.includes(id) || showKey) {
          labelEl.style.display = '';
          const zoom = map.current ? map.current.getZoom() : 10;
          const fontSize = Math.max(10, Math.round(zoom * 1.2));
          labelEl.style.fontSize = `${fontSize}px`;
          labelMarker.setLngLat(point.coords);
        } else {
          labelEl.style.display = 'none';
        }
      }
    });
  }, [guessed, currentPoint, showKey, blindMode, hintTrigger, isMapLoaded]);

  // Logic Functions
  const revealAll = (show) => { setShowKey(show); markersRef.current.forEach((rec) => { if (rec.labelEl) rec.labelEl.style.display = show ? '' : 'none'; }); };
  const resetGame = () => { 
      setGuessed([]); setCurrentPoint(null); setAnswer(''); setFeedback(null); 
      setStartTime(Date.now()); setFinalTime(0); setShowCompletion(false); setShowKey(false); 
      if (map.current) map.current.flyTo({ center: INITIAL_CENTER, zoom: 9.5, pitch, bearing: bearing - MAP_DECLINATION }); 
      markersRef.current.forEach((rec) => { if (rec.labelEl) rec.labelEl.style.display = 'none'; }); 
  };
  const adjustPitch = (val) => { const p = Math.max(0, Math.min(85, Number(val))); setPitch(p); if (map.current) map.current.setPitch(p); };
  const adjustBearing = (val) => { const b = (Number(val) + 360) % 360; setBearing(b); if (map.current) map.current.setBearing(b - MAP_DECLINATION); };
  
  const startManualMode = () => { setAreaMode(false); setRandomMode(false); };
  const startAreaMode = () => {
    setAreaMode(true); setRandomMode(false);
    const ids = getSortedAreaIds(selectedArea);
    setAreaQueue(ids); setAreaPointIndex(0);
    if (ids.length) { 
        let startP;
        if (randomAreaSequence) {
             const un = ids.filter(id => !guessed.includes(id));
             if (un.length > 0) startP = points.find(pt => pt.id === un[Math.floor(Math.random() * un.length)]);
        } else { startP = points.find(pt => pt.id === ids[0]); }
        if (startP) { setCurrentPoint(startP); if (map.current) map.current.flyTo({ center: startP.coords }); }
    }
  };
  const startRandomMode = () => {
    setRandomMode(true); setAreaMode(false);
    if (!currentPoint) {
        const rem = points.filter(p => !guessed.includes(p.id));
        const next = rem.length ? rem[Math.floor(Math.random() * rem.length)] : null;
        if (next) { setCurrentPoint(next); setAnswer(''); if (map.current) map.current.flyTo({ center: next.coords }); }
    }
  };
  const stopAreaMode = () => startManualMode();
  const stopRandomMode = () => startManualMode();
  const triggerHint = () => setHintTrigger(prev => prev + 1);
  const handleCompletion = () => { setFinalTime(elapsedTime); setShowCompletion(true); };

  const moveToNextPoint = () => {
      if (!currentPoint) return;
      let nextPoint = null;
      const sortedPoints = [...points].sort((a, b) => a.name.localeCompare(b.name));

      if (areaMode) {
          if (randomAreaSequence) {
              const updated = [...guessed, currentPoint.id];
              const remainingInArea = areaQueue.filter(id => !updated.includes(id));
              if (remainingInArea.length > 0) {
                  const randId = remainingInArea[Math.floor(Math.random() * remainingInArea.length)];
                  nextPoint = points.find(p => p.id === randId);
              }
          } else {
              const currentIndexInQueue = areaQueue.indexOf(currentPoint.id);
              if (currentIndexInQueue >= 0 && currentIndexInQueue < areaQueue.length - 1) {
                  nextPoint = points.find(p => p.id === areaQueue[currentIndexInQueue + 1]);
                  setAreaPointIndex(currentIndexInQueue + 1);
              }
          }
      } else {
          const currentIndex = sortedPoints.findIndex(p => p.id === currentPoint.id);
          if (currentIndex >= 0 && currentIndex < sortedPoints.length - 1) nextPoint = sortedPoints[currentIndex + 1];
          else if (currentIndex === sortedPoints.length - 1) nextPoint = sortedPoints[0]; 
      }
      if (nextPoint) {
          setCurrentPoint(nextPoint); setAnswer(''); setFeedback(null);
          if (map.current) map.current.flyTo({ center: nextPoint.coords });
      }
  };

  const moveToPrevPoint = () => {
      if (!currentPoint) return;
      let prevPoint = null;
      const sortedPoints = [...points].sort((a, b) => a.name.localeCompare(b.name));

      if (areaMode && !randomAreaSequence) {
          const currentIndexInQueue = areaQueue.indexOf(currentPoint.id);
          if (currentIndexInQueue > 0) {
              prevPoint = points.find(p => p.id === areaQueue[currentIndexInQueue - 1]);
              setAreaPointIndex(currentIndexInQueue - 1);
          }
      } else if (!areaMode) {
          const currentIndex = sortedPoints.findIndex(p => p.id === currentPoint.id);
          if (currentIndex > 0) prevPoint = sortedPoints[currentIndex - 1];
          else if (currentIndex === 0) prevPoint = sortedPoints[sortedPoints.length - 1]; 
      }
      if (prevPoint) {
          setCurrentPoint(prevPoint); setAnswer(''); setFeedback(null);
          if (map.current) map.current.flyTo({ center: prevPoint.coords });
      }
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
            const remainingInArea = areaQueue.filter(id => !updated.includes(id));
            if (remainingInArea.length > 0) {
                const randId = remainingInArea[Math.floor(Math.random() * remainingInArea.length)];
                nextPoint = points.find(p => p.id === randId);
            }
        } else {
            const nextIndex = areaPointIndex + 1;
            if (nextIndex < areaQueue.length) {
                setAreaPointIndex(nextIndex);
                nextPoint = points.find(p => p.id === areaQueue[nextIndex]);
            }
        }

        if (nextPoint) {
             setCurrentPoint(nextPoint); setAnswer('');
             if (map.current) map.current.flyTo({ center: nextPoint.coords });
        } else {
             const nextAreaIdx = (areaList.indexOf(selectedArea) + 1) % areaList.length;
             setAreaIndex(nextAreaIdx);
             const nextAreaName = areaList[nextAreaIdx];
             setSelectedArea(nextAreaName); // This triggers useEffect for queue
             
             // Manually compute next queue to prevent 1-render lag
             const nextIds = getSortedAreaIds(nextAreaName);
             const availableNext = nextIds.filter(id => !updated.includes(id));
             if (availableNext.length > 0) {
                 let firstId = randomAreaSequence ? availableNext[Math.floor(Math.random() * availableNext.length)] : availableNext[0];
                 const firstPoint = points.find(p => p.id === firstId);
                 setCurrentPoint(firstPoint || null); setAnswer('');
                 if (map.current && firstPoint) map.current.flyTo({ center: firstPoint.coords });
             } else {
                 handleCompletion(); setCurrentPoint(null);
             }
        }
      } else if (randomMode) {
        const remaining = points.filter(p => !updated.includes(p.id));
        const next = remaining.length ? remaining[Math.floor(Math.random() * remaining.length)] : null;
        if (next) { setCurrentPoint(next); setAnswer(''); if (map.current) map.current.flyTo({ center: next.coords }); }
        else { handleCompletion(); setCurrentPoint(null); setAnswer(''); }
      } else { setCurrentPoint(null); setAnswer(''); }
    } else { setFeedback('error'); }
  };

  useEffect(() => {
      const handleKeyDown = (e) => {
          if (e.key === 'ArrowRight') moveToNextPoint();
          else if (e.key === 'ArrowLeft') moveToPrevPoint();
          else if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); revealAll(!showKey); }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPoint, areaMode, randomAreaSequence, areaQueue, showKey]);

  // Lists for dropdown
  const missingPoints = points.filter(p => !guessed.includes(p.id)).sort((a,b)=>a.name.localeCompare(b.name));
  const answeredPoints = points.filter(p => guessed.includes(p.id)).sort((a,b)=>a.name.localeCompare(b.name));
  const pointsInAnyArea = new Set();
  Object.values(AREAS).forEach(names => names.forEach(name => { const id = nameToPointId(name); if(id) pointsInAnyArea.add(id); }));
  const otherPointsList = points.filter(p => !pointsInAnyArea.has(p.id)).sort((a,b)=>a.name.localeCompare(b.name));

  return (
    <div style={{ position: 'fixed', inset: 0, fontFamily: 'Arial, sans-serif', color: '#333', overflow: 'hidden' }}>
      <style>{`
        @keyframes pulseHint { 0% { transform: scale(0.5); opacity: 0; } 20% { opacity: 0.8; } 100% { transform: scale(2.0); opacity: 0; } }
        .animate-pulse-hint { animation: pulseHint 1s ease-out; }
        @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        .completion-popup { animation: slideDown 0.5s ease-out forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {mapError && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', textAlign: 'center', padding: '20px' }}>
          <div style={{ background: '#333', padding: '30px', borderRadius: '12px', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <h2 style={{ color: '#ff5252', marginTop: 0 }}>⚠️ Erro no Mapa</h2>
            <p>Limite de visualizações do mapa excedido em todas as chaves disponíveis.</p>
            <p style={{ fontSize: '14px', color: '#ccc', marginTop: '20px' }}>Por favor, <strong>entre em contato com o desenvolvedor</strong>.</p>
          </div>
        </div>
      )}

      {showCompletion && (
          <div className="completion-popup" style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', padding: '24px 32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 9999, textAlign: 'center', pointerEvents: 'auto', minWidth: '200px' }}>
              <button onClick={() => setShowCompletion(false)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#999', padding: '4px', lineHeight: 1 }}>✕</button>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Parabéns! ↗️🔥</div>
              <div style={{ fontSize: '16px', color: '#555' }}>tempo usado: <span style={{ fontWeight: 'bold', color: '#333' }}>{formatTime(finalTime)}</span></div>
          </div>
      )}

      {showIntro && !mapError && (
        <div style={{ position: 'absolute', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', justifyContent:'center', alignItems:'center' }}>
          <div style={{ background:'white', padding:'20px', borderRadius:'10px', width: '90%', maxWidth:'460px', textAlign:'left', lineHeight:1.4, maxHeight: '90%', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>Atalhos do Jogo:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontWeight: 'bold', background: '#eee', padding: '2px 6px', borderRadius: 4 }}>Enter</span><span>Confirmar resposta</span>
                <span style={{ fontWeight: 'bold', background: '#eee', padding: '2px 6px', borderRadius: 4 }}>➜</span><span>Próximo ponto</span>
                <span style={{ fontWeight: 'bold', background: '#eee', padding: '2px 6px', borderRadius: 4 }}>⬅</span><span>Ponto anterior</span>
                <span style={{ fontWeight: 'bold', background: '#eee', padding: '2px 6px', borderRadius: 4 }}>Ctrl + Espaço</span><span>Alternar gabarito</span>
            </div>
            <p style={{ fontStyle: 'italic', borderTop: '1px solid #eee', paddingTop: 10 }}>"O SENHOR é o meu pastor; nada me faltará." - Salmo 23.1</p>
            <div style={{ borderTop: '1px solid #eee', paddingTop: 10 }}>
                <button onClick={() => setShowFullInstructions(!showFullInstructions)} style={{ background: 'none', border: 'none', color: '#2196f3', cursor: 'pointer', padding: 0, fontWeight: 'bold', fontSize: 13 }}>{showFullInstructions ? 'Ocultar instruções detalhadas ▲' : 'Ver instruções detalhadas ▼'}</button>
                {showFullInstructions && (<div style={{ marginTop: 10, fontSize: 13, color: '#555' }}><p>- Clique nas bolinhas em vermelho manualmente para responder o nome do local;<br/>- Ou clique em aleatório e deixe que o mapa vá para qualquer um dos pontos faltantes;<br/>- Pode ativar ou desativar a opção aleatório a qualquer momento;<br/>- Pode apertar ENTER para aceitar a resposta;<br/>- Marque e desmarque a opção gabarito para conferências;<br/>- A lista pode te levar direto para o ponto selecionado;<br/>- Recomeçar reseta seu progresso.</p></div>)}
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop: 20 }}><button onClick={() => setShowIntro(false)} style={{ padding:'10px 20px', border:'none', borderRadius:6, background:'#4caf50', color:'white', fontSize: 16, cursor: 'pointer' }}>Começar</button></div>
          </div>
        </div>
      )}

      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {!mapError && (
        <>
          <div style={{ position: 'absolute', top: 10, right: 10, background:'rgba(255,255,255,0.45)', padding:6, borderRadius:6, minWidth:90, display:'flex', flexDirection:'column', gap:6, alignItems:'center', zIndex: 10 }}>
            <div style={{ fontSize:11, opacity:0.8 }}>Pitch</div>
            <input type="range" min="0" max="85" value={pitch} onChange={(e) => adjustPitch(e.target.value)} style={{ width:80 }} />
            <div style={{ fontSize:11, opacity:0.8 }}>Proa</div>
            <input type="range" min="0" max="360" value={bearing} onChange={(e) => adjustBearing(e.target.value)} style={{ width:80 }} />
          </div>

          <div style={{ position:'absolute', top:160, right:10, background:'rgba(255,255,255,0.6)', padding:6, borderRadius:6, textAlign:'center', zIndex: 10 }}>
            <div style={{ width:28, height:28, border:'2px solid rgba(0,0,0,0.6)', borderRadius:'50%', margin:'auto', position:'relative' }}><div style={{ position:'absolute', top:4, left:'50%', width:2, height:18, background:'red', transform:`translateX(-50%) rotate(${bearing}deg)` }} /></div>
            <div style={{ fontSize:12 }}>{bearing}°</div>
          </div>

          {currentPoint && (
            <div style={{ position: 'absolute', top: '80px', left: '16px', background: 'white', padding: '8px', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', width: 'auto', maxWidth: '220px' }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: 2, fontStyle: 'italic', fontWeight: 'bold' }}>{getPointInfo(currentPoint)}</div>
              <label style={{ fontWeight: 'bold', fontSize: 13 }}>Nome do ponto</label>
              <input type="text" value={answer} onChange={(e) => { setAnswer(e.target.value); if(feedback) setFeedback(null); }} onKeyDown={(e) => e.key === 'Enter' && checkAnswer()} style={{ padding:'6px', borderRadius:4, border: feedback === 'error' ? '1px solid red' : '1px solid #ccc', width: '100%', boxSizing: 'border-box' }} autoFocus />
              {feedback === 'error' && (<div style={{ color: 'red', fontSize: '11px', marginTop: -4, fontWeight: 'bold' }}>Incorreto</div>)}
              <div style={{ display:'flex', gap:8 }}><button onClick={checkAnswer} style={{ padding:'6px 12px', borderRadius:4, backgroundColor:'#4caf50', color:'white', border:'none', width: '100%', cursor:'pointer' }}>Responder</button></div>
            </div>
          )}

          <div className="scrollbar-hide" style={{ position:'absolute', bottom:0, left:0, right:0, background:'white', padding:'10px', display:'flex', alignItems:'center', gap:12, boxShadow:'0 -2px 6px rgba(0,0,0,0.15)', fontSize:14, zIndex: 30, overflowX: 'auto', whiteSpace: 'nowrap', width: '100%', boxSizing: 'border-box' }}>
            <div onClick={startManualMode} style={{ display:'flex', alignItems:'center', gap:4, cursor:'pointer', padding: '6px 10px', border: (!randomMode && !areaMode) ? '2px solid #4caf50' : '1px solid #ccc', borderRadius: '6px', backgroundColor: (!randomMode && !areaMode) ? '#e8f5e9' : 'transparent', transition: 'all 0.2s', flexShrink: 0 }}><b>Manual</b></div>
            <div onClick={() => { if(randomMode) stopRandomMode(); else startRandomMode(); }} style={{ display:'flex', alignItems:'center', gap:4, cursor:'pointer', padding: '6px 10px', border: randomMode ? '2px solid #4caf50' : '1px solid #ccc', borderRadius: '6px', backgroundColor: randomMode ? '#e8f5e9' : 'transparent', transition: 'all 0.2s', flexShrink: 0 }}><b>Aleatório</b></div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink: 0 }}>
                <div onClick={() => { if(areaMode) stopAreaMode(); else startAreaMode(); }} style={{ display:'flex', alignItems:'center', gap:4, cursor:'pointer', padding: '6px 10px', border: areaMode ? '2px solid #4caf50' : '1px solid #ccc', borderRadius: '6px', backgroundColor: areaMode ? '#e8f5e9' : 'transparent', transition: 'all 0.2s' }}><b>Áreas</b></div>
                {areaMode && (<label style={{ display:'flex', alignItems:'center', gap:4, fontSize: 12, cursor:'pointer' }} title="Sequência aleatória dentro da área atual"><input type="checkbox" checked={randomAreaSequence} onChange={(e) => setRandomAreaSequence(e.target.checked)} />Seq. Aleatória</label>)}
                <select value={selectedArea} onChange={(e)=> setSelectedArea(e.target.value)} style={{ padding:'6px', borderRadius:4, maxWidth: '120px' }}>{areaList.map(a => <option key={a} value={a}>{a}</option>)}</select>
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:4, marginLeft: 10, cursor:'pointer', borderLeft: '1px solid #ddd', paddingLeft: 10, flexShrink: 0 }}><input type="checkbox" checked={blindMode} onChange={(e) => setBlindMode(e.target.checked)} /><b>Às Cegas</b></label>
            <button onClick={triggerHint} style={{ opacity: blindMode ? 1 : 0, pointerEvents: blindMode ? 'auto' : 'none', transition: 'opacity 0.3s ease', padding: '6px 12px', borderRadius: 4, border: '1px solid #2196f3', backgroundColor: '#e3f2fd', color: '#1976d2', cursor: 'pointer', fontWeight: 'bold', fontSize: 12, flexShrink: 0 }}>Dica</button>
            <div style={{ display:'flex', alignItems: 'center', flexShrink: 0, border: '1px solid #ffcc80', borderRadius: 6, overflow: 'hidden', height: '28px', backgroundColor: 'white' }}>
                <div style={{ padding: '0 8px', fontSize: 11, background: '#fff3e0', color: '#e65100', display: 'flex', alignItems: 'center', height: '100%', fontWeight: 'bold', borderRight: '1px solid #ffcc80' }}>Limites</div>
                <div onClick={() => setBoundaryMode('all')} style={{ padding: '0 8px', fontSize: 12, cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center', backgroundColor: boundaryMode === 'all' ? '#ffe0b2' : 'white', fontWeight: boundaryMode === 'all' ? 'bold' : 'normal', borderRight: '1px solid #ffcc80', color: '#e65100' }}>Todos</div>
                <div onClick={() => setBoundaryMode('progressive')} style={{ padding: '0 8px', fontSize: 12, cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center', backgroundColor: boundaryMode === 'progressive' ? '#ffe0b2' : 'white', fontWeight: boundaryMode === 'progressive' ? 'bold' : 'normal', borderRight: '1px solid #ffcc80', color: '#e65100' }}>Progr.</div>
                <div onClick={() => setBoundaryMode('none')} style={{ padding: '0 8px', fontSize: 12, cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center', backgroundColor: boundaryMode === 'none' ? '#ffe0b2' : 'white', fontWeight: boundaryMode === 'none' ? 'bold' : 'normal', color: '#e65100' }}>Off</div>
            </div>
            <button onClick={resetGame} style={{ padding:'6px 10px', borderRadius:4, border:'none', background:'#f44336', color:'white', marginLeft: 'auto', flexShrink: 0 }}>Recomeçar</button>
            <div style={{ minWidth:180, marginLeft: 10, flexShrink: 0 }}>
              <select style={{ width:'100%', padding:6, borderRadius:4 }} onChange={(e)=>{ const pt=points.find(p=>p.id===Number(e.target.value)); if(pt && map.current) map.current.flyTo({ center:pt.coords, zoom:16 }); }} value="">
                <option value="">-- Ir para ponto --</option>
                {!areaMode ? (
                  <>
                    {missingPoints.length > 0 && (<optgroup label="Faltantes">{missingPoints.map(pt => (<option key={pt.id} value={pt.id}>{pt.name}</option>))}</optgroup>)}
                    {answeredPoints.length > 0 && (<optgroup label="Respondidos">{answeredPoints.map(pt => (<option key={pt.id} value={pt.id}>{pt.name} ✅</option>))}</optgroup>)}
                  </>
                ) : (
                  <>
                    {Object.entries(AREAS).map(([areaName, areaPointsNames]) => {
                        const areaPointsIds = areaPointsNames.map(n => nameToPointId(n)).filter(Boolean);
                        const areaMissing = areaPointsIds.filter(id => !guessed.includes(id)).sort((a,b) => points.find(p=>p.id===a).name.localeCompare(points.find(p=>p.id===b).name));
                        const areaGuessed = areaPointsIds.filter(id => guessed.includes(id)).sort((a,b) => points.find(p=>p.id===a).name.localeCompare(points.find(p=>p.id===b).name));
                        return (
                            <optgroup key={areaName} label={areaName}>
                                {areaMissing.map(id => { const pt = points.find(p => p.id === id); return <option key={id} value={id}>{pt.name}</option>; })}
                                {areaGuessed.map(id => { const pt = points.find(p => p.id === id); return <option key={id} value={id}>{pt.name} ✅</option>; })}
                            </optgroup>
                        );
                    })}
                    {otherPointsList.length > 0 && (
                        <optgroup label="DEMAIS PONTOS">
                            {otherPointsList.filter(p => !guessed.includes(p.id)).map(pt => (<option key={pt.id} value={pt.id}>{pt.name}</option>))}
                            {otherPointsList.filter(p => guessed.includes(p.id)).map(pt => (<option key={pt.id} value={pt.id}>{pt.name} ✅</option>))}
                        </optgroup>
                    )}
                  </>
                )}
              </select>
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:4, marginLeft: 10, flexShrink: 0 }}><input type="checkbox" checked={showKey} onChange={(e)=> revealAll(e.target.checked)} /> Gabarito</label>
            <label style={{ display:'flex', alignItems:'center', gap:4, marginLeft: 10, flexShrink: 0 }}><input type="checkbox" checked={showTerrain} onChange={(e)=> setShowTerrain(e.target.checked)} /> Relevo</label>
          </div>
        </>
      )}
    </div>
  );
}
