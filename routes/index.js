const express = require('express');
const router = express.Router();
const db = require('../database/db');
const tweetCatcher = require('../twitter/tweetCatcher');
const passport = require('passport');
const cel = require('connect-ensure-login');

router.get('/', function (req, res, next) {

    if (req.user) {
        console.log('Redirecting to home page');
        res.redirect('/home')
    } else {
        res.redirect('/login');
    }
});

router.get('/login', function(req, res){
    res.sendFile('login.html', {root: './public/views'});
});

router.get('/login/twitter', passport.authenticate('twitter'));

router.get('/home', cel.ensureLoggedIn(), function (req, res, next) {

    console.log('Sending home page');
    res.sendFile('index.html', {root: './public/views'})
});

router.get('/common-words', cel.ensureLoggedIn(), function (req, res, next) {

    console.log('Sending common words');
    res.json(db.commonWords)
});

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

router.get('/coordinates', cel.ensureLoggedIn(), function(req, res, next) {
    res.json(tweetCatcher.getCenter());
});

router.get('/login/twitter/return',
    passport.authenticate('twitter', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    }
);

module.exports = router;
