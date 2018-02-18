/**
 * Created by alexs on 2/18/2018.
 */
var fs = require('fs'),
    readline = require('readline');
const MongoClient = require('mongodb').MongoClient;
const dbHelper = require('../database/db');
const assert = require('assert');

exports.load = function () {
    MongoClient.connect(dbHelper.url, function(err, client) {
        assert.equal(null, err);
        console.log('Connected to DB for stopword storage');

        const db = client.db(dbHelper.dbName);
        const collection = db.collection('stopwords');

        collection.drop(function(err, delOk) {
            if (err) console.log(err);
            else console.log('Stopwords deleted');

            var rd = readline.createInterface({
                input: fs.createReadStream('./resources/stop-words.txt'),
                output: process.stdout,
                terminal: false
            });

            rd.on('line', function (line) {
                collection.insertOne({word: line}, function(err, r) {
                    assert.equal(null, err);
                });
            }).on('close', function () {
                client.close();
            });
        });
    });
};