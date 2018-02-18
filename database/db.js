/**
 * Created by alexs on 2/11/2018.
 */
// Retrieve
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
exports.url = url;
const dbName = 'test';
exports.dbName = dbName;

exports.connect = function () {
// Connect to the db
    MongoClient.connect(url, function(err, client) {
        assert.equal(null, err);
        console.log("Connected correctly to server");

        const db = client.db(dbName);

        exports.testtweets = db.collection('testtweets');
        exports.stopwords = db.collection('stopwords');

        // client.close();
    });
};

exports.testtweets = null;

