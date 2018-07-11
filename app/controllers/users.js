'use strict';

const {
    wrap: async
} = require('co');
const UserHelper = require('../helpers/user_helper');
const beelineMfs = require('../services/beeline_mfs');
const cnpService = require('../services/cnp_service');
const only = require('only');
const assign = Object.assign;
const uuid = require('uuid');


function handleBeelineError(req, res, error) {
    if (error) loggerHelper.error('beeline_error', error.toString());
    let error_key = error.message;
    if (error.name === 'SequelizeValidationError' && error.errors && error.errors[0]) {
        return res.json({ status: 'error', error: error.errors[0].message });
    } else if (!appLocales.ru[error_key]) {
        return res.json({ status: 'error', error: mainHelper.getLocaleLangKey(req.language, 'couldnt_send_request') });
    } else {
        return res.json({ status: 'error', error: mainHelper.getLocaleLangKey(req.language, error_key) });
    }
}

// login, username, avatar, email, push_enable, push_token
exports.getUser = (function(req, res) {
    return res.json({ status: 'success', user: req.curr_user });
});

module.exports.getRegions = function(req, res) {
    let regions = new Array();
    regions = allRegions;
    return res.json({ status: 'success', body: regions, language_version: appConfig.language_version });
};

module.exports.getLanguages = function(req, res) {
    let languages = require('../../config/locales/mobile.js');
    return res.json({ status: 'success', languages: languages });
};

// login, username, avatar, email, push_enable, push_token
exports.updateUserParameters = (function(req, res) {
    let image = req.file;
    // if (!appLodash.isEmpty(image)) {
        // let image_type = appLodash.trim(image.type.split('/').slice(-1)[0]);
        // let originalname = appLodash.trim(image.name.split('.').slice(-1)[0]);
        // if (!image_type.match(/\.(bmp|jpg|jpeg|png)$/i) && !originalname.match(/\.(bmp|jpg|jpeg|png)$/i)) {
        //     return res.json({
        //         status: 'error',
        //         error: `${mainHelper.getLocaleLangKey(req.body.language, 'image_formats')} bmp, jpg, jpeg, png`
        //     });
        // }
    // }
    UserHelper.updateUserParameters(req.query.login, req.curr_user,{
        username: req.body.username,
        email: req.body.email,
        push_enable: req.body.push_enable,
        push_token: req.body.push_token,
        regionId: req.body.regionId
    }, image)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return handleBeelineError(req, res, error);
    });
});


function isValidWord(str) {
  return /^\w+$/.test(str);
}

function validate_pass(pass) {
   if (pass.length < 6) return 'Пароль должен содержать хотя бы 6 символов';
   if (pass.length > 255) return 'Пароль не должен содержать больше 255 символов';
   if (isValidWord(pass)) return '';
   return 'Пароль может содержать только латинские буквы и цифры';
}

// login, old_password, new_password
exports.changePassword = (function(req, res) {
    // let validate_string = validate_pass(req.body.old_password);
    // if (validate_string) return res.json({ status: 'error', error: validate_string });
    let validate_string1 = validate_pass(req.body.new_password);
    if (validate_string1.length > 0) return res.json({ status: 'error', error: validate_string1 });

    beelineMfs.changePassword(req.query.login, req.api_token, req.body.old_password, req.body.new_password)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return handleBeelineError(req, res, error);
    });
});

// login
exports.signup = (function(req, res) {
    if (!(appLodash.startsWith(req.body.login, '777')
    || appLodash.startsWith(req.body.login, '776')
    || appLodash.startsWith(req.body.login, '771')
    || appLodash.startsWith(req.body.login, '705'))) {
        return res.json({ status: 'error', error: mainHelper.getLocaleLangKey(req.language, 'only_beeline_users'), is_warning: true });
    }
    beelineMfs.passReset(req.body.login)
    .then(response => {
        if (response && response.status === 'error') return res.json(response);
        UserHelper.findCreateUser(req.body.login, { login: req.body.login }, ['id']);
        return res.json(response);
    })
    .catch(error => {
        return handleBeelineError(req, res, error);
    });
});

// login and password
exports.signin = (function(req, res) {
    if (!(appLodash.startsWith(req.body.login, '777')
    || appLodash.startsWith(req.body.login, '776')
    || appLodash.startsWith(req.body.login, '771')
    || appLodash.startsWith(req.body.login, '705'))) {
        return res.json({ status: 'error', error: mainHelper.getLocaleLangKey(req.language, 'only_beeline_users'), is_warning: true });
    }
    beelineMfs.authAuth(req.body.login, req.body.password)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return handleBeelineError(req, res, error);
    });
});

// login, token, oneTimeToken
exports.verifyOneTimeToken = (function(req, res) {
    beelineMfs.verifyOneTimeToken(req.query.login, req.api_token, req.query.oneTimeToken)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return handleBeelineError(req, res, error);
    });
});

// login, token
exports.generateOneTimeToken = (function(req, res) {
    beelineMfs.generateOneTimeToken(req.query.login, req.api_token)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return handleBeelineError(req, res, error);
    });
});

// login, token
exports.userType = (function(req, res) {
    beelineMfs.userType(req.query.login, req.curr_user, req.api_token)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return handleBeelineError(req, res, error);
    });
});

// login, token
exports.prepaidBalance = (function(req, res) {
    beelineMfs.prepaidBalance(req.query.login, req.api_token)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return handleBeelineError(req, res, error);
    });
});

// login, token
exports.postpaidBalance = (function(req, res) {
    beelineMfs.postpaidBalance(req.query.login, req.api_token)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return handleBeelineError(req, res, error);
    });
});

// login, token
exports.payType = (function(req, res) {
    beelineMfs.payType(req.query.login, req.api_token)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return handleBeelineError(req, res, error);
    });
});

// login
exports.signout = (function(req, res) {
    UserHelper.signout(req.body.login);
    return res.json({ status: 'success' });
});

// login, token
exports.acceptOffer = (function(req, res) {
    beelineMfs.acceptOffer(req.query.login, req.api_token)
    .then(response => {
        return res.json(response);
    })
    .catch(error => {
        return handleBeelineError(req, res, error);
    });
});
