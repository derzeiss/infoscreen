'use strict';

angular.module('infoClock')
    .component('infoClock', {
        templateUrl: 'info-clock/info-clock.template.html',
        controller: infoClockController
    });

infoClockController.$inject = ['$timeout'];

function infoClockController($timeout) {
    var ctrl = this;

    ctrl.currentTime = 'loading...';
    getCurrentTime();
    ////////////////////

    function twoDigits(n) {
        return ('' + n).length < 2 ? '0' + n : '' + n;
    }

    function getCurrentTime() {
        var d = new Date(),
            h = twoDigits(d.getHours()),
            m = twoDigits(d.getMinutes()),
            s = twoDigits(d.getSeconds());
        $timeout(getCurrentTime);
        ctrl.currentTime = h + ':' + m + ':' + s;
    }

}
