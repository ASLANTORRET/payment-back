'use strict';

const winston = require('winston');
module.exports = function(appConfig) {
        return new (winston.Logger)({
        exitOnError: false,
        transports: [
            new (winston.transports.Console)(appConfig.log_config_console),
            new (winston.transports.File)(appConfig.log_config_file),
        ]
    });
};
