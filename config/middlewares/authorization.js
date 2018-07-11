'use strict';

exports.requiresLogin = require('./auths/require_login');
exports.paramsGetPost = require('./auths/params_get_post');
exports.ownLogin = require('./auths/own_login').own_login;
exports.cnpLogin = require('./auths/cnp_login');
exports.mfsLogin = require('./auths/mfs_login').mfsLogin;
