import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie, Doughnut, Polar, Radar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import axios from 'axios';


function Cpu() {

    const [data, setData] = useState({
        labels: ['%CPU UTILIZADO', '%CPU LIBRE'],
        datasets: [
            {
                label: 'CPU',
                data: [50, 50],
                backgroundColor: [
                    'rgba(187, 143, 206, 1)',
                    'rgba(215, 219, 221, 1)',

                ],
                borderColor: [
                    'rgba(142, 68, 173, 1)',
                    'rgba(189, 195, 199, 1)',

                ],
                borderWidth: 1,
            },
        ],
    })
    const getData = async () => {
        //cambio ruta
        const response = await axios.get('http://34.125.94.32:5000/api/cpu')
        const valueResult = response.data.results1[0].CPU;
        console.log(response.data.results1[0].CPU);
        setData({
            labels: ['%CPU UTILIZADO', '%CPU LIBRE'],
            datasets: [
                {
                    label: 'CPU',
                    data: [valueResult, (100-valueResult)],
                    backgroundColor: [
                        'rgba(187, 143, 206, 1)',
                        'rgba(215, 219, 221, 1)',
    
                    ],
                    borderColor: [
                        'rgba(142, 68, 173, 1)',
                        'rgba(189, 195, 199, 1)',
    
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
        }, 3000);
        return () => clearInterval(interval);
    }, []);


    return (
        <div>
            <Pie data={data} />
        </div>
    );
};

export default Cpu;
