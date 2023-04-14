const mysql = require('mysql');
require('dotenv').config({ path: './.env.local' });

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

connection.connect();
// connection.end();


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = "./vote.proto";


const loaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

// initializing the package definition
var packageDef = protoLoader.loadSync(PROTO_PATH, loaderOptions);

const grpcObj = grpc.loadPackageDefinition(packageDef);

const ourServer = new grpc.Server();


ourServer.addService(grpcObj.VoteService.service, {
    addNewVote: (voteMessage, callback) => {
        const voteDetails = { ...voteMessage.request };
        connection.query(
            'INSERT INTO votes (`SEDE`, `MUNICIPIO`, `DEPARTAMENTO`, `PAPELETA`, `PARTIDO`) VALUES (?, ?, ?, ?, ?)',
            [voteDetails.sede, voteDetails.municipio, voteDetails.departamento, voteDetails.papeleta, voteDetails.partido],
            (error, results, fields) => {
                if (error) console.log(error);
                console.log("InsID:" + results.insertId)
            }
        );

        callback(null, {status : 200});
    },
});
const GRPC_SERVER_PORT = process.env.GRPC_SERVER_PORT;
ourServer.bindAsync(
    "0.0.0.0:" + GRPC_SERVER_PORT,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        console.log("Server running at http://0.0.0.0:" + GRPC_SERVER_PORT);
        ourServer.start();
    }
);