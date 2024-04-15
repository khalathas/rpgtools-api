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
const filename = "app.js"; // for logging purposes

// Main function
function main() {

    // Setup config, run initialization if config does not exist
    let promise = new Promise(function(resolve, reject) {

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

        // create empty config object for later
        let config = {};

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
           Right now it will accept invalid responses and likely break the app. */
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
            fs.writeFile('config/config.json', JSON.stringify(configTemplate, null, 4), (err) => {
                if (err) throw err;console.log('Configuration saved to config.json');
                rl.close();
            })
        }

        // Begin the load/create config process
        console.log(filename,": Checking config file");

        if (fs.existsSync('config/config.json')) {
            console.log(filename,": Loading config.json");
            configFileContents = fs.readFileSync('config/config.json', 'utf8');
            //console.log(filename,": Config File Contents: ", configFileContents);
            config = JSON.parse(configFileContents);
            resolve(config);
        } else {
            console.log('No config.json found. Starting first run initialization...');
            config = promptForConfig();
            resolve(config);
        }

        /* Old code, from when these methods are called by setupDb()
        // Check if config.json exists
        config.checkConfig = async () => fs.existsSync('config/config.json');

        config.createConfig = async () => {
            console.log('No config.json found. Starting first run initialization...');
            return await promptForConfig({...configTemplate});
        };

        config.getConfig = async () => {
            console.log(filename,": Loading config.json");
            configFileContents = fs.readFileSync('config/config.json', 'utf8');
            //console.log(filename,": Config File Contents: ", configFileContents);
            return await JSON.parse(configFileContents);
        };
        */

        // End promise

    }).finally(() => {
        console.log("Setup complete");


    }).then(
        function(result) {
            let config = result;
            console.log(filename,": config contains: ",config);
            let db = mysql.createConnection({
                host : config.db.host,
                user : config.db.user,
                port : config.db.port,
                password : config.db.password,
                database : config.db.database
            });

            // store db in app.locals
            app.locals.db = db;

            console.log(filename,": app.locals.db config contains: ",app.locals.db);

            // const roles = require('./roles');
            console.log(filename,": Defining Routes");
            const systemRouter = require('./routes/system');
            const srdRouter = require('./routes/srd');
            const usersRouter =require('./routes/users');

            // set cors allowed origins
            app.use(cors());

            app.use(express.json());
            app.use(
                express.urlencoded({
                    extended: true
                })
            );

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

            app.get('/db', function(request, response) {
                console.log(filename," : db object: ",db);
                response.send("check console for object");
            });

        },
    function(error) {
            console.log(error);
        }
    );

};

main();





/* promise contents

// create config methods used below
        console.log(filename,": Defining Config");
        const configMethods = require('./config/config');

        //set up db config and connection, create db config if it doesn't exist
        let db;
        
        // check if config exists
        const hasConfig = await configMethods.checkConfig();
        console.log(filename,": hasConfig : ",hasConfig);

        // if exists, use file, else create it and use the object returned from the create method
        const config = hasConfig ? await configMethods.getConfig() : await configMethods.createConfig();
        console.log(filename,": current config db host : ",config.db.host);

        // set up db connector with values from config
        dbconn = mysql.createConnection({
            host : config.db.host,
            user : config.db.user,
            port : config.db.port,
            password : config.db.password,
            database : config.db.database
        });

            //console.log(filename,": database connector: ",db);

            resolve(dbconn);
        };


*/





/* then block contents
db = setupDb();

        app.locals.db = db;
        console.log(filename,": db config contains: ",db);

        //start what used to be outside of this

        console.log(filename,": Exists check, db is: ",db);

        // const roles = require('./roles');
        console.log(filename,": Defining Routes");
        const systemRouter = require('./routes/system');
        const srdRouter = require('./routes/srd');
        const usersRouter =require('./routes/users');

        // set cors allowed origins
        app.use(cors());

        app.use(express.json());
        app.use(
            express.urlencoded({
                extended: true
            })
        );

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

        app.get('/db', function(request, response) {
            console.log(filename," : db object: ",db);
            response.send("check console for object");
        });

        );
*/