const mysql = require('mysql');
require('dotenv').config({ path: './.env.local' });
////////////////////gRPC Imports///////////////////////
const grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");
////////////////////API Imports///////////////////////
const Hapi = require('@hapi/hapi');
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
const PROTO_PATH = "./vote.proto";
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};
let grpcObj = protoLoader.loadSync(PROTO_PATH, options);
const VoteService = grpc.loadPackageDefinition(grpcObj).VoteService;
const GRPC_SERVER_HOST = process.env.GRPC_SERVER_HOST;
const GRPC_SERVER_PORT = process.env.GRPC_SERVER_PORT;
const clientStub = new VoteService(
    GRPC_SERVER_HOST + ":" + GRPC_SERVER_PORT,
    grpc.credentials.createInsecure()
);

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
let departments = {}
let municipalities = {}
let papers = {}
let parties = {}


const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_PORT = process.env.MYSQL_PORT;
const MYSQL_DB = process.env.MYSQL_DB;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASS = process.env.MYSQL_PASS;


const connection = mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASS,
    database: MYSQL_DB
});


getVoteInfo()


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
            connection.end();
        }
    })();
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
const GPRC_CLIENT_API_PORT = process.env.GPRC_CLIENT_API_PORT;
const init = async () => {
    const server = Hapi.server({
        port: GPRC_CLIENT_API_PORT,
        host: '0.0.0.0',
        routes: {
            cors: true
        }
    });

    server.route({
        method: 'POST',
        path: '/new_vote',
        handler: (request, h) => {

            const resPromise = new Promise((resolve, _) => {
                newVote = {};
                newVote.sede = request.payload.sede;

                key = getKeyByDepartment(request.payload.departamento)
                if (key === -1) {
                    resolve({ "status": 11});
                }
                newVote["departamento"] = key;

                key = getKeyByMunicipality(request.payload.municipio, newVote["departamento"]);
                if (key === -1) {
                    resolve({ "status": 12});
                }
                newVote["municipio"] = key;
                key = getKeyByPaper(request.payload.papeleta);
                if (key === -1) {
                    resolve({ "status": 13});
                }
                newVote["papeleta"] = key;

                key = getKeyByParty(request.payload.partido)
                if (key === -1) {
                    resolve({ "status": 14});
                }
                newVote["partido"] = key;

                clientStub.AddNewVote({
                        sede: newVote.sede,
                        municipio: newVote.municipio,
                        departamento: newVote.departamento,
                        papeleta: newVote.papeleta,
                        partido: newVote.partido
                    },
                    (error, voteDetails) => {
                        //implement your error logic here
                        console.log(voteDetails);
                        // console.log(error);
                    }
                );

                resolve({ "status": 0});
            });
            return resPromise.then(data => data);
        }
    });
    await server.start();
    console.log('Servidor Funcionando en %s', server.info.uri);
}
init()

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

function getKeyByPaper(name) {
    for (const key in papers) {
        if (papers[key].name === name) {
            return parseInt(key)
        }
    }
    return -1
}

function getKeyByParty(name) {
    for (const key in parties) {
        if (parties[key].name === name) {
            return parseInt(key)
        }
    }
    return -1
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
