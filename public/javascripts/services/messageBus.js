(function () {
    'use strict';
    const app = angular.module('app');
    const MessageBus = function ($rootScope) {

        const events = {
            CONNECTION_UPDATE: 'CONNECTION_UPDATE',
            TWEETS_COLLECTED: 'TWEETS_COLLECTED',
            TOTAL_TWEETS: 'TOTAL_TWEETS'
        };

        const subscribe = (event, callback) => {
            const msgBusEvent = events[event];
            if (!msgBusEvent) {
                log.error("No such event: " + event);
            } else {
                console.log("Subscribing to event: " + event);
                $rootScope.$on(msgBusEvent, callback);
            }
        };

        const publish = (event, data) => {
            const msgBusEvent = events[event];
            if (!msgBusEvent) {
                log.error("No such event: " + event);
            } else {
                console.log("Publishing event: " + event);
                $rootScope.$emit(msgBusEvent, data);
            }
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