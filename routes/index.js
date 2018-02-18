var express = require('express');
var router = express.Router();
var db = require('../database/db');
const assert = require('assert');

/* GET home page. */
router.get('/', function (req, res, next) {
    db.testtweets.find({}).toArray(function(err, docs) {
        assert.equal(null, err);
        console.log('tweets!');
        // db.client.close();
    });
    db.stopwords.find({}).toArray(function(err, docs) {
        assert.equal(null, err);
        console.log('stopwords!');
        console.log(docs);
        // db.client.close();
    });
    res.render('index', {title: 'Express'});
});

module.exports = router;
