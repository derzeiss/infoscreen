'use strict';

angular.module('core.impression')
    .factory('Impression', ['$resource', 'CONFIG', function ($resource, CONFIG) {
        return $resource(CONFIG.urlBase + '/api/impression/:id', {}, {
            deleteImage: {
                url: CONFIG.urlBase + '/api/impressionImg/:filename',
                method: 'delete',
                isArray: 'false'
            }
        });
    }]);