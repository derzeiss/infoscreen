'use strict';
(function () {
    angular
        .module('element.notificationBar', [])
        .component('notificationBar', {
            templateUrl: 'element/notification-bar/notification-bar.template.html',
            controller: notificationBarController,
            bindings: {
                msg: '<',
                onInit: '&'
            }
        });

    notificationBarController.$inject = ['$timeout'];

    function notificationBarController($timeout) {
        const ctrl = this;

        ctrl.isVisible = false;
        ctrl.timeout = null;

        ctrl.$onInit = () => {
            ctrl.onInit({
                $notificationBar: {
                    showMessage: showMessage
                }
            })
        };

        ctrl.$onChanges = (change) => {
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

            ctrl.timeout = $timeout(() => {
                ctrl.displayMsg = null;
            }, 200);
        }

    }
})();