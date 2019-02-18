const yelpAccess = require('../secure/yelpAccess');
const yelp = require('yelp-fusion');
const client = yelp.client(yelpAccess.api_key, {socketTimeout: 5000});
const myCache = require('../utils/serviceCache');
const SECONDS_IN_A_DAY = 86400;

const YELP_BUSINESS_PREFIX = "YELP_BUSINESS_";

exports.search = (term, latitude, longitude) => {
    return new Promise(((resolve, reject) => {
        myCache.get(YELP_BUSINESS_PREFIX + term).then((result) => {
           if (result) {
               resolve(result);
           } else {
               client.search({
                   term: term,
                   latitude: latitude,
                   longitude: longitude
               }).then(response => {
                   console.log('Received response from yelp');
                   if (response.statusCode === 200) {
                        myCache.set(YELP_BUSINESS_PREFIX + term, response.jsonBody.businesses, SECONDS_IN_A_DAY);
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