/**
 * Created by alexs on 8/13/2018.
 */
(function () {
    'use strict';
    const app = angular.module('app');
    const HomeCtrl = function (ResourceFactory, $state, $stateParams) {
        console.log("HomeCtrl init");

        const _this = this;
        _this.words = [];
        angular.element(document.getElementById('map')).attr('style', 'height:0');

        ResourceFactory.getUser({}, function(response) {
            if ($stateParams.skipUser || response.user) {
                getCommonWords()
            } else {
                $state.go('newUser');
            }
        }, function (err) {
            console.error("Error retrieving user data", err)
        });

        function getCommonWords() {
            ResourceFactory.getCommonWords({}, function(response){
                _this.words = response;
                console.log('Common words retrieved');
            }, function (err) {
                console.error("Error retrieving common words")
            });
        }
    };
    HomeCtrl.$inject = ['ResourceFactory', '$state', '$stateParams'];
    app.controller('HomeCtrl', HomeCtrl);
}());