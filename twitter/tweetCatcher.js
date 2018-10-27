/**
 * Created by alexs on 2/18/2018.
 */
const lowerLeft = '-74.042,40.687';
const upperRight = '-73.878,40.859';
const lonLat = lowerLeft + ',' + upperRight;

var APIKeys = require('../secure/twitterAccess');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

var Twitter = require('twitter')
    , twitterClient = new Twitter({consumer_key: APIKeys.consumer_key,
    consumer_secret: APIKeys.consumer_secret,
    access_token_key: APIKeys.access_token_key,
    access_token_secret: APIKeys.access_token_secret
});

var counter = 0;

exports.catchTweets = function() {
    MongoClient.connect('mongodb://localhost:27017/test', function(err, client) {
        assert.equal(null, err);
        console.log('Connected to DB for tweet storage');

        const db = client.db('test');
        const collection = db.collection('testtweets');

        var stream = twitterClient.stream('statuses/filter',{ locations: lonLat });

        stream.on('data', function (tweet) {
            if(tweet.geo !== null) {
                console.log('tweet received');
                collection.insertOne(tweet, function(err, r) {
                    assert.equal(null, err);
                    console.log('tweet stored: ' + ++counter);
                });
            } else {
                console.error('bad data received: ' + tweet);
            }
        });

        stream.on('error', function (err) {
            console.log(' Twitter ERROR-----------: '+err);
            client.close();
            throw err;
        });
    });
};

exports.getCenter = function () {
    const lower = lowerLeft.split(',');
    const upper = upperRight.split(',');
    const lat = lower[0] /
};