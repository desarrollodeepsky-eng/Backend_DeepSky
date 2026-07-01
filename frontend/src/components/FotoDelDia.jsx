import { useState, useEffect } from 'react';
import { getFotoDelDia } from '../api/nasaApi.js';

function FotoDelDia() {
  const [fotoDelDia, setFotoDelDia] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFotoDelDia()
      .then(data => setFotoDelDia(data))
      .catch(() => setError('No se pudo cargar la foto del día.'));
  }, []);

  if (error) {
    return <p style={estilos.error}>{error}</p>;
  }

  if (!fotoDelDia) {
    return <p style={estilos.cargando}>Cargando foto del día...</p>;
  }

  return (
    <div style={estilos.contenedor}>
      <h2 style={estilos.titulo}>{fotoDelDia.titulo}</h2>
      <img
        src={fotoDelDia.imagenUrl}
        alt={fotoDelDia.titulo}
        style={estilos.imagen}
      />
      <p style={estilos.descripcion}>{fotoDelDia.descripcion}</p>
      <span style={estilos.fecha}>{fotoDelDia.fecha}</span>
    </div>
  );
}

const estilos = {
  contenedor: {
    textAlign: 'center',
    marginBottom: '50px',
    paddingBottom: '50px',
    borderBottom: '1px solid #45a29e',
  },
  titulo: {
    color: '#c5c6c7',
    marginBottom: '20px',
  },
  imagen: {
    maxWidth: '75%',
    borderRadius: '10px',
    boxShadow: '0px 0px 25px rgba(69, 162, 158, 0.3)',
  },
  descripcion: {
    maxWidth: '800px',
    margin: '20px auto',
    lineHeight: '1.6',
    fontSize: '0.95em',
    color: '#a5a6a7',
  },
  fecha: {
    color: '#45a29e',
    fontSize: '0.85em',
  },
  cargando: {
    textAlign: 'center',
    color: '#45a29e',
  },
  error: {
    textAlign: 'center',
    color: '#ff4c4c',
  },
};

export default FotoDelDia;
