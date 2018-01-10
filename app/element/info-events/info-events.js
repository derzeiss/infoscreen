'use strict';
(function () {
    angular
        .module('element.infoEvents', [])
        .component('infoEvents', {
            templateUrl: 'element/info-events/info-events.template.html',
            controller: infoEventsController
        });

    infoEventsController.$inject = ['Event'];

    function infoEventsController(Event) {
        const ctrl = this;


        //////////////////////////////

    }
})();