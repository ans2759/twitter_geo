const express = require('express');
const router = express.Router();
const db = require('../database/db');
const tweetCatcher = require('../twitter/tweetCatcher');
const passport = require('passport');
const cel = require('connect-ensure-login');


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
    res.json(db.commonWords)
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

module.exports = router;
