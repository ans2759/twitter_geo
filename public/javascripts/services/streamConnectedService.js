(function () {
    'use strict';
    const app = angular.module('app');
    const StreamConnected = function (ResourceFactory, $timeout, MessageBus) {

        const _this = this;
        let timer;
        let streamConnected = false;
        let count = 0;
        const startPolling = function() {
            ResourceFactory.streamConnected({}, function (response) {
                if (streamConnected !== response.connected) {
                    streamConnected = response.connected;
                    MessageBus.publish(MessageBus.events.CONNECTION_UPDATE, {connected: streamConnected});
                }
                count = response.count;
                MessageBus.publish(MessageBus.events.TWEETS_COLLECTED, {tweets: count});
                timer = $timeout(startPolling, 10000);
            });
        };

        const isStreamConnected = () => {
            return streamConnected;
        };

        const getCount = () => {
            return count;
        };

        const cancel = function() {
            $timeout.cancel(timer);
        };

        return {
            startPolling: startPolling,
            isStreamConnected: isStreamConnected,
            getCount: getCount,
            cancel: cancel
        }

    };
    StreamConnected.$inject = ['ResourceFactory', '$timeout', 'MessageBus'];
    app.service("StreamConnected", StreamConnected)
}());