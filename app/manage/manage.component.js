'use strict';
(function () {
    angular
        .module('view.manage', [])
        .component('manage', {
            templateUrl: 'manage/manage.template.html',
            controller: manageController
        });

    manageController.$inject = ['CONFIG', 'Upload', 'Impression'];

    function manageController(CONFIG, Upload, Impression) {
        var ctrl = this;

        ctrl.selectedItem = null;
        ctrl.impressions = Impression.query();
        ctrl.obsoleteImages = [];

        ctrl.onNotificationBarInit = onNotificationBarInit;
        ctrl.selectImpression = selectImpression;

        ctrl.addImpression = addImpression;
        ctrl.removeImpression = removeImpression;
        ctrl.save = save;
        ctrl.moveUp = moveUp;
        ctrl.moveDown = moveDown;

        ctrl.uploadImpressionImage = uploadImpressionImage;

        ctrl.defaultImpression = {
            img: '',
            name: '',
            duration: 5,
            description: ''
        };
        //////////////////////////////
        function onNotificationBarInit(notificationBar) {
            ctrl.notificationBar = notificationBar;
        }

        function selectImpression(index) {
            ctrl.selectedImpressionIndex = index;
            ctrl.selectedImpression = ctrl.impressions[index];
        }

        function addImpression() {
            ctrl.impressions.push(angular.copy(ctrl.defaultImpression));
        }

        function removeImpression() {
            if (!ctrl.selectedImpression) return;
            if (ctrl.selectedImpression.img) ctrl.obsoleteImages.push(ctrl.selectedImpression.img);
            var nextSelectedIndex = Math.min(ctrl.selectedImpressionIndex, ctrl.impressions.length - 2);

            ctrl.impressions.splice(ctrl.selectedImpressionIndex, 1);
            ctrl.selectedImpression = null;
            ctrl.selectedImpressionIndex = null;
            ctrl.selectImpression(nextSelectedIndex);
            ctrl.notificationBar.showMessage('Impression gelöscht');
        }

        function save() {
            console.log('save');
            Impression.save(ctrl.impressions).$promise.then(function () {
                ctrl.notificationBar.showMessage('Speichern erfolgreich');

                // remove obsolete images
                ctrl.obsoleteImages.forEach(function (img) {
                    Impression.deleteImage({filename: img});
                });

            }).catch(function (err) {
                console.log(err);
                ctrl.notificationBar.showMessage('Speichern fehlgeschlagen');
            });
        }

        function moveUp() {
            if (!ctrl.selectedImpression) return;
            var item = ctrl.impressions.splice(ctrl.selectedImpressionIndex, 1)[0],
                insertAt = Math.max(0, ctrl.selectedImpressionIndex - 1);
            ctrl.impressions.splice(insertAt, 0, item);
            ctrl.selectImpression(insertAt);
        }

        function moveDown() {
            if (!ctrl.selectedImpression) return;
            var item = ctrl.impressions.splice(ctrl.selectedImpressionIndex, 1)[0],
                insertAt = Math.min(ctrl.impressions.length, ctrl.selectedImpressionIndex + 1);
            console.log(item, insertAt);
            ctrl.impressions.splice(insertAt, 0, item);
            ctrl.selectImpression(insertAt);
        }

        function uploadImpressionImage(file) {
            if (!file) return;
            file.upload = Upload.upload({
                url: CONFIG.urlBase + '/api/impressionImg',
                data: {impression: file}
            });
            file.upload.then(
                function (response) {
                    if (ctrl.selectedImpression.img) ctrl.obsoleteImages.push(ctrl.selectedImpression.img);
                    ctrl.selectedImpression.img = response.data.filename;
                    ctrl.notificationBar.showMessage('Upload erfolgreich');
                },
                function (err) {
                    console.log(err);
                    ctrl.notificationBar.showMessage('Upload fehlgeschlagen');
                },
                function (ev) {
                    // TODO upload progress
                }
            )
        }

    }
})();