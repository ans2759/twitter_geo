/**
 * Created by alexs on 8/13/2018.
 */
const app = angular.module("app", ['ui.router', 'ngResource', 'ngCookies', 'ngToast', 'angularFileUpload'])

    .config(function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/home');

        $stateProvider.state('home', {
            url: '/home?accountCreated',
            controller: 'HomeCtrl',
            controllerAs: 'ctrl',
            templateUrl: 'views/home.html'
        });

        $stateProvider.state('word', {
            url: '/word/:word',
            controller: 'WordCtrl',
            controllerAs: 'ctrl',
            templateUrl: 'views/word.html',
            onExit: function(map) {
                map.deleteMarkers();
            }
        });

        $stateProvider.state('newUser', {
            url: '/newUser',
            controller: 'NewUserCtrl',
            controllerAs: 'ctrl',
            templateUrl: 'views/newUser.html'
        });

        $stateProvider.state('admin', {
            url: '/admin',
            controller: 'AdminCtrl',
            controllerAs: 'ctrl',
            templateUrl: 'views/admin.html',
            onExit: function(StreamConnected, TweetCount) {
                StreamConnected.cancel();
                TweetCount.cancel();
            }
        });

        $stateProvider.state('notAuthorized', {
            url: '/notAuthorized?section',
            controller: 'NotAuthorizedCtrl',
            controllerAs: 'ctrl',
            templateUrl: 'views/notAuthorized.html'
        });
    });
