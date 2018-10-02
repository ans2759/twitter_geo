/**
 * Created by alexs on 7/22/2018.
 */

exports.asyncMiddleware = fn =>
(req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch(next);
};