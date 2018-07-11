'use strict';

const {
    wrap: async
} = require('co');
const got = require('got');
const beeline_config = appConfig.api_services.beeline;
let host = beeline_config.host;
const FormData = require('form-data');
const UserHelper = require('../helpers/user_helper');
const mfsService = require('./mfs_service');
const only = require('only');


module.exports.returnError = function(resolve, reject, code) {
    if (code) reject(new Error(`error_code_${code}`));
    else reject(new Error('couldnt_send_request'));
    throw new Error('breaking_chain');
};

module.exports.authAuth = (function(login, password) {
    let return_user;
    let api_token;
    let tempPassInd = false;
    return new Promise((resolve, reject) => {
        let body = {
            'password': password
        };
        got.put(`${host}/auth/auth`, {
            query: {
                'login': login,
                'userType': beeline_config.userType
            },
            headers: {
                'X-API-Version': 2,
                'Client-Type': beeline_config.clientType,
                'Content-Type': beeline_config.contentType
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            loggerHelper.warn('response is: ', JSON.stringify({ response_body: response.body }).substr(0, 300));
            let body = response.body;
            tempPassInd = body.tempPassInd;
            let meta = body.meta;
            let code = 0;
            if (meta) code = meta.code;
            switch (code) {
                case 20000:
                    return body.token;
                default:
                    this.returnError(resolve, reject, code);
            }
        })
        .then(token => {
            api_token = token;
            return UserHelper.saveToken(login, token);
        })
        .then((user) => {
            if (appLodash.isEmpty(user.log_token) || user.lastEnter < (Date.now() - appConfig.constraints.logTokenFullExpire)) {
                return UserHelper.generateLocalToken(login);
            } else return user;
        })
        .then((user) => {
            return_user = user;
            return this.userType(login, return_user, api_token);
        })
        .then((user_type_obj) => {
            if (user_type_obj.status === 'success' && user_type_obj) {
                switch (user_type_obj.type) {
                    case 'B2C':
                        return;
                    case 'B2B':
                        return;
                    default:
                        reject(new Error('not_supported_user_type'));
                        throw new Error('breaking_chain');
                }
            } else {
                reject(new Error('not_supported_user_type'));
                throw new Error('breaking_chain');
            }
        })
        .then(() => {
            return this.payType(login, api_token);
        })
        .then((pay_type_obj) => {
            if (pay_type_obj.status === 'success' && pay_type_obj) {
                switch (pay_type_obj.payType) {
                    case 'PREPAID':
                        return;
                    default:
                        reject(new Error('not_supported_user_type'));
                        throw new Error('breaking_chain');
                }
            } else {
                reject(new Error('couldnt_send_request'));
                throw new Error('breaking_chain');
            }
        })
        .then(() => {
            resolve({ status: 'success', user: return_user, tempPassInd: tempPassInd });
            return mfsService.login(login, '128ascrfg');
        })
        .catch(error => {
            reject(error);
        });
    });
});

module.exports.passReset = (function(login) {
    return new Promise((resolve, reject) => {
        got.get(`${host}/auth/passReset`, {
            query: {
                'login': login,
                'channelType': beeline_config.channelType.sms,
                'userType': beeline_config.userType,
                'targetType': beeline_config.targetType
            },
            headers: {
                'X-API-Version': 1,
                'Impersonation-Context': beeline_config.impersonationContext,
                'Client-Type': beeline_config.clientType,
                'Content-Type': beeline_config.contentType
            },
            json: true
        })
        .then(response => {
	    loggerHelper.warn('response is: ', JSON.stringify({ response_body: response.body }).substr(0, 300));
            let body = response.body;
            let meta = body.meta;
            let code = 0;
            if (meta) code = meta.code;
            switch (code) {
                case 20000:
                    resolve({ status: 'success' });
                    break;
                default:
                    this.returnError(resolve, reject, code);
            }
        })
        .catch(error => {
            reject(error);
        });
    });
});

module.exports.changePassword = (function(login, token, oldPassword, newPassword) {
    return new Promise((resolve, reject) => {
        got.put(`${host}/setting/changePassword`, {
            query: {
                'login': login,
                'initiatorName': beeline_config.initiatorName,
                'oldPassword': oldPassword,
                'newPassword': newPassword,
                'userType': beeline_config.userType
            },
            headers: {
                'Usss-Language': beeline_config.usssLanguage,
                'Impersonation-Context': beeline_config.impersonationContext,
                'Cookie': `token=${token}`,
                'Client-Type': beeline_config.clientType,
                'Content-Type': beeline_config.contentType
            },
            json: true
        })
        .then(response => {
	    loggerHelper.warn('response is: ', JSON.stringify({ response_body: response.body }).substr(0, 300));
            let body = response.body;
            let meta = body.meta;
            let code = 0;
            if (meta) code = meta.code;
            switch (code) {
                case 20000:
                    resolve({ status: 'success' });
                    break;
                default:
                    this.returnError(resolve, reject, code);
            }
        })
        .catch(error => {
            reject(error);
        });
    });
});


module.exports.verifyOneTimeToken = (function(login, token, oneTimeToken) {
    return new Promise((resolve, reject) => {
        got.get(`${host}/auth/verifyOneTimeToken`, {
            query: {
                'login': login,
                // 'hash': '',
                'client': beeline_config.client,
                'oneTimeToken': oneTimeToken
            },
            headers: {
                'X-API-Version': 1,
                'Cookie': `token=${token}`,
                'Content-Type': beeline_config.contentType
            },
            json: true
        })
        .then(response => {
	    loggerHelper.warn('response is: ', JSON.stringify({ response_body: response.body }).substr(0, 300));
            let body = response.body;
            let meta = body.meta;
            let code = 0;
            if (meta) code = meta.code;
            switch (code) {
                case 20000:
                    resolve({ status: 'success', valid: body.valid });
                    break;
                default:
                    this.returnError(resolve, reject, code);
            }
        })
        .catch(error => {
            reject(error);
        });
    });
});


module.exports.generateOneTimeToken = (function(login, token) {
    return new Promise((resolve, reject) => {
        got.get(`${host}/auth/generateOneTimeToken`, {
            query: {
                'login': login,
                'client': beeline_config.client
            },
            headers: {
                'X-API-Version': 1,
                'Cookie': `token=${token}`,
                'Content-Type': beeline_config.contentType
            },
            json: true
        })
        .then(response => {
	    loggerHelper.warn('response is: ', JSON.stringify({ response_body: response.body }).substr(0, 300));
            let body = response.body;
            let meta = body.meta;
            let code = 0;
            if (meta) code = meta.code;
            switch (code) {
                case 20000:
                    resolve({ status: 'success', token: body.token });
                    break;
                default:
                    this.returnError(resolve, reject, code);
            }
        })
        .catch(error => {
            reject(error);
        });
    });
});


module.exports.userType = (function(login, curr_user, token) {
    return new Promise((resolve, reject) => {
        let user_type = curr_user.user_type;
        if (!appLodash.isEmpty(user_type)) return resolve({ status: 'success', type: user_type });

        got.get(`${host}/info/userType`, {
            query: {
                'login': login,
                'client': beeline_config.client
            },
            headers: {
                'Cookie': `token=${token}`,
                'Content-Type': beeline_config.contentType
            },
            json: true
        })
        .then(response => {
	    loggerHelper.warn('response is: ', JSON.stringify({ response_body: response.body }).substr(0, 300));
            let body = response.body;
            let meta = body.meta;
            let code = 0;
            if (meta) code = meta.code;
            switch (code) {
                case 20000:
                    // resolve({ status: 'success', type: body.type });
                    return body.type;
                default:
                    this.returnError(resolve, reject, code);
            }
        })
        .then(type => {
            user_type = type;
            UserHelper.updateUser(
                { login: login },
                { user_type: user_type }
            );
        })
        .then(() => {
            resolve({ status: 'success', type: user_type });
        })
        .catch(error => {
            reject(error);
        });
    });
});

module.exports.prepaidBalance = (function(login, token) {
    return new Promise((resolve, reject) => {
        got.get(`${host}/info/prepaidBalance`, {
            query: {
                'ctn': login,
                'client': beeline_config.client
            },
            headers: {
                'Cookie': `token=${token}`,
                'Content-Type': beeline_config.contentType
            },
            json: true
        })
        .then(response => {
	    loggerHelper.warn('response is: ', JSON.stringify({ response_body: response.body }).substr(0, 300));
            let body = response.body;
            let meta = body.meta;
            let code = 0;
            if (meta) code = meta.code;
            switch (code) {
                case 20000:
                    body.balance = parseFloat(body.balance).toFixed(2);
                    resolve({ status: 'success', balance: body.balance, currency: body.currency, debtExists: body.debtExists, unifiedBillingDay: body.unifiedBillingDay, nextBillingDate: body.nextBillingDate });
                    break;
                default:
                    this.returnError(resolve, reject, code);
            }
        })
        .catch(error => {
            reject(error);
        });
    });
});

module.exports.postpaidBalance = (function(login, token) {
    return new Promise((resolve, reject) => {
        got.get(`${host}/info/postpaidBalance`, {
            query: {
                'ctn': login,
                'client': beeline_config.client
            },
            headers: {
                'Cookie': `token=${token}`,
                'Content-Type': beeline_config.contentType
            },
            json: true
        })
        .then(response => {
	    loggerHelper.warn('response is: ', JSON.stringify({ response_body: response.body }).substr(0, 300));
            let body = response.body;
            let meta = body.meta;
            let code = 0;
            if (meta) code = meta.code;
            switch (code) {
                case 20000:
                    resolve({ status: 'success', balance: body.balance, currency: body.currency, debtExists: body.debtExists, unifiedBillingDay: body.unifiedBillingDay, nextBillingDate: body.nextBillingDate });
                    break;
                default:
                    this.returnError(resolve, reject, code);
            }
        })
        .catch(error => {
            reject(error);
        });
    });
});

module.exports.payType = (function(login, token) {
    return new Promise((resolve, reject) => {
        got.get(`${host}/info/payType`, {
            query: {
                'ctn': login,
                'client': beeline_config.client
            },
            headers: {
                'Cookie': `token=${token}`,
                'Content-Type': beeline_config.contentType
            },
            json: true
        })
        .then(response => {
	    loggerHelper.warn('response is: ', JSON.stringify({ response_body: response.body }).substr(0, 300));
            let body = response.body;
            let meta = body.meta;
            let code = 0;
            if (meta) code = meta.code;
            switch (code) {
                case 20000:
                    resolve({ status: 'success', payType: body.payType, accountType: body.accountType, market: body.market });
                    break;
                default:
                    this.returnError(resolve, reject, code);
            }
        })
        .catch(error => {
            reject(error);
        });
    });
});


module.exports.acceptOffer = (function(login, token) {
    return new Promise((resolve, reject) => {
        got.get(`${host}/offer/accept`, {
            query: {
                'ctn': login,
		'login': login,
                'client': beeline_config.client,
		'acceptType': 'CAPTCHA',
		'type': 'B2C',
		'version': 2
            },
            headers: {
                'Cookie': `token=${token}`,
                'Content-Type': beeline_config.contentType
            },
            json: true
        })
        .then(response => {
	    loggerHelper.warn('response is: ', JSON.stringify({ response_body: response.body }).substr(0, 300));
            let body = response.body;
            let meta = body.meta;
            let code = 0;
            if (meta) code = meta.code;
            switch (code) {
                case 20000:
                    resolve({ status: 'success' });
                    break;
                default:
                    this.returnError(resolve, reject, code);
            }
        })
        .catch(error => {
            reject(error);
        });
    });
});

