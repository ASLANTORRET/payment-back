'use strict';

module.exports.own_login = function(req, res, next) {
    if (!appLodash.isEmpty(req.curr_user) && req.curr_user_id === req.params.userId) return next();
    return res.json({
        status: 'error',
        error: mainHelper.getLocaleLangKey(req.body.language, 'not_you')
    });
};
