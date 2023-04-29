
import './App.css';
import Partido from './Partido';
import Presidente from './Presidente';
import Recopilacion from './Recopilacion';
import Redis from './Redis';

function App() {

  return (
    <div className="container">
      <div className='row mt-4'>
        <div className='col-6'>
          <h2>Estado de Procesos</h2>
          <Recopilacion />
        </div>
        <div className='col-6'>
          <h2>Departamentos con mayores votos para presidente</h2>
          <Presidente />
          <Partido/>
          <Redis/>
        </div>
      </div>
    </div>
  );
}

export default App;
