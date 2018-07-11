const Sequelize = require('sequelize');
module.exports = (sequeelize, DataTypes) => {
    return sequeelize.define('admin_user', {
        fullname: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true,
            validate: {
                isEmail: { msg: 'Неверный Email' }
            }    
        },
        lastEnter: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        jwt: { type: Sequelize.STRING, allowNull: true, defaultValue: null }
    },{
        indexes: [
            { unique: true, fields: ['email'] }
        ],
        charset: 'utf8'
    });
};