'use strict';

angular.module('eventItem')
    .component('eventItem', {
        bindings: {
            'event': '<'
        },
        templateUrl: 'event-item/event-item.template.html',
        controller: eventItemController
    });

eventItemController.$inject = [];

function eventItemController() {
    var ctrl = this;

}
