const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('region', {
    region_name: { type: Sequelize.STRING, allowNull: false, defaultValue: "" },
    order_field: { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0 }
  }, {
    indexes: [
    ],
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
  });
};
