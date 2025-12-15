import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

const MAPTILER_KEY = "YHlTRP429Wo5PZXGJklr";
const MAP_STYLE = `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`;

// Coordenadas Iniciais atualizadas: 21°59'13"S 47°20'14"W
const INITIAL_CENTER = [-47.3372, -21.9869];

const points = [
  { id: 'p1', name: 'Júpiter', aliases: ['jupiter'], coords: [-47.45, -21.9878] },
  { id: 'p2', name: 'Prédios Brancos', aliases: ['predios brancos'], coords: [-47.4142, -21.9872] },
  { id: 'p3', name: 'Trevo', aliases: ['trevo'], coords: [-47.3975, -22.0106] },
  { id: 'p8', name: 'FAZ DA TOCA 2700', aliases: ['faz da toca 2700'], coords: [-47.7033, -22.2456] },
  { id: 'p9', name: 'Engenho', aliases: ['engenho'], coords: [-47.3653, -22.0378] },
  { id: 'p10', name: 'Analândia 2800', aliases: ['analandia 2800'], coords: [-47.7192, -22.1567] },
  { id: 'p11', name: 'Itirapina 2600', aliases: ['itirapina 2600'], coords: [-47.8614, -22.1942] },
  { id: 'p12', name: 'Rio Claro 2000', aliases: ['rio claro 2000'], coords: [-47.5619, -22.4306] },
  { id: 'p13', name: 'Araras 2200', aliases: ['araras 2200'], coords: [-47.3586, -22.3389] },
  { id: 'p14', name: 'Leme 2000', aliases: ['leme 2000'], coords: [-47.3814, -22.2261] },
  { id: 'p15', name: 'São Carlos 2600', aliases: ['sao carlos 2600'], coords: [-47.9036, -21.8744] },
  { id: 'p16', name: 'Faz da Barra 2300', aliases: ['faz da barra 2300'], coords: [-47.7758, -21.8814] },
  { id: 'p17', name: 'Usina Ipiranga 2500', aliases: ['usina ipiranga 2500'], coords: [-47.7339, -21.8336] },
  { id: 'p18', name: 'Faz Álamo 2400', aliases: ['faz alamo 2400'], coords: [-47.90083, -21.81528] },
  { id: 'p19', name: 'Faz Pixoxó 2100', aliases: ['faz pixoxo 2100'], coords: [-47.88306, -21.78] },
  { id: 'p20', name: 'Araraquara 2300', aliases: ['araraquara 2300'], coords: [-48.1333, -21.8111] },
  { id: 'p21', name: 'Área Vermelha 2100', aliases: ['area vermelha 2100'], coords: [-47.6575, -21.7253] },
  { id: 'p22', name: 'Santa Rita do Passa Quatro 2800', aliases: ['santa rita do passa quatro 2800'], coords: [-47.47, -21.6425] },
  { id: 'p23', name: 'Lagoa do Aeroclube', aliases: ['lagoa do aeroclube'], coords: [-47.4233, -22.0403] },
  { id: 'p24', name: 'Matão', aliases: ['matao'], coords: [-48.3583, -21.6075] },
  { id: 'p25', name: 'Cravinhos', aliases: ['cravinhos'], coords: [-47.7278, -21.3286] },
  { id: 'p26', name: 'Cajuru', aliases: ['cajuru'], coords: [-47.3058, -21.2731] },
  { id: 'p27', name: 'Mococa', aliases: ['mococa'], coords: [-47.0003, -21.4756] },
  { id: 'p28', name: 'Santa Rosa de Viterbo', aliases: ['santa rosa de viterbo'], coords: [-47.3661, -21.501] },
  { id: 'p29', name: 'Santa Rita do Passa Quatro', aliases: ['santa rita do passa quatro'], coords: [-47.4803, -21.7086] },
  { id: 'p30', name: 'Porto Ferreira', aliases: ['porto ferreira'], coords: [-47.4833, -21.857] },
  { id: 'p31', name: 'Leme', aliases: ['leme'], coords: [-47.3847, -22.1811] },
  { id: 'p32', name: 'Brotas', aliases: ['brotas'], coords: [-48.1253, -22.2861] },
  { id: 'p33', name: 'Iracemópolis', aliases: ['iracemopolis'], coords: [-47.5197, -22.5872] },
  { id: 'p34', name: 'Cordeirópolis', aliases: ['cordeiropolis'], coords: [-47.4578, -22.4822] },
  { id: 'p35', name: 'Rio Claro', aliases: ['rio claro'], coords: [-47.5636, -22.4042] },
  { id: 'p36', name: 'Araras', aliases: ['araras'], coords: [-47.3811, -22.3647] },
  { id: 'p37', name: 'Santa Cruz da Conceição', aliases: ['santa cruz da conceicao'], coords: [-47.4517, -22.1378] },
  { id: 'p38', name: 'Analândia', aliases: ['analandia'], coords: [-47.6611, -22.1294] },
  { id: 'p39', name: 'Trevo Aguaí Anhanguera', aliases: ['trevo aguai anhanguera'], coords: [-47.432, -22.0383] },
  { id: 'p40', name: 'Itirapina', aliases: ['itirapina'], coords: [-47.8158, -22.2575] },
  { id: 'p41', name: 'Araraquara', aliases: ['araraquara'], coords: [-48.167, -21.7894] },
  { id: 'p42', name: 'São Carlos', aliases: ['sao carlos'], coords: [-22.0164, -47.8903] },
  { id: 'p43', name: 'Ibaté', aliases: ['ibate'], coords: [-47.9983, -21.9511] },
  { id: 'p44', name: 'Ipeúna', aliases: ['ipeuna'], coords: [-47.7114, -22.4331] },
  { id: 'p45', name: 'Morro da Antena', aliases: ['morro da antena'], coords: [-47.4836, -22.0042] },
  { id: 'p46', name: 'Ponta W Vila SGT', aliases: ['ponta w vila sgt'], coords: [-47.3697, -21.9906] },
  { id: 'p47', name: 'Ponte Velha', aliases: ['ponte velha'], coords: [-47.3683, -21.9261] },
  { id: 'p49', name: 'Lagoa na SP-225', aliases: ['lagoa na sp-225'], coords: [-48.0144, -22.2878] },
  { id: 'p50', name: 'Fazenda Brotas', aliases: ['fazenda brotas'], coords: [-48.0544, -22.235] },
  { id: 'p51', name: 'Rincão', aliases: ['rincao'], coords: [-48.0722, -21.5878] },
  { id: 'p52', name: 'Pedágio São Simão', aliases: ['pedagio sao simao'], coords: [-47.6642, -21.4144] },
  { id: 'p53', name: 'Santa Cruz da Esperança', aliases: ['santa cruz da esperanca'], coords: [-47.4283, -21.292] },
  { id: 'p54', name: 'Fazenda da Serra', aliases: ['fazenda da serra'], coords: [-47.2111, -21.3578] },
  { id: 'p55', name: 'Américo Brasiliense', aliases: ['americo brasiliense'], coords: [-48.1222, -21.7408] },
  { id: 'p56', name: 'Guatapará', aliases: ['guatapara'], coords: [-48.0367, -21.4956] },
  { id: 'p57', name: 'Corumbataí', aliases: ['corumbatai'], coords: [-47.6228, -22.2214] },
  { id: 'p58', name: 'Luís Antônio', aliases: ['luis antonio'], coords: [-47.7008, -21.5519] },
  { id: 'p59', name: 'São Simão', aliases: ['sao simao'], coords: [-47.5556, -21.4794] },
  { id: 'p60', name: 'Sumidouro', aliases: ['sumidouro'], coords: [-47.3467, -21.9636] },
  { id: 'p61', name: 'Estrada SO/SGT', aliases: ['estrada so sgt'], coords: [-47.3447, -22.0067] },
  { id: 'p62', name: 'Descalvado', aliases: ['descalvado'], coords: [-47.6258, -21.9117] },
];

const AREAS = {
  Capricornio: [
    'Trevo Aguaí Anhanguera','Leme','Leme 2000','Araras','Araras 2200','Cordeirópolis','Rio Claro 2000','Rio Claro','Ipeúna','Lagoa na SP-225','Itirapina','FAZ DA TOCA 2700','Analândia','Corumbataí'
  ],
  Aquarius: [
    'Trevo Aguaí Anhanguera','Analândia','Analândia 2800','Itirapina','Itirapina 2600','Lagoa na SP-225','Fazenda Brotas','Américo Brasiliense','São Carlos 2600','Descalvado','Porto Ferreira'
  ],
  Peixes: [
    'Porto Ferreira','Descalvado','Usina Ipiranga 2500','Faz da Barra 2300','Faz Álamo 2400','Faz Pixoxo 2100','Américo Brasiliense','Rincão','Usina sta rita 2100','Pedágio São Simão','Luís Antônio'
  ],
  Taurus: [
    'Porto Ferreira','Pedágio São Simão','Santa Rita do Passa Quatro 2800','Santa Rita do Passa Quatro','Santa Cruz da Esperança','Fazenda da Serra','Mococa','São Simão','Santa Rosa de Viterbo'
  ],
  'Tráfego AFA': [
    'Sumidouro','Estrada SO/SGT','Ponte Velha','Prédios Brancos','Júpiter','Morro da Antena','Trevo','Trevo Aguaí Anhanguera','Lagoa do Aeroclube','Engenho','Ponta W Vila SGT'
  ]
};

const AREA_LIMITS = {
  Capricornio: [
    'Trevo Aguaí Anhanguera', 'Leme', 'Araras', 'Cordeirópolis', 'Ipeúna', 'Lagoa na SP-225', 'Itirapina', 'Analândia'
  ],
  Aquarius: [
    'Trevo Aguaí Anhanguera', 'Analândia', 'Itirapina', 'Lagoa na SP-225', 'Fazenda Brotas', 'Américo Brasiliense', 'Descalvado', 'Porto Ferreira'
  ],
  Peixes: [
    'Porto Ferreira', 'Pedágio São Simão', 'Rincão', 'Américo Brasiliense', 'Descalvado'
  ],
  Taurus: [
    'Porto Ferreira', 'Pedágio São Simão', 'Santa Cruz da Esperança', 'Fazenda da Serra', 'Mococa', 'Santa Rosa de Viterbo', 'Santa Rita do Passa Quatro'
  ]
};

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef(new Map());

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
  
  const [boundaryMode, setBoundaryMode] = useState('progressive'); 
  
  const [showKey, setShowKey] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [hintTrigger, setHintTrigger] = useState(0);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const [selectedArea, setSelectedArea] = useState('Capricornio');
  const areaList = Object.keys(AREAS);
  const [areaIndex, setAreaIndex] = useState(0);
  const [areaPointIndex, setAreaPointIndex] = useState(0);
  const [areaQueue, setAreaQueue] = useState([]);

  const normalize = (s) => {
    try { return String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase(); }
    catch (e) { return String(s || '').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase(); }
  };

  const nameToPointId = (name) => {
    const norm = normalize(name);
    const p = points.find(pt => normalize(pt.name) === norm || (pt.aliases || []).some(a => normalize(a) === norm));
    return p ? p.id : null;
  };

  const getPointInfo = (point) => {
    if (!point) return "";
    let infoParts = [];
    const pId = point.id;
    Object.entries(AREAS).forEach(([areaName, areaPointsNames]) => {
      const isInArea = areaPointsNames.map(n => nameToPointId(n)).includes(pId);
      if (isInArea) {
        const limits = AREA_LIMITS[areaName] || [];
        const isLimit = limits.map(n => nameToPointId(n)).includes(pId);
        if (isLimit) {
          infoParts.push(`Limite da área de ${areaName}`);
        } else {
          infoParts.push(`Ponto da área de ${areaName}`);
        }
      }
    });
    const uniqueInfo = [...new Set(infoParts)];
    if (uniqueInfo.length === 0) return "Ponto Isolado";
    return uniqueInfo.join(" | ");
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const names = AREAS[selectedArea] || [];
    const ids = names.map(n => nameToPointId(n)).filter(Boolean);
    setAreaQueue(ids);
    setAreaPointIndex(0);
  }, [selectedArea]);

  useEffect(() => {
    if (!isMapLoaded || !map.current) return;

    Object.entries(AREA_LIMITS).forEach(([areaName, limitNames]) => {
        const source = map.current.getSource(`source-${areaName}`);
        if (!source) return;

        const limitIds = limitNames.map(name => nameToPointId(name)).filter(Boolean);
        
        if (limitIds.length < 2) {
             source.setData({ type: 'FeatureCollection', features: [] });
             return;
        }

        const segments = [];

        for (let i = 0; i < limitIds.length; i++) {
            const id1 = limitIds[i];
            const id2 = limitIds[(i + 1) % limitIds.length];

            const p1 = points.find(p => p.id === id1);
            const p2 = points.find(p => p.id === id2);

            if (p1 && p2) {
                let isVisible = false;

                if (boundaryMode === 'all') {
                    isVisible = true;
                } else if (boundaryMode === 'none') {
                    isVisible = false;
                } else if (boundaryMode === 'progressive') {
                    const isP1Guessed = guessed.includes(id1);
                    const isP2Guessed = guessed.includes(id2);
                    isVisible = isP1Guessed && isP2Guessed;
                }

                if (isVisible) {
                    segments.push([p1.coords, p2.coords]);
                }
            }
        }

        const geoJson = {
            'type': 'Feature',
            'geometry': {
                'type': 'MultiLineString',
                'coordinates': segments
            }
        };

        source.setData(geoJson);
    });

  }, [isMapLoaded, guessed, boundaryMode]);

  useEffect(() => {
    if (map.current) return;

    const initMap = async () => {
      try {
        const response = await fetch(MAP_STYLE);
        const styleJson = await response.json();

        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: styleJson,
          center: INITIAL_CENTER,
          zoom: 12,
          pitch,
          bearing: bearing - MAP_DECLINATION,
        });

        map.current.on('load', () => {
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
            el.style.width = '0px'; 
            el.style.height = '0px';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.flexShrink = '0';
            el.style.overflow = 'visible'; 
            
            const content = document.createElement('div');
            content.className = 'marker-content';
            content.style.width = '40px'; 
            content.style.height = '40px';
            content.style.borderRadius = '50%';
            content.style.cursor = 'pointer';
            content.style.display = 'flex';
            content.style.alignItems = 'center';
            content.style.justifyContent = 'center';
            content.style.position = 'relative';
            content.style.flexShrink = '0';
            content.style.transition = 'width 0.3s, height 0.3s';

            const hint = document.createElement('div');
            hint.className = 'hint-pulse';
            hint.style.position = 'absolute';
            hint.style.width = '100%';
            hint.style.height = '100%';
            hint.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            hint.style.borderRadius = '50%';
            hint.style.transform = 'scale(0.5)';
            hint.style.opacity = '0';
            hint.style.pointerEvents = 'none';

            const dot = document.createElement('div');
            dot.className = 'marker-dot';
            dot.style.width = '12px';
            dot.style.height = '12px';
            dot.style.backgroundColor = 'red';
            dot.style.borderRadius = '50%';
            dot.style.boxShadow = '0 0 5px rgba(0,0,0,0.6)';
            dot.style.transition = 'opacity 0.2s ease';
            
            content.appendChild(hint);
            content.appendChild(dot);
            el.appendChild(content);

            content.addEventListener('click', (e) => {
              e.stopPropagation();
              setCurrentPoint(point);
              setAnswer('');
            });

            const marker = new maplibregl.Marker({ 
                element: el, 
                anchor: 'center',
                pitchAlignment: 'viewport', 
                rotationAlignment: 'viewport'
            })
              .setLngLat(point.coords)
              .addTo(map.current);

            const labelEl = document.createElement('div');
            labelEl.className = 'label';
            labelEl.textContent = point.name;
            labelEl.style.color = 'white';
            labelEl.style.fontWeight = 'bold';
            labelEl.style.textShadow = '0 0 5px rgba(0,0,0,0.8)';
            labelEl.style.whiteSpace = 'nowrap';
            labelEl.style.pointerEvents = 'none';
            labelEl.style.display = 'none';
            labelEl.style.padding = '2px 6px';
            labelEl.style.borderRadius = '4px';
            labelEl.style.background = 'rgba(0,0,0,0.6)';

            const labelMarker = new maplibregl.Marker({ 
                element: labelEl, 
                anchor: 'bottom',
                pitchAlignment: 'viewport',
                rotationAlignment: 'viewport'
            })
              .setLngLat(point.coords)
              .addTo(map.current);

            markersRef.current.set(point.id, { marker, content, dot, hint, labelMarker, labelEl, point });
          });

          setIsMapLoaded(true);

          map.current.on('move', () => {
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
  }, []);

  useEffect(() => {
    if (!isMapLoaded) return;

    markersRef.current.forEach((rec, id) => {
      const { content, dot, hint, labelEl, labelMarker, point } = rec;
      if (!dot || !content) return;

      let color = 'red';
      let isGuessed = guessed.includes(id);
      let isCurrent = currentPoint && currentPoint.id === id;

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

  const triggerHint = () => {
      setHintTrigger(prev => prev + 1);
  };

  const checkAnswer = () => {
    const normalized = normalize(answer);
    if (currentPoint && currentPoint.aliases.map(a => normalize(a)).includes(normalized)) {
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
             setCurrentPoint(nextPoint);
             setAnswer('');
             if (map.current) map.current.flyTo({ center: nextPoint.coords });
        } else {
             const nextAreaIdx = (areaIndex + 1) % areaList.length;
             setAreaIndex(nextAreaIdx);
             const nextAreaName = areaList[nextAreaIdx];
             setSelectedArea(nextAreaName);

             const nextNames = AREAS[nextAreaName] || [];
             const nextIds = nextNames.map(n => nameToPointId(n)).filter(Boolean);
             setAreaQueue(nextIds);
             setAreaPointIndex(0);

             const availableNext = nextIds.filter(id => !updated.includes(id));
             if (availableNext.length > 0) {
                 let firstId;
                 if (randomAreaSequence) {
                     firstId = availableNext[Math.floor(Math.random() * availableNext.length)];
                 } else {
                     firstId = availableNext[0];
                 }
                 const firstPoint = points.find(p => p.id === firstId);
                 setCurrentPoint(firstPoint || null);
                 setAnswer('');
                 if (map.current && firstPoint) map.current.flyTo({ center: firstPoint.coords });
             } else {
                 alert('Todas as áreas finalizadas!');
                 setCurrentPoint(null);
             }
        }

      } else if (randomMode) {
        const remaining = points.filter(p => !updated.includes(p.id));
        const next = remaining.length ? remaining[Math.floor(Math.random() * remaining.length)] : null;
        if (next) { setCurrentPoint(next); setAnswer(''); if (map.current) map.current.flyTo({ center: next.coords }); }
        else { setCurrentPoint(null); setAnswer(''); }
      } else { setCurrentPoint(null); setAnswer(''); }
    } else {
      alert('Errado!');
    }
  };

  useEffect(() => { const id = setInterval(() => setElapsedTime(Math.floor((Date.now() - startTime) / 1000)), 1000); return () => clearInterval(id); }, [startTime]);

  const revealAll = (show) => { setShowKey(show); markersRef.current.forEach((rec) => { if (rec.labelEl) rec.labelEl.style.display = show ? '' : 'none'; }); };
  const resetGame = () => { setGuessed([]); setCurrentPoint(null); setAnswer(''); setStartTime(Date.now()); setShowKey(false); if (map.current) map.current.flyTo({ center: INITIAL_CENTER, zoom: 12, pitch, bearing: bearing - MAP_DECLINATION }); markersRef.current.forEach((rec) => { if (rec.labelEl) rec.labelEl.style.display = 'none'; }); };

  const adjustPitch = (val) => { const p = Math.max(0, Math.min(85, Number(val))); setPitch(p); if (map.current) map.current.setPitch(p); };
  const adjustBearing = (val) => { const b = (Number(val) + 360) % 360; setBearing(b); if (map.current) map.current.setBearing(b - MAP_DECLINATION); };

  const startManualMode = () => {
    setAreaMode(false);
    setRandomMode(false);
  };

  const startAreaMode = () => {
    setAreaMode(true);
    setRandomMode(false);
    const names = AREAS[selectedArea] || [];
    const ids = names.map(n => nameToPointId(n)).filter(Boolean);
    setAreaQueue(ids);
    setAreaIndex(areaList.indexOf(selectedArea));
    setAreaPointIndex(0);
    if (ids.length) { 
        let startP;
        if (randomAreaSequence) {
             const un = ids.filter(id => !guessed.includes(id));
             if (un.length > 0) startP = points.find(pt => pt.id === un[Math.floor(Math.random() * un.length)]);
        } else {
             startP = points.find(pt => pt.id === ids[0]); 
        }
        if (startP) {
            setCurrentPoint(startP); 
            if (map.current) map.current.flyTo({ center: startP.coords }); 
        }
    }
  };

  const startRandomMode = () => {
    setRandomMode(true);
    setAreaMode(false);
    if (!currentPoint) {
        const rem = points.filter(p => !guessed.includes(p.id));
        const next = rem.length ? rem[Math.floor(Math.random() * rem.length)] : null;
        if (next) {
            setCurrentPoint(next);
            setAnswer('');
            if (map.current) map.current.flyTo({ center: next.coords });
        }
    }
  };

  const stopAreaMode = () => { startManualMode(); };
  const stopRandomMode = () => { startManualMode(); };

  const sortedPoints = [...points].sort((a, b) => a.name.localeCompare(b.name));
  
  const missingPoints = sortedPoints.filter(p => !guessed.includes(p.id));
  const answeredPoints = sortedPoints.filter(p => guessed.includes(p.id));

  const pointsInAnyArea = new Set();
  Object.values(AREAS).forEach(names => {
      names.forEach(name => {
          const id = nameToPointId(name);
          if (id) pointsInAnyArea.add(id);
      });
  });

  const otherPointsList = sortedPoints.filter(p => !pointsInAnyArea.has(p.id));

  return (
    <div style={{ position: 'fixed', inset: 0, fontFamily: 'Arial, sans-serif', color: '#333', overflow: 'hidden' }}>
      
      <style>{`
        @keyframes pulseHint {
          0% { transform: scale(0.5); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: scale(2.0); opacity: 0; }
        }
        .animate-pulse-hint {
          animation: pulseHint 1s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      {showIntro && (
        <div style={{ position: 'absolute', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', justifyContent:'center', alignItems:'center' }}>
          <div style={{ background:'white', padding:'20px', borderRadius:'10px', maxWidth:'460px', textAlign:'left', lineHeight:1.4 }}>
            <h3>INSTRUÇÕES:</h3>
            <p>- Clique nas bolinhas em vermelho manualmente para responder o nome do local;<br/>
            - Ou clique em aleatório e deixe que o mapa vá para qualquer um dos pontos faltantes;<br/>
            - Pode ativar ou desativar a opção aleatório a qualquer momento;<br/>
            - Pode apertar ENTER para aceitar a resposta;<br/>
            - Marque e desmarque a opção gabarito para conferências;<br/>
            - A lista pode te levar direto para o ponto selecionado;<br/>
            - Recomeçar reseta seu progresso.</p>
            <p><i>"O Senhor é o meu pastor; de nada terei falta." - Salmos 23:1</i></p>
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button onClick={() => setShowIntro(false)} style={{ marginTop:10, padding:'8px 14px', border:'none', borderRadius:6, background:'#4caf50', color:'white' }}>Começar</button>
            </div>
          </div>
        </div>
      )}

      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      <div style={{ position: 'absolute', top: 10, right: 10, background:'rgba(255,255,255,0.45)', padding:6, borderRadius:6, minWidth:90, display:'flex', flexDirection:'column', gap:6, alignItems:'center', zIndex: 10 }}>
        <div style={{ fontSize:11, opacity:0.8 }}>Pitch</div>
        <input type="range" min="0" max="85" value={pitch} onChange={(e) => adjustPitch(e.target.value)} style={{ width:80 }} />
        <div style={{ fontSize:11, opacity:0.8 }}>Proa</div>
        <input type="range" min="0" max="360" value={bearing} onChange={(e) => adjustBearing(e.target.value)} style={{ width:80 }} />
      </div>

      <div style={{ position:'absolute', top:160, right:10, background:'rgba(255,255,255,0.6)', padding:6, borderRadius:6, textAlign:'center', zIndex: 10 }}>
        <div style={{ width:28, height:28, border:'2px solid rgba(0,0,0,0.6)', borderRadius:'50%', margin:'auto', position:'relative' }}>
          <div style={{ position:'absolute', top:4, left:'50%', width:2, height:18, background:'red', transform:`translateX(-50%) rotate(${bearing}deg)` }} />
        </div>
        <div style={{ fontSize:12 }}>{bearing}°</div>
      </div>

      {currentPoint && (
        <div style={{ position: 'absolute', top: '80px', left: '16px', background: 'white', padding: '8px', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', width: 'auto', maxWidth: '220px' }}>
          
          <div style={{ fontSize: '11px', color: '#666', marginBottom: 2, fontStyle: 'italic' }}>
            {getPointInfo(currentPoint)}
          </div>

          <label style={{ fontWeight: 'bold', fontSize: 13 }}>Nome do ponto</label>
          <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkAnswer()} style={{ padding:'6px', borderRadius:4, border:'1px solid #ccc', width: '100%', boxSizing: 'border-box' }} autoFocus />
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={checkAnswer} style={{ padding:'6px 12px', borderRadius:4, backgroundColor:'#4caf50', color:'white', border:'none', width: '100%', cursor:'pointer' }}>Responder</button>
          </div>
        </div>
      )}

      <div className="scrollbar-hide" style={{ 
          position:'absolute', 
          bottom:0, 
          left:0, 
          right:0, 
          background:'white', 
          padding:'10px', 
          display:'flex', 
          alignItems:'center', 
          gap:12, 
          boxShadow:'0 -2px 6px rgba(0,0,0,0.15)', 
          fontSize:14, 
          zIndex: 30,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          width: '100%',
          boxSizing: 'border-box'
      }}>
        
        <div 
          onClick={startManualMode} 
          style={{ 
            display:'flex', alignItems:'center', gap:4, cursor:'pointer', padding: '6px 10px', 
            border: (!randomMode && !areaMode) ? '2px solid #4caf50' : '1px solid #ccc',
            borderRadius: '6px',
            backgroundColor: (!randomMode && !areaMode) ? '#e8f5e9' : 'transparent',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
        >
          <b>Manual</b>
        </div>

        <div 
          onClick={() => { if(randomMode) stopRandomMode(); else startRandomMode(); }} 
          style={{ 
            display:'flex', alignItems:'center', gap:4, cursor:'pointer', padding: '6px 10px', 
            border: randomMode ? '2px solid #4caf50' : '1px solid #ccc',
            borderRadius: '6px',
            backgroundColor: randomMode ? '#e8f5e9' : 'transparent',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
        >
          <b>Aleatório</b>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink: 0 }}>
            <div 
              onClick={() => { if(areaMode) stopAreaMode(); else startAreaMode(); }}
              style={{
                display:'flex', alignItems:'center', gap:4, cursor:'pointer', padding: '6px 10px',
                border: areaMode ? '2px solid #4caf50' : '1px solid #ccc',
                borderRadius: '6px',
                backgroundColor: areaMode ? '#e8f5e9' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <b>Áreas</b>
            </div>

            {areaMode && (
                <label style={{ display:'flex', alignItems:'center', gap:4, fontSize: 12, cursor:'pointer' }} title="Sequência aleatória dentro da área atual">
                    <input type="checkbox" checked={randomAreaSequence} onChange={(e) => setRandomAreaSequence(e.target.checked)} />
                    Seq. Aleatória
                </label>
            )}

            <select value={selectedArea} onChange={(e)=> setSelectedArea(e.target.value)} style={{ padding:'6px', borderRadius:4, maxWidth: '120px' }}>
              {areaList.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
        </div>

        <label style={{ display:'flex', alignItems:'center', gap:4, marginLeft: 10, cursor:'pointer', borderLeft: '1px solid #ddd', paddingLeft: 10, flexShrink: 0 }}>
            <input type="checkbox" checked={blindMode} onChange={(e) => setBlindMode(e.target.checked)} />
            <b>Às Cegas</b>
        </label>

        {/* Botão Dica (aparece se blindMode) */}
        <button
            onClick={triggerHint}
            style={{
                opacity: blindMode ? 1 : 0,
                pointerEvents: blindMode ? 'auto' : 'none',
                transition: 'opacity 0.3s ease',
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #2196f3',
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: 12,
                flexShrink: 0
            }}
        >
            Dica
        </button>

        {/* Boundary Control - Moved here */}
        <div style={{ display:'flex', alignItems: 'center', flexShrink: 0, border: '1px solid #ffcc80', borderRadius: 6, overflow: 'hidden', height: '28px', backgroundColor: 'white' }}>
            <div style={{ padding: '0 8px', fontSize: 11, background: '#fff3e0', color: '#e65100', display: 'flex', alignItems: 'center', height: '100%', fontWeight: 'bold', borderRight: '1px solid #ffcc80' }}>
                Limites
            </div>
            <div
                onClick={() => setBoundaryMode('all')}
                style={{
                    padding: '0 8px', fontSize: 12, cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center',
                    backgroundColor: boundaryMode === 'all' ? '#ffe0b2' : 'white',
                    fontWeight: boundaryMode === 'all' ? 'bold' : 'normal',
                    borderRight: '1px solid #ffcc80', color: '#e65100'
                }}
            >
                Todos
            </div>
            <div
                onClick={() => setBoundaryMode('progressive')}
                style={{
                    padding: '0 8px', fontSize: 12, cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center',
                    backgroundColor: boundaryMode === 'progressive' ? '#ffe0b2' : 'white',
                    fontWeight: boundaryMode === 'progressive' ? 'bold' : 'normal',
                    borderRight: '1px solid #ffcc80', color: '#e65100'
                }}
            >
                Progr.
            </div>
            <div
                onClick={() => setBoundaryMode('none')}
                style={{
                    padding: '0 8px', fontSize: 12, cursor: 'pointer', height: '100%', display: 'flex', alignItems: 'center',
                    backgroundColor: boundaryMode === 'none' ? '#ffe0b2' : 'white',
                    fontWeight: boundaryMode === 'none' ? 'bold' : 'normal',
                    color: '#e65100'
                }}
            >
                Off
            </div>
        </div>

        <button onClick={resetGame} style={{ padding:'6px 10px', borderRadius:4, border:'none', background:'#f44336', color:'white', marginLeft: 'auto', flexShrink: 0 }}>Recomeçar</button>

        <div style={{ minWidth:180, marginLeft: 10, flexShrink: 0 }}>
          <select 
            style={{ width:'100%', padding:6, borderRadius:4 }} 
            onChange={(e)=>{ const pt=points.find(p=>p.id===e.target.value); if(pt && map.current) map.current.flyTo({ center:pt.coords, zoom:16 }); }}
            value=""
          >
            <option value="">-- Ir para ponto --</option>
            
            {!areaMode ? (
              <>
                {missingPoints.length > 0 && (
                    <optgroup label="Faltantes">
                        {missingPoints.map(pt => (
                            <option key={pt.id} value={pt.id}>{pt.name}</option>
                        ))}
                    </optgroup>
                )}
                {answeredPoints.length > 0 && (
                    <optgroup label="Respondidos">
                        {answeredPoints.map(pt => (
                            <option key={pt.id} value={pt.id}>{pt.name} ✅</option>
                        ))}
                    </optgroup>
                )}
              </>
            ) : (
              <>
                {Object.entries(AREAS).map(([areaName, areaPointsNames]) => {
                    const areaPointsIds = areaPointsNames.map(n => nameToPointId(n)).filter(Boolean);
                    const areaMissing = areaPointsIds.filter(id => !guessed.includes(id));
                    const areaGuessed = areaPointsIds.filter(id => guessed.includes(id));
                    
                    areaMissing.sort((a,b) => { 
                        const pa = points.find(p=>p.id===a); const pb = points.find(p=>p.id===b);
                        return pa.name.localeCompare(pb.name);
                    });
                    areaGuessed.sort((a,b) => { 
                        const pa = points.find(p=>p.id===a); const pb = points.find(p=>p.id===b);
                        return pa.name.localeCompare(pb.name);
                    });

                    return (
                        <optgroup key={areaName} label={areaName}>
                            {areaMissing.map(id => {
                                const pt = points.find(p => p.id === id);
                                return <option key={id} value={id}>{pt.name}</option>;
                            })}
                            {areaGuessed.map(id => {
                                const pt = points.find(p => p.id === id);
                                return <option key={id} value={id}>{pt.name} ✅</option>;
                            })}
                        </optgroup>
                    );
                })}

                {otherPointsList.length > 0 && (
                    <optgroup label="DEMAIS PONTOS">
                        {otherPointsList.filter(p => !guessed.includes(p.id)).map(pt => (
                            <option key={pt.id} value={pt.id}>{pt.name}</option>
                        ))}
                        {otherPointsList.filter(p => guessed.includes(p.id)).map(pt => (
                            <option key={pt.id} value={pt.id}>{pt.name} ✅</option>
                        ))}
                    </optgroup>
                )}
              </>
            )}

          </select>
        </div>

        <label style={{ display:'flex', alignItems:'center', gap:4, marginLeft: 10, flexShrink: 0 }}>
          <input type="checkbox" checked={showKey} onChange={(e)=> revealAll(e.target.checked)} /> Gabarito
        </label>
      </div>
    </div>
  );
}
