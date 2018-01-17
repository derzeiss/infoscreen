'use strict';
(function () {
    angular
        .module('element.infoClock', [])
        .component('infoClock', {
            templateUrl: 'element/info-clock/info-clock.template.html',
            controller: infoClockController
        });

    infoClockController.$inject = ['$timeout'];

    function infoClockController($timeout) {
        const ctrl = this;

        ctrl.currentTime = '';

        update();
        //////////////////////////////

        /**
         * Add left padding to a string
         * @param str {string|Number} - string to add padding to
         * @param [len] {int} - target length
         * @param [char] {string} - padding char
         * @returns {*}
         */
        function padLeft(str, len, char) {
            str = str + '';
            len = len || 2;
            char = char || '0';
            while (str.length < len) {
                str = char + str;
            }
            return str;
        }

        function update() {
            let d = new Date(),
                h = padLeft(d.getHours()),
                m = padLeft(d.getMinutes()),
                s = padLeft(d.getSeconds());

            // schedule next update
            $timeout(update, 1000);

            // set new time string
            ctrl.currentTime = `${h}:${m}:${s}`;
        }
    }
})();