import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie, Doughnut, Polar, Radar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import dep from './resources/departamentos.json';
import mun from './resources/municipios.json';
import axios from 'axios';


function Partido() {

    const [departamentoId, setDepartamentoId] = useState(1);
    const [departamentoName, setDepartamentoName] = useState("Alta Verapaz");
    const [municipioId, setMunicipioId] = useState(1);
    const [municipioName, setMunicipioName] = useState("Coban");
    const [municipioArr, setMunicipioArr] = useState([]);
    const [data, setData] = useState({
        labels: ['UNE', 'VAMOS', 'FCN', 'UNIONISTA', 'VALOR'],
        datasets: [
            {
                label: 'Total de votos por departamento',
                data: [20, 20, 20, 20, 20],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',

                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
            },
        ],
    })

    const [dataMun, setDataMun] = useState({
        labels: ['UNE', 'VAMOS', 'FCN', 'UNIONISTA', 'VALOR'],
        datasets: [
            {
                label: 'Total de votos por Municipio',
                data: [20, 20, 20, 20, 20],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',

                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
            },
        ],
    })

    const handleChange = (e) => {
        setDepartamentoId(Number(e.target.value.split("-")[0]));
        setDepartamentoName(e.target.value.split("-")[1]);
        

        const filteredData = [...mun];
        const filtered = filteredData.filter(item => item.dpt_id === Number(e.target.value.split("-")[0]));
        console.log(filtered);
        setMunicipioArr([...filtered]);
        setMunicipioId(filtered[0].id);
        setMunicipioName(filtered[0].name);
    };

    const handleChangeMunicipio = (e) => {
        console.log(e.target.value);
        setMunicipioId(Number(e.target.value.split("-")[0]));
        setMunicipioName(e.target.value.split("-")[1]);
    };

    const getDataDepartamento = async () => {
        const params = {
            department_name: departamentoName
        }
        const response = await axios.post('http://35.225.74.205:5000/get_top_department', params)
        const une = response.data.votes.UNE || 0;
        const vamos = response.data.votes.VAMOS || 0;
        const valor = response.data.votes.VALOR || 0;
        const unionista = response.data.votes.UNIONISTA || 0;
        const fcn = response.data.votes.FCN || 0;

        setData({
            labels: ['UNE', 'VAMOS', 'FCN', 'UNIONISTA', 'VALOR'],
            datasets: [
                {
                    label: 'Total de votos por departamento',
                    data: [une, vamos, fcn, unionista, valor],
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

    const getDataMunicipio = async () => {
        const params = {
            department_name: departamentoName,
            municipality_name: municipioName
        }
        const response = await axios.post('http://35.225.74.205:5000/get_top_municipality', params)
        const une = response.data.votes.UNE || 0;
        const vamos = response.data.votes.VAMOS || 0;
        const valor = response.data.votes.VALOR || 0;
        const unionista = response.data.votes.UNIONISTA || 0;
        const fcn = response.data.votes.FCN || 0;

        setDataMun({
            labels: ['UNE', 'VAMOS', 'FCN', 'UNIONISTA', 'VALOR'],
            datasets: [
                {
                    label: 'Total de votos por departamento',
                    data: [une, vamos, fcn, unionista, valor],
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
        getDataDepartamento();
    }, [departamentoName]);

    useEffect(() => {
        getDataMunicipio();
    }, [municipioName]);


    return (
        <div>
            <div className='row mt-4'>
                <h2>Votos por partido</h2>
                <div className='col-6'>
                    <h4>Departamento</h4>
                    <select
                        className="form-select"
                        aria-label="Default select example"
                        onChange={handleChange}
                    >
                        {dep.map((departamento) => {
                            return (
                                <option value={departamento.id + "-" + departamento.name}>
                                    {departamento.name}
                                </option>
                            );
                        })}
                    </select>
                <Pie data={data} />
                </div>
                <div className='col-6'>
                    <h4>Municipio</h4>
                    <select
                        className="form-select"
                        aria-label="Default select example"
                        onChange={handleChangeMunicipio}
                    >
                        {municipioArr.map((municipio) => {
                            return (
                                <option value={municipio.id + "-" + municipio.name}>
                                    {municipio.name}
                                </option>
                            );
                        })}
                    </select>
                <Pie data={dataMun} />
                </div>
            </div>
        </div>
    );
};

export default Partido;
