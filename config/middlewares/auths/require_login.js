'use strict';
const UserHelper = require('../../../app/helpers/user_helper');
const {
    wrap: async
} = require('co');
const no_token_message = {
    status: 'error',
    error: 'no token'
};

const getAttrs = (path) => {
    let attrs = ['id', 'login', 'api_token', 'cnp_token', 'cnp_userid', 'lastEnter', 'username', 'email', 'avatar', 'push_enable', 'push_token', 'user_type', 'regionId', 'mfs_token', 'mfs_timestamp', 'language', 'app_version']; // log_token
    // switch (path) {
    //     case '/setting/changePassword':
    //         attrs = attrs.concat([]);
    //         break;
    // }
    return attrs;
};


const requiresLoginResolve = async(function *(req) {
    try {
	loggerHelper.warn(new Date().toISOString(), ': req.url | req.body | req.query: ', req.originalUrl, '|', req.body, '|',  req.query);


        if (!appLodash.isEmpty(req.query.login) && !appLodash.isEmpty(req.headers.authorization)) {
            let user = yield UserHelper.findUser({ login: req.query.login, log_token: req.headers.authorization }, getAttrs(req.route.path));
            req.language = req.body.language || req.query.language ||  'ru';
            req.app_version = req.body.app_version || req.query.app_version ||  '1.0.0';
            if (user) {
				if (user.language !== req.language) yield UserHelper.updateUser({ login: req.query.login }, { language: req.language });
				if (user.app_version !== req.app_version) yield UserHelper.updateUser({ login: req.query.login }, { app_version: req.app_version });
                req.curr_user = user;
                req.curr_user_id = user.id;
                req.api_token = user.api_token;
                if (user.lastEnter < (Date.now() - appConfig.constraints.logTokenFullExpire)) return no_token_message;
                if (user.lastEnter < (Date.now() - appConfig.constraints.logTokenPreExpire)) UserHelper.passedAuth(req.curr_user_id);
                return -1;
            }
        }
        return no_token_message;
    } catch (err) {
        if (err) {
            loggerHelper.error({
                name: 'error_in_route',
                message: `route is: ${req.route.path} | ${err}`,
                stack: err.stack
            });
        }
        return no_token_message;
    }
});

module.exports = async(function *(req, res, next) {
    try {
        let resolve = yield requiresLoginResolve(req);
        if (resolve === -1) return next();
        else return res.json(resolve);
    } catch (err) {
        if (err) {
            loggerHelper.error({
                name: 'error_in_route',
                message: `route is: ${req.route.path} | ${err}`,
                stack: err.stack
            });
        }
        return res.json(no_token_message);
    }
});
