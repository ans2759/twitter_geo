const express = require('express');
const router = express.Router();
const db = require('../database/db');
const tweetCatcher = require('../twitter/tweetCatcher');
const passport = require('passport');
const cel = require('connect-ensure-login');
const latLngRegex = new RegExp("^-?[0-9]{1,3}\\.[0-9]{1,3}$");
const stopWords = require('../twitter/stopWords');


/**
 * *****************************Home Routes
 */
router.get('/', function (req, res, next) {
    if (req.user) {
        console.log('Redirecting to home page');
        res.redirect('/home')
    } else {
        res.redirect('/login');
    }
});

router.get('/home', cel.ensureLoggedIn(), function (req, res, next) {
    console.log('Sending home page');
    res.sendFile('index.html', {root: './public/views'})
});
/**
 * *****************************End Home Routes
 */

/**
 * *****************************Login Routes
 */
router.get('/login', function(req, res){
    res.sendFile('login.html', {root: './public/views'});
});

router.get('/login/twitter', passport.authenticate('twitter'));

router.get('/login/twitter/return',
    passport.authenticate('twitter', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    }
);
/**
 * *****************************End Login Routes
 */

/**
 * *****************************User Routes
 */
router.get('/getUser', cel.ensureLoggedIn(), function (req, res, next) {
    console.log('Getting User profile');
    db.getUser(req.user.id).then(function (user) {
        res.json({user: user});
    });
});

router.get('/getTwitterUser', cel.ensureLoggedIn(), function (req, res, next) {
    console.log('Getting User Twitter profile');
    res.json(req.user);
});

router.get('/isAdmin', cel.ensureLoggedIn(), function (req, res, next) {
    console.log("isAdmin");
    db.getUser(req.user.id).then(function (user) {
        res.json({isAdmin: user.isAdmin});
    });
});

router.post('/createUser', cel.ensureLoggedIn(), function (req, res, next) {
   if (req.user) {
       console.log('Creating user ' + req.user.displayName);
       db.createUser(req.user).then(function(result) {
            console.log(result);
            res.status(200).end();
       })
   } else {
       res.statusMessage('No twitter user record found');
       res.status(400).end();
   }
});
/**
 * *****************************End User Routes
 */

/**
 * *****************************Word Routes
 */
router.get('/word', cel.ensureLoggedIn(),  function (req, res, next) {
    const word = req.query.word;
    console.log('Getting tweets for ' + word);
    if (word != null && word !== '') {
        db.getTweets(word).then(function(tweets) {
            res.json(tweets);
        });
    } else {
        console.error("No word provided");
        res.statusMessage = "No word provided to search for";
        res.status(400).end();
    }
});

router.get('/common-words', cel.ensureLoggedIn(), function (req, res, next) {
    console.log('Sending common words');
    db.getIndex().then(function (words) {
        res.json(words);
    })
});
/**
 * *****************************End Word Routes
 */

/**
 * *****************************Admin Routes
 */
router.get('/getBoundingInfo', cel.ensureLoggedIn(), function (req, res, next) {
    console.log('Retrieving bounding box info');
    db.getBoundingInfo().then(function(data) {
        res.json(data);
    })
});

router.get('/getcenter', cel.ensureLoggedIn(), function (req, res, next) {
    console.log('Calculating new center');
    res.json(tweetCatcher.getNewCenter(req.query.lowerLeftLat, req.query.lowerLeftLng,
        req.query.upperRightLat, req.query.upperRightLng));
});

router.get('/getUsers', cel.ensureLoggedIn(), isAdmin(), function (req, res, next) {
    console.log("Getting users");
    db.getUsers(req.query.user).then(function(users) {
        res.json(users);
    });
});

router.delete('/deleteUser', cel.ensureLoggedIn(), isAdmin(), function(req, res, next) {
    console.log("Deleting User");
    db.deleteUser(req.query.id).then(function(data) {
        if (data.deletedCount > 0) {
            res.status(200).send("Successfully deleted");
        } else {
            res.status(500).send("Error deleting user");
        }
    });
});

router.put('/changeAdminStatus', cel.ensureLoggedIn(), isAdmin(), function(req, res, next) {
    console.log("Changing admin status to : " + req.query.isAdmin);
    db.changeAdminStatus(req.body.id, req.body.isAdmin).then(function(data) {
        if (data.modifiedCount > 0) {
            res.status(200).send("Successfully updated");
        } else {
            res.status(500).send("Error changing status of user");
        }
    });
});

router.put('/updateCorners', cel.ensureLoggedIn(), isAdmin(), function(req, res, next) {
    console.log('Updating bounding info');
    if (isValidLatitude(req.body.boundingInfo.lowerLeft.lat) && isValidLatitude(req.body.boundingInfo.upperRight.lat) &&
        isValidLongitude(req.body.boundingInfo.lowerLeft.lng) && isValidLongitude(req.body.boundingInfo.upperRight.lng)) {
        db.updateBoundingInfo(req.body.boundingInfo).then(function (data) {
            if (data.modifiedCount > 0) {
                res.status(200).send("Successfully updated");
            } else {
                res.status(500).send("bounding info not modified");
            }
        })
    } else {
        res.status(400).send("Invalid bounding info");
    }
});

router.get('/streamConnected', cel.ensureLoggedIn(), isAdmin(), function(req, res, next) {
    console.log('Is Stream connected?');
    const TweetCatcher = tweetCatcher.TweetCatcher.getInstance();
    res.json({
        connected: TweetCatcher.isConnected(),
        count: TweetCatcher.getCount()
    })
});

router.put('/connectStream', cel.ensureLoggedIn(), isAdmin(), function(req, res, next) {
    console.log('Connecting Stream');
    if(tweetCatcher.TweetCatcher.getInstance().isConnected()) {
        res.status(400).send("Stream already connected");
    } else {
        try {
            tweetCatcher.TweetCatcher.getInstance().catchTweets();
            res.status(200).send("Starting connection")
        } catch(err) {
            console.error("Error starting twitter stream", err);
        }
    }
});

router.put('/closeStream', cel.ensureLoggedIn(), isAdmin(), function(req, res, next) {
    console.log("Closing stream");
    if(!tweetCatcher.TweetCatcher.getInstance().isConnected()) {
        res.status(400).send("Stream not connected");
    } else {
        try {
            tweetCatcher.TweetCatcher.getInstance().close();
        } catch(err) {
            console.error("Error closing twitter stream", err);
        }
        res.status(200).send("Closing connection")
    }
});

router.post('/uploadStopWords', cel.ensureLoggedIn(), isAdmin(), (req, res, next) => {
    if (Object.keys(req.files).length === 0) {
        res.status(400).send({data: 'No files were uploaded.'});
    } else if (req.files.file.mimetype !== "text/plain") {
        res.status(400).send({data: "Invalid file type"});
    } else {
        const stopWordsFile = req.files.file;

        // Use the mv() method to place the file somewhere on your server
        stopWordsFile.mv('./resources/stop-words.txt').then(function(err) {
            if (err) {
                res.status(500).send({data: err});
            } else {
                stopWords.load().then((err) => {
                    if (err) {
                        res.status(500).send({data: err});
                    }
                    res.status(200).send('File uploaded!');
                });
            }
        });
    }
});

router.post('/archiveTweets', cel.ensureLoggedIn(), isAdmin(), (req, res, next) => {
    db.archiveData().then(() => {
        res.status(200).send("Tweets Archived!");
    }, (err) => {
        console.error(err);
        res.status(500).send({data:err})
    });
});

router.get('/getTweetCount', cel.ensureLoggedIn(), isAdmin(), (req, res, next) => {
    db.getTweetCount().then((count) => {
        res.status(200).send({count: count});
    }, (error) => {
        res.status(500).send({data: error});
    })
});
/**
 * *****************************End Admin Routes
 */

/**
 * *****************************Common Routes
 */
router.get('/coordinates', cel.ensureLoggedIn(), function(req, res, next) {
    res.json(tweetCatcher.getCenter());
});
/**
 * *****************************End Common Routes
 */

/**
 * *****************************Utility functions
 */
function isAdmin() {
    return function(req, res, next) {
        db.isAdmin(req.user.id).then(function(isAdmin) {
            if (isAdmin) {
                next();
            } else {
                res.status(400).send("Unauthorized");
            }
        });
    }
}

function isValidLatitude(val) {
    return  val !== null && val !== '' && latLngRegex.test(val) && parseFloat(val) <= 90;
}

function isValidLongitude(val) {
    return val !== null && val !== '' && latLngRegex.test(val) && parseFloat(val) <= 180;
}
/**
 * *****************************End Utility functions
 */

module.exports = router;
