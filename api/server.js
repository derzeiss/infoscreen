const express = require('express');
const path = require('path');
const config = require('./config');

const app = express();

require('body-parser').json();
if (config.app.enableCors) app.use(require('cors')());

// require routes
app.use(require('./routes'));

// setup static filesystem
app.use(express.static(path.join(__dirname, '..', 'app')));

// 404 handler
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// send err to client
app.use((err, req, res, next) => {
    err.status = err.status || 500;
    res.status = err.status;
    console.error(err);
    return res.json({
        status: err.status,
        name: err.name,
        message: err.message
    });
});

app.listen(config.app.port, function () {
    console.log('listening on port', config.app.port);
});