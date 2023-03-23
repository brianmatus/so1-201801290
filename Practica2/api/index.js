// SERVER
const Hapi = require('@hapi/hapi');


// DATABASE
let is_sql_local = false
let mainDB;
const mysql = require('mysql');


process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});


if (is_sql_local) {
    mainDB = mysql.createConnection({
        host: process.env.L_DB_HOST,
        user: process.env.L_DB_USER,
        password: process.env.L_DB_PASS,
        database: process.env.L_DB_NAME
    });
}
else {
    mainDB = mysql.createConnection({
        host: process.env.C_DB_HOST,
        user: process.env.C_DB_USER,
        password: process.env.C_DB_PASS,
        database: process.env.C_DB_NAME
    });
}

mainDB.connect(function (err) {
    if (err) throw err;
})


function makeDBQuery(sqlQuery) {
    return new Promise((resolve, reject) => {
        mainDB.query(sqlQuery, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve([results, fields]);
            }
        });
    });
}



const init = async () => {

    const server = Hapi.server({
        port: 5000,
        host: 'localhost',
        routes: {
            cors: true
        }
    });

    server.route({
        method: 'GET',
        path: '/get_data',
        handler: async (request, h) => {

            let result = {};
            let stats, procs;


            await makeDBQuery("SELECT * FROM prac2_stats")
                .then(composition => {
                    stats= composition[0];
                })
                .catch(error => {
                    console.error(error);
                }
            );
            await makeDBQuery("SELECT * FROM prac2_procs")
                .then(composition => {
                    const resultDict = {};
                    composition[0].forEach((row) => {
                        const rowDict = {};
                        composition[1].forEach((field) => {
                            rowDict[field.name] = row[field.name];
                        });
                        resultDict[row["ENTRY"]] = rowDict; // Assuming "id" is the primary key of the table
                    });
                    procs = resultDict;
                })
                .catch(error => {
                    console.error(error);
                }
            );

            // console.log(procs)
            // console.log(stats[0].free_ram)

            let ram_usage = (stats[0].total_ram - stats[0].free_ram - stats[0].buffered_ram - stats[0].cached_ram)*100/stats[0].total_ram;
            ram_usage = ram_usage.toFixed(2);
            let cp_usage = (stats[0].cpu_usage - 80)/400 + 1.4
            cp_usage = Math.min(Math.max(cp_usage, 0), 100);
            cp_usage.toFixed(2);

            let count_total_proc = Object.keys(procs).length;
            let count_running_proc = 0;
            let count_suspended_proc = 0;
            let count_stopped_proc = 0;
            let count_zombie_proc = 0;
            let count_other_proc = 0;

            for (const entry in procs) {
                switch (procs[entry]["State"]) {
                    case "R":
                        count_running_proc++;
                        break;
                    case "S":
                        count_suspended_proc++;
                        break;
                    case "T":
                        count_stopped_proc++;
                        break;
                    case "Z":
                        count_zombie_proc++;
                        break;
                    default:
                        count_other_proc++;
                }
            }
            result["processes"] = procs
            result["count_total_proc"] = count_total_proc
            result["count_running_proc"] = count_running_proc
            result["count_suspended_proc"] = count_suspended_proc
            result["count_stopped_proc"] = count_stopped_proc
            result["count_zombie_proc"] = count_zombie_proc
            result["count_other_proc"] = count_other_proc
            result["cpu_usage"] = cp_usage
            result["ram_usage"] = ram_usage
            result["total_ram"] = stats[0].total_ram
            result["free_ram"] = stats[0].free_ram
            result["buffered_ram"] = stats[0].buffered_ram
            result["cached_ram"] = stats[0].cached_ram
            return JSON.stringify(result);
        }
    });
    await server.start();
    console.log('Server running on %s', server.info.uri);
};


init();