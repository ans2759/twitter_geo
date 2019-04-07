(function () {
    'use strict';
    const app = angular.module('app');
    const WordCtrl = function ($stateParams, ResourceFactory, map, $window) {
        console.log("WordCtrl init");
        console.log('Word: ' + $stateParams.word);

        $window.scrollTo(0, 0);

        const _this = this;
        const YELP_IMAGES_PATH = "images/yelp/regular_";
        const PNG = '.png';
        _this.showLoader = true;
        _this.word = $stateParams.word;
        _this.tweets = [];
        _this.tweetFilter = {};
        _this.filterOnGeo = false;
        _this.hasGeo = false;
        _this.businesses = [];
        _this.isValidUser = false;

        ResourceFactory.getWord({word: $stateParams.word}, function (response) {
            _this.tweets = response;
            map.initMap();
            _this.hasGeo = _this.tweets.some((tweet) => tweet.geo);
            _this.showLoader = false;
        }, function (err) {
            console.error('Error retrieving tweets for ' + $stateParams.word, err);
        });

        ResourceFactory.getUser({}, function(response) {
            _this.isValidUser = response.user.isMember && response.user.validUntil > new Date().getTime();
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
            if (_this.isValidUser) {
                ResourceFactory.yelpSearch({word: _this.word}, (response) => {
                    _this.businesses = response;
                });
            }
        };

        _this.searchYelpGeo = function(tweet) {
            if (_this.isValidUser) {
                ResourceFactory.yelpSearchGeo({word: _this.word, lat: tweet.geo.coordinates[0], lng: tweet.geo.coordinates[1]}, (response) => {
                    _this.businesses = response;
                });
            }
        };

        _this.getStarImageUrl = function(rating) {
            let url = YELP_IMAGES_PATH;
            switch (rating) {
                case 0:
                    url = url + '0';
                    break;
                case 1.0:
                    url = url + '1';
                    break;
                case 1.5:
                    url = url + '1_half';
                    break;
                case 2.0:
                    url = url + '2';
                    break;
                case 2.5:
                    url = url + '2_half';
                    break;
                case 3.0:
                    url = url + '3';
                    break;
                case 3.5:
                    url = url + '3_half';
                    break;
                case 4:
                    url = url + '4';
                    break;
                case 4.5:
                    url = url + '4_half';
                    break;
                case 5:
                    url = url + '5';
                    break;
                default:
                    console.error('No image for rating ' + rating);
            }

            return url + PNG;
        }

    };
    WordCtrl.$inject = ['$stateParams', 'ResourceFactory', 'map', '$window'];
    app.controller("WordCtrl", WordCtrl)
}());