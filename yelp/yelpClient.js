const yelpAccess = require('../secure/yelpAccess');
const yelp = require('yelp-fusion');
const client = yelp.client(yelpAccess.api_key, {socketTimeout: 5000});

exports.search = (term, latitude, longitude) => {
    return new Promise(((resolve, reject) => {
        client.search({
            term: term,
            latitude: latitude,
            longitude: longitude
        }).then(response => {
            console.log('Received response from yelp');
            if (response.statusCode === 200) {
                resolve(response.jsonBody);
            } else {
                console.log("Response status code " + response.statusCode + " returned from yelp");
                reject("Error searching yelp");
            }
        }).catch(e => {
            console.error(e);
            reject("Error searching yelp");
        });
    }));
};