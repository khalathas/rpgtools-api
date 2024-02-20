const fs = require('fs');
const readline = require('readline');

// create the input/output text interface for first run initialization process
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// create config json template
const configTemplate = {
    app: {
        port: 4000
    },
    db: {
        host: "localhost",
        port: 3306,
        dbname: "",
        user: "",
        pass: ""
    }
};

function askQuestion(query) {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
}

// Series of prompts for building config file on first run.
// Future consideration: add input validation to ensure user gives valid values.
// Right now it will accept invalid responses and likely break the app.

async function promptForConfig() {
    const port = await askQuestion('Enter api port (default 4000): ');
    configTemplate.app.port = port.trim() ? parseInt(port, 10) : 4000;

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

/* new checkConfig streamlined, first run initialization added */
/*
function checkConfig() {
    if (!fs.existsSync('config/config.json')) {
        console.log('No config.json found. Starting first run initialization...');
        promptForConfig();
        // Do not attempt to parse configFileContents here since it's not set.
    } else {
        console.log('Loading config.json');
        configFileContents = fs.readFileSync('config/config.json', 'utf8');
        // Only parse configFileContents if it's defined.
        config = JSON.parse(configFileContents);
    }
}
*/

const config = {};

config.checkConfig = async () => fs.existsSync('config/config.json');

config.createConfig = async () => {
    console.log('No config.json found. Starting first run initialization...');
    return await promptForConfig({...configTemplate});
};

config.getConfig = async () => {
    console.log('Loading config.json');
    configFileContents = fs.readFileSync('config/config.json', 'utf8');
    return JSON.parse(configFileContents);
};

// export config to rest of app
module.exports = config;