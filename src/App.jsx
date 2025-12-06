// Map Quiz App with optimized markers and live MapLibre preview
import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// --- Put your MapTiler key here (user provided)
const MAPTILER_KEY = "YHlTRP429Wo5PZXGJklr";
const MAP_STYLE = `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`;

// ==============================
// POINTS (complete list)
// ==============================
const points = [
  { id: 'p1', name: 'Júpiter', aliases: ['jupiter'], coords: [-47.45, -21.9878] },
  { id: 'p2', name: 'Prédios Brancos', aliases: ['predios brancos'], coords: [-47.4142, -21.9872] },
  { id: 'p3', name: 'Trevo', aliases: ['trevo'], coords: [-47.3975, -22.0106] },
  { id: 'p4', name: '130', aliases: ['130'], coords: [-47.8558, -21.6653] },
  { id: 'p5', name: '200', aliases: ['200'], coords: [-47.4297, -21.4375] },
  { id: 'p6', name: '100', aliases: ['100'], coords: [-47.4297, -21.4375] },
  { id: 'p7', name: '060', aliases: ['060'], coords: [-47.5856, -22.3278] },
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
  { id: 'p19', name: 'Faz Pixoxó 2100', aliases: ['faz pixoxo 2100'], coords: [-47.88306, -21.78000] },
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
  { id: 'p39', name: 'Trevo', aliases: ['trevo'], coords: [-47.432, -22.0383] },
  { id: 'p40', name: 'Itirapina', aliases: ['itirapina'], coords: [-47.8158, -22.2575] },
  { id: 'p41', name: 'Araraquara', aliases: ['araraquara'], coords: [-48.167, -21.7894] },
  { id: 'p42', name: 'São Carlos', aliases: ['sao carlos'], coords: [-47.8903, -22.0164] },
  { id: 'p43', name: 'Ibaté', aliases: ['ibate'], coords: [-47.9983, -21.9511] },
  { id: 'p44', name: 'Ipeúna', aliases: ['ipeuna'], coords: [-47.7114, -22.4331] },
  { id: 'p45', name: 'Morro da Antena', aliases: ['morro da antena'], coords: [-47.4836, -22.0042] },
  { id: 'p46', name: 'Ponta W Vila SGT', aliases: ['ponta w vila sgt'], coords: [-47.3697, -21.9906] },
  { id: 'p47', name: 'Ponte Velha', aliases: ['ponte velha'], coords: [-47.3683, -21.9261] },
  { id: 'p48', name: 'Rua com Prédios Brancos', aliases: ['rua com predios brancos'], coords: [-47.3656, -22.0358] },
  { id: 'p49', name: 'Lagoa na SP-225', aliases: ['lagoa na sp-225'], coords: [-48.0144, -22.2878] },
  { id: 'p50', name: 'Fazenda Brotas', aliases: ['fazenda brotas'], coords: [-48.0544, -22.235] },
  { id: 'p51', name: 'Rincão', aliases: ['rincao'], coords: [-48.0722, -21.5878] },
  { id: 'p52', name: 'Pedágio São Simão', aliases: ['pedagio sao simao'], coords: [-47.6642, -21.4144] },
  { id: 'p53', name: 'Santa Cruz da Esperança', aliases: ['santa cruz da esperanca'], coords: [-47.4283, -21.292] },
  { id: 'p54', name: 'Fazenda da Serra', aliases: ['fazenda da serra'], coords: [-47.2111, -21.3578] },
  { id: 'p55', name: 'Américo Brasiliense', aliases: ['americo brasiliense'], coords: [-48.1222, -21.7408] },
  { id: 'p56', name: 'Guatapará', aliases: ['guatapara'], coords: [-48.0367, -21.4956] }
];

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef(new Map()); // id -> { marker, labelEl }

  const [guessed, setGuessed] = useState([]);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [answer, setAnswer] = useState('');
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pitch, setPitch] = useState(60);
  const [bearing, setBearing] = useState(130);
  const [randomMode, setRandomMode] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // create or update marker element styles
  const updateMarkerStyle = (pointId) => {
    const rec = markersRef.current.get(pointId);
    if (!rec) return;
    const { el } = rec;
    if (!el) return;
    if (guessed.includes(pointId)) {
      el.style.backgroundColor = 'green';
    } else if (currentPoint && currentPoint.id === pointId) {
      el.style.backgroundColor = 'yellow';
    } else if (showKey) {
      // when showing key, highlight all markers lightly
      el.style.backgroundColor = 'orange';
    } else {
      el.style.backgroundColor = 'red';
    }
  };

  // initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [-47.524, -21.812],
      zoom: 16,
      pitch,
      bearing,
    });

    map.current.on('load', () => {
      // create markers once
      points.forEach(point => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.backgroundColor = 'red';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 0 5px black';

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setCurrentPoint(point);
          setAnswer('');
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(point.coords)
          .addTo(map.current);

        // label element (for guessed markers)
        const labelEl = document.createElement('div');
        labelEl.className = 'label';
        labelEl.textContent = point.name;
        labelEl.style.color = 'white';
        labelEl.style.fontWeight = 'bold';
        labelEl.style.textShadow = '0 0 5px black';
        labelEl.style.whiteSpace = 'nowrap';
        labelEl.style.pointerEvents = 'none';
        labelEl.style.display = 'none';

        const labelMarker = new maplibregl.Marker({ element: labelEl, anchor: 'bottom' })
          .setLngLat(point.coords)
          .addTo(map.current);

        markersRef.current.set(point.id, { marker, el, labelMarker, labelEl, point });
      });

      // if showKey was toggled before load, apply it
      if (showKey) {
        markersRef.current.forEach((rec) => { if (rec.labelEl) rec.labelEl.style.display = ''; });
      }

      // fly to initial point if randomMode
      if (randomMode && !currentPoint) {
        const remaining = points.filter(p => !guessed.includes(p.id));
        const next = remaining.length ? remaining[Math.floor(Math.random() * remaining.length)] : null;
        if (next) {
          setCurrentPoint(next);
          setAnswer('');
          map.current.flyTo({ center: next.coords });
        }
      }

    });

    return () => {
      // cleanup map and markers
      markersRef.current.forEach(({ marker, labelMarker }) => {
        try { marker.remove(); } catch (e) {}
        try { labelMarker.remove(); } catch (e) {}
      });
      markersRef.current.clear();
      if (map.current) map.current.remove();
      map.current = null;
    };
  }, []);

  // update marker visuals when guessed/currentPoint/showKey change or zoom
  useEffect(() => {
    markersRef.current.forEach((rec, id) => {
      updateMarkerStyle(id);
      // show/hide label for guessed or when gabarito (showKey) is active
      if (rec.labelEl) {
        if (guessed.includes(id) || showKey) {
          rec.labelEl.style.display = '';
          // adjust font size based on zoom
          const zoom = map.current ? map.current.getZoom() : 10;
          const fontSize = Math.max(10, zoom * 1.5 * 0.7);
          rec.labelEl.style.fontSize = `${fontSize}px`;
          rec.labelMarker.setLngLat(rec.point.coords);
        } else {
          rec.labelEl.style.display = 'none';
        }
      }
    });
  }, [guessed, currentPoint, showKey]);

  // throttle zoomend label resizing
  useEffect(() => {
    const handler = () => {
      markersRef.current.forEach((rec) => {
        if (rec.labelEl && rec.labelEl.style.display !== 'none' && map.current) {
          const zoom = map.current.getZoom();
          const fontSize = Math.max(10, zoom * 1.5 * 0.7);
          rec.labelEl.style.fontSize = `${fontSize}px`;
        }
      });
    };
    if (map.current) map.current.on('zoomend', handler);
    return () => { if (map.current) map.current?.off('zoomend', handler); };
  }, []);

  const adjustPitch = (delta) => {
    const newPitch = Math.max(0, Math.min(85, pitch + delta));
    setPitch(newPitch);
    if (map.current) map.current.setPitch(newPitch);
  };

  const adjustBearing = (delta) => {
    const newBearing = (bearing + delta + 360) % 360;
    setBearing(newBearing);
    if (map.current) map.current.setBearing(newBearing);
  };

  const normalize = (s) => s.normalize('NFD').replace(/[^a-zA-Z0-9]/g,'').toLowerCase();

  const checkAnswer = () => {
    const normalized = normalize(answer);
    if (currentPoint && currentPoint.aliases.map(a => normalize(a)).includes(normalized)) {
      const updatedGuessed = Array.from(new Set([...guessed, currentPoint.id]));
      setGuessed(updatedGuessed);
      const rec = markersRef.current.get(currentPoint.id);
      if (rec && rec.labelEl) rec.labelEl.style.display = '';
      if (randomMode) {
        const remaining = points.filter(p => !updatedGuessed.includes(p.id));
        const next = remaining.length ? remaining[Math.floor(Math.random() * remaining.length)] : null;
        if (next) {
          setCurrentPoint(next);
          setAnswer('');
          if (map.current) map.current.flyTo({ center: next.coords });
        } else { setCurrentPoint(null); setAnswer(''); }
      } else { setCurrentPoint(null); setAnswer(''); }
    } else alert('Errado!');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // helper: show gabarito
  const revealAll = () => {
    setShowKey(true);
    markersRef.current.forEach((rec) => { if (rec.labelEl) rec.labelEl.style.display = ''; });
  };

  // helper: reset game
  const resetGame = () => {
    setGuessed([]);
    setCurrentPoint(null);
    setAnswer('');
    setStartTime(Date.now());
    setShowKey(false);
    if (map.current) map.current.flyTo({ center: [-47.524, -21.812], zoom: 16, pitch, bearing });
    markersRef.current.forEach((rec) => { if (rec.labelEl) rec.labelEl.style.display = 'none'; });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      {/* Map container */}
      <div ref={mapContainer} style={{ width: '100%', height: '90vh', position: 'relative' }} />

      {/* Top-right controls: pitch & bearing */}
      <div style={{ position: 'absolute', top: 10, right: 10, background: 'white', padding: '10px', borderRadius: '8px', minWidth: '180px' }}>
        <label>Pitch: {pitch}°</label>
        <input type="range" min="0" max="85" value={pitch} onChange={(e) => adjustPitch(Number(e.target.value) - pitch)} style={{ width: '100%' }} />
        <label>Azimute: {bearing}°</label>
        <input type="range" min="0" max="360" value={bearing} onChange={(e) => adjustBearing(Number(e.target.value) - bearing)} style={{ width: '100%' }} />
      </div>

      {/* Current point answer box */}
      {currentPoint && (
        <div style={{ position: 'absolute', top: 100, left: 10, background: 'white', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label>Qual é o nome da cidade?</label>
          <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkAnswer()} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={checkAnswer} style={{ padding:'6px', borderRadius:'4px', backgroundColor:'#4caf50', color:'white', border:'none' }}>Responder</button>
            
          </div>
        </div>
      )}

      {/* Top-center controls: random toggle + restart */}
      <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label>
          <input type="checkbox" checked={randomMode} onChange={(e) => {
            const isChecked = e.target.checked;
            setRandomMode(isChecked);
            if (isChecked && !currentPoint) {
              const remaining = points.filter(p => !guessed.includes(p.id));
              const next = remaining.length ? remaining[Math.floor(Math.random() * remaining.length)] : null;
              if (next) {
                setCurrentPoint(next);
                setAnswer('');
                if (map.current) map.current.flyTo({ center: next.coords });
              }
            }
          }} /> Aleatório
        </label>
        <button onClick={resetGame} style={{ padding: '6px 10px', borderRadius: '4px', border: 'none', backgroundColor: '#f44336', color: 'white' }}>Recomeçar</button>
      </div>

      {/* Bottom-left: time and score */}
      <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'white', padding: '8px', borderRadius: '8px' }}>
        Tempo: {elapsedTime}s<br />
        Acertos: {guessed.length} / {points.length}
      </div>

      {/* Bottom-right: total, dropdown (acertados -> faltantes), gabarito button */}
      <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'white', padding: '10px', borderRadius: '8px', maxHeight: '30vh', overflowY: 'auto', minWidth: '220px' }}>
        <strong>Total de pontos: {points.length}</strong>
        <div style={{ marginTop: '8px' }}>
          <label style={{ display: 'block', marginBottom: '6px' }}>Selecionar ponto:</label>
          <select style={{ width: '100%', padding: '6px', borderRadius: '4px' }} onChange={(e)=>{
            const pt = points.find(p=>p.id===e.target.value);
            if(pt && map.current){ map.current.flyTo({center: pt.coords, zoom: 16}); }
          }} value="">
            <option value="">-- Selecionar --</option>
            <optgroup label="Acertados">
              {guessed.map(id=>{ const c=points.find(p=>p.id===id); return <option key={id} value={id}>{c?.name ?? id}</option>; })}
            </optgroup>
            <optgroup label="Faltantes">
              {points.filter(p=>!guessed.includes(p.id)).map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
            </optgroup>
          </select>

          <button onClick={revealAll} style={{ marginTop:'10px', padding:'6px', borderRadius:'4px', backgroundColor:'#2196f3', color:'white', border:'none', width:'100%' }}>Gabarito</button>
        </div>
      </div>
    </div>
  );
}
