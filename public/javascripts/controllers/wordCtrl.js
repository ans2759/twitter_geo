(function () {
    'use strict';
    const app = angular.module('app');
    const WordCtrl = function ($stateParams, ResourceFactory, map, $window) {
        console.log("WordCtrl init");
        console.log('Word: ' + $stateParams.word);

        $window.scrollTo(0, 0);

        const _this = this;
        _this.showLoader = true;
        _this.word = $stateParams.word;
        _this.tweets = [];
        _this.tweetFilter = {};
        _this.filterOnGeo = false;
        _this.hasGeo = false;

        ResourceFactory.getWord({word: $stateParams.word}, function (response) {
            _this.tweets = response;
            map.initMap();
            _this.hasGeo = _this.tweets.some((tweet) => tweet.geo);
            _this.showLoader = false;
        }, function (err) {
            console.error('Error retrieving tweets for ' + $stateParams.word, err);
        });

        _this.showTweet = function(tweet) {
            map.deleteMarkers();
            map.addMarker(tweet, true);
        };

        _this.showAllTweets = function() {
            map.deleteMarkers();
            map.addTweets(_this.tweets.filter(tweet => tweet.geo));
        };

        _this.showGeoTweets = function() {
            _this.tweetFilter = _this.filterOnGeo ? {} : hasGeoFilter;
            _this.filterOnGeo = !_this.filterOnGeo;
        };

        const hasGeoFilter = function(tweet) {
            return tweet.geo !== null;
        };

        _this.searchYelp = function() {
            ResourceFactory.yelpSearch({word: _this.word}, (response) => {

            });
        }

    };
    WordCtrl.$inject = ['$stateParams', 'ResourceFactory', 'map', '$window'];
    app.controller("WordCtrl", WordCtrl)
}());