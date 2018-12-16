(function () {
    'use strict';
    const app = angular.module('app');
    const StreamConnected = function (ResourceFactory, $timeout, MessageBus) {

        const _this = this;
        let timer;
        let streamConnected = false;
        const startPolling = function() {
            ResourceFactory.streamConnected({}, function (response) {
                if (streamConnected !== response.connected) {
                    streamConnected = response.connected;
                    MessageBus.publish(MessageBus.events.CONNECTION_UPDATE, {connected: streamConnected});
                }
                timer = $timeout(startPolling, 3000);
            });
        };

        const isStreamConnected = () => {
            return streamConnected;
        };

        const cancel = function() {
            $timeout.cancel(timer);
        };

        return {
            startPolling: startPolling,
            isStreamConnected: isStreamConnected,
            cancel: cancel
        }

    };
    StreamConnected.$inject = ['ResourceFactory', '$timeout', 'MessageBus'];
    app.service("StreamConnected", StreamConnected)
}());