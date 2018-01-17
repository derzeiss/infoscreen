const debug = require('debug')('app:config');
const fs = require('fs');
const path = require('path');

let config = null;
let msg = null;
try {
    let name = fs.readFileSync(path.join(__dirname, 'default-config'), 'utf-8');
    try {
        config = {
            ct: require(`./${name}/ct.json`),
            app: require(`./${name}/app.json`)
        };
        msg = `using config "${name}"`
    } catch (e) {
        msg = `config "${name}" is invalid; using default config.`;
    }
} catch (e) {
    msg = 'custom config file not found; using default config.';
}

if (!config) {
    config = {
        ct: require(`./default/ct.json`),
        app: require(`./default/app.json`),
    }
}

debug(msg);
config.msg = msg;
module.exports = config;