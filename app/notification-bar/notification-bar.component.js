'use strict';
(function () {
    angular
        .module('element.notificationBar', [])
        .component('notificationBar', {
            templateUrl: 'notification-bar/notification-bar.template.html',
            controller: notificationBarController,
            bindings: {
                msg: '<',
                onInit: '&'
            }
        });

    notificationBarController.$inject = ['$timeout'];

    function notificationBarController($timeout) {
        var ctrl = this;

        ctrl.isVisible = false;
        ctrl.timeout = null;

        ctrl.$onInit = function() {
            ctrl.onInit({$notificationBar: {
                showMessage: showMessage
            }})
        };

        ctrl.$onChanges = function (change) {
            if (change.msg && change.msg.currentValue) {
                showMessage(change.msg.currentValue);
            }
        };
        //////////////////////////////

        function showMessage(msg) {
            if (ctrl.timeout) $timeout.cancel(ctrl.timeout);
            ctrl.displayMsg = msg;
            ctrl.isVisible = true;
            ctrl.timeout = $timeout(hideMessage, 3000);
        }

        function hideMessage() {
            ctrl.isVisible = false;

            ctrl.timeout = $timeout(function() {
                ctrl.displayMsg = null;
            }, 200);
        }

    }
})();