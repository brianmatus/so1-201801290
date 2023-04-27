import React, { useState, useEffect } from 'react';
import axios from 'axios';


function Table() {
    const [data, setData] = useState([]);
    const [dataChild, setDataChild] = useState([]);
    const getData = async () => {
        const response = await axios.get('http://34.125.94.32:5000/api/procesos')
        console.log(response.data);
        setData(response.data.results1);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            getData();
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = async (e) => {
        setDataChild([]);
        console.log(e);
        const parametros = {
            pid: e,
        };
        const respuesta = await axios.post('http://34.125.94.32:5000/api/hijos', parametros);
        console.log(respuesta);
        setDataChild(respuesta.data.results1);
        
    };

    return (
        <>
            <div className='row'>
                <div className='col-6'>
                    <div className='card'>
                        <h2>Procesos</h2>
                        <div class="table-responsive">
                            <table className="table table-striped table-sm">
                                <thead>
                                    <tr>
                                        <th>PID</th>
                                        <th>Nombre</th>
                                        <th>%RAM</th>
                                        <th>Estado</th>
                                        <th>Sub Procesos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(item => (
                                        <tr key={item.pid}>
                                            <td>{item.pid}</td>
                                            <td>{item.comm}</td>
                                            <td>{item.ram}</td>
                                            <td>{item.state}</td>
                                            <td> <button className='btn btn-outline-warning' onClick={() => handleChange(item.pid)}>Ver SubProcesos</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className='col-6'>
                    <div className='card'>
                        <h2>Sub Procesos</h2>
                        <div class="table-responsive">
                            <table className="table table-striped table-sm">
                                <thead>
                                    <tr>
                                        <th>PID</th>
                                        <th>Nombre</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataChild.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.pid}</td>
                                            <td>{item.comm}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Table;
