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

let counter = 0;

exports.catchTweets = function() {
    MongoClient.connect('mongodb://localhost:27017/test', function(err, client) {
        assert.equal(null, err);
        console.log('Connected to DB for tweet storage');

        const db = client.db('test');
        const collection = db.collection('testtweets');

        const stream = twitterClient.stream('statuses/filter',{ locations: lonLat });

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
    return {
        lat: calcMiddle(parseFloat(upper[1]), parseFloat(lower[1])),
        lng: calcMiddle(parseFloat(upper[0]), parseFloat(lower[0]))
    };
};

const calcMiddle = function(upper, lower) {
    return parseFloat((((upper - lower) / 2) + lower).toFixed(3));
};