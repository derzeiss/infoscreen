const debug = require('debug')('app:config');
const fs = require('fs');
const path = require('path');

let config = null;
try {
    let name = fs.readFileSync(path.join(__dirname, 'default-config.txt'), 'utf-8');
    try {
        config = {
            ct: require(`./${name}/ct.json`),
            app: require(`./${name}/app.json`)
        };
        debug(`using config "${name}"`)
    } catch (e) {
        debug(`config "${name}" is invalid; using default config.\n Original error: ${e}`)
    }
} catch (e) {
    debug(`custom config file not found; using default config.\n Original error: ${e}`);
}

if (!config) {
    config = {
        ct: require(`./default/ct.json`),
        app: require(`./default/app.json`)
    }
}

module.exports = config;