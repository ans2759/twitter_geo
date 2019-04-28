/**
 * Created by alexs on 2/18/2018.
 */

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
    let lowerLeft = '';
    let upperRight = '';

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

                        db.collection('twitter').findOne({}, function (err, result) {
                            lowerLeft = result.lowerLeft.lng + ',' + result.lowerLeft.lat;
                            upperRight = result.upperRight.lng + ',' + result.upperRight.lat;

                            twitterClient.stream('statuses/filter', {locations: lowerLeft + ',' + upperRight}, function(stream) {
                                resolve();
                                connected = true;
                                counter = 0;
                                streamReference = stream;

                                stream.on('data', function (tweet) {
                                    tweet.timestamp_ms = parseInt(tweet.timestamp_ms);
                                    collection.insertOne(tweet, function (err, r) {
                                        assert.equal(null, err);
                                        counter++;
                                    });
                                });

                                stream.on('error', function (err) {
                                    console.log(' Twitter ERROR-----------: ' + err);
                                    connected = false;
                                    client.close();
                                    resolve();
                                });
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
        },
        lowerLeft: lowerLeft,
        upperRight: upperRight
    }
})();
exports.TweetCatcher = TweetCatcher;

exports.getCenter = function () {
    function resolveCenter(tcLowerLeft, tcUpperRight, resolve) {
        const lower = tcLowerLeft.split(',');
        const upper = tcUpperRight.split(',');
        resolve({
            lat: calcMiddle(parseFloat(upper[1]), parseFloat(lower[1])),
            lng: calcMiddle(parseFloat(upper[0]), parseFloat(lower[0]))
        });
    }

    return new Promise(function(resolve, reject) {
        let tcLowerLeft = TweetCatcher.lowerLeft;
        let tcUpperRight = TweetCatcher.upperRight;
        if (!tcLowerLeft || tcLowerLeft === '' || !tcUpperRight || tcUpperRight === '') {
            MongoClient.connect('mongodb://localhost:27017/test', function (err, client) {
                const db = client.db('test');
                const collection = db.collection('testtweets');

                db.collection('twitter').findOne({}, function (err, result) {
                    tcLowerLeft = result.lowerLeft.lng + ',' + result.lowerLeft.lat;
                    tcUpperRight = result.upperRight.lng + ',' + result.upperRight.lat;
                    resolveCenter(tcLowerLeft, tcUpperRight, resolve);
                });
            });
        } else {
            resolveCenter(tcLowerLeft, tcUpperRight, resolve);
        }
    })
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