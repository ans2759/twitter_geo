(function () {
    'use strict';
    const app = angular.module('app');
    const TweetCount = function (ResourceFactory, $timeout, MessageBus) {

        const _this = this;
        let timer;
        let streamConnected = false;
        let count = 0;
        const startPolling = function() {
            ResourceFactory.getTweetCount({}, function (response) {
                const newCount = response.count;
                if (count !== newCount) {
                    MessageBus.publish(MessageBus.events.TOTAL_TWEETS, {count: newCount});
                }
                count = newCount;
                timer = $timeout(startPolling, 10000);
            });
        };

        const getCount = () => {
            return count;
        };

        const cancel = function() {
            $timeout.cancel(timer);
        };

        return {
            startPolling: startPolling,
            getCount: getCount,
            cancel: cancel
        }

    };
    TweetCount.$inject = ['ResourceFactory', '$timeout', 'MessageBus'];
    app.service("TweetCount", TweetCount)
}());