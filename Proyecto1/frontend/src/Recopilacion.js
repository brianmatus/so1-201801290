import React, { useState, useEffect } from 'react';
import axios from 'axios';


function Recopilacion() {
    const [data, setData] = useState([]);
    const [key, setKey] = useState(1);
    const [dataChild, setDataChild] = useState([]);

    const getData = async () => {
        const response = await axios.get('http://34.170.128.101:5000/get_votes')
        console.log(response.data.votes);
        setData(response.data.votes);
    }

    useEffect(() => {
        // const interval = setInterval(() => {
        //     getData();
        // }, 3000);
        // return () => clearInterval(interval);
        getData();
    }, []);

    return (
        <>

            <div className='card mt-2 mb-2'>
                <div class="table-responsive">
                    <table className="table table-sm">
                        <thead>
                            <tr>
                                <th>Papeleta</th>
                                <th>Tipo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr key={1}>
                                <td>BLANCA</td>
                                <td>PRESIDENTE</td>
                            </tr>
                            <tr className='table-success' key={2}>
                                <td>VERDE</td>
                                <td>DIPUTADOS</td>
                            </tr>
                            <tr className='table-danger' key={3}>
                                <td>ROSADA</td>
                                <td>ALCALDIA</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='card'>
                <div class="table-responsive">
                    <table className="table table-striped table-sm">
                        <thead>
                            <tr>
                                <th>Sede</th>
                                <th>Municipio</th>
                                <th>Departamento</th>
                                <th>Papeleta</th>
                                <th>Partido</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.sede}>
                                    <td>{item.sede}</td>
                                    <td>{item.municipio}</td>
                                    <td>{item.departamento}</td>
                                    <td>{item.papeleta}</td>
                                    <td>{item.partido}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default Recopilacion;
