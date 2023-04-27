import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie, Doughnut, Polar, Radar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import axios from 'axios';

function Ram() {
    const [data, setData] = useState({
        labels: ['%RAM UTILIZADA', '%RAM LIBRE'],
        datasets: [
            {
                label: 'ram',
                data: [50, 50],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',

                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',

                ],
                borderWidth: 1,
            },
        ],
    });

    const getData = async () => {
        const response = await axios.get('http://34.125.94.32:5000/api/ram')
        const valueResult = response.data.results1[0].RAM;
        console.log(response.data.results1[0].RAM);
        setData({
            labels: ['%RAM UTILIZADA', '%RAM LIBRE'],
            datasets: [
                {
                    label: 'ram',
                    data: [valueResult, (100-valueResult)],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
    
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
    
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
            <Doughnut data={data} />
        </div>
    );
};

export default Ram;
