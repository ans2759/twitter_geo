/**
 * Created by alexs on 2/18/2018.
 */
const lowerLeft = '-74.042,40.687';
const upperRight = '-73.878,40.859';
const lonLat = lowerLeft + ',' + upperRight;

const APIKeys = require('../secure/twitterAccess');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const Twitter = require('twitter')
    , twitterClient = new Twitter({consumer_key: APIKeys.consumer_key,
    consumer_secret: APIKeys.consumer_secret,
    access_token_key: APIKeys.access_token_key,
    access_token_secret: APIKeys.access_token_secret
});

const TweetCatcher = (function() {
    let instance;
    let connected = false;
    let counter = 0;
    let globalClient;

    function init() {
        let streamReference;

        return {
            catchTweets: function() {
                new Promise((resolve, reject) => {
                    MongoClient.connect('mongodb://localhost:27017/test', function (err, client) {
                        globalClient = client;
                        assert.equal(null, err);
                        console.log('Connected to DB for tweet storage');

                        const db = client.db('test');
                        const collection = db.collection('testtweets');

                        twitterClient.stream('statuses/filter', {locations: lonLat}, function(stream) {
                            resolve();
                            connected = true;
                            streamReference = stream;

                            stream.on('data', function (tweet) {
                                if (tweet.geo !== null) {
                                    console.log('tweet received');
                                    tweet.timestamp_ms = parseInt(tweet.timestamp_ms);
                                    collection.insertOne(tweet, function (err, r) {
                                        assert.equal(null, err);
                                        console.log('tweet stored: ' + ++counter);
                                    });
                                }
                            });

                            stream.on('error', function (err) {
                                reject();
                                console.log(' Twitter ERROR-----------: ' + err);
                                connected = false;
                                client.close();
                                throw err;
                            });
                        });
                    });
                });
            },
            isConnected: function() {
                return connected;
            },
            getCount: function() {
                return counter;
            },
            close: function() {
                connected = false;
                if (globalClient) {
                    globalClient.close();
                }
                if (streamReference) {
                    streamReference.destroy();
                }
            }
        }
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    }
})();
exports.TweetCatcher = TweetCatcher;

exports.getCenter = function () {
    const lower = lowerLeft.split(',');
    const upper = upperRight.split(',');
    return {
        lat: calcMiddle(parseFloat(upper[1]), parseFloat(lower[1])),
        lng: calcMiddle(parseFloat(upper[0]), parseFloat(lower[0]))
    };
};

exports.getNewCenter = function(lowerLeftLat, lowerLeftLng, upperRightLat, upperRightLng) {
    return {
        lat: calcMiddle(parseFloat(upperRightLat), parseFloat(lowerLeftLat)),
        lng: calcMiddle(parseFloat(upperRightLng), parseFloat(lowerLeftLng))
    }
};

const calcMiddle = function(upper, lower) {
    return parseFloat((((upper - lower) / 2) + lower).toFixed(3));
};