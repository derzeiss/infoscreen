(function () {
    var config = {
        // mandatory settings
        url: 'https://gza.church.tools',     // your ChurchTools-URL
        email: 'infoscreen@gza-online.de',   // your ChurchTool e-mail
        password: 'virtuellerNutzer',        // your ChurchTools password

        // optional settings
        showEventsForDays: 1,               // events are shown for the next ~ days
        showEventsWithoutBookings: true,    // set to true if you want to display events that have no bookings assigned
        showMultipleLocations: true,        // if true locations will be joined by ',', if false only the highest priority location will be shown
        locationPriority: [],               // event locations will be sorted in this order. Locations that are not listed get a lower priority. Syntax is: ['room1', 'room2']
        debug: true,                        // set debug mode for server app. If true, more error details will be send to the client
        port: 80,                           // server port
        enableCors: true                    // enable Cross-Origin-Resource-Sharing; let it turned on unless you know what you're doing
    };

    if (!config.url.endsWith('/')) config.url += '/';
    module.exports = config;
})();