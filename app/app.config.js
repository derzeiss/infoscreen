'use strict';

angular
    .module('infoscreen', [
        'ngResource',
        'ngRoute',
        'ngFileUpload',

        'core',
        'view',
        'element'
    ])

    .config(['$locationProvider', '$routeProvider',
        function ($locationProvider, $routeProvider) {
            $locationProvider.hashPrefix('!');

            $routeProvider
                .when('/', {
                    template: '<info></info>'
                })
                .when('/manage', {
                    template: '<manage></manage>'
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
        clientDebug: true
    });