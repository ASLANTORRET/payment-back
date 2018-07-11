'use strict';

const path = require('path');
const extend = require('util')._extend;

const defaults = {
  root: path.join(__dirname, '..'),
};

Array.prototype.max = function() {
return Math.max.apply(null, this);
};

Array.prototype.min = function() {
return Math.min.apply(null, this);
};

Array.prototype.limit = function(mx) {
   return this.filter(function(e, i) {
       return i < mx;
   });
};

Array.prototype.offset = function(os) {
   return this.filter(function(e, i) {
       return i > (os - 1);
   });
};

Array.prototype.unique = function() {
    let arr = [];
    for (let i = 0; i < this.length; i++) {
        if (!this[i] || this[i].length === 0) continue;
        this[i] = `${this[i]}`;
        if (!(~arr.indexOf(this[i]))) arr.push(this[i]);
    }
    return arr;
};

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

const development = require('./env/development');
const test = require('./env/test');
const production = require('./env/production');

module.exports = {
  development: extend(development, defaults),
  test: extend(test, defaults),
  production: extend(production, defaults)
}[appEnv];
