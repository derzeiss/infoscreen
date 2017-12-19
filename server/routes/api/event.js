const debug = require('debug')('app:routes:event');
const router = require('express').Router();
const bluebird = require('bluebird');
const config = require('../../config');
const accessor = require('../../modules/churchtools/accessor');
const logger = require('../../modules/logger');

router.get('/', accessor.loginRequired, (req, res, next) => {
    let promises = [];

    promises.push(accessor.requestData({
        q: 'churchcal',
        func: 'getMasterData'
    }).then((data) => {
        let categories = [];
        for (let id in data.category) {
            if (!data.category.hasOwnProperty(id)) continue;
            categories.push(id);
        }
        return accessor.requestData({
            q: 'churchcal',
            func: 'getCalendarEvents',
            body: {
                from: 0,
                to: 1,
                category_ids: categories
            }
        });
    }));
    promises.push(accessor.requestData({
        q: 'churchresource',
        func: 'getMasterData'
    }));

    bluebird.all(promises).then((data) => {
        return res.json(normalizeEvents(data[0], data[1]));
    })

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
    let event,
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
    for (let i = 0; i < events.length; i++) {
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
                return config.app.locationPriority.indexOf(a) - config.app.locationPriority.indexOf(b);
            });

            if (config.app.showMultipleLocations) {
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
        } else if (config.app.showEventsWithoutBookings) {
            normalizedEvents.push(normalizedEvent);
        } else debug('filtered cause it has no bookings', event)
    }
    return normalizedEvents;
}

module.exports = router;