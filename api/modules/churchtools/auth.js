const accessor = require('./accessor');
const config = require('../../config');

let cookie = null;

function getSessionHeaders() {
    return cookie ? {'Cookie': cookie} : null;
}

function login() {
    if (cookie) return new Promise((res, rej) => res());
    return accessor.requestJSON({
        q: 'login',
        func: 'login',
        resolveWithFullResponse: true,
        body: {
            email: config.ct.email,
            password: config.ct.password
        }
    }).then((response) => {
        cookie = response.headers['set-cookie'].join(';');
    });
}

/**
 * Use login as middleware
 * @param req
 * @param res
 * @param next
 */
function loginRequired(req, res, next) {
    return login().then(next).catch(next);
}

module.exports = {
    getSessionHeaders: getSessionHeaders,
    login: login,
    loginRequired: loginRequired
};