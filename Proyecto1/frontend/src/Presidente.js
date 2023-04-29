import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie, Doughnut, Polar, Radar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import axios from 'axios';
import backendIP from "./backend_ip";


function Presidente() {

    const [data, setData] = useState({
        labels: ['TOP 1', 'TOP 2', 'TOP 3'],
        datasets: [
            {
                label: 'Departamentos con mayores votos para presidente',
                data: [50, 30, 10],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',

                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
            },
        ],
    })
    const getData = async () => {
        //cambio ruta
        const response = await axios.get(backendIP + '/get_votes')
        const departamento1 = response.data.topPresident[0].department;
        const val1 = response.data.topPresident[0].count;
        const departamento2 = response.data.topPresident[1].department;
        const val2 = response.data.topPresident[1].count;
        const departamento3 = response.data.topPresident[2].department;
        const val3 = response.data.topPresident[2].count;

        setData({
            labels: [departamento1, departamento2, departamento3],
            datasets: [
                {
                    label: 'Departamentos con mayores votos para presidente',
                    data: [val1, val2, val3],
                    backgroundColor: [
                        'rgb(215, 189, 226)',
                        'rgb(162, 217, 206)',
                        'rgb(252, 243, 207)',

                    ],
                    borderColor: [
                        'rgb(81, 46, 95)',
                        'rgb(11, 83, 69)',
                        'rgb(125, 102, 8)',
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
            <Bar data={data} />
        </div>
    );
};

export default Presidente;
