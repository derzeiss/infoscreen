'use strict';
(function () {
    angular
        .module('element.infoImpressions', [])
        .component('infoImpressions', {
            templateUrl: 'element/info-impressions/info-impressions.template.html',
            controller: infoImpressionsController
        });

    infoImpressionsController.$inject = ['Impression'];

    function infoImpressionsController(Impression) {
        const ctrl = this;


        //////////////////////////////

    }
})();