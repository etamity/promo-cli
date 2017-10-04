'use strict';

const colors = require('colors/safe');
const _ = require('lodash');
const gutil = require('gulp-util');

class LogHelper {
    static log(msg) {
        gutil.log(gutil.colors.green(msg));
    }

    static error(msg) {
        gutil.log(gutil.colors.red(msg));
    }

    static toString(msg) {
        return _.isObject(msg) ? JSON.stringify(msg) : msg;
    }
}

module.exports = LogHelper;