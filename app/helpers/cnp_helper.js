'use strict';
const CnpOrder = db_sequelize.sequelize.models.cnp_order;
const uuid = require('uuid');
const fs = require('fs');

module.exports.makeId = function(id, length) {
    id = id.toString();
    let prefix = '1111';
    for (let i = id.length; i < length; i++) {
        prefix += '0';
    }
    return `${prefix}${id}`;
};

module.exports.createOrder = (function(create_obj) {
    return new Promise((resolve, reject) => {
        let order_id, full_order_id;
        CnpOrder.create(create_obj)
        .then((new_order) => {
            order_id = new_order.id;
            full_order_id = this.makeId(order_id, 16);
            return this.updateOrder(
                { id: order_id },
                { orderId: full_order_id }
            );
        })
        .then(() => {
            resolve(full_order_id);
        })
        .catch(error => {
            resolve(null);
            loggerHelper.error(error);
        });
    });
});

module.exports.updateOrder = function(update_user, update_obj) {
    return new Promise((resolve, reject) => {
        CnpOrder.update(update_obj, {
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
