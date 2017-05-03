'use strict';

// TODO add delete-confirmation dialog
// TODO animate on-delete

angular.module('impressionCard')
    .component('impressionCard', {
        bindings: {
            impression: '=',
            save: '&onSave',
            delete: '&onDelete',
            validateImpression: '&'
        },
        templateUrl: 'impression-card/impression-card.template.html',
        controller: impCardController
    });

impCardController.$inject = ['Upload', 'CONFIG'];

function impCardController(Upload, CONFIG) {
    var ctrl = this;

    ctrl.uploadImpressionImage = uploadImpressionImage;

    ////////////////////

    function uploadImpressionImage(file, errFiles) {
        console.log(file);
        if (!file) return;
        ctrl.status = {
            status: '',
            data: ''
        };
        file.upload = Upload.upload({
            url: CONFIG.urlBase + '/api/impressionImg',
            data: {impression: file }
        });
        file.upload.then(
            function (response) {
                ctrl.impression.img = response.data.filename;
            },
            function (response) {
                if(response.status) ctrl.fileUpload = {
                    status: response.status,
                    data: response.data
                }
            },
            function (ev) {
                ctrl.fileUpload = {
                    status: 'uploading',
                    data: Math.min(100, parseInt(100.0 * ev.loaded / ev.total))
                };
            }
        )
    }
}