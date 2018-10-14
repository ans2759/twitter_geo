(function () {
    'use strict';
    const app = angular.module('app');
    const MapUtil = function () {

        let map;
        function initMap(lat, lng) {
            angular.element(document.getElementById('map')).attr('style', 'height:100%');

            map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: lat, lng: lng},
                zoom: 8
            });
        }

        return {
            initMap: initMap
        }
    };
    app.directive("mapUtil", MapUtil)
}());