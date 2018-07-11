const Sequelize = require('sequelize');
module.exports  = (sequelize, DataTypes) => {
    return sequelize.define('merchant', {
        merchantId: { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
        internalName: { type: Sequelize.STRING, allowNull: false},
        fullName: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
        displayName: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
        description: { type: Sequelize.TEXT, allowNull: false, defaultValue: '' },
        endMerchantName: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
        status: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
        isVisible: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },        
        startDate: { type: Sequelize.DATE, allowNull: false },
        endDate: { type: Sequelize.DATE, allowNull: false },
        category: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
        image: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
    },{
        indexes: [

        ],
        charset: 'utf8'
    });
};

