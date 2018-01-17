'use strict';
(function () {
    angular
        .module('core.event', [])
        .factory('Event', eventFactory);

    eventFactory.$inject = ['$resource', 'CONFIG'];

    function eventFactory($resource, CONFIG) {
        return $resource(CONFIG.urlBase + '/api/event/:id');
    }
})();