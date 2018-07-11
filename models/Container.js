const Sequelize = require('sequelize');
module.exports  = (sequelize, DataTypes) => {
    return sequelize.define('container', {
        name: { type: Sequelize.STRING, allowNull: false},
        isVisible: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        image: { type: Sequelize.STRING, allowNull: true, defaultValue: null }
    },{
        indexes: [

        ],
        charset: 'utf8'
    });
};

