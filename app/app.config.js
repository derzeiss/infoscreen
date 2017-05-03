'use strict';

angular
    .module('infoscreen')

    .config(['$locationProvider', '$routeProvider',
        function ($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');

            $routeProvider
                .when('/', {
                    template: '<info-main></info-main>'
                })
                .when('/manage', {
                    template: '<impression-list></impression-list>'
                })
                .otherwise('/')

        }
    ])

    .constant('CONFIG', {
        urlBase: window.location.protocol + '//' + window.location.host,
        hashPrefix: '#!',
        // Note: all time values are ms
        eventCycleTimeout: 5 * 1000,
        eventFxDuration: 2 * 1000,
        eventRefreshDuration: 15 * 60 * 1000,
        impressionRefreshDuration: 15 * 60 * 1000,
        clientDebug: true,
        baseImpression: {
            name: '',
            duration: 0,
            description: '',
            img: ''
        }
    });