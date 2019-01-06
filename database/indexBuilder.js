const MongoDb = require('mongodb');
const MongoClient = MongoDb.MongoClient;
const assert = require('assert');
const DB = require('./db');

const url = DB.url;
const DB_NAME = DB.dbName;
const ALPHA_REGEX = new RegExp("[a-zA-Z]+");

const buildIndex = function () {
    process.send("Building Index");
    return new Promise(function(resolve, reject) {
        // Connect to the db
        MongoClient.connect(url, function(err, client) {
            if (null !== err) {
                reject("Error connecting to DB", err)
            }
            process.send("Connected correctly to server");

            const db = client.db(DB_NAME);

            buildStopWordList(db).then(function(stopWordsList) {
                getTweets(db, stopWordsList).then(function (foundWords) {
                    dropIndex(db).then(function () {
                        insertWords(db.collection('indexedwords'), foundWords).then(function() {
                            client.close();
                            process.send("Completed Index Building");
                            setTimeout(() => {
                                buildIndex();
                            }, 60000);
                            resolve();
                        });
                    })
                })
            })
        });
    });
};

const insertWords = function(indexedWords, foundWords) {
    return new Promise(function(resolve, reject) {

        let wordsToInsert = [];
        for(const key in foundWords) {
            if(foundWords.hasOwnProperty(key)) {
                wordsToInsert.push(foundWords[key]);
            }
        }
        if (wordsToInsert && wordsToInsert.length > 0) {
            indexedWords.insertMany(wordsToInsert).then(() => {
                resolve();
            });
        } else {
            process.send("No words to insert");
            resolve();
        }
    });
};

const dropIndex = function(db) {
    return new Promise(function (resolve, reject) {
        doesIndexExist(db).then(function (indexedWordsExists) {
            if (indexedWordsExists) {
                db.collection('indexedwords').drop(function (err, delOK) {
                    if (err !== null) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
    })
};

const doesIndexExist = function (db) {
    return new Promise(function(resolve, reject) {
        let indexedWordsExists = false;
        db.listCollections().toArray(function(err, collections) {
            if (err !== null) {
                reject(err);
            } else {
                collections.forEach(function(col, index) {
                    if (col.name === 'indexedwords') indexedWordsExists = true;
                });
                resolve(indexedWordsExists);
            }
        });
    })
};

const getTweets = function (db, stopWordsList) {
    return new Promise(function(resolve, reject) {
        const testtweets = db.collection('testtweets');
        let foundWords = {};
        let date = new Date();
        date.setDate(date.getDate() - 7);
        testtweets.find({timestamp_ms: {$gt: date.getTime()}}).each(function (err, tweet) {
            if (err !== null) {
                reject(err);
            } else {
                if (tweet !== null) {
                    tweet.text.split(' ').forEach(function (word, index) {
                        word = word.trim().replace(/[^a-z0-9]/gi, '').toLowerCase();
                        if (word !== '') {
                            if (stopWordsList.indexOf(word) === -1 && ALPHA_REGEX.test(word)) {
                                if (foundWords[word]) {
                                    foundWords[word].count++;
                                    if (foundWords[word].tweets.indexOf(tweet._id) === -1) {
                                        foundWords[word].tweets.push(tweet._id);
                                    }
                                } else {
                                    foundWords[word] = {
                                        word: word,
                                        count: 1,
                                        tweets: [tweet._id]
                                    };
                                }
                            }
                        }
                    });
                } else {
                    process.send("Indexed " + Object.keys(foundWords).length + " words");
                    resolve(foundWords);
                }
            }
        });
    });
};

const buildStopWordList = function (db) {
    process.send("Building Stopwords");
    return new Promise(function (resolve, reject) {
        const stopwords = db.collection('stopwords');
        stopwords.find().toArray(function (err, words) {
            if (err !== null) {
                reject(err);
            } else {
                process.send("Built Stop-words list with length: " + words.length);
                resolve(words);
            }
        });
    })
};

process.on('message', (msg) => {
    process.send("Buidling Index");
    buildIndex();
});

process.stdout.on('error', function( err ) {
    if (err.code === "EPIPE") {
        process.exit(0);
    }
});