/**
 * Created by alexs on 8/13/2018.
 */
(function () {
    'use strict';
    const app = angular.module('app');
    const HomeCtrl = function (ResourceFactory) {
        console.log("HomeCtrl init");

        const _this = this;
        _this.words = [];
        /*ResourceFactory.getCommonWords().then(function(response){
            _this.words = response.data;
            console.log('Common words retrieved');
        }, function (err) {
            console.error("Error retrieving common words")
        });*/
        ResourceFactory.getCommonWords({}, function(response){
            _this.words = response;
            console.log('Common words retrieved');
        }, function (err) {
            console.error("Error retrieving common words")
        });
    };
    HomeCtrl.$inject = ['ResourceFactory'];
    app.controller('HomeCtrl', HomeCtrl);
}());