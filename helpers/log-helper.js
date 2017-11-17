'use strict';

const colors = require('colors/safe');
const _ = require('lodash');
const gutil = require('gulp-util');

class LogHelper {
    static log() {
        let args = Array.prototype.slice.call(arguments);
        const msg = args.join(' ');
        gutil.log(gutil.colors.green(msg));
    }

    static error() {
        let args = Array.prototype.slice.call(arguments);
        const msg = args.join(' ');
        gutil.log(gutil.colors.red(msg));
    }

    static toString(msg) {
        return _.isObject(msg) ? JSON.stringify(msg) : msg;
    }
}

module.exports = LogHelper;