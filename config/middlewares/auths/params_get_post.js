'use strict';

let formidable = require('formidable');

module.exports = (function(req, res, next) {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        let form = new formidable.IncomingForm({
            maxFieldsSize: appConfig.constraints.maxHttpSize,
            maxFields: appConfig.constraints.maxFields,
	    uploadDir: `${appRoot}/tmp/`
        });
        try {
            let error = {};
            form.parse(req, function(err, fields, files) {
                if (err) {
                    loggerHelper.error(err);
                    return res.json({
                        status: 'error',
                        error: mainHelper.getLocaleLangKey(req.body.language, 'couldnt_send_request')
                    });
                }
                let lang = req.body.language;
                if (!appLodash.isEmpty(fields)) req.body = fields;
                req.body.language = lang;
                if (!appLodash.isEmpty(files)) {
			req.file = files.avatar;
		}
            }).on('progress', function(bytesReceived, bytesExpected) {
                if (bytesExpected > appConfig.constraints.maxBufferSize) {
                    error = {
                        status: 'error',
                        error: mainHelper.getLocaleLangKey(req.body.language, 'file_too_large')
                    };
                }
            }).on('end', function() {
                if (appLodash.isEmpty(error)) return next();
                else return res.json(error);
            }).on('error', function(err) {
                if (err) loggerHelper.error(err);
                return res.json({
                    status: 'error',
                    error: mainHelper.getLocaleLangKey(req.body.language, 'couldnt_send_request')
                });
            });
        } catch (err) {
          loggerHelper.error(err);
          return res.json({
              status: 'error',
              error: mainHelper.getLocaleLangKey(req.body.language, 'couldnt_send_request')
          });
        }
    }
    else return next();
});
