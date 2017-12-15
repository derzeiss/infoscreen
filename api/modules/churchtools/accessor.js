const bluebird = require('bluebird');
const request = require('request-promise');
const auth = require('./auth');
const config = require('../../config');
const logger = require('../logger');

/**
 * Request data from ChurchTools-API. Calls requestJsonFromCt.
 * @param options.q {string} - q param
 * @param options.func {string} - func param
 * @param [options.body] {object} - POST-Data
 * * @return {Promise}
 */
function requestData(options) {
    console.log(auth);
    return requestJSON({
        q: options.q,
        func: options.func,
        body: options.body,
        headers: auth.getSessionHeaders()
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
    requestJSON: requestJSON,
    requestData: requestData
};