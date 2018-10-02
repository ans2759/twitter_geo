(function () {
    'use strict';
    const app = angular.module('app');
    const WordCtrl = function ($stateParams, ResourceFactory) {
        console.log("WordCtrl init");
        console.log('Word: ' + $stateParams.word);

        const _this = this;
        _this.word = $stateParams.word;
        _this.tweets = [];
        ResourceFactory.getWord({word: $stateParams.word}, function (response) {
            _this.tweets = response;
        }, function (err) {
            console.error('Error retrieving tweets for ' + $stateParams.word);
        })
    };
    WordCtrl.$inject = ['$stateParams', 'ResourceFactory'];
    app.controller("WordCtrl", WordCtrl)
}());