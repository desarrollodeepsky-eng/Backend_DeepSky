import { useState } from 'react';
import { buscarImagenes } from '../api/nasaApi.js';

function BuscadorImagenes() {
  const [busqueda, setBusqueda] = useState('');
  const [galeria, setGaleria] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const handleBuscar = async () => {
    if (!busqueda.trim()) return;
    setCargando(true);
    setError(null);
    try {
      const resultados = await buscarImagenes(busqueda);
      setGaleria(resultados);
    } catch {
      setError('No se pudo completar la búsqueda.');
    }
    setCargando(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleBuscar();
  };

  return (
    <div style={estilos.seccion}>
      <h2 style={estilos.titulo}>Buscador Cósmico</h2>

      <div style={estilos.filaBusqueda}>
        <input
          type="text"
          placeholder="Ej: Mars, Orion, Apollo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          onKeyDown={handleKeyDown}
          style={estilos.input}
        />
        <button onClick={handleBuscar} style={estilos.boton}>
          Buscar
        </button>
      </div>

      {cargando && <p style={estilos.info}>Buscando en la galaxia...</p>}
      {error && <p style={estilos.error}>{error}</p>}
      {!cargando && galeria.length === 0 && busqueda && (
        <p style={estilos.info}>No se encontraron imágenes para "{busqueda}".</p>
      )}

      <div style={estilos.galeria}>
        {galeria.map((foto, index) => (
          <div key={index} style={estilos.tarjeta}>
            <img
              src={foto.imagenUrl}
              alt={foto.titulo}
              style={estilos.imagen}
            />
            <h4 style={estilos.tituloFoto}>{foto.titulo}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}

const estilos = {
  seccion: {
    marginTop: '50px',
  },
  titulo: {
    color: '#66fcf1',
    textAlign: 'center',
  },
  filaBusqueda: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    padding: '12px 20px',
    width: '320px',
    borderRadius: '25px',
    border: '1px solid #45a29e',
    backgroundColor: '#1f2833',
    color: '#fff',
    outline: 'none',
  },
  boton: {
    padding: '12px 25px',
    backgroundColor: '#45a29e',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  galeria: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  tarjeta: {
    width: '300px',
    backgroundColor: '#1f2833',
    padding: '15px',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px solid rgba(69,162,158,0.1)',
  },
  imagen: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '5px',
  },
  tituloFoto: {
    color: '#66fcf1',
    marginTop: '10px',
    fontSize: '0.95em',
  },
  info: {
    textAlign: 'center',
    color: '#45a29e',
  },
  error: {
    textAlign: 'center',
    color: '#ff4c4c',
  },
};

export default BuscadorImagenes;
