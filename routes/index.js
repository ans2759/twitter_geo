const express = require('express');
const router = express.Router();
const db = require('../database/db');
const assert = require('assert');

router.get('/', function (req, res, next) {

    console.log('Redirecting to home page');
    res.redirect('/home')
});

router.get('/home', function (req, res, next) {

    console.log('Sending home page');
    res.sendFile('index.html', {root: './public/views'})
});

router.get('/common-words', function (req, res, next) {

    console.log('Sending common words');
    res.json(db.commonWords)
});

router.get('/word',  function (req, res, next) {
    const word = req.query.word;
    console.log('Getting tweets for ' + word);
    if (word != null && word != '') {
        db.getTweets(word).then(function(tweets) {
            res.json(tweets);
        });
    } else {
        console.error("No word provided");
        res.statusMessage = "No word provided to search for";
        res.status(400).end();
    }
});

router.get('/coordinates', function(req, res, next) {
    res.json({lat: 40.687, lng: -74.042})
});

module.exports = router;
