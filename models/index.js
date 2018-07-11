'use strict';

const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');
const basename  = path.basename(module.filename);
const env       = process.env.NODE_ENV || 'development';
let config    = require(`${__dirname}/../config/config.json`)[env];
let db        = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    let model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db['user'].belongsTo(db['region']);
db['cnp_order'].belongsTo(db['user']);
db['mfs_txn'].belongsTo(db['user']);
db['container'].hasMany(db['merchant']);    
db['merchant'].belongsTo(db['container']);    
sequelize.sync({
   // force: true
});
module.exports = db;



if (true) { // TODO remove on production
    let regions = ['Актау и Мангистауская область',
    'Актобе и область',
    'Алматы и область',
    'Астана и Акмолинская область',
    'Атырау и область',
    'Караганда и область',
    'Костанай и область',
    'Кызылорда и область',
    'Павлодар и область',
    'Петропавловск и Северо-Казахстанская область',
    'Тараз и Жамбылская область',
    'Уральск и Западно-Казахстанская область',
    'Усть-Каменогорск и Восточно-Казахстанская область',
    'Шымкент и Южно-Казахстанская область',
    'Узбекская'];
    const Region = db.sequelize.models.region;
    for (let i = 0; i < regions.length; i++) {
        Region.findOrCreate({
            where: { region_name: regions[i] },
            defaults: { order_field: 1 }
        });
    }
}
