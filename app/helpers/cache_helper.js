'use strict';

const {
    wrap: async
} = require('co');
const redisHelper = require('../helpers/redis_helper');

module.exports.delKeys = async(function *(key) {
    try {
        mainRedis.keys(key, function(err, keys) {
           if (err) loggerHelper.error(err);
           if (keys.length) mainRedis.del(keys);
        });
    } catch (err) {
        if (err) loggerHelper.error(err);
    }
});

module.exports.setCache = async(function *(key, val, exp) {
    try {
        key = JSON.stringify(key);
        if (exp === 0 && key.indexOf('*') !== -1) return yield this.delKeys(`pcache_${key}`);
        if (val === null) return yield redisHelper.set_redis_store(`pcache_${key}`, '', 0);
        val = JSON.stringify(val);
        if (val.indexOf('no token') !== -1) return;
        yield redisHelper.set_redis_store(`pcache_${key}`, val, exp);
    } catch (err) {
        if (err) loggerHelper.error(err);
    }
});

module.exports.getCache = async(function *(key) {
    try {
        key = JSON.stringify(key);
        let val = yield redisHelper.get_redis_store(`pcache_${key}`);
        if (appLodash.isEmpty(val)) return null;
        return JSON.parse(val);
    } catch (err) {
        if (err) loggerHelper.error(err);
        return null;
    }
});
