'use strict';

const bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    express = require('express'),
    errorhandler = require('errorhandler');

module.exports = (app, config) => {
  
    app.use(express.static('storage'));
    app.use('/stat', express.static('public'));
    app.use(bodyParser.json({ extended: true, parameterLimit: 10000, limit: 1024 * 1024 * 50 }));
    app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 10000, limit: 1024 * 1024 * 50, uploadDir: `${appRoot}/tmp/`, type: 'application/x-www-form-urlencoded' }));
    app.use(methodOverride('X-HTTP-Method-Override'));
    app.use(methodOverride((req) => {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method;
        delete req.body._method;
        return method;
      }
    }));
    
    app.set('showStackError', true);

    if (appEnv === 'development') {
      // only use in development
      app.use(errorhandler());
      app.locals.pretty = true;
    }
};
