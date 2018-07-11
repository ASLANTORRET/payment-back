'use strict';

const {
    wrap: async
} = require('co');
const path = require('path');
const UserHelper = require('../helpers/user_helper');
const CnpHelper = require('../helpers/cnp_helper');

module.exports.default = function(req, res) {
    return res.json({
      status: 'success',
      env: appEnv
    });
};

exports.offer_html = (function(req, res) {
        res.sendFile(path.join(appRoot + '/app/views/offer.pdf'));
});
