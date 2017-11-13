var express = require('express');
var app = require('express')();
var http = require('http').Server(app);

var bodyParser = require('body-parser');
var fs = require('fs');
var multiparty = require('multiparty');
var Form = multiparty.Form;
var path = require('path');
var request = require('request');
var util = require("util");
var config = require("./config.gza");

var promisedIo = require('promised-io/promise');
var Deferred = promisedIo.Deferred;
var whenAll = promisedIo.all;

if (config.enableCors) {
    var cors = require('cors');
    app.use(cors());
}

String.prototype.toAbsolutePath = function () {
    var relativePath = this[0] === '/' ? this : '/' + this;
    return path.resolve(__dirname + relativePath);
};

/**
 * returns an array including the numbers from min to max.
 * @param min - lower limit, included in array
 * @param max - upper limit, not included in array
 * @returns {int[]} array including the numbers from min to max-1
 */
function range(min, max) {
    if (!max) {
        max = min;
        min = 0;
    }
    var delta = max - min;
    return Array
        .apply(null, {length: delta})
        .map(Number.call, Number)
        .map(function (n) {
            return n + min
        });
}

// absolute paths used in the app
app.paths = {
    index: '../app/index.html'.toAbsolutePath(),
    manage: '/#!/manage',
    data: 'data'.toAbsolutePath(),
    impressions: 'data/impressions.json'.toAbsolutePath(),
    ct: config.url,
    ctLogin: '?q=login/ajax&func=login',
    ctGetEvents: '?q=churchcal/ajax&func=getCalendarEvents',
    ctGetResources: '?q=churchresource/ajax&func=getMasterData'
};

app.data = {
    cookies: null // cookies are just stored in session variable and get refreshed when (re)starting the server
};

// error types for event requests
app.errorTypes = {
    unknownError: {
        id: 0,
        name: 'UnknownError'
    },
    requestError: {
        id: 1,
        name: 'RequestError'
    },
    parseError: {
        id: 2,
        name: 'ParseError'
    },
    ctError: {
        id: 3,
        name: 'ChurchToolsError'
    }
};

// -------------------- CLIENT APP --------------------

// send client app
app.get('/', function (req, res) {
    res.sendFile(app.paths.index);
});

app.get('/manage', function (req, res) {
    res.redirect(app.paths.manage);
});


// -------------------- PARSE POST DATA --------------------
// parse application/json
var jsonParser = bodyParser.json();


// -------------------- DATA API --------------------

// ---------- IMPRESSIONS ----------
app.get('/api/impression', function (req, res) {
    // try to send impressions
    res.sendFile(app.paths.impressions, {}, function (err) {
        // send empty impression array if file doesn't exist
        if (err) {
            fs.mkdir(app.paths.data);
            fs.writeFile(app.paths.impressions, '[]');
            res.send('[]')
        }
    });
});

app.post('/api/impression', jsonParser, function (req, res) {
    // TODO validate impressions
    fs.writeFileSync(app.paths.impressions, JSON.stringify(req.body));
    res.sendStatus(204);
});

app.post('/api/impressionImg', function (req, res) {
    var form = new Form();
    form.on('error', function (err) {
        console.log('error parsing form: ' + err.stack);
    });

    form.parse(req, function (err, fields, files) {
        if (err) {
            console.error(err);
            res.status(500).send(err);
            return;
        }
        var fieldId, field;
        for (fieldId in files) {
            if (!files.hasOwnProperty(fieldId)) continue;
            field = files[fieldId];
            field.forEach(function (file) {
                // generate name for new file
                var fileNameSplit = file.originalFilename.split('.'),
                    fileExtension = fileNameSplit[fileNameSplit.length - 1],  // get file extension
                    newFileName = new Date().getTime() + '.' + fileExtension,  // generate new unique file name + extension
                    newFilePath = ('/../app/imp/' + newFileName).toAbsolutePath();  // generate absolute file path
                // write file to new path
                fs.readFile(file.path, function (err, data) {  // read temp-file
                    fs.writeFile(newFilePath, data, function () {  // write new file
                        fs.unlinkSync(file.path);  // delete temp-file
                        res.send({filename: newFileName});
                    });
                });
            })
        }
    });

});

app.delete('/api/impressionImg/:filename', function (req, res, next) {
    try {
        fs.unlinkSync('../app/imp/' + req.params.filename);
        res.sendStatus(204);
    } catch (err) {
        res.sendStatus(404);
    }

});

// ---------- EVENTS ----------

app.get('/api/event', function (req, res) {
    var doneLogin, doneEvents, doneResources;

    // login if needed
    if (!app.data.cookies) doneLogin = requestLogin();
    else doneLogin = Deferred().resolve();

    whenAll(doneLogin).then(
        // onSuccess: request events and resources
        function () {
            doneEvents = requestEvents();
            doneResources = requestResources();

            whenAll(doneEvents, doneResources).then(
                // onSuccess: normalize events and send
                function (responses) {
                    var events = responses[0];
                    var resources = responses[1];

                    res.send(normalizeEvents(events, resources));

                },
                // onError: send error
                function (err) {
                    res.status(500).send(err);
                })
        },
        // onError: send error
        function (err) {
            res.status(500).send(err);
        }
    )
});

/**
 * Convert all events into a readable format
 * @param {Array} events - CT-Events
 * @param {String} events[].bezeichnung
 * @param {String} events[].startdate
 * @param {String} events[].enddate
 * @param {Object} events[].bookings
 * @param {Object} resources - CT-Resources
 * @param {Object} resources.resources
 * @param {Object} resources.status
 * @returns {Array} normalized events
 */
function normalizeEvents(events, resources) {
    var event,
        date,
        now = new Date(),
        normalizedEvents = [],
        normalizedEvent,
        normalizedBookings,
        bookingId,
        booking,
        resource,
        location;

    // loop through events
    for (var i = 0; i < events.length; i++) {
        event = events[i];

        // don't display event if it's over or not today
        date = new Date(event.enddate);
        if (date.getTime() < now.getTime() || date.getDay() !== now.getDay()) {
            console.log('filtered cause it\'s over or not today:', event.startdate, '|', event.enddate, '|', event.bezeichnung);
            continue;
        }

        normalizedEvent = {
            title: event.bezeichnung,
            time: event.startdate.split(' ')[1].substr(0, 5),
            location: '',
            level: ''
        };

        // check if event has bookings
        if (event.bookings) {
            normalizedBookings = [];
            location = '';

            // loop through bookings
            for (bookingId in event.bookings) {
                if (!event.bookings.hasOwnProperty(bookingId)) continue;

                booking = event.bookings[bookingId];
                resource = resources.resources[booking.resource_id];

                // create a normalized booking TODO filter bookings by status
                normalizedBookings.push({
                    locationId: booking.resource_id,
                    locationName: resource.bezeichnung,
                    level: resource.location,
                    statusId: booking.status_id,
                    statusName: resources.status[booking.status_id].bezeichnung
                });
            }

            // sort bookings
            normalizedBookings.sort(function (a, b) {
                return config.locationPriority.indexOf(a) - config.locationPriority.indexOf(b);
            });

            if (config.showMultipleLocations) {
                // join location names with ','
                normalizedEvent.location = normalizedBookings.map(function (e) {
                    return e.locationName
                }).join(', ');
            } else {
                // take highest priority location
                normalizedEvent.location = normalizedBookings[0].locationName
            }

            // level is always the one of highest priority location
            normalizedEvent.level = normalizedBookings[0].level;

            normalizedEvents.push(normalizedEvent);
        } else if (config.showEventsWithoutBookings) normalizedEvents.push(normalizedEvent);
        else console.log('filtered cause it has no bookings', event)
    }
    return normalizedEvents;
}

/**
 * request ChurchCal Events
 * @returns {Deferred} promise
 */
function requestLogin() {
    var promise = requestJsonFromCt(
        app.paths.ctLogin,
        {
            email: config.email,
            password: config.password
        });

    // set cookies onSuccess
    promise.then(function (data) {
        // save cookies
        app.data.cookies = data.httpResponse.headers['set-cookie'].join(';');
    });

    return promise
}

/**
 * request ChurchCal Events
 * @returns {Deferred} promise
 */
function requestEvents() {
    return requestDataFromCT(
        app.paths.ctGetEvents,
        {
            from: 0,
            to: config.showEventsForDays,
            category_ids: range(100)
        });
}

/**
 * request ChurchResource MasterData
 * @returns {Deferred} promise
 */
function requestResources() {
    return requestDataFromCT(app.paths.ctGetResources);
}

/**
 * Request data from ChurchTools-API. Calls requestJsonFromCt.
 * @param {String} url - The request URL
 * @param {Object} [form] - POST-Data
 * @return {Deferred} promise. Set callbacks via promise.then(onSuccess(data), onError(err))
 */
function requestDataFromCT(url, form) {
    var promise = Deferred();
    requestJsonFromCt(url, form, {'Cookie': app.data.cookies}).then(
        // onSuccess
        function (data) {
            promise.resolve(data.json);
        },
        // onError
        function onError(err) {
            promise.reject(err)
        });
    return promise;
}

/**
 * Request JSON from ChurchTools-API. Does error-handling.
 * @param {String} url - The request URL
 * @param {Object} [form] - POST-Data
 * @param {Object} [headers] - request headers
 * @return {Deferred} promise
 */
function requestJsonFromCt(url, form, headers) {
    var json;
    var promise = Deferred();
    request.post({
        url: app.paths.ct + url,
        headers: headers,
        form: form
    }, function (err, httpResponse, body) {
        // check request error
        if (err) {
            promise.reject(getErrorMessage(app.errorTypes.requestError, app.paths.ct + url, err));
            return;
        }
        // check if response is valid JSON
        try {
            json = JSON.parse(body);
        } catch (err) {
            promise.reject(getErrorMessage(app.errorTypes.parseError, app.paths.ct + url, body));
            return;
        }
        // check CT-API error
        if (json.status !== 'success') {
            promise.reject(getErrorMessage(app.errorTypes.ctError, app.paths.ct + url, json.data));
            return;
        }

        // everything fine -> return data
        promise.resolve({json: json.data, httpResponse: httpResponse});
    });
    return promise
}

/**
 * Create an error message depending on the debug level
 * @param {Object} type - error type. See app.errorTypes
 * @param {int} type.id
 * @param {String} type.name
 * @param {String} context - Function or context in which the error is thrown
 * @param {String} details - Detailed debug info (returned only if debug is enabled)
 * @returns {String} Error message
 */
function getErrorMessage(type, context, details) {
    var err = type.name + ' @ ' + context;
    if (config.debug) err += ':\n' + details;
    return err;
}


// -------------------- FILESYSTEM & ERROR HANDLING --------------------
app.use(express.static(__dirname + '/../app/'));

// handle 404 errors
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// send error page
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.contentType = 'text/plain';
    res.send(err.status + ' ' + err.message);
    if (err.status !== 404) console.err(err);
});

http.listen(config.port, function () {
    console.log('listening on port', config.port);
});