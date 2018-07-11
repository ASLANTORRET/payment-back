const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    // instantiating will automatically set the flag to true if not set
    online: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },

    // default values for dates => current time
    lastEnter: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },

    login: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isDecimal: true
        }
    },
    ctn: { type: Sequelize.STRING, allowNull: false, unique: true },
    pin: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    log_token: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    api_token: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    cnp_token: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    cnp_userid: { type: Sequelize.STRING, allowNull: false, defaultValue: false },
    mfs_token: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    mfs_timestamp: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    language: { type: Sequelize.STRING, allowNull: false, defaultValue: 'ru' },
    app_version: { type: Sequelize.STRING, allowNull: false, defaultValue: '1.0.0' },
    username: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        validate: {
            len: { args: [0, 100], msg: 'email не может содержать больше 100 символов' }
        },
    },
    avatar: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    email: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        validate: {
            len: { args: [0, 100], msg: 'email не может содержать больше 100 символов' },
            isEmail: { msg: 'Неверный E-mail' }
        }
    },
    push_enable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    push_token: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    user_type: { type: Sequelize.STRING, allowNull: false, defaultValue: '' }
  }, {
    indexes: [
      { unique: true, fields: ['login'] },
      { unique: true, fields: ['ctn'] }
    ],
  });
};
