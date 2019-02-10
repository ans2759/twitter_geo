/**
 * Created by alexs on 8/13/2018.
 */
(function () {
    'use strict';
    const app = angular.module('app');
    const HomeCtrl = function (ResourceFactory, $state, $stateParams, $cookies, ngToast, $location) {
        console.log("HomeCtrl init");

        const _this = this;
        _this.words = [];
        _this.showLoader = true;

        if ($stateParams.accountCreated) {
            $location.url('home');
            ngToast.success('Account successfully created');
        }

        ResourceFactory.getUser({}, function(response) {
            if ($cookies.get('skipUser') || response.user) {
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
                _this.showLoader = false;
                console.log('Common words retrieved');
            }, function (err) {
                console.error("Error retrieving common words")
            });
        }
    };
    HomeCtrl.$inject = ['ResourceFactory', '$state', '$stateParams', '$cookies', 'ngToast', '$location'];
    app.controller('HomeCtrl', HomeCtrl);
}());