'use strict';

let fs = require('fs');

module.exports.delete_file = function(file_path) {
    fs.unlink(file_path, function(err) {
        try {
            if (err) throw err;
        } catch (err) {
            loggerHelper.error(err);
        }
    });
};

module.exports.write_file = function(fd, buffer) {
    fs.writeFile(fd, buffer, function(err) {
        try {
            if (err) throw err;
        } catch (err) {
            loggerHelper.error(err);
        }
    });
};
