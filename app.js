// Main app file for test api

// create express and initialize modules
const express = require('express'); 
const app = express(); //create app
const cors = require('cors'); //add cors module
const path = require('path'); //add path module
const mysql = require('mysql'); //add mysql2 module
const fs = require('fs'); //add filesystem module
const bodyParser = require('body-parser');
const readline = require('readline'); //add readline input module for creating config
// const utils = require('./utils.js'); // custom functions
const filename = "app.js"; // for logging purposes


//console.log(filename,": Defining net");
//const { createConnection } = require('net');

// create empty config object for later
let config = {};
let db = {};

console.log(filename,": Entering main function");

// Main function
function main() {

    console.log(filename,": Set up config promise");
    // Setup config, run initialization if config does not exist
    let setupConfigPromise = new Promise(function(resolve, reject) {

        // define templates and structures
        // create config json template
        const configTemplate = {
            db: {
                host: "localhost",
                port: 3306,
                dbname: "",
                user: "",
                pass: ""
            }
        };

        // create the input/output text interface for first run initialization process
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // define functions

        // ask question, return answer, use r1 in/out interface above
        async function askQuestion(query) {
            return new Promise((resolve) => {
                rl.question(query, (answer) => {
                    resolve(answer);
                });
            });
        }

        /* Series of prompts for building config file on first run.
           Future consideration: add input validation to ensure user gives valid values.
           Right now it will accept invalid ress and likely break the app. */
        async function promptForConfig() {
            const host = await askQuestion('Enter database host (default "localhost"): ');
            configTemplate.db.host = host.trim() || 'localhost';
        
            const dbPort = await askQuestion('Enter database port (default 3306): ');
            configTemplate.db.port = dbPort.trim() ? parseInt(dbPort, 10) : 3306;
        
            const dbname = await askQuestion('Enter database name: ');
            configTemplate.db.dbname = dbname.trim();
        
            const user = await askQuestion('Enter database user: ');
            configTemplate.db.user = user.trim();
        
            const pass = await askQuestion('Enter database password: ');
            configTemplate.db.pass = pass.trim();
        
            // After collecting all inputs, write to config.json
            writeConfig(configTemplate);
        
            return {...configTemplate};
        }

        function writeConfig(configTemplate) {
            fs.writeFile('config.json', JSON.stringify(configTemplate, null, 4), (err) => {
                if (err) throw err;console.log('Configuration saved to config.json');
                rl.close();
            })
        }

        // Begin the load/create config process
        console.log(filename,": Checking config file");

        if (fs.existsSync('config.json')) {
            console.log(filename,": Loading config.json");
            configFileContents = fs.readFileSync('config.json', 'utf8');
            //console.log(filename,": Config File Contents: ", configFileContents);
            config = JSON.parse(configFileContents);
            resolve(config);
        } else {
            console.log('No config.json found. Starting first run initialization...');
            config = promptForConfig();
            resolve(config);
        }

        // End promise

    }).finally(() => {
        console.log(filename,": Setup complete");


    }).then(
        function(result) {
            const config = result;
         
            // new, connection pooling
            dbpool = mysql.createPool({
                connectionLimit : 10,
                host : config.db.host,
                user : config.db.user,
                port : config.db.port,
                password : config.db.pass,
                database : config.db.dbname
            });
            console.log(filename,": Connection Pool created");
                        
            // store db in app.locals
            app.locals.config = config;
            app.locals.db = dbpool;

            // set cors allowed origins
            app.use(cors());

            app.use(express.json());
            app.use(
                express.urlencoded({
                    extended: true
                })
            );

            // const roles = require('./roles');
            console.log(filename,": Defining Routes");

            console.log(filename,": Defining SRD");
            const srdRouter = require('./routes/srd');

            console.log(filename,": Defining System");
            const systemRouter = require('./routes/system');

            console.log(filename,": Defining Users");
            const usersRouter =require('./routes/users');

            //hook up routers
            console.log(filename,": Hooking up routes");
            app.use('/system', systemRouter); //system functions
            app.use('/srd', srdRouter); //srd functions
            app.use('/users', usersRouter); //user functions

            // grab port as argument from commandline, else default to port in config file
            // note to self, add checking to ensure argv[2] is numeric in valid port range
            // temporarily disabled for heroku port binding
            if (process.argv[2]) {
                port = process.argv[2];
            } else {
                port = 4000;
            }
            // make the port heroku-friendly
            if (process.env.PORT) { 
                truePort = process.env.PORT;
            } else { 
                truePort = port;
            }

            // modified for heroku
            app.listen(truePort, () => {
                console.log(filename,": API is ready to rock on port " + truePort);
            });

        },
    function(error) {
            console.log(error);
        }
    );

};


main();