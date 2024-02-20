// Main app file for test api

// create express and initialize modules
const express = require('express'); 
const app = express(); //create app
const cors = require('cors'); //add cors module
const path = require('path'); //add path module
const mysql = require('mysql'); //add mysql2 module
const fs = require('fs'); //add filesystem module
const bodyParser = require('body-parser');

// const db = require('./db'); // database connector
console.log("Defining Config");
const configMethods = require('./config/config');
const hasConfig = async () => await configMethods.checkConfig();
const configFile = async () => hasConfig ? await configMethods.getConfig() : await configMethods.createConfig();
const config = configFile();
// const roles = require('./roles');
console.log("Defining Routes");
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
console.log("Hooking up routes");
app.use('/system', systemRouter); //system functions
app.use('/srd', srdRouter); //srd functions
app.use('/users', usersRouter); //user functions

// grab port as argument from commandline, else default to port in config file
// note to self, add checking to ensure argv[2] is numeric in valid port range
// temporarily disabled for heroku port binding
if (process.argv[2]) {
    port = process.argv[2];
} else {
    port = config.app.port;
}
// make the port heroku-friendly
if (process.env.PORT) { 
    truePort = process.env.PORT;
} else { 
    truePort = port;
}

// modified for heroku
app.listen(truePort, () => {
    console.log("API is ready to rock on port " + truePort);
});

// Homepage - disabled
//app.get('/', function (request, response) {
//    request.render()
    /*
    response.sendFile(path.resolve(__dirname,'html') + '/index.html');
    console.log("Home endpoint invoked.");
    */
//});
