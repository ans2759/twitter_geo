const yelpAccess = require('../secure/yelpAccess');
const yelp = require('yelp-fusion');
const client = yelp.client(yelpAccess.api_key, {socketTimeout: 5000});
const myCache = require('../utils/serviceCache');
const SECONDS_IN_A_DAY = 86400;

const YELP_BUSINESS_PREFIX = "YELP_BUSINESS_";
const NUMERIC = /[^0-9-]+/g;

exports.search = (term, latitude, longitude) => {
    const termExists = term !== null && term !== '';

    function getBody() {
        return termExists ?
            {
                term: term,
                latitude: latitude,
                longitude: longitude
            } :
            {
                latitude: latitude,
                longitude: longitude,
                radius: 500
            };
    }

    const getKey = function() {
        return termExists ?
            YELP_BUSINESS_PREFIX + term :
            YELP_BUSINESS_PREFIX + latitude.toString().replace(NUMERIC, '') + "_" + longitude.toString().replace(NUMERIC, '');
    };

    return new Promise((function (resolve, reject) {
        myCache.get(getKey()).then((result) => {
           if (result) {
               resolve(result);
           } else {
               client.search(getBody()).then(response => {
                   console.log('Received response from yelp');
                   if (response.statusCode === 200) {
                        myCache.set(getKey(), response.jsonBody.businesses, SECONDS_IN_A_DAY);
                       resolve(response.jsonBody.businesses);
                   } else {
                       console.log("Response status code " + response.statusCode + " returned from yelp");
                       reject("Error searching yelp");
                   }
               }).catch(e => {
                   console.error(e);
                   reject("Error searching yelp");
               });
           }
        });
    }));
};