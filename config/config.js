const fs = require('fs');

const defaultFile = "config/default.json";
const configFile = "config/config.json";
var activeConfig;

// run at startup
checkConfig();

// read and parse config file, if config.json exists, else default.json
// default.json just for testing with config.json. will be removed later most likely
// this will eventually become the first run initialize code as well

/*
replace this with an initialize app type function that looks for
a config file and loads it if it exists, and creates it if it does not exist
process should ask user for their database info.
*/

function checkConfig() {
    if (fs.existsSync(configFile)) {
        activeConfig = JSON.parse(fs.readFileSync(configFile));
        console.log('Config file exists, loading: ', configFile);
    } else {
        activeConfig = JSON.parse(fs.readFileSync(defaultFile));
        console.log('Config file does not exist, loading: ', defaultFile);
        console.log('Please use default.json as a template to create config.json with your own setting parameters to connect to your database.');
    }
}

const config = {
    app: { port: activeConfig.app.port },
    db: {
        host: activeConfig.db.host,
        user : activeConfig.db.user,
        port : activeConfig.db.port,
        password : activeConfig.db.pass,
        database : activeConfig.db.dbname
    },
    listPerPage: 10
}

module.exports = config;