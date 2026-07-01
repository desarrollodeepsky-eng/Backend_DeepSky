import { useState, useEffect, useRef } from 'react';
import { getAsteroides } from '../api/nasaApi.js';

function r(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function generarEstrellas(cantidad = 80) {
  return Array.from({ length: cantidad }).map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.6 + 0.2,
    animDelay: Math.random() * 3,
  }));
}

const ESTRELLAS = generarEstrellas();

function procesarAsteroides(datos) {
  if (!datos.length) return [];
  const distanciaMaxima = Math.max(...datos.map(a => a.distancia_tierra_km));
  return datos.map((ast, index) => {
    const angulo = (index * (360 / datos.length)) * (Math.PI / 180);
    const radio = (ast.distancia_tierra_km / distanciaMaxima) * 165;
    const formaRoca = `${r(30,60)}% ${r(30,60)}% ${r(30,60)}% ${r(30,60)}% / ${r(30,60)}% ${r(30,60)}% ${r(30,60)}% ${r(30,60)}%`;
    const tamano = Math.max(7, Math.min(22, ast.diametro_metros / 30));
    return { ...ast, x: 200 + radio * Math.cos(angulo), y: 200 + radio * Math.sin(angulo), formaRoca, tamano };
  });
}

function MetricaBar({ label, valor, max, color, unidad }) {
  const pct = Math.min((valor / max) * 100, 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: '#8892a4', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
          {typeof valor === 'number' ? valor.toLocaleString() : valor} <span style={{ color: '#8892a4', fontSize: '0.7rem' }}>{unidad}</span>
        </span>
      </div>
      <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 2, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 8px ${color}66` }} />
      </div>
    </div>
  );
}

function PeligroBadge({ esPeligroso }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, backgroundColor: esPeligroso ? 'rgba(255,76,76,0.12)' : 'rgba(0,230,160,0.1)', border: `1px solid ${esPeligroso ? '#ff4c4c55' : '#00e6a055'}` }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: esPeligroso ? '#ff4c4c' : '#00e6a0', boxShadow: `0 0 6px ${esPeligroso ? '#ff4c4c' : '#00e6a0'}`, animation: 'pulso 1.5s ease-in-out infinite' }} />
      <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: esPeligroso ? '#ff6b6b' : '#00e6a0', textTransform: 'uppercase' }}>
        {esPeligroso ? 'Amenaza Potencial' : 'Trayectoria Segura'}
      </span>
    </div>
  );
}

function StatCard({ icon, label, valor, color }) {
  return (
    <div style={{ flex: 1, minWidth: 110, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: '1.4rem' }}>{icon}</span>
      <span style={{ color, fontSize: '1.3rem', fontWeight: 700, lineHeight: 1 }}>{valor}</span>
      <span style={{ color: '#8892a4', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
  );
}

export default function RadarNEO() {
  const [asteroides, setAsteroides] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  const [escaneado, setEscaneado] = useState(false);
  const [anguloBarrido, setAnguloBarrido] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    if (!escaneado) return;
    let angulo = 0;
    const animar = () => {
      angulo = (angulo + 1.2) % 360;
      setAnguloBarrido(angulo);
      animRef.current = requestAnimationFrame(animar);
    };
    animRef.current = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(animRef.current);
  }, [escaneado]);

  const escanear = async () => {
    setCargando(true);
    setError(null);
    setSeleccionado(null);
    setEscaneado(true);
    try {
      const datos = await getAsteroides();
      setAsteroides(procesarAsteroides(datos));
    } catch {
      setError('No se pudo conectar con los servicios de la NASA.');
      setEscaneado(false);
    }
    setCargando(false);
  };

  const peligrosos = asteroides.filter(a => a.es_peligroso).length;
  const seguros = asteroides.filter(a => !a.es_peligroso).length;
  const masGrande = asteroides.length ? Math.max(...asteroides.map(a => a.diametro_metros)) : 0;
  const masCercano = asteroides.length ? Math.min(...asteroides.map(a => a.distancia_tierra_km)) : 0;

  return (
    <div style={s.wrapper}>
      <style>{`
        @keyframes pulso { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.4)} }
        @keyframes parpadeo { 0%,100%{opacity:0.3}50%{opacity:1} }
        @keyframes flotar { 0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)} }
        @keyframes entrar { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        .ast-dot { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .ast-dot:hover { z-index: 10 !important; }
      `}</style>

      <div style={s.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: escaneado ? '#00e6a0' : '#555', boxShadow: escaneado ? '0 0 10px #00e6a0' : 'none', animation: escaneado ? 'pulso 1.5s infinite' : 'none' }} />
            <span style={{ color: '#8892a4', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {escaneado ? 'Sistema Activo · NASA NeoWs' : 'Sistema en Espera'}
            </span>
          </div>
          <h2 style={s.titulo}>Monitor de Objetos Cercanos</h2>
          <p style={s.subtitulo}>Near Earth Objects — Datos en tiempo real</p>
        </div>
        <button onClick={escanear} disabled={cargando} style={{ ...s.boton, ...(cargando ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}>
          {cargando
            ? <span style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ animation:'parpadeo 0.8s infinite' }}>◉</span> Sincronizando...</span>
            : <span style={{ display:'flex', alignItems:'center', gap:8 }}>⬡ {escaneado ? 'Reescanear' : 'Activar Escáner'}</span>
          }
        </button>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {asteroides.length > 0 && (
        <div style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap', animation:'entrar 0.5s ease' }}>
          <StatCard icon="☄️" label="Detectados" valor={asteroides.length} color="#66fcf1" />
          <StatCard icon="⚠️" label="Amenazas" valor={peligrosos} color="#ff6b6b" />
          <StatCard icon="✅" label="Seguros" valor={seguros} color="#00e6a0" />
          <StatCard icon="📐" label="Más grande" valor={`${masGrande.toFixed(0)}m`} color="#f9ca24" />
          <StatCard icon="🛣️" label="Más cercano" valor={`${(masCercano/1000000).toFixed(2)}M km`} color="#a29bfe" />
        </div>
      )}

      <div style={s.cuerpo}>
        {/* RADAR */}
        <div style={s.radarContenedor}>
          {ESTRELLAS.map(e => (
            <div key={e.id} style={{ position:'absolute', top:`${e.top}%`, left:`${e.left}%`, width:e.size, height:e.size, backgroundColor:'#fff', borderRadius:'50%', opacity:e.opacity, animation:`parpadeo ${2+e.animDelay}s ease-in-out infinite` }} />
          ))}

          {[165, 120, 80, 40].map((rad, i) => (
            <div key={i} style={{ position:'absolute', width:rad*2, height:rad*2, border:`1px solid rgba(102,252,241,${0.04+i*0.02})`, borderRadius:'50%', top:200-rad, left:200-rad }} />
          ))}

          <div style={{ position:'absolute', width:'100%', height:1, top:200, backgroundColor:'rgba(102,252,241,0.06)' }} />
          <div style={{ position:'absolute', width:1, height:'100%', left:200, backgroundColor:'rgba(102,252,241,0.06)' }} />

          {escaneado && (
            <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', borderRadius:'50%', overflow:'hidden', pointerEvents:'none' }}>
              <div style={{ position:'absolute', top:'50%', left:'50%', width:'50%', height:2, transformOrigin:'0% 50%', transform:`rotate(${anguloBarrido}deg)`, background:'linear-gradient(90deg, transparent, rgba(102,252,241,0.7))' }} />
              {[1,2,3,4].map(i => (
                <div key={i} style={{ position:'absolute', top:'50%', left:'50%', width:'50%', height:1, transformOrigin:'0% 50%', transform:`rotate(${anguloBarrido - i*8}deg)`, background:`linear-gradient(90deg, transparent, rgba(102,252,241,${0.15-i*0.03}))` }} />
              ))}
            </div>
          )}

          {/* Tierra */}
          <div style={{ position:'absolute', top:184, left:184, width:32, height:32, background:'radial-gradient(circle at 35% 35%, #4facfe, #0a2d6e)', borderRadius:'50%', boxShadow:'0 0 20px rgba(79,172,254,0.5), 0 0 40px rgba(79,172,254,0.2)', border:'1px solid rgba(79,172,254,0.4)', zIndex:2, animation:'flotar 4s ease-in-out infinite' }} title="Tierra" />
          {/* Luna */}
          <div style={{ position:'absolute', top:190, left:222, width:7, height:7, backgroundColor:'#c5c6c7', borderRadius:'50%', boxShadow:'0 0 5px rgba(197,198,199,0.5)', zIndex:2 }} title="Luna" />

          {asteroides.map(ast => (
            <div
              key={ast.id}
              className="ast-dot"
              onClick={() => setSeleccionado(ast)}
              onMouseEnter={() => setSeleccionado(ast)}
              style={{
                position:'absolute',
                width:ast.tamano, height:ast.tamano,
                left:ast.x - ast.tamano/2, top:ast.y - ast.tamano/2,
                backgroundImage: ast.es_peligroso
                  ? 'radial-gradient(circle at 30% 30%, #ff8a80, #b71c1c)'
                  : 'radial-gradient(circle at 30% 30%, #80cbc4, #1a4a47)',
                borderRadius:ast.formaRoca,
                cursor:'pointer',
                zIndex: ast.id === seleccionado?.id ? 5 : 1,
                boxShadow: ast.es_peligroso ? `0 0 ${ast.tamano}px rgba(255,76,76,0.8)` : `0 0 ${ast.tamano/2}px rgba(69,162,158,0.5)`,
                border: ast.id === seleccionado?.id ? '1.5px solid #66fcf1' : `1px solid ${ast.es_peligroso ? '#ff4c4c44' : '#45a29e33'}`,
                transform: ast.id === seleccionado?.id ? 'scale(1.5)' : 'scale(1)',
              }}
            />
          ))}

          <div style={{ position:'absolute', bottom:12, left:14, color:'rgba(102,252,241,0.2)', fontSize:'0.58rem', fontFamily:'monospace' }}>0°N 0°E</div>
          <div style={{ position:'absolute', top:12, right:14, color:'rgba(102,252,241,0.2)', fontSize:'0.58rem', fontFamily:'monospace' }}>{new Date().toISOString().slice(0,10)}</div>
        </div>

        {/* PANEL */}
        <div style={s.panel}>
          {seleccionado ? (
            <div style={{ animation:'entrar 0.3s ease' }}>
              <div style={{ marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:10, flexWrap:'wrap' }}>
                  <div>
                    <div style={{ color:'#8892a4', fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:3 }}>Objeto Seleccionado</div>
                    <h3 style={{ color:'#fff', margin:0, fontSize:'0.95rem', fontWeight:600, lineHeight:1.3 }}>{seleccionado.nombre}</h3>
                  </div>
                  <PeligroBadge esPeligroso={seleccionado.es_peligroso} />
                </div>
                <div style={{ backgroundColor:'rgba(255,255,255,0.04)', borderRadius:6, padding:'6px 10px', display:'inline-block' }}>
                  <span style={{ color:'#8892a4', fontSize:'0.68rem' }}>ID: </span>
                  <span style={{ color:'#66fcf1', fontSize:'0.68rem', fontFamily:'monospace' }}>{seleccionado.id}</span>
                </div>
              </div>

              <div style={{ marginBottom:20 }}>
                <MetricaBar label="Diámetro" valor={parseFloat(seleccionado.diametro_metros.toFixed(1))} max={500} color="#f9ca24" unidad="m" />
                <MetricaBar label="Velocidad" valor={Math.round(seleccionado.velocidad_kmh/1000)} max={200} color="#a29bfe" unidad="×10³ km/h" />
                <MetricaBar label="Distancia" valor={parseFloat((seleccionado.distancia_tierra_km/1000000).toFixed(2))} max={80} color="#66fcf1" unidad="M km" />
              </div>

              <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:16 }}>
                <div style={{ color:'#8892a4', fontSize:'0.68rem', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Telemetría Exacta</div>
                {[
                  { label:'Diámetro máx.', valor:`${seleccionado.diametro_metros.toFixed(2)} m` },
                  { label:'Velocidad relativa', valor:`${seleccionado.velocidad_kmh.toLocaleString()} km/h` },
                  { label:'Distancia de cruce', valor:`${seleccionado.distancia_tierra_km.toLocaleString()} km` },
                ].map(({ label, valor }) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color:'#8892a4', fontSize:'0.78rem' }}>{label}</span>
                    <span style={{ color:'#fff', fontSize:'0.78rem', fontFamily:'monospace' }}>{valor}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'40px 20px', color:'#8892a4' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:12, animation:'flotar 3s ease-in-out infinite' }}>🛰️</div>
              <p style={{ fontSize:'0.82rem', lineHeight:1.6, margin:0 }}>
                {escaneado ? 'Haz clic o pasa el cursor sobre un objeto en el radar para ver sus datos.' : 'Activa el escáner para detectar objetos cercanos a la Tierra.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {asteroides.length > 0 && (
        <div style={{ display:'flex', gap:20, marginTop:20, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.06)', flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', backgroundColor:'#ff4c4c', boxShadow:'0 0 6px #ff4c4c' }} />
            <span style={{ color:'#8892a4', fontSize:'0.72rem' }}>Potencialmente peligroso</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', backgroundColor:'#45a29e', boxShadow:'0 0 6px #45a29e' }} />
            <span style={{ color:'#8892a4', fontSize:'0.72rem' }}>Trayectoria segura</span>
          </div>
          <span style={{ color:'rgba(255,255,255,0.12)', fontSize:'0.68rem' }}>Tamaño y distancia proporcionales a datos reales de la NASA</span>
        </div>
      )}
    </div>
  );
}

const s = {
  wrapper: { backgroundColor:'#090d14', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:'28px 32px', marginTop:50, marginBottom:60 },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:16 },
  titulo: { color:'#ffffff', margin:0, fontSize:'1.5rem', fontWeight:700, letterSpacing:'-0.02em' },
  subtitulo: { color:'#8892a4', margin:'4px 0 0', fontSize:'0.82rem' },
  boton: { padding:'10px 22px', backgroundColor:'rgba(102,252,241,0.05)', color:'#66fcf1', fontWeight:600, border:'1px solid rgba(102,252,241,0.25)', borderRadius:10, cursor:'pointer', fontSize:'0.85rem', letterSpacing:'0.04em' },
  error: { textAlign:'center', color:'#ff6b6b', backgroundColor:'rgba(255,76,76,0.08)', border:'1px solid rgba(255,76,76,0.2)', borderRadius:8, padding:'10px 16px', fontSize:'0.82rem', marginBottom:20 },
  cuerpo: { display:'flex', gap:28, alignItems:'flex-start', flexWrap:'wrap', justifyContent:'center' },
  radarContenedor: { width:400, height:400, borderRadius:'50%', border:'1px solid rgba(102,252,241,0.15)', position:'relative', background:'radial-gradient(circle at 50% 50%, #0d1f2d 0%, #050810 100%)', boxShadow:'0 0 60px rgba(102,252,241,0.05), inset 0 0 40px rgba(0,0,0,0.5)', overflow:'hidden', flexShrink:0 },
  panel: { flex:1, minWidth:280, maxWidth:340, backgroundColor:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, minHeight:300 },
};