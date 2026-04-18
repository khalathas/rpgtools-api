module.exports = {
  apps: [{
    name: 'axiom',
    script: 'app.js',
    env: {
      NODE_ENV: 'development',
      PORT: 4000
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log'
  }]
};
