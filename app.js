// Main app file for test api

// create express and initialize modules
const express = require('express'); 
const app = express(); //create app
const cors = require('cors'); //add cors module
const path = require('path'); //add path module
const mysql = require('mysql'); //add mysql2 module
const fs = require('fs'); //add filesystem module
const bodyParser = require('body-parser');
const filename = "app.js";

// create config methods used below
console.log(filename,": Defining Config");
const configMethods = require('./config/config');

//set up db config and connection, create db config if it doesn't exist
let db;
async function setupDb() {
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

    return dbconn;
};

// run setup function on start
db = setupDb();
db.then(function(result) {
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
    

//end what used to be outside of this

});

