// Main app file for test api

// create express and initialize modules
const express = require('express'); 
const app = express(); //create app
const cors = require('cors'); //add cors module
const bodyParser = require('body-parser'); //don't remember why we added this, but leaving it in for now, may be useful for future form handling
const path = require('path'); //add path module
const filename = path.basename(__filename); // for logging purposes
const { loadConfig } = require('./config/config.js'); //import loadConfig function from config.js
const { createPool } = require('./config/database.js'); //import createPool function from database.js

// execute main function
main();

// declare main function
async function main() {
    console.log(filename,": Entering main function");

    console.log(filename,": Set up config");
    const config = await loadConfig();
    console.log(filename,": Config loaded");
    const dbpool = createPool(config);
    console.log(filename,": Connection Pool loaded");

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

    console.log(filename,": Defining Health");
    const healthRouter = require('./routes/health');

    //hook up routers
    console.log(filename,": Hooking up routes");
    app.use('/system', systemRouter); //system functions
    app.use('/srd', srdRouter); //srd functions
    app.use('/users', usersRouter); //user functions
    app.use('/api', healthRouter); //health check

    // grab port as argument from commandline, else default to port in config file
    // note to self, add checking to ensure argv[2] is numeric in valid port range
    // temporarily disabled for heroku port binding

    /* refactor to be cleaner
    let port;
    let truePort;

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
    */
    

    const port = process.env.PORT || process.argv[2] || 4000;

    // modified for heroku
    app.listen(port, () => {
        console.log(filename,": API is ready to rock on port " + port);
    });

};

