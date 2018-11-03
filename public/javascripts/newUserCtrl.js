(function () {
    'use strict';
    const app = angular.module('app');
    const NewUserCtrl = function ($stateParams, ResourceFactory, map, $window, $state) {
        console.log("NewUserCtrl init");

        const _this = this;
        angular.element(document.getElementById('map')).attr('style', 'height:0');

        _this.user = null;
        ResourceFactory.getTwitterUser({}, function (response) {
            _this.user = response;
        }, function (err) {
            console.error('Error retrieving user ', err);
        });

        _this.createUser = function() {
           ResourceFactory.createUser({}, function (response) {
               $state.go('home');
           }, function (err) {
               console.error("Error creating user", err);
           })
        };

        _this.doNotCreateUser = function() {
            $state.go('home', {skipUser: true});
        };
    };
    NewUserCtrl.$inject = ['$stateParams', 'ResourceFactory', 'map', '$window', '$state'];
    app.controller("NewUserCtrl", NewUserCtrl)
}());