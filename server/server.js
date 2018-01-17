require('dotenv').config();
const debug = require('debug')('app:server');
const express = require('express');
const path = require('path');
const config = require('./config');
const logger = require('./modules/logger');

const app = express();

app.use(express.json());
if (config.app.enableCors) app.use(require('cors')());

// require routes
app.use(require('./routes'));

// setup static filesystem
app.use(express.static(path.join(__dirname, '..', 'app')));

// 404 handler
app.use((req, res, next) => {
    let err = new Error(`Not found: ${req.url}`);
    err.status = 404;
    next(err);
});

// send err to client
app.use((err, req, res, next) => {
    err.status = err.status || 500;
    res.status(err.status);

    // log err to console in dev environment
    if (process.env.NODE_ENV === 'development') console.error(err);
    logger.getError({
        url: req.url,
        name: err.name,
        message: err.message
    }, err);

    return res.json({
        status: err.status,
        name: err.name,
        message: err.message
    });
});

app.listen(config.app.port, function () {
    debug('listening on port', config.app.port);
});