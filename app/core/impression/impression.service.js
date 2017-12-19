'use strict';

angular.module('core.impression')
    .factory('Impression', ['$resource', 'CONFIG', function ($resource, CONFIG) {
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
    }]);