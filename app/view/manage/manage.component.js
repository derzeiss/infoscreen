'use strict';
(function () {
    angular
        .module('view.manage', [])
        .component('manage', {
            templateUrl: 'view/manage/manage.template.html',
            controller: manageController
        });

    manageController.$inject = ['CONFIG', 'Upload', 'Impression'];

    function manageController(CONFIG, Upload, Impression) {
        const ctrl = this;

        ctrl.impressions = Impression.query();
        ctrl.selectedImpression = null;
        ctrl.selectedImpressionIndex = null;
        ctrl.actions = [];

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

        window.addEventListener('beforeunload', (e) => {
            commitActions(ctrl.actions, 'discard');
            ctrl.actions = [];
        });

        function onNotificationBarInit(notificationBar) {
            ctrl.notificationBar = notificationBar;
        }

        function commitActions(actions, name) {
            if (!actions || !Array.isArray(actions)) return;
            actions.forEach((action) => {
                if (action[name] && typeof action[name] === 'function') action[name]();
            });
        }

        function selectImpression(index) {
            ctrl.selectedImpressionIndex = index;
            ctrl.selectedImpression = ctrl.impressions[index];
        }

        function addImpression() {
            ctrl.impressions.push(angular.copy(ctrl.defaultImpression));
            ctrl.selectImpression(ctrl.impressions.length - 1);
        }

        function removeImpression() {
            if (!ctrl.selectedImpression) return;
            if (ctrl.selectedImpression.img) ctrl.actions.push({save: getActionMethod.deleteImg(ctrl.selectedImpression.img)});
            let nextSelectedIndex = Math.min(ctrl.selectedImpressionIndex, ctrl.impressions.length - 2);

            ctrl.impressions.splice(ctrl.selectedImpressionIndex, 1);
            ctrl.selectedImpression = null;
            ctrl.selectedImpressionIndex = null;
            ctrl.selectImpression(nextSelectedIndex);
            ctrl.notificationBar.showMessage('Impression gelöscht');
        }

        function save() {
            Impression.save(ctrl.impressions).$promise.then(() => {
                ctrl.notificationBar.showMessage('Speichern erfolgreich');
                commitActions(ctrl.actions, 'save');
                ctrl.actions = [];
            }).catch((err) => {
                console.warn(err);
                ctrl.notificationBar.showMessage('Speichern fehlgeschlagen');
            });
        }

        function moveUp() {
            if (!ctrl.selectedImpression) return;
            let item = ctrl.impressions.splice(ctrl.selectedImpressionIndex, 1)[0],
                insertAt = Math.max(0, ctrl.selectedImpressionIndex - 1);
            ctrl.impressions.splice(insertAt, 0, item);
            ctrl.selectImpression(insertAt);
        }

        function moveDown() {
            if (!ctrl.selectedImpression) return;
            let item = ctrl.impressions.splice(ctrl.selectedImpressionIndex, 1)[0],
                insertAt = Math.min(ctrl.impressions.length, ctrl.selectedImpressionIndex + 1);
            ctrl.impressions.splice(insertAt, 0, item);
            ctrl.selectImpression(insertAt);
        }

        function uploadImpressionImage(file) {
            if (!file) return;
            file.upload = Upload.upload({
                url: CONFIG.urlBase + '/api/impression/img',
                data: {
                    img: file,
                    name: ctrl.selectedImpression.name
                }
            });
            file.upload.then(
                (response) => {
                    // add an action to delete either old image on save or new image on discard
                    ctrl.actions.push({
                        save: ctrl.selectedImpression.img ? getActionMethod.deleteImg(ctrl.selectedImpression.img) : null,
                        discard: getActionMethod.deleteImg(response.data.filename)
                    });
                    // set new img and show confirmation message
                    ctrl.selectedImpression.img = response.data.filename;
                    ctrl.notificationBar.showMessage('Upload erfolgreich');
                },
                (err) => {
                    console.warn(err);
                    ctrl.notificationBar.showMessage('Upload fehlgeschlagen');
                },
                (ev) => {
                    // TODO upload progress
                }
            )
        }

        let getActionMethod = {
            deleteImg: (filename) => (() => Impression.deleteImage({filename: filename}).$promise.catch((err) => console.warn(err)))
        };

    }
})();