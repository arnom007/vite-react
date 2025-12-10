import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

const MAPTILER_KEY = "YHlTRP429Wo5PZXGJklr";
const MAP_STYLE = `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`;

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

const AREAS = {
  Capricornio: [
    'Trevo Aguaí Anhanguera','Leme','Leme 2000','Araras','Araras 2200','Cordeirópolis','Rio Claro 2000','Rio Claro','Ipeúna','Lagoa na SP-225','Itirapina','FAZ DA TOCA 2700','Analândia'
  ],
  Aquarius: [
    'Trevo Aguaí Anhanguera','Analândia','Analândia 2800','Itirapina','Itirapina 2600','Lagoa na SP-225','Fazenda Brotas','Américo Brasiliense','São Carlos 2600','Descalvado','Porto Ferreira'
  ],
  Pisces: [
    'Porto Ferreira','Descalvado','Usina Ipiranga 2500','Faz da Barra 2300','Faz Álamo 2400','Faz Pixoxo 2100','Américo Brasiliense','Rincão','Usina sta rita 2100','Pedágio São Simão'
  ],
  Taurus: [
    'Porto Ferreira','Pedágio São Simão','Santa Rita do Passa Quatro 2800','Santa Rita do Passa Quatro','Santa Cruz da Esperança','Fazenda da Serra','Mococa'
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
  const [showKey, setShowKey] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const [areaMode, setAreaMode] = useState(false);
  const [selectedArea, setSelectedArea] = useState('Capricornio');
  const areaList = Object.keys(AREAS);
  const [areaIndex, setAreaIndex] = useState(0);
  const [areaPointIndex, setAreaPointIndex] = useState(0);
  const [areaQueue, setAreaQueue] = useState([]);

  // Inject CSS for MapLibre
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const normalize = (s) => {
    try { return String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase(); }
    catch (e) { return String(s || '').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase(); }
  };

  const nameToPointId = (name) => {
    const norm = normalize(name);
    const p = points.find(pt => normalize(pt.name) === norm || (pt.aliases || []).some(a => normalize(a) === norm));
    return p ? p.id : null;
  };

  useEffect(() => {
    const names = AREAS[selectedArea] || [];
    const ids = names.map(n => nameToPointId(n)).filter(Boolean);
    setAreaQueue(ids);
    setAreaPointIndex(0);
  }, [selectedArea]);

  useEffect(() => {
    if (map.current) return;

    // Fetch style manually to avoid SecurityError with window.location.href in sandboxed iframes
    const initMap = async () => {
      try {
        const response = await fetch(MAP_STYLE);
        const styleJson = await response.json();

        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: styleJson,
          center: [-47.524, -21.812],
          zoom: 16,
          pitch,
          bearing: bearing - MAP_DECLINATION,
        });

        map.current.on('load', () => {
          points.forEach(point => {
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.width = '12px';
            el.style.height = '12px';
            el.style.backgroundColor = 'red';
            el.style.borderRadius = '50%';
            el.style.cursor = 'pointer';
            el.style.boxShadow = '0 0 5px rgba(0,0,0,0.6)';

            el.addEventListener('click', (e) => {
              e.stopPropagation();
              setCurrentPoint(point);
              setAnswer('');
            });

            const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
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

            const labelMarker = new maplibregl.Marker({ element: labelEl, anchor: 'bottom' })
              .setLngLat(point.coords)
              .addTo(map.current);

            markersRef.current.set(point.id, { marker, el, labelMarker, labelEl, point });
          });

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
    markersRef.current.forEach((rec, id) => {
      const { el, labelEl, labelMarker, point } = rec;
      if (!el) return;
      if (guessed.includes(id)) el.style.backgroundColor = 'green';
      else if (currentPoint && currentPoint.id === id) el.style.backgroundColor = 'yellow';
      else if (showKey) el.style.backgroundColor = 'orange';
      else el.style.backgroundColor = 'red';

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
  }, [guessed, currentPoint, showKey]);

  const checkAnswer = () => {
    const normalized = normalize(answer);
    if (currentPoint && currentPoint.aliases.map(a => normalize(a)).includes(normalized)) {
      const updated = Array.from(new Set([...guessed, currentPoint.id]));
      setGuessed(updated);
      const rec = markersRef.current.get(currentPoint.id);
      if (rec && rec.labelEl) rec.labelEl.style.display = '';

      if (areaMode && areaQueue.length) {
        const nextIndex = areaPointIndex + 1;
        if (nextIndex < areaQueue.length) {
          setAreaPointIndex(nextIndex);
          const nextId = areaQueue[nextIndex];
          const nextPoint = points.find(p => p.id === nextId);
          setCurrentPoint(nextPoint || null);
          setAnswer('');
          if (map.current && nextPoint) map.current.flyTo({ center: nextPoint.coords });
        } else {
          const nextAreaIdx = (areaIndex + 1) % areaList.length;
          setAreaIndex(nextAreaIdx);
          const nextAreaName = areaList[nextAreaIdx];
          setSelectedArea(nextAreaName);
          const nextNames = AREAS[nextAreaName] || [];
          const nextIds = nextNames.map(n => nameToPointId(n)).filter(Boolean);
          const prevIds = areaQueue || [];
          const overlap = prevIds.filter(id => nextIds.includes(id));
          if (overlap.length) {
            setGuessed(g => g.filter(id => !overlap.includes(id)));
          }
          setAreaQueue(nextIds);
          setAreaPointIndex(0);
          const firstId = nextIds[0];
          const firstPoint = points.find(p => p.id === firstId);
          setCurrentPoint(firstPoint || null);
          setAnswer('');
          if (map.current && firstPoint) map.current.flyTo({ center: firstPoint.coords });
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
  const resetGame = () => { setGuessed([]); setCurrentPoint(null); setAnswer(''); setStartTime(Date.now()); setShowKey(false); if (map.current) map.current.flyTo({ center: [-47.524, -21.812], zoom: 16, pitch, bearing: bearing - MAP_DECLINATION }); markersRef.current.forEach((rec) => { if (rec.labelEl) rec.labelEl.style.display = 'none'; }); };

  const adjustPitch = (val) => { const p = Math.max(0, Math.min(85, Number(val))); setPitch(p); if (map.current) map.current.setPitch(p); };
  const adjustBearing = (val) => { const b = (Number(val) + 360) % 360; setBearing(b); if (map.current) map.current.setBearing(b - MAP_DECLINATION); };

  const startAreaMode = () => {
    setAreaMode(true);
    const names = AREAS[selectedArea] || [];
    const ids = names.map(n => nameToPointId(n)).filter(Boolean);
    setAreaQueue(ids);
    setAreaIndex(areaList.indexOf(selectedArea));
    setAreaPointIndex(0);
    if (ids.length) { const p = points.find(pt => pt.id === ids[0]); setCurrentPoint(p || null); if (map.current && p) map.current.flyTo({ center: p.coords }); }
  };

  const stopAreaMode = () => { setAreaMode(false); setAreaQueue([]); setAreaPointIndex(0); };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', fontFamily: 'Arial, sans-serif', color: '#333' }}>

      {showIntro && (
        <div style={{ position: 'absolute', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', justifyContent:'center', alignItems:'center' }}>
          <div style={{ background:'white', padding:'20px', borderRadius:'10px', maxWidth:'460px', textAlign:'left', lineHeight:1.4 }}>
            <h3>INSTRUÇÕES:</h3>
            <p>- Clique nas bolinhas em vermelho manualmente para responder o nome do local;<br/>
            - Ou clique em aleatório e deixe que o mapa vá para qualquer um dos pontos faltantes;<br/>
            - Pode ativar ou desativar a opção aleatório a qualquer momento;<br/>
            - Pode apertar ENTER para aceitar a resposta;<br/>
            - Se o modo aleatório estiver ativo, ao acertar irá diretamente para outro ponto;<br/>
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

      {/* Alterado height de 82vh para 100vh para remover a barra cinza */}
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />

      <div style={{ position: 'absolute', top: 10, right: 10, background:'rgba(255,255,255,0.45)', padding:6, borderRadius:6, minWidth:90, display:'flex', flexDirection:'column', gap:6, alignItems:'center' }}>
        <div style={{ fontSize:11, opacity:0.8 }}>Pitch</div>
        <input type="range" min="0" max="85" value={pitch} onChange={(e) => adjustPitch(e.target.value)} style={{ width:80 }} />
        <div style={{ fontSize:11, opacity:0.8 }}>Proa</div>
        <input type="range" min="0" max="360" value={bearing} onChange={(e) => adjustBearing(e.target.value)} style={{ width:80 }} />
      </div>

      <div style={{ position:'absolute', top:160, right:10, background:'rgba(255,255,255,0.6)', padding:6, borderRadius:6, textAlign:'center' }}>
        <div style={{ width:28, height:28, border:'2px solid rgba(0,0,0,0.6)', borderRadius:'50%', margin:'auto', position:'relative' }}>
          <div style={{ position:'absolute', top:4, left:'50%', width:2, height:18, background:'red', transform:`translateX(-50%) rotate(${bearing}deg)` }} />
        </div>
        <div style={{ fontSize:12 }}>{bearing}°</div>
      </div>

      {currentPoint && (
        <div style={{ position: 'absolute', top: 100, left: 10, background: 'white', padding: 10, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label>Nome do ponto</label>
          <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkAnswer()} style={{ padding:6, borderRadius:4, border:'1px solid #ccc' }} />
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={checkAnswer} style={{ padding:6, borderRadius:4, backgroundColor:'#4caf50', color:'white', border:'none' }}>Responder</button>
          </div>
        </div>
      )}

      {/* Adicionado zIndex para garantir que a barra fique sobre o mapa */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'white', padding:'6px 10px', display:'flex', alignItems:'center', gap:10, boxShadow:'0 -2px 6px rgba(0,0,0,0.15)', fontSize:14, zIndex: 10 }}>
        <label style={{ display:'flex', alignItems:'center', gap:4 }}>
          <input type="checkbox" checked={randomMode} onChange={(e)=>{ const checked=e.target.checked; setRandomMode(checked); if(checked){ setAreaMode(false); stopAreaMode(); } if(checked && !currentPoint){ const rem=points.filter(p=>!guessed.includes(p.id)); const next=rem.length? rem[Math.floor(Math.random()*rem.length)] : null; if(next){ setCurrentPoint(next); setAnswer(''); if(map.current) map.current.flyTo({ center: next.coords }); } } }} /> Aleatório
        </label>

        <label style={{ display:'flex', alignItems:'center', gap:4 }}>
          <input type="checkbox" checked={areaMode} onChange={(e)=>{ const checked=e.target.checked; if(checked){ setRandomMode(false); startAreaMode(); } else stopAreaMode(); }} /> Áreas
        </label>

        <select value={selectedArea} onChange={(e)=> setSelectedArea(e.target.value)} style={{ padding:'4px 6px', borderRadius:4 }}>
          {areaList.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <button onClick={resetGame} style={{ padding:'6px 10px', borderRadius:4, border:'none', background:'#f44336', color:'white' }}>Recomeçar</button>

        <div style={{ marginLeft:'auto' }}>Tempo: {elapsedTime}s {" "} {guessed.length}/{points.length}</div>

        <div style={{ minWidth:180 }}>
          <select style={{ width:'100%', padding:4, borderRadius:4 }} onChange={(e)=>{ const pt=points.find(p=>p.id===e.target.value); if(pt && map.current) map.current.flyTo({ center:pt.coords, zoom:16 }); }}>
            <option value="">-- Selecionar ponto --</option>
            {Object.entries(AREAS).map(([area, list]) => (
              <optgroup key={area} label={area}>
                {list.map(name => { const pt = points.find(p=>p.name===name); return pt ? <option key={pt.id} value={pt.id}>{pt.name}</option> : null; })}
              </optgroup>
            ))}
          </select>
        </div>

        <label style={{ display:'flex', alignItems:'center', gap:4 }}>
          <input type="checkbox" checked={showKey} onChange={(e)=> revealAll(e.target.checked)} /> Gabarito
        </label>
      </div>
    </div>
  );
}
