import FotoDelDia from './components/FotoDelDia';
import RadarNEO from './components/RadarNEO';
import BuscadorImagenes from './components/BuscadorImagenes';

function App() {
  return (
    <div style={estilos.app}>
      <h1 style={estilos.header}>DEEPSKY</h1>
      <FotoDelDia />
      <RadarNEO />
      <BuscadorImagenes />
    </div>
  );
}

const estilos = {
  app: {
    backgroundColor: '#0b0c10',
    color: '#c5c6c7',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'Arial',
  },
  header: {
    textAlign: 'center',
    color: '#66fcf1',
    letterSpacing: '2px',
  },
};

export default App;