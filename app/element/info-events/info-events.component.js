'use strict';
(function () {
    angular
        .module('element.infoEvents', [])
        .component('infoEvents', {
            templateUrl: 'element/info-events/info-events.template.html',
            controller: infoEventsController
        });

    infoEventsController.$inject = ['$timeout', 'CONFIG', 'Event'];

    function infoEventsController($timeout, CONFIG, Event) {
        const ctrl = this;

        ctrl.events = [];
        ctrl.isAnimationHelperVisible = true;

        fetchEvents();
        //////////////////////////////

        /**
         * Fetch events from server and display them.
         * Insert empty state if there are no events
         */
        function fetchEvents() {
            // save if events are currently animated for later
            let isAnimated = ctrl.events.length > 4;

            // fetch new events
            Event.query().$promise.then((events) => {
                ctrl.events.forEach((ev) => ev.isObsolete = true);

                if (!events.length) {
                    // insert empty state
                    ctrl.events = [{
                        title: 'Für heute war\'s das.',
                        location: 'Es stehen keine Termine mehr im Kalender',
                    }];
                } else {
                    // sort events by time
                    events.sort((a, b) => timeToInt(a.time) - timeToInt(b.time));
                    events.forEach((e) => ctrl.events.push(e));

                    // start animating events if not already done ...
                    if (!isAnimated && ctrl.events.length > 4) showNextEvent();
                    // ... clean up events otherwise
                    else cleanUpEvents()
                }
            });

            // schedule next fetch
            $timeout(fetchEvents, CONFIG.eventRefreshDuration);
        }

        /**
         * Rotate to the next event with animation & remove the old one if it's obsolete
         */
        function showNextEvent() {
            // will animate the animation helpers height to 0
            ctrl.isAnimationHelperVisible = false;
            $timeout(() => { // wait until that's done
                ctrl.isAnimationHelperVisible = true;
                // get and remove first event
                let e = ctrl.events.shift();
                // push it to the end of events if it's not obsolete
                if (!e.isObsolete) ctrl.events.push(e);
                // keep animating if needed ...
                if (ctrl.events.length > 4) $timeout(showNextEvent, CONFIG.eventCycleTimeout - CONFIG.eventFxDuration);
                // ... clean up events otherwise
                else cleanUpEvents();
            }, CONFIG.eventFxDuration);
        }

        /**
         * Do a hard clean up on ctrl.events removing all obsolete events instantly
         */
        function cleanUpEvents() {
            // don't remove any events if the list is animated
            if(ctrl.events.length > 4) return;
            ctrl.events = ctrl.events.reduce((events, ev) => {
                if(!ev.isObsolete) events.push(ev);
                return events;
            }, [])
        }

        /**
         * convert event.time string into compareable number
         * @param time
         * @returns {Number}
         */
        function timeToInt(time) {
            return parseInt(time.replace(':', ''));
        }

    }
})();