'use strict';
(function () {
    angular
        .module('element.infoImpressions', [])
        .component('infoImpressions', {
            templateUrl: 'element/info-impressions/info-impressions.template.html',
            controller: infoImpressionsController
        });

    infoImpressionsController.$inject = ['$timeout', 'CONFIG', 'Impression'];

    function infoImpressionsController($timeout, CONFIG, Impression) {
        const ctrl = this;

        ctrl.impressions = [];
        ctrl.currentImpressionIndex = null;

        ctrl.isImpressionVisible = isImpressionVisible;

        fetchImpressions(true);
        //////////////////////////////

        function isImpressionVisible(index) {
            return index === ctrl.currentImpressionIndex;
        }

        function fetchImpressions(isInitialUpdate) {
            Impression.query().$promise.then((impressions) => {
                // make all current impressions obsolete
                ctrl.impressions.forEach((imp) => imp.isObsolete = true);

                // add new impressions
                impressions.forEach((imp) => ctrl.impressions.push(imp));

                // set timeout for next fetch
                $timeout(fetchImpressions, CONFIG.impressionRefreshDuration);

                if (isInitialUpdate) showNextImpression();
            });
        }

        function showNextImpression() {
            // check if current impression is obsolete & schedule removal after it faded out
            let currImp = ctrl.impressions[ctrl.currentImpressionIndex];
            if (currImp && currImp.isObsolete) $timeout(() => removeImpression(currImp), 1000);

            // show next impression
            ctrl.currentImpressionIndex = (ctrl.currentImpressionIndex + 1) % ctrl.impressions.length || 0;

            // schedule next swap
            if (ctrl.impressions.length) $timeout(showNextImpression, ctrl.impressions[ctrl.currentImpressionIndex].duration * 1000);
        }

        function removeImpression(impression) {
            let index = ctrl.impressions.indexOf(impression);
            if (index > -1) ctrl.impressions.splice(index, 1);
            if (index < ctrl.currentImpressionIndex) ctrl.currentImpressionIndex = Math.max(ctrl.currentImpressionIndex - 1, 0);
        }


    }
})();