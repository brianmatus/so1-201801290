import React, { useState, useEffect } from 'react';
import axios from 'axios';


function Estado() {

    const [proces, setproces] = useState({ exec: 0, stop: 0, suspend: 0, zombie: 0, total: 0 })

    const getData = async () => {
        const response = await axios.get('http://34.125.94.32:5000/api/estados')
        console.log(response.data);
        setproces({
            exec: response.data.results1[0].EJECUCION,
            stop: response.data.results3[0].DETENIDOS,
            suspend: response.data.results2[0].SUSPENDIDOS,
            zombie: response.data.results4[0].ZOMBIE,
            total: response.data.results5[0].PROCESOS
        });
    }

    useEffect(() => {
        const interval = setInterval(() => {
            getData();
        }, 3000);
        return () => clearInterval(interval);
    }, []);



    return (
        <>

            <div className='card'>
                <div class="table-responsive">
                    <table className="table table-striped table-sm">
                        <thead>
                            <tr>
                                <th>Estado</th>
                                <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>

                            <tr key={1}>
                                <td>Procesos en Ejecución</td>
                                <td>{proces.exec}</td>
                            </tr>
                            <tr key={2}>
                                <td>Procesos Detenidos</td>
                                <td>{proces.stop}</td>
                            </tr>
                            <tr key={3}>
                                <td>Procesos Suspendidos</td>
                                <td>{proces.suspend}</td>
                            </tr>
                            <tr key={4}>
                                <td>Procesos Zombie</td>
                                <td>{proces.zombie}</td>
                            </tr>
                            <tr key={5}>
                                <td>Total de Procesos</td>
                                <td>{proces.total}</td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>

        </>
    );
}

export default Estado;
