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
        console.log("New vote request: info:")
        console.log(voteDetails)
        callback(null, {status : 200});
    },
});

ourServer.bindAsync(
    "127.0.0.1:50051",
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        console.log("Server running at http://127.0.0.1:50051");
        ourServer.start();
    }
);