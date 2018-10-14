(function () {
    'use strict';
    const app = angular.module('app');
    const WordCtrl = function ($stateParams, ResourceFactory) {
        console.log("WordCtrl init");
        console.log('Word: ' + $stateParams.word);

        const _this = this;

        let map;
        function initMap(lat, lng) {
            angular.element(document.getElementById('map')).attr('style', 'height:100%');

            map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: lat, lng: lng},
                zoom: 11
            });
        }

        _this.word = $stateParams.word;
        _this.tweets = [];
        ResourceFactory.getWord({word: $stateParams.word}, function (response) {
            _this.tweets = response;

            initMap(40.687, -74.042);

            _this.tweets.forEach(function(tweet, index) {
                if (tweet.geo && tweet.geo.coordinates) {
                    const myLatlng = new google.maps.LatLng(tweet.geo.coordinates[0], tweet.geo.coordinates[1]);
                    const marker = new google.maps.Marker({
                        position: myLatlng,
                        title: tweet.user.name
                    });

                    const infoWindow = new google.maps.InfoWindow({
                        content: '<div id="content">'+
                            '<div id="siteNotice">'+
                            '</div>'+
                            '<h1 id="firstHeading" class="firstHeading">' + tweet.user.name + '</h1>'+
                            '<div id="bodyContent">'+
                            '<p>' + tweet.text + '</p>'+
                            '</div>'+
                            '</div>'

                });
                    marker.addListener('click', function() {
                        infoWindow.open(map, marker)
                    });
                    marker.setMap(map);
                }
            })
        }, function (err) {
            console.error('Error retrieving tweets for ' + $stateParams.word);
        })
    };
    WordCtrl.$inject = ['$stateParams', 'ResourceFactory'];
    app.controller("WordCtrl", WordCtrl)
}());