const debug = require('debug')('app:modules:logger');
const fs = require('bluebird').promisifyAll(require('fs'));
const path = require('path');
const config = require('../config');

/**
 * log error and return logged message
 * @returns {string} - formatted error message
 * @param customErr
 * @param originalErr
 */
function getError(customErr, originalErr) {
    let msg = `${customErr.url} | ${customErr.name}: ${customErr.message}\nOriginal error: ${originalErr.name}: ${originalErr.message}`;

    error(msg);
    return msg;
}

// @formatter:off
function log() { write('log', arguments); }
function warn() { write('warn', arguments); }
function error() { write('err', arguments); }
// @formatter:on

/**
 * Write into log file.
 * @param type {string} - logging type. Usually log, warn or err
 * @param arguments {Array} - array of elements to log
 */
function write(type, arguments) {
    if (!Array.isArray(arguments)) arguments = Array.prototype.slice.call(arguments);
    let logPath = path.join(__dirname, '..', config.app.path.log, new Date().toISOString().split('T')[0] + '.txt'),
        time = new Date().toISOString().replace('T', ' ').replace('Z', ''),
        msg = `[${type.toUpperCase()}] ${time}: ${arguments.join(', ')}`;
    msg = msg.replace(/\n/g, '\n\t') + '\n';

    fs.appendFileAsync(logPath, msg).catch((err) => {
        throw err;
    });
}

// log config state onInit
log('---------- Server starting ----------');
log(config.msg);

module.exports = {
    getError: getError,
    log: log,
    warn: warn,
    error: error
};