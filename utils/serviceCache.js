/**
 * Created by alexs on 12/22/2018.
 */
const STANDARD_TTL = 60;
const CHECK_PERIOD = 120;

const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: STANDARD_TTL, checkperiod: CHECK_PERIOD } );

exports.set = (key, data, ttl) => {
    return new Promise((resolve, reject) => {
        myCache.set(key, data, (err, success) => {
            if (err || !success) {
                console.error('Error caching ' + key, err);
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
                reject()
            } else {
                resolve(value);
            }
        });
    });
};

exports.delete = (key) => {
    return new Promise(((resolve, reject) => {
        myCache.del(key, (err, count) => {
            if (err) {
                console.error("Error deleting record for key " + key, err);
                reject();
            } else {
                resolve();
            }
        })
    }))
}