/**
 * Created by alexs on 8/13/2018.
 */
const app = angular.module("app", ['ui.router', 'ngResource', 'ngCookies', 'ngToast'])

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
    })

    .factory('ResourceFactory', ['$resource', function($resource) {
        return $resource('/', {}, {
                getCommonWords: {
                    method: 'GET',
                    isArray: true,
                    url: '/common-words'
                },
                getWord: {
                    method: 'GET',
                    isArray: true,
                    url: '/word'
                },
                getCoordinates: {
                    method: 'GET',
                    isArray: false,
                    url: '/coordinates'
                },
                getUser: {
                    method: 'GET',
                    isArray: false,
                    url: '/getUser'
                },
                getTwitterUser: {
                    method: 'GET',
                    isArray: false,
                    url: '/getTwitterUser'
                },
                createUser: {
                    method: 'POST',
                    url: '/createUser'
                }
            }
        );
}]);
