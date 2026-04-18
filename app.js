// Main app file for test api

// create express and initialize modules
const express = require('express'); 
const app = express(); //create app
const cors = require('cors'); //add cors module
const path = require('path'); //add path module
const filename = path.basename(__filename); // for logging purposes
const { loadConfig } = require('./config/config.js'); //import loadConfig function from config.js
const { createPool } = require('./config/database.js'); //import createPool function from database.js
const { log } = require('./utils.js'); //import log function from utils.js

// execute main function
main();

// declare main function
async function main() {
    log(filename,": Entering main function");

    log(filename,": Set up config");
    const config = await loadConfig();
    log(filename,": Config loaded");
    const dbpool = createPool(config);
    log(filename,": Connection Pool loaded");

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

    log(filename,": Defining Routes");

    log(filename,": Defining SRD");
    const srdRouter = require('./routes/srd');
    log(filename,": Defining Health");
    const healthRouter = require('./routes/health');

    //hook up routers
    log(filename,": Hooking up routes");
    app.use('/srd', srdRouter); //srd functions
    app.use('/api', healthRouter); //health check

    // grab port as argument from commandline, else default to port in config file
    // note to self, add checking to ensure argv[2] is numeric in valid port range

    const port = process.env.PORT || process.argv[2] || 4000;

    app.listen(port, () => {
        log(filename,": API is ready to rock on port " + port);
    });

};

