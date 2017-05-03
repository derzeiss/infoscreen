'use strict';

angular.module('eventList')
    .component('eventList', {
        templateUrl: 'event-list/event-list.template.html',
        controller: eventListController
    });

eventListController.$inject = ['$http', '$timeout', 'CONFIG'];

function eventListController($http, $timeout, CONFIG) {
    var ctrl = this;
    ctrl.events = [];
    ctrl.animationHelperVisible = true;

    updateEvents(true);
    ////////////////////

    function updateEvents(initialUpdate) {
        // get events via $http
        $http.get(CONFIG.urlBase + '/api/event').then(onEventsLoadedSuccess, onEventsLoadedError);
        // set timeout for next update if this is the initial update
        if (initialUpdate) $timeout(updateEvents, CONFIG.eventRefreshDuration);
    }

    function onEventsLoadedSuccess(response) {
        if (CONFIG.clientDebug) console.log('[eventList][controller] events loaded successfully:', response.data);
        ctrl.events = response.data;
        ctrl.events.sort(function (a, b) {
            return timeToInt(a.time) - timeToInt(b.time);
        });
        if (ctrl.events.length > 4) nextEvent();
    }

    function onEventsLoadedError(response) {
        console.error('[eventList][controller] error:', response.data);
    }

    function nextEvent() {
        ctrl.animationHelperVisible = false;
        $timeout(function () {
            ctrl.animationHelperVisible = true;
            ctrl.events.push(ctrl.events.shift());
            $timeout(nextEvent, CONFIG.eventCycleTimeout);
        }, CONFIG.eventFxDuration);
    }

    function timeToInt(time) {
        return parseInt(time.replace(':', ''));
    }
}
