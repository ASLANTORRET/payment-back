'use strict';

global.appEnv = process.env.NODE_ENV || 'development';
global.appConfig = require('./config/app_config');
global.appLocales = require('./config/locales/texts');
global.appRoot = require('app-root-dir').get();
global.loggerHelper = require('./app/helpers/logger_helper')(appConfig);
global.mainHelper = require('./app/helpers/main_helper');
global.appLodash = require('lodash');

// redis servers
const redis = require('redis');
const bluebird = require('bluebird');
global.mainRedis = require('./config/redis_client').client(redis, bluebird, process.env.REDIS_MAIN_URL);
const cors = require('cors');
if (appEnv === 'development') require('dotenv').config();
require('datejs');

const port = process.env.PORT || 3025;
const express = require('express'),
app = module.exports = express();
const corsOptions = {
	origin: '*',
	credentials: true
  };
app.use(cors(corsOptions));
global.db_sequelize = require('./models/index');

const Region = db_sequelize.sequelize.models.region;
global.allRegions = {};
Region.findAll({order: [['order_field', 'ASC']]})
.then(local_regions => {
	allRegions = local_regions;
})
.catch(err => {
    console.log("ERROR REGIONS LOAD: ", err);
});
// const mfsService = require('./app/services/mfs_service');
// global.globalServices = [];
// mfsService.getServices2(0, 400)
// .then(response => {
// 	if (response.body) {
// 		globalServices = response.body;
// 		global.globalServicesTime = Date.now();
// 		console.log("globalServices: ", globalServices.length);
// 		mainHelper.mfsImageHelper(globalServices);
// 	}
// })
// .catch(error => {
// 	console.log("mfsService initialize error: ", error);
// });

// console.log("db_sequelize is: ", db_sequelize);


require('./config/express')(app, appConfig);
try {
    require('./config/routes')(app);
} catch (err) {
    console.log("some err in route: ", err);
}

function listen() {
    if (app.get('env') === 'test') return;
    let server = app.listen(port);
    console.log('Express server listening on port %d', server.address().port);
}

listen();
module.exports = app;
