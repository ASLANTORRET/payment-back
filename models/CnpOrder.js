const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('cnp_order', {
    orderId: { type: Sequelize.STRING, allowNull: false, defaultValue: "" },
    amount: { type: Sequelize.FLOAT(11), allowNull: false, defaultValue: 0 },
    customerReference: { type: Sequelize.STRING, allowNull: false, defaultValue: "" },
    currencyCode: { type: Sequelize.STRING, allowNull: false, defaultValue: "" },
    dateTime: { type: Sequelize.STRING, allowNull: false, defaultValue: "" },
    paymentTarget: { type: Sequelize.STRING, allowNull: false, defaultValue: "" },
    additionalInfoList: { type: Sequelize.TEXT, allowNull: false, defaultValue: "" }
  }, {
    indexes: [
    ],
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
  });
};
