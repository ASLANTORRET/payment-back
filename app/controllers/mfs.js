'use strict';

const {
    wrap: async
} = require('co');
const UserHelper = require('../helpers/user_helper');
const mfsService = require('../services/mfs_service');
const only = require('only');
const assign = Object.assign;
const uuid = require('uuid');

function handleMfsError(req, res, error) {
    if (error) loggerHelper.error('mfs_error', error.toString());
    let error_key = error.message;
    if (!appLocales.ru[error_key]) {
        return { status: 'error', error: mainHelper.getLocaleLangKey(req.language, 'couldnt_send_request') };
   } else {
//	return { status: 'error', error: error_key };
        return { status: 'error', error: mainHelper.getLocaleLangKey(req.language, error_key) };
    }
}

// getServices
exports.getServices = (function(req, res) {
    mfsService.getServices2(req.query.skip, req.query.limit, req.query.category_id, req.query.category_filter, req.query.name_filter)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleMfsError(req, res, error));
    });
});

// getServiceById
exports.getServiceById = (function(req, res) {
    mfsService.getServiceById(req.query.service_id)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleMfsError(req, res, error));
    });
});

// getCategories
exports.getCategories = (function(req, res) {
    mfsService.getCategories(req.query.skip, req.query.limit, req.query.name)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleMfsError(req, res, error));
    });
});

// getCategoryById
exports.getCategoryById = (function(req, res) {
    mfsService.getCategoryById(req.query.category_id)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleMfsError(req, res, error));
    });
});

// getServicesCount
exports.getServicesCount = (function(req, res) {
    mfsService.getServicesCount(req.query.category_id)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleMfsError(req, res, error));
    });
});

// cnpMfsHistory
exports.cnpMfsHistory = (function(req, res) {
    mfsService.cnpMfsHistory(req.query.login, req.curr_user, {
        startDate: req.query.from_date,
        endDate: req.query.end_date,
        status: req.query.status,
        type: req.query.type,
        limit: req.query.limit
    })
    .then(response => {
        if (response && response.status === 'success' && response.body && response.body.payments) {
            response.body.payments.forEach(x => {
                if (x.txn && x.txn.txnType) x.txn.txnType = mainHelper.getLocaleLangKey(req.language, `txn_type_${x.txn.txnType}`);
                if (x.txn && x.txn.type) x.txn.type = mainHelper.getLocaleLangKey(req.language, `txn_type_${x.txn.type}`);
            });
        }
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleMfsError(req, res, error));
    });
});

// getTransaction
exports.getTransaction = (function(req, res) {
    mfsService.getTransaction(req.query.login, req.curr_user, {
        txnId: req.query.transactionId
    })
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleMfsError(req, res, error));
    });
});

// transactions
exports.transactions = (function(req, res) {
    mfsService.transactions(req.query.login, req.curr_user, {
        startDate: req.query.from_date,
        endDate: req.query.end_date,
        status: req.query.status,
        limit: req.query.limit
    })
    .then(response => {
        if (response && response.status === 'success' && response.body) {
            response.body.forEach(x => {
                x.txnType = mainHelper.getLocaleLangKey(req.language, `txn_type_${x.txnType}`);
            });
        }
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleMfsError(req, res, error));
    });
});

// servicesAvailability
exports.servicesAvailability = (function(req, res) {
    mfsService.servicesAvailability(req.query.login, req.curr_user, {
        service_id: req.body.service_id,
        recipient_id: req.body.recipient_id,
        amount: req.body.amount,
        uiFields: req.body.uiFields
    })
    .then((response) => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleMfsError(req, res, error));
    });
});

// purchaseInitiation
exports.purchaseInitiation = (function(req, res) {
    mfsService.purchaseInitiation(req.query.login, req.curr_user, {
        service_id: req.body.service_id,
        recipient_id: req.body.recipient_id,
        amount: req.body.amount,
        uiFields: req.body.uiFields
    })
    .then((response) => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleMfsError(req, res, error));
    });
});

// confirmTransaction
exports.confirmTransaction = (function(req, res) {
    mfsService.confirmTransaction(req.query.login, req.curr_user, {
        txnid: req.body.txnid,
        token: req.body.otp
    })
    .then((response) => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleMfsError(req, res, error));
    });
});

// approveTransaction
exports.approveTransaction = (function(req, res) {
    mfsService.approveTransaction(req.query.login, req.curr_user, {
        txnid: req.body.txnid,
        password: req.body.otp
    })
    .then((response) => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleMfsError(req, res, error));
    });
});

// chargeConfirmation
exports.chargeConfirmation = (function(req, res) {
    mfsService.chargeConfirmation(req.query.login, req.curr_user, {
        txnid: req.body.txnid
    })
    .then((response) => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleMfsError(req, res, error));
    });
});

// statusTransaction
exports.statusTransaction = (function(req, res) {
    mfsService.statusTransaction(req.query.login, req.curr_user, {
        txnid: req.query.txnid
    })
    .then((response) => {
        return res.json(response);
    })
    .catch(error => {
        return res.json(handleMfsError(req, res, error));
    });
});

exports.returnUrl = (function(req, res) {
    return res.json({ status: 'success' });
});
