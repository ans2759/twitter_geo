(function () {
    'use strict';
    const app = angular.module('app');
    const ResourceFactory = function ($resource) {
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
                },
                isAdmin: {
                    method: 'GET',
                    isArray: false,
                    url: '/isAdmin'
                },
                getBoundingInfo: {
                    method: 'GET',
                    isArray: false,
                    url: '/getBoundingInfo'
                },
                getCenter: {
                    method: 'GET',
                    isArray: false,
                    url: 'getCenter'
                },
                getUsers: {
                    method: 'GET',
                    isArray: true,
                    url: '/getUsers'
                },
                deleteUser: {
                    method: 'DELETE',
                    isArray: false,
                    url: '/deleteUser'
                },
                changeAdminStatus: {
                    method: 'PUT',
                    isArray: false,
                    url: '/changeAdminStatus'
                },
                updateCorners: {
                    method: 'PUT',
                    isArray: false,
                    url: '/updateCorners'
                },
                streamConnected: {
                    method: 'GET',
                    isArray: false,
                    url: '/streamConnected'
                },
                connectStream: {
                    method: 'PUT',
                    isArray: false,
                    url: '/connectStream'
                },
                closeStream: {
                    method: 'PUT',
                    isArray: false,
                    url: '/closeStream'
                },
                uploadStopWords: {
                    method: 'POST',
                    isArray: false,
                    url: '/uploadStopWords'
                },
                archiveTweets: {
                    method: 'POST',
                    isArray: false,
                    url: '/archiveTweets'
                },
                getTweetCount: {
                    method: 'GET',
                    isArray: false,
                    url: '/getTweetCount'
                },
                yelpSearch: {
                    method: 'GET',
                    isArray: false,
                    url: '/yelp-search'
                }
            }
        );
    };
    ResourceFactory.$inject = ['$resource'];
    app.factory("ResourceFactory", ResourceFactory)
}());