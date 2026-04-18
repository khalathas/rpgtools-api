const fs = require('fs'); //add filesystem module
const readline = require('readline'); //add readline input module for creating config
const path = require('path'); //add path module
const filename = path.basename(__filename); // for logging purposes
const { log } = require('../utils.js'); //import log function from utils.js

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


async function loadConfig() {
    // Begin the load/create config process
    log(filename,": Checking config file");

    if (fs.existsSync('config.json')) {
        log(filename,": Loading config.json");
        const configFileContents = fs.readFileSync('config.json', 'utf8');
        const config = JSON.parse(configFileContents);
        log(filename,": Config complete");
        return config;
    } else {
        log('No config.json found. Starting first run initialization...');
        const config = await promptForConfig(); // consider promptForConfig().then(resolve); syntax as a cleanup item
        log(filename,": Config complete");
        return config;
    }

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

// ask question, return answer, use r1 in/out interface above
async function askQuestion(query) {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
}

// write config file to disk
function writeConfig(configTemplate) {
    fs.writeFile('config.json', JSON.stringify(configTemplate, null, 4), (err) => {
        if (err) {
            rl.close();
            throw err;
        }
        log('Configuration saved to config.json');
        rl.close();
    })
}

module.exports = { 
    loadConfig 
};