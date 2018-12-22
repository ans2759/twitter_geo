/**
 * Created by alexs on 12/22/2018.
 */
const STANDARD_TTL = 60;
const CHECK_PERIOD = 120;

const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: STANDARD_TTL, checkperiod: CHECK_PERIOD } );

exports.set = (key, data, ttl) => {
    return new Promise((resolve, reject) => {
        const ttlValue = ttl ? ttl : STANDARD_TTL;
        myCache.set(key, data, (err, success) => {
            if (err || !success) {
                console.error('Error caching ' + key, err)
                reject();
            } else {
                console.log(key + " cached");
                resolve();
            }
        });
    });
};

exports.get = (key) => {
    return new Promise((resolve, reject) => {
        myCache.get(key, (err, value) => {
            if (err) {
                console.error("Error retrieving " + key + " from cache", err);
                resolve();
            } else {
                resolve(value);
            }
        });
    });
};