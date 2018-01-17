'use strict';
(function () {
    angular
        .module('view.info', [])
        .component('info', {
            templateUrl: 'view/info/info.template.html',
            controller: infoController
        });

    infoController.$inject = ['Event', 'Impression'];

    function infoController(Event, Impression) {
        const ctrl = this;

        ctrl.impressions = Impression.query();
        ctrl.events = Event.query();

        //////////////////////////////

        function updateEvents() {
            ctrl.events = Event.query();
            ctrl.events.$promise.then((data) => {

            }).catch((err) => console.log('infoController.updateEvents.err', err));
        }

    }
})();