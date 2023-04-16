const mysql = require('mysql');
require('dotenv').config({ path: './.env.local' });
const Hapi = require('@hapi/hapi');
const redis = require('redis')
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
let departments = {}
let municipalities = {}
let papers = {}
let parties = {}


const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_DB = process.env.MYSQL_DB;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASS = process.env.MYSQL_PASS;

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

let connection = mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASS,
    database: MYSQL_DB
});

let redisClient;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))



//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
const FRONT_API_PORT = process.env.FRONT_API_PORT;
const init = async options => {
    console.log("Waiting 10 segs for MySQL to start")
    await delay(10000)
    getVoteInfo()
    const server = Hapi.server({
        port: FRONT_API_PORT,
        host: '0.0.0.0',
        routes: {
            cors: true
        }
    });
    setServerRoutes(server)

    redisClient = redis.createClient({socket:{host:REDIS_HOST, port:REDIS_PORT}})
    redisClient.connect()


    await server.start();
    console.log('Servidor Funcionando en %s', server.info.uri);
}


function setServerRoutes(server) {
    server.route([
        {
            method: 'GET',
            path: '/get_votes',
            handler: (request, h) => {
                const resPromise = new Promise((resolve, _) => {

                    connection.query('SELECT * FROM votes', (error, results, fields) => {
                        if (error) {
                            console.log(error)
                            resolve({ "status": -1,
                                "error":error.toString(),
                                votes:[],
                                topPresident:{},
                                partyPercentageByMunicipalities:{},
                                partyPercentageByDepartments:{}

                            });
                        }
                        let allVotes = []
                        let presidentVotes = {}
                        let partyPercentageByDepartments = {}
                        let partyPercentageByMunicipalities = {}

                        results.forEach(row => {
                            allVotes.push({
                                sede:row.SEDE,
                                municipio:municipalities[row.MUNICIPIO].name,
                                departamento:departments[row.DEPARTAMENTO].name,
                                papeleta:papers[row.PAPELETA].name,
                                partido:parties[row.PARTIDO].name
                            })

                            //President Votes
                            if (row.PAPELETA === 1) {
                                if (presidentVotes.hasOwnProperty(row.DEPARTAMENTO)) {
                                    presidentVotes[row.DEPARTAMENTO]++;
                                } else {
                                    presidentVotes[row.DEPARTAMENTO] = 1;
                                }
                            }
                            //Votes per Department
                            if (partyPercentageByDepartments.hasOwnProperty(row.PARTIDO)) {
                                partyPercentageByDepartments[row.PARTIDO]++;
                            } else {
                                partyPercentageByDepartments[row.PARTIDO] = 1;
                            }
                        });

                        let keys = Object.keys(presidentVotes);
                        keys.sort(function(a, b) {
                            return presidentVotes[b] - presidentVotes[a];
                        });
                        keys = keys.slice(0, 3)

                        let topPresidents = []
                        for (let key of keys) {
                            topPresidents.push({department: departments[key].name, count:presidentVotes[key]})
                        }
                        console.log(topPresidents)
                        resolve({ status: 0,
                            error:0,
                            topPresident : topPresidents,
                            votes : allVotes,
                        });
                    });
                });
                return resPromise.then(data => data);
            }
        },
        {
            method: 'POST',
            path: '/get_top_department',
            handler: (request, h) => {
                const resPromise = new Promise((resolve, _) => {
                    connection.query('SELECT * FROM votes', (error, results, fields) => {
                        if (error) {
                            console.log(error)
                            resolve({ "status": -1,
                                error:error.toString(),
                                votes:[],
                            });
                        }
                        let partyPercentageByDepartments = {}
                        let theKey = getKeyByDepartment(request.payload.department_name)
                        results.forEach(row => {
                            if (row.DEPARTAMENTO === theKey) {
                                if (partyPercentageByDepartments.hasOwnProperty(parties[row.PARTIDO].name)) {
                                    partyPercentageByDepartments[parties[row.PARTIDO].name]++;
                                } else {
                                    partyPercentageByDepartments[parties[row.PARTIDO].name] = 1;
                                }
                            }
                        });
                        resolve({ status: 0,
                            error:0,
                            votes : partyPercentageByDepartments,
                        });
                    });
                });
                return resPromise.then(data => data);
            }
        },
        {
            method: 'POST',
            path: '/get_top_municipality',
            handler: (request, h) => {
                const resPromise = new Promise((resolve, _) => {
                    connection.query('SELECT * FROM votes', (error, results, fields) => {
                        if (error) {
                            console.log(error)
                            resolve({ "status": -1,
                                error:error.toString(),
                                votes:[],
                            });
                        }
                        let partyPercentageByMunicipalities = {}
                        let dptKey = getKeyByDepartment(request.payload.department_name)
                        let theKey = getKeyByMunicipality(request.payload.municipality_name, dptKey)
                        results.forEach(row => {
                            if (row.MUNICIPIO === theKey) {
                                if (partyPercentageByMunicipalities.hasOwnProperty(parties[row.PARTIDO].name)) {
                                    partyPercentageByMunicipalities[parties[row.PARTIDO].name]++;
                                } else {
                                    partyPercentageByMunicipalities[parties[row.PARTIDO].name] = 1;
                                }
                            }
                        });
                        resolve({ status: 0,
                            error:0,
                            votes : partyPercentageByMunicipalities,
                        });
                    });
                });
                return resPromise.then(data => data);
            }
        },
        {
            method: 'GET',
            path: '/get_last_redis',
            handler: (request, h) => {
                const resPromise = new Promise((resolve, _) => {
                    redisClient.LRANGE("lastFive", 0, -1, function(err, reply) {
                        if (err) console.error(err);
                    }).then((reply) => {
                        let lastFive = []
                        for (let entry of reply) {
                            lastFive.push(JSON.parse(entry))
                        }
                        resolve ({
                                status: 0,
                                error: 0,
                                top: lastFive,
                            });
                        })
                        .catch((err) => {
                            console.error(err);
                            resolve({
                                status: 1,
                                error: err.toString(),
                                top: [],
                            });
                        });
                });
                return resPromise.then(data => data);
            }
        },
        {
            method: 'GET',
            path: '/get_top_redis',
            handler: (request, h) => {
                const resPromise = new Promise((resolve, _) => {
                    redisClient.HGETALL("placeCounts", function(err, reply) {
                        if (err) console.error(err);
                    }).then((reply) => {
                        allPlaces = []
                        for (let key in reply) {
                            allPlaces.push({id:key, count:reply[key]})
                        }
                        const sortedList = allPlaces.sort((a, b) => b.count - a.count).slice(0, 5);
                        resolve ({
                            status: 0,
                            error: 0,
                            top: sortedList,
                        });
                    })
                        .catch((err) => {
                            console.error(err);
                            resolve({
                                status: 1,
                                error: err.toString(),
                                top: [],
                            });
                        });
                });
                return resPromise.then(data => data);
            }
        },
    ]);
}

function getVoteInfo() {
    (async () => {
        try {
            connection.connect();
            await getDeparments();
            // console.log(departments);

            await getMunicipalities();
            // console.log(municipalities);

            await getPapers();
            // console.log(papers);

            await getParties();
            // console.log(parties);

        } catch (error) {
            console.error(error);
        } finally {
            //connection.end();
        }
    })();
}
async function getDeparments() {
    return new Promise((resolve, reject) => {
        departments = {}
        connection.query('SELECT * FROM departments', (error, results, fields) => {
            if (error) console.log(error);
            results.forEach(row => {
                departments[row.ID] = {id:row.ID, name:row.NAME}
            });
            resolve(0)
        });
    });
}

async function getMunicipalities() {
    return new Promise((resolve, reject) => {
        municipalities = {}
        connection.query('SELECT * FROM municipalities', (error, results, fields) => {
            if (error) console.log(error);
            results.forEach(row => {
                municipalities[row.ID] = {id:row.ID, dpt_id:row.DPT, name:row.NAME}
            });
            resolve(0)
        });
    });
}

async function getPapers() {
    return new Promise((resolve, reject) => {
        papers = {}
        connection.query('SELECT * FROM papers', (error, results, fields) => {
            if (error) console.log(error);
            results.forEach(row => {
                papers[row.ID] = {id:row.ID, name:row.NAME}
            });
            resolve(0)
        });
    });
}

async function getParties() {
    return new Promise((resolve, reject) => {
        parties = {}
        connection.query('SELECT * FROM parties', (error, results, fields) => {
            if (error) console.log(error);
            results.forEach(row => {
                parties[row.ID] = {id:row.ID, name:row.NAME}
            });
            resolve(0)
        });
    });
}

function getKeyByDepartment(name) {
    for (const key in departments) {
        if (departments[key].name === name) {
            return parseInt(key)
        }
    }
    return -1
}

function getKeyByMunicipality(name, dpt) {
    for (const key in municipalities) {
        if (municipalities[key].name === name && municipalities[key].dpt_id === dpt) {
            return parseInt(key)
        }
    }
    return -1
}

init()