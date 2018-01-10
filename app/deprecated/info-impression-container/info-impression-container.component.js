'use strict';

angular.module('infoImpressionContainer')
    .component('infoImpressionContainer', {
        templateUrl: 'info-impression-container/info-impression-container.template.html',
        controller: infoImpressionContainerController
    });

infoImpressionContainerController.$inject = ['$timeout', 'CONFIG', 'Impression'];

function infoImpressionContainerController($timeout, CONFIG, Impression) {
    var ctrl = this;

    ctrl.impressions = [];
    ctrl.visibleImpression = -1;

    updateImpressions(true);
    ////////////////////

    function updateImpressions(initialUpdate) {
        if (CONFIG.clientDebug) console.log('[infoImpressionContainer][controller][updateImpressions] initialUpdate:', initialUpdate);

        // set isVisible property to false for all impressions when they're fetched
        Impression.query().$promise.then(function (impressions) {
            if (!impressions.length) return;

            // make old impressions obsolete
            ctrl.impressions.forEach(function (impression) {
                impression.isObsolete = true;
            });
            impressions.forEach(function (impression) {
                ctrl.impressions.push(impression);
            });

            // setup timeout for next impression-update
            $timeout(updateImpressions, CONFIG.impressionRefreshDuration);

            // start animation loop if it's the first update
            if(initialUpdate) showNextImpression();
        });
    }

    function showNextImpression() {
        var currImp, nextImp;

        // set current impression
        currImp = ctrl.impressions[ctrl.visibleImpression] || {};

        // calc index of next impression and set
        ctrl.visibleImpression = (ctrl.visibleImpression + 1) % ctrl.impressions.length;
        nextImp = ctrl.impressions[ctrl.visibleImpression];

        // swap impressions
        if (currImp) currImp.isVisible = false;
        nextImp.isVisible = true;

        // setup timeout for next swap
        $timeout(showNextImpression, nextImp.duration * 1000);

        // plan to remove old impression if it's obsolete
        if(currImp.isObsolete) {
            $timeout(function() {
                var index = ctrl.impressions.indexOf(currImp);
                if(index > -1) ctrl.impressions.splice(index, 1);
                ctrl.visibleImpression = Math.max(ctrl.visibleImpression - 1, 0);
            }, 2000);
        }
    }

}
