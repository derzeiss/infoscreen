'use strict';

angular.module('impressionList')
    .component('impressionList', {
        templateUrl: 'impression-list/impression-list.template.html',
        controller: impListController
    });

impListController.$inject = ['CONFIG', 'Impression'];

function impListController(CONFIG, Impression) {
    var ctrl = this;
    ctrl.impressions = Impression.query();
    ctrl.impressionsValid = true;
    ctrl.addImpression = addImpression;
    ctrl.onSave = onSave;
    ctrl.onDelete = onDelete;
    ctrl.validateImpression = validateImpression;

    ctrl.errorMsgs = {
        name: 'Der Name ist nicht eindeutig'
    };

    ////////////////////

    ctrl.impressions.$promise.then(function () { // add temporary error property (removed in onSave)
        ctrl.impressions.forEach(function (impression) {
            impression.error = {};
        });
    });

    function addImpression() {
        ctrl.impressions.push(angular.copy(CONFIG.baseImpression))
    }

    function onSave() {
        if (!ctrl.impressionsValid) return console.log('[impression-list][controller][onSave] errors');
        console.log('[impression-list][controller][onSave] saving');

        // remove temporary error field
        var impressions = angular.copy(ctrl.impressions);
        impressions.forEach(function (impression) {
            delete impression.error;
        });
        console.log(impressions);
        Impression.save(impressions);
    }

    function onDelete(name) {
        console.log('onDelete', name);
        ctrl.impressions.forEach(function (impression, index) {
            if (name == impression.name) {
                console.log('deleting', index);
                ctrl.impressions.splice(index, 1);
            }
        });
        onSave();
    }

    function validateImpression() {
        ctrl.impressionsValid = true;
        var index;
        var impressionNames = [];
        ctrl.impressions.forEach(function (impression) {
            index = impressionNames.indexOf(impression.name);
            if (index > -1) {
                impression.error.name = ctrl.errorMsgs.name;
                ctrl.impressions[index].error.name = ctrl.errorMsgs.name;
                ctrl.impressionsValid = false;
            } else impression.error.name = false;
            impressionNames.push(impression.name);
        });
    }
}
