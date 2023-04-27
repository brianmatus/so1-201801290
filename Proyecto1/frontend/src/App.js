
import './App.css';
import Cpu from './Cpu';
import Estado from './Estado';
import Presidente from './Presidente';
import Ram from './Ram';
import Recopilacion from './Recopilacion';
import Table from './Table';

function App() {

  return (
    <div className="container">
      <div className='row mt-4'>
        <div className='col-6'>
          <h2>Estado de Procesos</h2>
          <Recopilacion/>
        </div>
        <div className='col-6'>
          <h2>Departamentos con mayores votos para presidente</h2>
          <Presidente/>
        </div>
      </div>
    </div>
  );
}

export default App;
