const fs = require('fs');
const readline = require('readline');

// declare config
let config;

// create the input/output text interface for first run initialization process
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// create config json template
let configTemplate = {
    "app": {
        "port": 4000
    },
    "db": {
        "host": "localhost",
        "port": 3306,
        "dbname": "",
        "user": "",
        "pass": ""
    }
};

// Series of prompts for building config file on first run.
// Future consideration: add input validation to ensure user gives valid values.
// Right now it will accept invalid responses and likely break the app.
function promptForConfig() {
    rl.question('Enter api port (default 4000): ', (port) => {
        configTemplate.app.port = port.trim() ? parseInt(port, 10) : 4000;

        rl.question('Enter database host (default "localhost"): ', (host) => {
            configTemplate.db.host = host.trim() || 'localhost';
            
            rl.question('Enter database port (default 3306): ', (dbPort) => {
                configTemplate.db.port = dbPort.trim() ? parseInt(dbPort, 10) : 3306;
                
                rl.question('Enter database name: ', (dbname) => {
                    configTemplate.db.dbname = dbname.trim();
                    
                    rl.question('Enter database user: ', (user) => {
                        configTemplate.db.user = user.trim();
                        
                        rl.question('Enter database password: ', (pass) => {
                            configTemplate.db.pass = pass.trim();
                            // After collecting all inputs, write to config.json
                            writeConfig();
                        });
                    });
                });
            });
        });
    });
}

function writeConfig() {
    fs.writeFile('config/config.json', JSON.stringify(configTemplate, null, 4), (err) => {
        if (err) throw err;console.log('Configuration saved to config.json');
        rl.close();
    })
}

/* new checkConfig streamlined, first run initialization added */
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

// run at startup
checkConfig();

// export config to rest of app
module.exports = config;