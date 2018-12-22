/**
 * Created by alexs on 2/11/2018.
 */
const MongoDb = require('mongodb');
const MongoClient = MongoDb.MongoClient;
const boundingInfo = require('../twitter/defaultTwitterParams').boundingInfo;
const myCache = require('../utils/serviceCache');

const URL = 'mongodb://localhost:27017';
const INDEXED_WORDS = 'indexedWords';
const TWEET_CACHE_PREFIX = 'TWEET_CACHE_';
const USER_PREFIX = 'USER_';

exports.url = URL;
const DB_NAME = 'test';
exports.dbName = DB_NAME;

function getIndexFromDb(resolve, reject) {
    MongoClient.connect(URL).then(function (client) {
        const db = client.db(DB_NAME);
        db.collection('indexedwords').find({count: {$gt: 9}}).toArray(function (err, words) {
            myCache.set(INDEXED_WORDS, words);
            closeAndResolve(resolve, reject, client, err, words);
        });
    });
}

exports.getIndex = function() {
    return new Promise(function(resolve, reject) {
        myCache.get(INDEXED_WORDS).then((indexedWords) => {
            if (indexedWords) {
                resolve(indexedWords)
            } else {
                getIndexFromDb(resolve, reject);
            }
        });
    })
};

function getTweetsFromDb(word, reject, resolve) {
    MongoClient.connect(URL).then(function (client) {
        const db = client.db(DB_NAME);
        db.collection('indexedwords').findOne({word: word}, function (err, tweetIds) {
            if (err !== null) {
                client.close();
                reject(err);
            } else {
                db.collection('testtweets').find({
                    _id: {
                        $in: tweetIds.tweets
                    }
                }).toArray(function (err, data) {
                    myCache.set(TWEET_CACHE_PREFIX + word, data);
                    closeAndResolve(resolve, reject, client, err, data);
                })
            }
        });
    });
}

exports.getTweets = function(word) {
    return new Promise(function(resolve, reject) {
        myCache.get(TWEET_CACHE_PREFIX + word).then((tweets) => {
            if (tweets) {
                resolve(tweets)
            } else {
                getTweetsFromDb(word, reject, resolve);
            }
        });
    })
};

exports.getUser = function(userId) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(URL).then(function(client) {
            const db = client.db(DB_NAME);
            db.collection('users').findOne({userId: userId}, function(err, user) {
                myCache.set(USER_PREFIX + userId, user, 600);
                closeAndResolve(resolve, reject, client, err, user);
            });
        });
    });
};

exports.isAdmin = function(userId) {
    return new Promise(function (resolve, reject) {
        myCache.get(USER_PREFIX + userId).then((user) => {
            if (user) {
                resolve(user.isAdmin)
            } else {
                exports.getUser(userId).then((user) => resolve(user.isAdmin));
            }
        });
    });
};

exports.getUsers = function(searchTerm) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(URL).then(function(client) {
            const db = client.db(DB_NAME);
            db.collection('users').find({}).toArray(function(err, users) {
                closeAndResolve(resolve, reject, client, err, users);
            });
        });
    });
};

exports.createUser = function(user) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(URL).then(function(client) {
            const db = client.db(DB_NAME);
            db.collection('users').insertOne(buildUserObject(user), function (err, result) {
                closeAndResolve(resolve, reject, client, err, result);
            })
        });
    });
};

exports.deleteUser = function(id) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(URL).then(function(client) {
            const db = client.db(DB_NAME);
            db.collection('users').deleteOne({_id: MongoDb.ObjectId(id)}, function (err, result) {
                closeAndResolve(resolve, reject, client, err, result);
            })
        });
    });
};

exports.changeAdminStatus = function(id, isAdmin) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(URL).then(function(client) {
            const db = client.db(DB_NAME);
            db.collection('users').updateOne({_id: MongoDb.ObjectId(id)}, {$set: {isAdmin: isAdmin}}, function (err, result) {
                closeAndResolve(resolve, reject, client, err, result);
            })
        });
    });
};

exports.getBoundingInfo = function() {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(URL).then(function(client) {
            const db = client.db(DB_NAME);
            db.collection('twitter').findOne({}, function (err, result) {
                closeAndResolve(resolve, reject, client, err, result);
            })
        });
    });
};

exports.initData = function() {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(URL).then(function(client) {
            const db = client.db(DB_NAME);
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
        MongoClient.connect(URL).then(function(client) {
            const db = client.db(DB_NAME);
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
    MongoClient.connect(URL).then(function(client) {
        const db = client.db(DB_NAME);
        db.collection('users').createIndex({userId: 1});
        db.collection('users').createIndex({username: 1});
        db.collection('users').createIndex({displayName: 1});
        db.collection('indexedwords').createIndex({word: 1});
        db.collection('testtweets').createIndex({timestamp_ms: 1});
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

