const debug = require('debug')('app:modules:ct:accessor');
const bluebird = require('bluebird');
const request = require('request-promise');
const config = require('../config');
const logger = require('./logger');

/* ---------- AUTH ---------- */
let cookies = null;

/**
 * Use login as middleware
 * @param req
 * @param res
 * @param next
 */
function loginRequired(req, res, next) {
    return login().then(next).catch(next);
}

/**
 * fire user login request
 * @returns {*}
 */
function login() {
    if (cookies) return new Promise((res, rej) => res());
    return requestJSON({
        q: 'login',
        func: 'login',
        resolveWithFullResponse: true,
        body: {
            email: config.ct.email,
            password: config.ct.password
        }
    }).then((response) => {
        cookies = response.headers['set-cookie'].join(';');
    });
}

/* ---------- REQUEST ---------- */
/**
 * Request data from ChurchTools-API. Calls requestJsonFromCt.
 * @param options.q {string} - q param
 * @param options.func {string} - func param
 * @param [options.body] {object} - POST-Data
 * * @return {Promise}
 */
function requestData(options) {
    return requestJSON({
        q: options.q,
        func: options.func,
        body: options.body,
        headers: {'Cookie': cookies}
    });
}

/**
 * Request JSON from ChurchTools-API. Does error-handling.
 * @param options.q {string} - q param
 * @param options.func {string} - func param
 * @param [options.body] {object} - POST-Data
 * @param [options.resolveWithFullResponse] {boolean} - resolve response with full response or with body only
 * @param [options.headers] {object} - request headers
 * @return {Promise} promise
 */
function requestJSON(options) {
    return new bluebird.Promise((resolve, reject) => {
        const url = `${config.ct.url}?q=${options.q}/ajax&func=${options.func}`;
        request.post({
            url: url,
            form: options.body,
            headers: options.headers,
            proxy: config.app.proxy || null,
            resolveWithFullResponse: options.resolveWithFullResponse || false
        })
            .then((response) => {
                let data = options.resolveWithFullResponse ? response.body : response;

                // check for valid JSON
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    return reject(logger.getError({
                        url: url,
                        name: 'ParseError',
                        message: 'Got malformed response from churchtools'
                    }, e));
                }

                // check for ct-api error
                if (data.status !== 'success') {
                    return reject(logger.getError({
                        url: url,
                        name: 'ChurchToolsApiError',
                        message: data.message || 'Got empty error state from ChurchTools API'
                    }), data);
                }

                // return data
                return resolve(options.resolveWithFullResponse ? response : data.data);
            })
            .catch((err) => {
                return reject(logger.getError({
                    url: url,
                    name: 'RequestError',
                    message: err.message
                }, err));
            });
    });
}

module.exports = {
    loginRequired: loginRequired,

    requestJSON: requestJSON,
    requestData: requestData
};