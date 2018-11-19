/**
 * Created by alexs on 2/11/2018.
 */
const MongoDb = require('mongodb');
const MongoClient = MongoDb.MongoClient;
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
                        closeAndResolve(resolve, reject, client, err, data);
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
                closeAndResolve(resolve, reject, client, err, user);
            });
        });
    });
};

exports.isAdmin = function(userId) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url).then(function(client) {
            const db = client.db(dbName);
            db.collection('users').findOne({userId: userId}, function(err, user) {
                closeAndResolve(resolve, reject, client, err, user.isAdmin);
            });
        });
    });
};

exports.getUsers = function(searchTerm) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url).then(function(client) {
            const db = client.db(dbName);
            db.collection('users').find({}).toArray(function(err, users) {
                closeAndResolve(resolve, reject, client, err, users);
            });
        });
    });
};

exports.createUser = function(user) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url).then(function(client) {
            const db = client.db(dbName);
            db.collection('users').insertOne(buildUserObject(user), function (err, result) {
                closeAndResolve(resolve, reject, client, err, result);
            })
        });
    });
};

exports.deleteUser = function(id) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url).then(function(client) {
            const db = client.db(dbName);
            db.collection('users').deleteOne({_id: MongoDb.ObjectId(id)}, function (err, result) {
                closeAndResolve(resolve, reject, client, err, result);
            })
        });
    });
};

exports.changeAdminStatus = function(id, isAdmin) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url).then(function(client) {
            const db = client.db(dbName);
            db.collection('users').updateOne({_id: MongoDb.ObjectId(id)}, {$set: {isAdmin: isAdmin}}, function (err, result) {
                closeAndResolve(resolve, reject, client, err, result);
            })
        });
    });
};

exports.getBoundingInfo = function() {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url).then(function(client) {
            const db = client.db(dbName);
            db.collection('twitter').findOne({}, function (err, result) {
                closeAndResolve(resolve, reject, client, err, result);
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
                    client.close();
                    reject(err);
                } else {
                    if (result === null) {
                        db.collection('twitter').insertOne(boundingInfo, function(err, result) {
                            client.close();
                            if (err !== null) {
                                reject(err);
                            } else {
                                console.log("Default bounding info inserted");
                                resolve();
                            }
                        });
                    } else {
                        client.close();
                        resolve();
                    }
                }
            })
        });
    });
};

exports.updateBoundingInfo = function(boundingInfo) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url).then(function(client) {
            const db = client.db(dbName);
            db.collection('twitter').updateOne({}, {
                $set: {
                    lowerLeft: {lat: boundingInfo.lowerLeft.lat, lng: boundingInfo.lowerLeft.lng},
                    upperRight: {lat: boundingInfo.upperRight.lat, lng: boundingInfo.upperRight.lng}
                }
            }, function(err, result) {
                closeAndResolve(resolve, reject, client, err, result);
            });
        });
    });
};

exports.createIndexes = function() {
    MongoClient.connect(url).then(function(client) {
        const db = client.db(dbName);
        db.collection('users').createIndex({userId: 1});
        db.collection('users').createIndex({username: 1});
        db.collection('users').createIndex({displayName: 1});
        client.close();
    });
};

function closeAndResolve(resolve, reject, client, err, data) {
    client.close();
    if (err !== null) {
        console.error("Error encountered", err);
        reject(err);
    } else {
        resolve(data);
    }
}

function buildUserObject(twitterUser) {
    return {
        userId: twitterUser.id,
        username: twitterUser.username,
        displayName: twitterUser.displayName,
        isAdmin: false
    }
}

