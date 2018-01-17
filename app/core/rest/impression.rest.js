'use strict';
(function () {
    angular
        .module('core.impression', [])
        .factory('Impression', impressionFactory);

    impressionFactory.$inject = ['$resource', 'CONFIG'];

    function impressionFactory($resource, CONFIG) {
        return $resource(CONFIG.urlBase + '/api/impression/:id', {}, {
            save: {
                method: 'post',
                isArray: true
            },
            deleteImage: {
                url: CONFIG.urlBase + '/api/impression/img/:filename',
                method: 'delete',
                isArray: false
            }
        });
    }
})();