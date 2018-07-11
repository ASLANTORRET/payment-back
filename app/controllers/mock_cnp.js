'use strict';

const {
    wrap: async
} = require('co');
const path = require('path');

module.exports.auth = function(req, res) {
    return res.json({
        "code": 0,
        "message": "success",
        "uuid": "9652125c-82cd-40e9-8c82-fef47143438e"
    });
}

module.exports.accounts = function(req, res) {
    return res.json({
        "code": 0,
        "message": "success",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12",
        "account": {
            "accountId": "7770001122",
            "userId": 450,
            "createdDate": "21.10.2016 16:33:34",
            "updatedDate": "21.10.2016 16:33:34",
            "status": "ACTIVE",
            "blockingReason": "",
            "passwordStatus": true,
            "cards": [
                {
                    "cardId": 43,
                    "userId": 450,
                    "name": "New card",
                    "lastDigits": "4289",
                    "status": "REGISTERED",
                    "primary": true,
                    "registeredDate": "19.10.2016 16:52:32",
                    "updatedDate": "19.10.2016 17:52:32",
                    "attemptsCount": 2
                },
                {
                    "cardId": 12,
                    "userId": 450,
                    "name": "Старая карта",
                    "lastDigits": "6732",
                    "status": "UNCOMPLETED",
                    "primary": true,
                    "registeredDate": "19.01.2016 16:52:32",
                    "updatedDate": "19.10.2016 17:52:32",
                    "attemptsCount": 0
                }
            ],
            "autoPayments": [
                {
                    "autoPaymentId": 11,
                    "cardId": 43,
                    "name": "Интернет дома",
                    "paymentTarget": "0010090364",
                    "registeredDate": "19.01.2016 16:52:32",
                    "updatedDate": "19.10.2016 17:52:32",
                    "autoPaymentEnabled": true,
                    "autoPaymentAmount": 200.00,
                    "sсheduledPaymentEnabled": true,
                    "sсheduledPaymentMonthly": true,
                    "sсheduledPaymentDay": 8,
                    "sсheduledPaymentAmount": 500.00
                }
            ]
        }
    })
}

module.exports.verify = function(req, res) {
    return res.json({
        "code": 0,
        "message": "success",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12"
    });
}

module.exports.resetPassword = function(req, res) {
    return res.json({
        "code": 0,
        "message": "The account details have been updated.",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12",
        "account": {
            "accountId": "7770001122",
            "userId": 450,
            "passwordStatus": true,
            "createdDate": "21.10.2016 16:33:34",
            "updatedDate": "24.10.2016 9:56:12",
            "status": "ACTIVE",
            "blockingReason": "",
            "switchControlStatus": "ENABLED"
        }
    });
}

module.exports.changePassword = function(req, res) {
    return res.json({
        "code": 0,
        "message": "The account details have been updated.",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12",
        "account": {
            "accountId": "7770001122",
            "userId": 450,
            "passwordStatus": true,
            "createdDate": "21.10.2016 16:33:34",
            "updatedDate": "24.10.2016 9:56:12",
            "status": "ACTIVE",
            "blockingReason": "",
            "switchControlStatus": "DISABLED"
        }
    });
}

module.exports.getCards = function(req, res) {
    return res.json({
        "code": 0,
        "message": "success",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12",
        "cards": [
            {
                "cardId": 43,
                "userId": 450,
                "name": "New card",
                "lastDigits": "4289",
                "status": "REGISTERED",
                "primary": true,
                "registeredDate": "19.10.2016 16:52:32",
                "updatedDate": "19.10.2016 17:52:32",
                "attemptsCount": 2
            },
            {
                "cardId": 12,
                "userId": 450,
                "name": "Старая карта",
                "lastDigits": "6732",
                "status": "UNCOMPLETED",
                "primary": false,
                "registeredDate": "19.01.2016 16:52:32",
                "updatedDate": "19.10.2016 17:52:32",
                "attemptsCount": 0
            }
        ]
    });
}

module.exports.addCard = function(req, res) {
    return res.json({
        "code": 0,
        "message": "success",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12",
        "redirectUrl": "https://test.processing.kz/CNPConsumerWebsite/BOPRequestCardholderDetails?tranGUID=b9fea283-5c89-4c46-a331-45de2051ff12",
        "customerReference": "123456789012"
    });
};

module.exports.updateCard = function(req, res) {
    return res.json({
        "code": 0,
        "message": "The credit card details has been updated.",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12",
        "card": {
            "cardId": 12,
            "userId": 450,
            "name": "Новая карта 22",
            "lastDigits": "6732",
            "status": "REGISTERED",
            "primary": true,
            "registeredDate": "19.01.2016 16:52:32",
            "updatedDate": "24.10.2016 11:15:32",
            "attemptsCount": 0
        }
    });
};

module.exports.deleteCard = function(req, res) {
    return res.json({
        "code": 0,
        "message": "The credit card has been deleted.",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12"
    });
};

module.exports.processInstantPayment = function(req, res) {
    return res.json({
        "code": 0,
        "message": "success",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12",
        "customerReference": "123456789012"
    });
};

module.exports.getPaymentHistory = function(req, res) {
    return res.json({
        "code": 0,
        "message": "success",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12",
        "payments": [
            {
                "customerReference": "123123123123",
                "cardId": 43,
                "rspCode": "00",
                "authCode": "428923",
                "amount": 1000.00,
                "date": "19.10.2016 16:52:32",
                "type": "ONE",
                "targetCtn": "7775210818"
            },
            {
                "customerReference": "123123123111",
                "cardId": 43,
                "rspCode": "51",
                "authCode": "428777",
                "amount": 1000.00,
                "date": "19.10.2016 16:52:32",
                "type": "INSTANT",
                "targetCtn": "7775210818"
            },
            {
                "customerReference": "123123123122",
                "cardId": 43,
                "rspCode": "00",
                "authCode": "428777",
                "amount": 1000.00,
                "date": "19.10.2016 16:52:32",
                "type": "SCHEDULED",
                "targetCtn": "7775210818"
            },
            {
                "customerReference": "123123123133",
                "cardId": 12,
                "rspCode": "57",
                "authCode": "428777",
                "amount": 1000.00,
                "date": "19.10.2016 16:52:32",
                "type": "AUTO",
                "targetCtn": "7775210818"
            }
        ]
    });
};

module.exports.deleteAccount = function(req, res) {
    return res.json({
        "code": 0,
        "message": "The account has been deleted.",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12"
    });
};

module.exports.getAutoPayments = function(req, res) {
    return res.json({
        "code": 0,
        "message": "success",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12",
        "autoPayments": [
            {
                "autoPaymentId": 13,
                "cardId": 43,
                "name": "Мой номер",
                "paymentTarget": "7772223344",
                "createdDate": "19.01.2016 16:52:32",
                "updatedDate": "19.10.2016 17:52:32",
                "autoPaymentEnabled": false,
                "autoPaymentAmount": 0.00,
                "sсheduledPaymentEnabled": true,
                "sсheduledPaymentMonthly": false,
                "sсheduledPaymentDay": 2,
                "sсheduledPaymentAmount": 200.00
            },
            {
                "autoPaymentId": 11,
                "cardId": 43,
                "name": "Интернет дома",
                "paymentTarget": "0010090364",
                "createdDate": "19.01.2016 16:52:32",
                "updatedDate": "19.10.2016 17:52:32",
                "autoPaymentEnabled": true,
                "autoPaymentAmount": 200.00,
                "sсheduledPaymentEnabled": true,
                "sсheduledPaymentMonthly": true,
                "sсheduledPaymentDay": 8,
                "sсheduledPaymentAmount": 500.00
            }
        ]
    });
};


module.exports.addAutoPayment = function(req, res) {
    return res.json({
        "code": 0,
        "message": "The auto payment has been created.",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12",
        "autoPayment": {
            "autoPaymentId": 45,
            "cardId": 43,
            "name": "Интернет дома 2",
            "paymentTarget": "0010090364",
            "createdDate": "19.01.2016 16:52:32",
            "updatedDate": "19.10.2016 17:52:32",
            "autoPaymentEnabled": true,
            "autoPaymentAmount": 200.00,
            "sсheduledPaymentEnabled": true,
            "sсheduledPaymentMonthly": true,
            "sсheduledPaymentDay": 8,
            "sсheduledPaymentAmount": 500.00
        }
    });
};

module.exports.updateAutoPayment = function(req, res) {
    return res.json({
        "code": 0,
        "message": "The auto payment has been updated.",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12",
        "autoPayment": {
            "autoPaymentId": 45,
            "cardId": 43,
            "name": "Интернет",
            "paymentTarget": "0010090364",
            "createdDate": "19.01.2016 16:52:32",
            "updatedDate": "19.10.2016 17:52:32",
            "autoPaymentEnabled": false,
            "autoPaymentAmount": 0.00,
            "sсheduledPaymentEnabled": true,
            "sсheduledPaymentMonthly": true,
            "sсheduledPaymentDay": 28,
            "sсheduledPaymentAmount": 500.00
        }
    });
};

module.exports.deleteAutoPayment = function(req, res) {
    return res.json({
        "code": 0,
        "message": "The auto payment has been deleted.",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12"
    });
};

module.exports.changePasswordStatus = function(req, res) {
    return res.json({
        "code": 0,
        "message": "The account details have been updated.",
        "uuid": "b9fea283-5c89-4c46-a331-45de2051ff12",
        "account": {
            "accountId": "7770001122",
            "userId": 450,
            "passwordStatus": true,
            "createdDate": "21.10.2016 16:33:34",
            "updatedDate": "24.10.2016 9:56:12",
            "status": "ACTIVE",
            "blockingReason": "",
            "switchControlStatus": "DISABLED"
        }
    });
};
