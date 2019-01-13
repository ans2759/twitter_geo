(function () {
    'use strict';
    const app = angular.module('app');
    const MessageBus = function ($rootScope) {

        const events = {
            CONNECTION_UPDATE: 'CONNECTION_UPDATE',
            TWEETS_COLLECTED: 'TWEETS_COLLECTED'
        };

        const subscribe = (event, callback) => {
            console.log("Subscribing to event: " + event);
            $rootScope.$on(event, callback);
        };

        const publish = (event, data) => {
            console.log("Publishing event: " + event);
            $rootScope.$emit(event, data);
        };

        return {
            events: events,
            subscribe: subscribe,
            publish: publish
        }

    };
    MessageBus.$inject = ['$rootScope'];
    app.service("MessageBus", MessageBus)
}());