const fs = require('fs');
const readline = require('readline');
const filename="config.js"

// create the input/output text interface for first run initialization process
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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

const config = {};

console.log(filename,": Checking config file");

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

// export config to rest of app
module.exports = config;