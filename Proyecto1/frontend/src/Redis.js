import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie, Doughnut, Polar, Radar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import axios from 'axios';


function Redis() {

    const [data, setData] = useState({
        labels: ['Sede 1', 'Sede 2', 'Sede 3', 'Sede 4', 'Sede 5'],
        datasets: [
            {
                label: 'Top 5 sedes con mayor cantidad de votos',
                data: [20, 20, 20, 20, 20],
                backgroundColor: [
                    'rgb(46, 204, 113)',
                    'rgb(142, 68, 173)',
                    'rgb(93, 109, 126)',
                    'rgb(244, 208, 63)',
                    'rgb(133, 193, 233)',

                ],
                borderColor: [
                    'rgb(24, 106, 59)',
                    'rgb(74, 35, 90)',
                    'rgb(27, 38, 49)',
                    'rgb(125, 102, 8)',
                    'rgb(27, 79, 114)',
                ],
                borderWidth: 1,
            },
        ],
    })

    const [dataTop, setDataTop] = useState([]);

    const getDataTop = async () => {
        const response = await axios.get('http://35.225.74.205:5000/get_last_redis')
        setDataTop(response.data.top);
    }


    const getData = async () => {
        //cambio ruta
        const response = await axios.get('http://35.225.74.205:5000/get_top_redis')
        const une = response.data.top[0].id || 0;
        const vamos = response.data.top[1].id || 0;
        const valor = response.data.top[2].id || 0;
        const unionista = response.data.top[3].id || 0;
        const fcn = response.data.top[4].id || 0;

        const unev = response.data.top[0].count || 0;
        const vamosv = response.data.top[1].count || 0;
        const valorv = response.data.top[2].count || 0;
        const unionistav = response.data.top[3].count || 0;
        const fcnv = response.data.top[4].count || 0;

        setData({
            labels: [une, vamos, valor, unionista, fcn],
            datasets: [
                {
                    label: 'Departamentos con mayores votos para presidente',
                    data: [unev, vamosv, valorv, unionistav, fcnv],
                    backgroundColor: [
                        'rgb(46, 204, 113)',
                        'rgb(142, 68, 173)',
                        'rgb(93, 109, 126)',
                        'rgb(244, 208, 63)',
                        'rgb(133, 193, 233)',

                    ],
                    borderColor: [
                        'rgb(24, 106, 59)',
                        'rgb(74, 35, 90)',
                        'rgb(27, 38, 49)',
                        'rgb(125, 102, 8)',
                        'rgb(27, 79, 114)',
                    ],
                    borderWidth: 1,
                },
            ],
        })
    };

    // Actualizar los valores de la gráfica cada 10 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            getData();
            getDataTop();
        }, 3000);
        return () => clearInterval(interval);

    }, []);


    return (
        <div className='mt-4'>
            <h2>Top 5 sedes con mayores votos</h2>
            <Bar data={data} />
            <div className='mt-4 mb-4'>
                <h2>Ultimos 5 votos almacenados</h2>
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
                            {dataTop.map(item => (
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

        </div>
    );
};

export default Redis;
