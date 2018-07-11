'use strict';
const MfsTxn = db_sequelize.sequelize.models.mfs_txn;
const CnpHelper = require('./cnp_helper');
const uuid = require('uuid');
const fs = require('fs');

module.exports.createTxn = (function(create_obj) {
    return new Promise((resolve, reject) => {
        let txn_id, merchantTxnId;
        MfsTxn.create(create_obj)
        .then((new_txn) => {
            txn_id = new_txn.id;
            merchantTxnId = CnpHelper.makeId(txn_id, 16);
            return this.updateTxn(
                { id: txn_id },
                { merchantTxnId: merchantTxnId }
            );
        })
        .then(() => {
            resolve(merchantTxnId);
        })
        .catch(error => {
            resolve(null);
            loggerHelper.error(error);
        });
    });
});

module.exports.updateTxn = function(update_user, update_obj) {
    return new Promise((resolve, reject) => {
        MfsTxn.update(update_obj, {
            where: update_user
        })
        .then(() => {
            resolve();
        })
        .catch(error => {
            reject(error);
        });
    });
};

module.exports.findTxn = function(search_obj, attributes) {
    return new Promise((resolve, reject) => {
        MfsTxn.findAll({
            where: search_obj,
			attributes: attributes
        })
        .then((txns) => {
            resolve(txns);
        })
        .catch(error => {
            reject(error);
        });
    });
};
