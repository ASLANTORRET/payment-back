const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('mfs_txn', {
    'txnId': { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    'txnType': { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    'date': { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    'amount': { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    'formattedAmount': { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    'currency': { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    'channel': { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    'failureReason': { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    'refundable': { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    'sender': { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    'recipient': { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    'status': { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    'fee': { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    'commission': { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    'merchantTxnId': { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    'service_id': { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 }
  }, {
    indexes: [
    ],
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
  });
};
