/**
 * Created by alexs on 8/13/2018.
 */
const app = angular.module("app", ['ui.router', 'ngResource'])

    .config(function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/home');

        $stateProvider.state('home', {
            url: '/home',
            controller: 'HomeCtrl',
            controllerAs: 'ctrl',
            templateUrl: 'views/home.html'
        });

        $stateProvider.state('word', {
            url: '/word/:word',
            controller: 'WordCtrl',
            controllerAs: 'ctrl',
            templateUrl: 'views/word.html'
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
                }
            }
        );
}]);
