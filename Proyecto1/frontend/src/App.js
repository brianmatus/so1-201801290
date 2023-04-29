
import React, { useState, useEffect } from 'react';

import './App.css';
import Partido from './Partido';
import Presidente from './Presidente';
import Recopilacion from './Recopilacion';
import Redis from './Redis';




const RealTimeClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerID = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerID);
    };
  }, []);

  return <h2>{time.toLocaleTimeString()}</h2>;
};

function App() {

  return (
    <div className="container">
      <div className='row mt-4'>
        <div className='col-6'>
          <RealTimeClock/>
        </div>
      </div>
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
