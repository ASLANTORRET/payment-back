'use strict';

const {
    wrap: async
} = require('co');
const UserHelper = require('../helpers/user_helper');
const cnpService = require('../services/cnp_service');
const only = require('only');
const assign = Object.assign;
const uuid = require('uuid');
const path = require('path');

function handleCnpError(req, res, error) {
    if (error) loggerHelper.error('cnp_error', error.toString());
    let error_key = error.message;
    if (!appLocales.ru[error_key]) {
        return { status: 'error', error: mainHelper.getLocaleLangKey(req.language, 'couldnt_send_request') };
    } else {
        return { status: 'error', error: mainHelper.getLocaleLangKey(req.language, error_key) };
    }
}

// auth
exports.auth = (function(req, res) {
    cnpService.auth(req.query.login, req.curr_user)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

// checkPassword
exports.checkPassword = (function(req, res) {
    cnpService.checkPassword(req.query.login, req.curr_user, req.body.password)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

// accounts
exports.accounts = (function(req, res) {
    cnpService.accounts(req.query.login, req.curr_user)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

// otp, password
exports.verify = (function(req, res) {
    cnpService.verify(req.query.login, req.curr_user, req.curr_user.cnp_token, req.body.otp, req.body.password)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

// newPassword
exports.resetPassword = (function(req, res) {
    cnpService.resetPassword(req.query.login, req.curr_user, req.body.newPassword, req.curr_user.cnp_token)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

// password, newPassword
exports.changePassword = (function(req, res) {
    cnpService.changePassword(req.query.login, req.curr_user, req.body.password, req.body.newPassword)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

// getCards
exports.getCards = (function(req, res) {
    cnpService.getCards(req.query.login, req.curr_user)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

// addCard
exports.addCard = (function(req, res) {
    cnpService.addCard(req.query.login, req.curr_user)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

// cardId, password
exports.deleteCard = (function(req, res) {
    cnpService.deleteCard(req.query.login, req.curr_user, req.body.cardId, req.body.password)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

// cardId, amount, paymentTarget, additionalInfoList, password
exports.processInstantPayment = (function(req, res) {
    cnpService.processInstantPayment(
        req.query.login,
        req.curr_user,
        req.body.cardId,
        req.body.amount,
        req.body.paymentTarget,
        req.body.additionalInfoList,
        req.body.password)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

// getPaymentHistory
exports.getPaymentHistory = (function(req, res) {
    cnpService.getPaymentHistory(req.query.login, req.curr_user, {
        startDate: req.query.from_date,
        endDate: req.query.end_date,
        status: req.query.status,
        limit: req.query.limit
    })
    .then(response => {
        if (response && response.status === 'success' && response.body && response.body.payments) {
            response.body.payments.forEach(x => {
                if (x.type) x.type = mainHelper.getLocaleLangKey(req.language, `txn_type_${x.type}`);
            });
        }
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

// password
exports.deleteAccount = (function(req, res) {
    cnpService.deleteAccount(req.query.login, req.curr_user, req.body.password)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

// getAutoPayments
exports.getAutoPayments = (function(req, res) {
    cnpService.getAutoPayments(req.query.login, req.curr_user)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

// cardId, name, paymentTarget, autoPaymentEnabled, autoPaymentAmount, scheduledPaymentEnabled, scheduledPaymentMonthly, scheduledPaymentDay, scheduledPaymentAmount, password
exports.addAutoPayment = (function(req, res) {
    cnpService.addAutoPayment(
        req.query.login,
        req.curr_user,
        req.body.cardId,
        req.body.name,
        req.body.paymentTarget,
        req.body.autoPaymentEnabled,
        req.body.autoPaymentAmount,
        req.body.scheduledPaymentEnabled,
        req.body.scheduledPaymentMonthly,
        req.body.scheduledPaymentDay,
        req.body.scheduledPaymentAmount,
        req.body.password
    )
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

// autoPaymentId, cardId, name, paymentTarget, autoPaymentEnabled, autoPaymentAmount, scheduledPaymentEnabled, scheduledPaymentMonthly, scheduledPaymentDay, scheduledPaymentAmount, password
exports.updateAutoPayment = (function(req, res) {
    cnpService.updateAutoPayment(
        req.query.login,
        req.curr_user,
        req.body.autoPaymentId,
        req.body.cardId,
        req.body.name,
        req.body.paymentTarget,
        req.body.autoPaymentEnabled,
        req.body.autoPaymentAmount,
        req.body.scheduledPaymentEnabled,
        req.body.scheduledPaymentMonthly,
        req.body.scheduledPaymentDay,
        req.body.scheduledPaymentAmount,
        req.body.password
    )
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

// autoPaymentId, password
exports.deleteAutoPayment = (function(req, res) {
    cnpService.deleteAutoPayment(req.query.login, req.curr_user, req.body.autoPaymentId, req.body.password)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});


// password, passwordStatus
exports.changePasswordStatus = (function(req, res) {
    cnpService.changePasswordStatus(req.query.login, req.curr_user, req.body.password, req.body.passwordStatus)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleCnpError(req, res, error));
    });
});

exports.returnUrl = (function(req, res) {
	res.sendFile(path.join(appRoot + '/app/views/cnp_success.html'));

//    return res.json({ status: 'success' });
});
