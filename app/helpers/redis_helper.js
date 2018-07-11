'use strict';
const {
    wrap: async
} = require('co');

module.exports.get_redis_store = async(function *(key) {
    try {
        let res = yield storeRedis.getAsync(key);
        return res;
    } catch (err) {
        if (err) loggerHelper.error(err);
        return '';
    }
});

module.exports.set_redis_store = async(function *(key, val, exp) {
    try {
        exp = +(exp);
        if (key) {
            if (exp === 0) return storeRedis.del(key);
            storeRedis.set(key, val);
            storeRedis.expireat(key, Math.floor(Date.now() / 1000) + exp);
        }
    } catch (err) {
        if (err) loggerHelper.error(err);
    }
});

module.exports.get_redis_api = async(function *(key) {
    try {
        let res = yield apiRedis.getAsync(key);
        return res;
    } catch (err) {
        if (err) loggerHelper.error(err);
        return '';
    }
});

module.exports.set_redis_api = async(function *(key, val, exp) {
    try {
        exp = +(exp);
        if (key) {
            if (exp === 0) return apiRedis.del(key);
            apiRedis.set(key, val);
            apiRedis.expireat(key, Math.floor(Date.now() / 1000) + exp);
        }
    } catch (err) {
        if (err) loggerHelper.error(err);
    }
});

module.exports.get_redis_socket = async(function *(key) {
    try {
        let res = yield socketRedis.getAsync(key);
        return res;
    } catch (err) {
        if (err) loggerHelper.error(err);
        return '';
    }
});

module.exports.set_redis_socket = async(function *(key, val, exp) {
    try {
        exp = +(exp);
        if (key) {
            if (exp === 0) return socketRedis.del(key);
            socketRedis.set(key, val);
            socketRedis.expireat(key, Math.floor(Date.now() / 1000) + exp);
        }
    } catch (err) {
        if (err) loggerHelper.error(err);
    }
});


module.exports.get_redis_call = async(function *(key) {
    try {
        let res = yield callRedis.getAsync(key);
        return res;
    } catch (err) {
        if (err) loggerHelper.error(err);
        return '';
    }
});

module.exports.set_redis_call = async(function *(key, val, exp) {
    try {
        exp = +(exp);
        if (key) {
            if (exp === 0) return callRedis.del(key);
            callRedis.set(key, val);
            callRedis.expireat(key, Math.floor(Date.now() / 1000) + exp);
        }
    } catch (err) {
        if (err) loggerHelper.error(err);
    }
});
