'use strict';

angular.module('infoImpressionContainer')
    .component('infoImpressionContainer', {
        templateUrl: 'info-impression-container/info-impression-container.template.html',
        controller: infoImpressionContainerController
    });

infoImpressionContainerController.$inject = ['$timeout', 'CONFIG', 'Impression'];

function infoImpressionContainerController($timeout, CONFIG, Impression) {
    var ctrl = this;

    ctrl.impressions = updateImpressions(true);
    ctrl.visibleImpression = -1;
    ////////////////////

    function updateImpressions(initialUpdate) {
        if(CONFIG.clientDebug) console.log('[infoImpressionContainer][controller][updateImpressions] initialUpdate:', initialUpdate);

        // fetch impressions via $resource
        var impressions = Impression.query();

        // set isVisible property to false for all impressions when they're fetched
        impressions.$promise.then(function () {
            if(!ctrl.impressions.length) return;
            ctrl.impressions.forEach(function (impression) {
                impression.isVisible = false;
            });
            showNextImpression();
        });

        // set timeout for next execution if it's the initial update
        if(initialUpdate) $timeout(updateImpressions, CONFIG.impressionRefreshDuration);

        return impressions;
    }

    function showNextImpression() {
        var imp = ctrl.impressions,
            currImp = imp[ctrl.visibleImpression];
        if(currImp) currImp.isVisible = false;  // hide current impression
        if (++ctrl.visibleImpression >= imp.length) ctrl.visibleImpression = 0; // change to next impression
        currImp = imp[ctrl.visibleImpression];
        currImp.isVisible = true;   // show next impression
        $timeout(showNextImpression, currImp.duration * 1000);
    }

}
