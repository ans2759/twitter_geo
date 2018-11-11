/**
 * Created by alexs on 2/11/2018.
 */
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const boundingInfo = require('../twitter/defaultTwitterParams').boundingInfo;

const url = 'mongodb://localhost:27017';

exports.url = url;
const dbName = 'test';
exports.dbName = dbName;
exports.commonWords = [];

const insertWords = function(indexedWords, foundWords) {
    return new Promise(function(resolve, reject) {
        for(const key in foundWords) {
            if(foundWords.hasOwnProperty(key)) {
                indexedWords.insertOne(foundWords[key], function (err, record) {
                    if (err !== null) {
                        reject(err);
                    }
                });
                if (foundWords[key].count > 50) {
                    console.log('word: ' + key + ' : ' + foundWords[key].count);
                    exports.commonWords.push(foundWords[key]);
                }
            }
        }
        resolve();
    });
};

exports.buildIndex = function () {
    return new Promise(function(resolve, reject) {
        // Connect to the db
        MongoClient.connect(url, function(err, client) {
            assert.equal(null, err);
            console.log("Connected correctly to server");

            const db = client.db(dbName);

            buildStopWordList(db).then(function(stopWordsList) {
                getTweets(db, stopWordsList).then(function (foundWords) {
                    dropIndex(db).then(function () {
                        insertWords(db.collection('indexedwords'), foundWords).then(function() {
                            client.close();
                            resolve();
                        });
                    })
                })
            })
        });
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
        testtweets.find().each(function (err, tweet) {
            if (err !== null) {
                reject(err);
            } else {
                if (tweet !== null) {
                    tweet.text.split(' ').forEach(function (word, index) {
                        word = word.trim().replace(/[^a-z0-9]/gi, '').toLowerCase();
                        if (word !== '') {
                            if (stopWordsList.indexOf(word) === -1) {
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
                    resolve(foundWords);
                }
            }
        });
    });
};

const buildStopWordList = function (db) {
    return new Promise(function (resolve, reject) {
        let stopWords = [];
        const stopwords = db.collection('stopwords');
        stopwords.find().each(function (err, word) {
            if (err !== null) {
                reject(err);
            } else {
                if (word !== null) {
                    stopWords.push(word.word);
                } else {
                    resolve(stopWords);
                }
            }
        });
    })
};

exports.getTweets = function(word) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url).then(function(client) {
            const db = client.db(dbName);
            db.collection('indexedwords').findOne({word: word}, function(err, tweetIds) {
                if (err !== null) {
                    client.close();
                    reject(err);
                } else {
                    db.collection('testtweets').find({
                        _id: {
                            $in: tweetIds.tweets
                        }
                    }).toArray(function (err, data) {
                        if (err !== null) {
                            client.close();
                            reject(err)
                        } else {
                            client.close();
                            resolve(data);
                        }
                    })
                }
            });
        });
    })
};

exports.getUser = function(userId) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url).then(function(client) {
            const db = client.db(dbName);
            db.collection('users').findOne({userId: userId}, function(err, user) {
                client.close();
                if (err !== null) {
                    reject(err);
                } else {
                    resolve(user);
                }
            });
        });
    });
};

exports.createUser = function(user) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url).then(function(client) {
            const db = client.db(dbName);
            db.collection('users').insertOne(buildUserObject(user), function (err, result) {
                if (err !== null) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    });
};

function buildUserObject(twitterUser) {
    return {
        userId: twitterUser.id,
        username: twitterUser.username,
        displayName: twitterUser.displayName,
        isAdmin: false
    }
}

exports.getBoundingInfo = function() {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url).then(function(client) {
            const db = client.db(dbName);
            db.collection('twitter').findOne({}, function (err, result) {
                if (err !== null) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    });
};

exports.initData = function() {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url).then(function(client) {
            const db = client.db(dbName);
            db.collection('twitter').findOne({}, function (err, result) {
                if (err !== null) {
                    reject(err);
                } else {
                    if (result === null) {
                        db.collection('twitter').insertOne(boundingInfo, function(err, result) {
                            if (err !== null) {
                                reject(err);
                            } else {
                                console.log("Default bounding info inserted")
                                resolve();
                            }
                        })
                    } else {
                        resolve();
                    }
                }
            })
        });
    });
};

