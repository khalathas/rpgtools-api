// Main app file for test api

// get environement
require('dotenv').config();

// create express and initialize modules
const express = require('express'); 
const app = express(); //create app
const cors = require('cors'); //add cors module
const path = require('path'); //add path module
const filename = path.basename(__filename); // for logging purposes
const { loadConfig } = require('./config/config.js'); //import loadConfig function from config.js
const { createPool } = require('./config/database.js'); //import createPool function from database.js
const { log } = require('./utils/logger.js'); //import log function from logger.js

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

    log(filename,": Defining Rules");
    const rulesRouter = require('./routes/rules');
    log(filename,": Defining System");
    const systemRouter = require('./routes/system');
    log(filename,": Defining Admin");
    const adminRouter = require('./routes/admin');

    //hook up routers
    log(filename,": Hooking up routes");
    app.use('/rules', rulesRouter); //rules functions
    app.use('/api', systemRouter); //system functions
    app.use('/admin', adminRouter); //admin functions

    // grab port as argument from commandline, else default to port in config file
    // note to self, add checking to ensure argv[2] is numeric in valid port range

    const port = process.env.PORT || process.argv[2] || 4000;

    app.listen(port, () => {
        log(filename,": API is ready to rock on port " + port);
    });

};

