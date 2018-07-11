'use strict';

const {
    wrap: async
} = require('co');
const only = require('only');
const got = require('got');
const beeline_config = appConfig.api_services.beeline;
const cnp_config = appConfig.api_services.cnp;
const fs = require('fs');
let host = cnp_config.host;
const FormData = require('form-data');
const UserHelper = require('../helpers/user_helper');
const CnpHelper = require('../helpers/cnp_helper');
const dateFormat = require('dateformat');
const mfsService = require('./mfs_service');

module.exports.postMethod = function(login, current_user, body) {
    if (!appLodash.isEmpty(body.uuid) && body.uuid !== current_user.cnp_token) UserHelper.updateUser({ login: login }, { cnp_token: body.uuid });
    if (body && body.userId && body.userId !== '0' && body.userId !== current_user.cnp_userid) UserHelper.updateUser({ login: login }, { cnp_userid: body.userId });
    let account = body.account;
    if (account && account.userId && account.userId !== '0' && account.userId !== current_user.cnp_userid) UserHelper.updateUser({ login: login }, { cnp_userid: account.userId });
};

module.exports.returnError = function(resolve, reject, code, message, throw_error) {
    if (message) {
        resolve({ status: 'error', error: message });
    } else {
        let error_key = `cnp_error_code_${code}`;
        reject(new Error(error_key));
    }
    // resolve({ status: 'error', error: mainHelper.getLocaleLangKey('ru', error_key), code: code });
    if (throw_error) throw new Error('breaking_chain');
};

module.exports.catchError = function(resolve, reject, error) {
    if (error.statusCode) {
        let code = error.statusCode;
        this.returnError(resolve, reject, code, '', false);
    } else reject(error);
};

module.exports.auth = (function(login, current_user) {
    return new Promise((resolve, reject) => {
        let body = {
        };
        let result_body = {};
        got.post(`${host}/auth/${login}`, {
            query: {
            },
            headers: {
                'Content-Type': beeline_config.contentType,
                'Authorization': cnp_config.authToken
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            loggerHelper.warn('response is: ', { response_body: response.body });
            let body = response.body;
            result_body = body;
            let code = body.code;
            if (!code) code = 0;
            switch (code) {
                case 0:
                    resolve({ status: 'success', body: result_body });
                    this.postMethod(login, current_user, body);
                    break;
                default:
                    this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});

module.exports.accounts = (function(login, current_user) {
    return new Promise((resolve, reject) => {
        let body = {
        };
        got.get(`${host}/accounts/${login}`, {
            query: {
            },
            headers: {
                'Content-Type': beeline_config.contentType,
                'Authorization': cnp_config.authToken
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            loggerHelper.warn('response is: ', { response_body: response.body });
            let body = response.body;
            let code = body.code;
            if (!code) code = 0;
            if (body.account && body.account.cards) {
                body.account.cards = body.account.cards.filter((card) => {
                    return (card.status === 'REGISTERED');
                });
            }
            switch (code) {
                case 0:
                    resolve({ status: 'success', body: body });
                    this.postMethod(login, current_user, body);
                    break;
                default:
                    this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});

module.exports.verify = (function(login, current_user, uuid, otp, password) {
    return new Promise((resolve, reject) => {
        let body = {
        };
        got.post(`${host}/auth/verify/${login}/${otp}`, {
            query: {
            },
            headers: {
                'Content-Type': beeline_config.contentType,
                'UUID': uuid,
                'Authorization': cnp_config.authToken
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            let body = response.body;
            body = {
                code: 0,
                message: 'success',
                uuid: '84b29031-fbb0-4b8b-816c-61c5b82997c1'
            };
            let code = body.code;
            if (!code) code = 0;
            switch (code) {
                case 0:
                    return body;
                default:
                  this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .then((body) => {
            resolve(body);
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});

module.exports.resetPassword = (function(login, current_user, newPassword, uuid) {
    return new Promise((resolve, reject) => {
        let body = {
            newPassword: newPassword
        };
        got.post(`${host}/accounts/password/${login}`, {
            query: {
            },
            headers: {
                'Content-Type': beeline_config.contentType,
                'UUID': uuid,
                'Authorization': cnp_config.authToken
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            let body = response.body;
            let code = body.code;
            if (!code) code = 0;
            switch (code) {
                case 0:
                    resolve({ status: 'success', body: body });
                    this.postMethod(login, current_user, body);
                    break;
                default:
                  this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});

module.exports.checkPassword = (function(login, current_user, password) {
    return new Promise((resolve, reject) => {
        this.accounts(login, current_user)
        .then(response => {
            if (response && response.status === 'success' && !appLodash.isEmpty(response.body.account)) {
                if (response.body.account.passwordStatus) return this.changePassword(login, current_user, password, password);
                else return resolve({ status: 'success', body: { resetPassword: false } });
            } else {
                resolve({ status: 'success', body: { resetPassword: true } });
                throw new Error('breaking_chain');
            }
        })
        .then(response => {
            if (response && response.status === 'success') resolve({ status: 'success', body: { resetPassword: false } });
            else resolve({ status: 'success', body: { resetPassword: true } });
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});


module.exports.changePassword = (function(login, current_user, password, newPassword) {
    return new Promise((resolve, reject) => {
        let body = {
            password: password,
            newPassword: newPassword
        };
        got.put(`${host}/accounts/password/${login}`, {
            query: {
            },
            headers: {
                'Content-Type': beeline_config.contentType,
                'Authorization': cnp_config.authToken
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            loggerHelper.warn('response is: ', { response_body: response.body });
            let body = response.body;
            let code = body.code;
            if (!code) code = 0;
            switch (code) {
                case 0:
                    resolve({ status: 'success', body: body });
                    this.postMethod(login, current_user, body);
                    break;
                default:
                    this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});

module.exports.getCards = (function(login, current_user) {
    return new Promise((resolve, reject) => {
        let body = {
        };
        got.get(`${host}/accounts/${login}/cards`, {
            query: {
            },
            headers: {
                'Content-Type': beeline_config.contentType,
                'Authorization': cnp_config.authToken
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            loggerHelper.warn('response is: ', { response_body: response.body });
            let body = response.body;
            let code = body.code;
            if (!code) code = 0;
            if (body && body.cards) {
                body.cards = body.cards.filter((card) => {
                    return (card.status === 'REGISTERED');
                });
            }
            switch (code) {
                case 0:
                    resolve({ status: 'success', body: body });
                    this.postMethod(login, current_user, body);
                    break;
                default:
                    this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});


module.exports.addCard = (function(login, current_user) {
    return new Promise((resolve, reject) => {
        let body = {
            returnUrl: `${appConfig.api_url}${cnp_config.returnUrl}?ctn=${login}`,
            languageCode: cnp_config.languageCode,
            template: cnp_config.addCardTemplate
        };
        got.post(`${host}/accounts/${login}/cards`, {
            query: {
            },
            headers: {
                'Content-Type': beeline_config.contentType,
                'Authorization': cnp_config.authToken
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            loggerHelper.warn('response is: ', { response_body: response.body });
            let body = response.body;
            let code = body.code;
            if (!code) code = 0;
            switch (code) {
                case 0:
                    resolve({ status: 'success', body: body });
                    this.postMethod(login, current_user, body);
                    break;
                default:
                    this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});

module.exports.deleteCard = (function(login, current_user, cardId, password) {
    return new Promise((resolve, reject) => {
        let body = {
            password: password
        };
        got.delete(`${host}/accounts/${login}/cards/${cardId}`, {
            query: {
            },
            headers: {
                'Content-Type': beeline_config.contentType,
                'Authorization': cnp_config.authToken
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            loggerHelper.warn('response is: ', { response_body: response.body });
            let body = response.body;
            let code = body.code;
            if (!code) code = 0;
            switch (code) {
                case 0:
                    resolve({ status: 'success', body: body });
                    this.postMethod(login, current_user, body);
                    break;
                default:
                    this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});


module.exports.processInstantPayment = (function(login, current_user, cardId, amount, paymentTarget, additionalInfoList, password) {
    return new Promise((resolve, reject) => {
        let currencyCode = 398;
        let dateTime = dateFormat(new Date(), 'dd.mm.yyyy HH:MM:ss');
        let full_order_id;
        CnpHelper.createOrder({
            amount: amount,
            currencyCode: currencyCode,
            dateTime: dateTime,
            paymentTarget: paymentTarget,
            additionalInfoList: JSON.stringify(additionalInfoList),
            userId: current_user.id
        })
        .then(orderId => {
            full_order_id = orderId;
            let body = {
                merchantId: cnp_config.merchantId,
                orderId: full_order_id,
                userId: current_user.cnp_userid,
                cardId: cardId,
                amount: amount,
                dateTime: dateTime,
                paymentTarget: paymentTarget,
                currencyCode: currencyCode,
                password: password,
                additionalInfoList: additionalInfoList
            };
            return got.post(`${host}/oneclick/payments`, {
                query: {
                },
                headers: {
                    'Content-Type': beeline_config.contentType,
                    'Authorization': cnp_config.authToken
                },
                body: JSON.stringify(body),
                json: true
            });
        })
        .then(response => {
            loggerHelper.warn('response is: ', { response_body: response.body });
            let body = response.body;
            let code = body.code;
            if (!code) code = 0;
            switch (code) {
                case 0:
                    resolve({ status: 'success', body: body });
                    this.postMethod(login, current_user, body);
					if (body.customerReference) CnpHelper.updateOrder({ orderId: full_order_id }, { customerReference: body.customerReference });
                    break;
                default:
                    this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});

module.exports.getPaymentHistory = (function(login, current_user, filter) {
    return new Promise((resolve, reject) => {
        if (filter.limit === 0) {
            resolve({ body: { payments: [] } });
            return;
        }
        let body = {
        };
        let cur_time = new Date().getTime();

        if (filter.startDate) {
          let tmp_date = filter.startDate.split('.');
          if (tmp_date.length === 3) {
              filter.startDate = `${tmp_date[0]}-${tmp_date[1]}-${tmp_date[2]}`;
          }
        }
        if (filter.endDate) {
          let tmp_date = filter.endDate.split('.');
          if (tmp_date.length === 3) {
              filter.endDate = `${tmp_date[0]}-${tmp_date[1]}-${tmp_date[2]}`;
          }
        }

        if (!filter.startDate) filter.startDate = mfsService.getCnpFormatDate(new Date(cur_time - 1000 * 60 * 60 * 24 * 30));
        if (!filter.endDate) filter.endDate = mfsService.getCnpFormatDate(cur_time);
        got.get(`${host}/accounts/${login}/payments/${filter.startDate}/${filter.endDate}`, {
            query: {
            },
            headers: {
                'Content-Type': beeline_config.contentType,
                'Authorization': cnp_config.authToken
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            loggerHelper.warn('response is: ', JSON.stringify({ response_body: response.body }).substr(0, 300));
            let body = response.body;
            let code = body.code;
            if (!code) code = 0;
            switch (code) {
                case 0:
                    if (!body.payments) body.payments = [];
                    if (filter.status === 'success') body.payments = body.payments.filter(txn => txn.rspCode === '0' || txn.rspCode === '00');
                    else if (filter.status === 'fail') body.payments = body.payments.filter(txn => txn.rspCode !== '0' && txn.rspCode !== '00');
                    body.payments.forEach(txn => {
                        txn.image = `${appConfig.api_url}/icons/beeline.png`;
                        txn.amount = (txn.amount / 100).toFixed(2);
                    });
                    appLodash.reverse(body.payments);
                    if (filter.limit && filter.limit > 0) body.payments = body.payments.slice(0, filter.limit);
                    resolve({ status: 'success', body: body });
                    this.postMethod(login, current_user, body);
                    break;
                default:
                    this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});

module.exports.deleteAccount = (function(login, current_user, password) {
    return new Promise((resolve, reject) => {
        let body = {
            password: password
        };
        got.delete(`${host}/accounts/${login}/`, {
            query: {
            },
            headers: {
                'Content-Type': beeline_config.contentType,
                'Authorization': cnp_config.authToken
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            loggerHelper.warn('response is: ', { response_body: response.body });
            let body = response.body;
            let code = body.code;
            if (!code) code = 0;
            switch (code) {
                case 0:
                    resolve({ status: 'success', body: body });
                    this.postMethod(login, current_user, body);
                    break;
                default:
                    this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});

module.exports.getAutoPayments = (function(login, current_user) {
    return new Promise((resolve, reject) => {
        let body = {
        };
        got.get(`${host}/accounts/${login}/autopayments`, {
            query: {
            },
            headers: {
                'Content-Type': beeline_config.contentType,
                'Authorization': cnp_config.authToken
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            loggerHelper.warn('response is: ', { response_body: response.body });
            let body = response.body;
            let code = body.code;
            if (!code) code = 0;
            switch (code) {
                case 0:
                    resolve({ status: 'success', body: body });
                    this.postMethod(login, current_user, body);
                    break;
                default:
                    this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});


module.exports.addAutoPayment = (function(login, current_user, cardId, name, paymentTarget, autoPaymentEnabled, autoPaymentAmount, scheduledPaymentEnabled, scheduledPaymentMonthly,
scheduledPaymentDay, scheduledPaymentAmount, password) {
    return new Promise((resolve, reject) => {
        let body = {
            cardId: cardId,
            name: name,
            paymentTarget: paymentTarget,
            autoPaymentEnabled: autoPaymentEnabled,
            autoPaymentAmount: autoPaymentAmount,
            scheduledPaymentEnabled: scheduledPaymentEnabled,
            scheduledPaymentMonthly: scheduledPaymentMonthly,
            scheduledPaymentDay: scheduledPaymentDay,
            scheduledPaymentAmount: scheduledPaymentAmount,
            password: password
        };
        body = appLodash(body).omitBy(appLodash.isUndefined).omitBy(appLodash.isNull).value();
        got.post(`${host}/accounts/${login}/autopayments`, {
            query: {
            },
            headers: {
                'Content-Type': beeline_config.contentType,
                'Authorization': cnp_config.authToken
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            loggerHelper.warn('response is: ', { response_body: response.body });
            let body = response.body;
            let code = body.code;
            if (!code) code = 0;
            switch (code) {
                case 0:
                    resolve({ status: 'success', body: body });
                    this.postMethod(login, current_user, body);
                    break;
                default:
                    this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});


module.exports.updateAutoPayment = (function(login, current_user, autoPaymentId, cardId, name, paymentTarget, autoPaymentEnabled, autoPaymentAmount, scheduledPaymentEnabled, scheduledPaymentMonthly,
scheduledPaymentDay, scheduledPaymentAmount, password) {
    return new Promise((resolve, reject) => {
        let body = {
            cardId: cardId,
            name: name,
            paymentTarget: paymentTarget,
            autoPaymentEnabled: autoPaymentEnabled,
            autoPaymentAmount: autoPaymentAmount,
            scheduledPaymentEnabled: scheduledPaymentEnabled,
            scheduledPaymentMonthly: scheduledPaymentMonthly,
            scheduledPaymentDay: scheduledPaymentDay,
            scheduledPaymentAmount: scheduledPaymentAmount,
            password: password
        };
        got.put(`${host}/accounts/${login}/autopayments/${autoPaymentId}`, {
            query: {
            },
            headers: {
                'Content-Type': beeline_config.contentType,
                'Authorization': cnp_config.authToken
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            loggerHelper.warn('response is: ', { response_body: response.body });
            let body = response.body;
            let code = body.code;
            if (!code) code = 0;
            switch (code) {
                case 0:
                    resolve({ status: 'success', body: body });
                    this.postMethod(login, current_user, body);
                    break;
                default:
                    this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});


module.exports.deleteAutoPayment = (function(login, current_user, autoPaymentId, password) {
    return new Promise((resolve, reject) => {
        let body = {
            password: password
        };
        got.delete(`${host}/accounts/${login}/autopayments/${autoPaymentId}`, {
            query: {
            },
            headers: {
                'Content-Type': beeline_config.contentType,
                'Authorization': cnp_config.authToken
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            loggerHelper.warn('response is: ', { response_body: response.body });
            let body = response.body;
            let code = body.code;
            if (!code) code = 0;
            switch (code) {
                case 0:
                    resolve({ status: 'success', body: body });
                    this.postMethod(login, current_user, body);
                    break;
                default:
                    this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});


module.exports.changePasswordStatus = (function(login, current_user, password, passwordStatus) {
    return new Promise((resolve, reject) => {
        let body = {
            password: password,
            passwordStatus: passwordStatus
        };
        got.put(`${host}/accounts/passwordstatus/${login}`, {
            query: {
            },
            headers: {
                'Content-Type': beeline_config.contentType,
                'Authorization': cnp_config.authToken
            },
            body: JSON.stringify(body),
            json: true
        })
        .then(response => {
            loggerHelper.warn('response is: ', { response_body: response.body });
            let body = response.body;
            let code = body.code;
            if (!code) code = 0;
            switch (code) {
                case 0:
                    resolve({ status: 'success', body: body });
                    this.postMethod(login, current_user, body);
                    break;
                default:
                    this.returnError(resolve, reject, code, body.message, true);
            }
        })
        .catch(error => {
            this.catchError(resolve, reject, error);
        });
    });
});
