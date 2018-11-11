(function () {
    'use strict';
    const app = angular.module('app');
    const WordCtrl = function ($stateParams, ResourceFactory, map, $window) {
        console.log("WordCtrl init");
        console.log('Word: ' + $stateParams.word);

        $window.scrollTo(0, 0);

        const _this = this;

        _this.word = $stateParams.word;
        _this.tweets = [];
        ResourceFactory.getWord({word: $stateParams.word}, function (response) {
            _this.tweets = response;

            map.initMap();

        }, function (err) {
            console.error('Error retrieving tweets for ' + $stateParams.word, err);
        });

        _this.showTweet = function(tweet) {
            map.deleteMarkers();
            map.addMarker(tweet, true);
        };

        _this.showAllTweets = function() {
            map.deleteMarkers();
            map.addTweets(_this.tweets);
        };

    };
    WordCtrl.$inject = ['$stateParams', 'ResourceFactory', 'map', '$window'];
    app.controller("WordCtrl", WordCtrl)
}());