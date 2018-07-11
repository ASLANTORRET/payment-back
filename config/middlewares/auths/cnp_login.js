'use strict';
const UserHelper = require('../../../app/helpers/user_helper');
const cnpService = require('../../../app/services/cnp_service');

module.exports.cnpRegistered = function(req, res, next) {
    let curr_user = req.curr_user;
    if (appLodash.isEmpty(curr_user.cnp_userid) || curr_user.cnp_userid === "0") {
        let not_passed_header = false;
        cnpService.accounts(curr_user.login)
        .then(response => {
            if (response.status === "success") {// user exists
                UserHelper.updateUser(
                    { login: curr_user.login },
                    { cnp_userid: response.body.account.userId }
                );
                return next();
            }
            else if (response.status === "error" && response.code === 1) { // user does not exists
                not_passed_header = true;
                return cnpService.auth(curr_user.login)
            } else { // some error on getting user
                return res.json(response);
            }
        })
        .then((cnp_token) => {
            if (not_passed_header) {
                curr_user.cnp_token = cnp_token;
                return res.json({ status: "error", error: 'no cnp' });
            }
        })
        .catch(error => {
            if (not_passed_header) {
                if (error) loggerHelper.error(error);
                return res.json({ status: "error", error: mainHelper.getLocaleLangKey(req.body.language, 'couldnt_send_request') });
            }
        });
    } else return next();
};

module.exports.cnpToken = function(req, res, next) {
    let curr_user = req.curr_user;
    if (appLodash.isEmpty(curr_user.cnp_token)) {
        let not_passed_header = false;
        cnpService.auth(curr_user.login)
        .then((cnp_token) => {
            curr_user.cnp_token = cnp_token;
            return res.json({ status: "error", error: 'no cnp' });
        })
        .catch(error => {
            if (not_passed_header) {
                if (error) loggerHelper.error(error);
                return res.json({ status: "error", error: mainHelper.getLocaleLangKey(req.body.language, 'couldnt_send_request') });
            }
        });
    } else return next();
};
