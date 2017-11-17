'use strict';
const gulp = require('gulp');
const tasks = require('promo-builder');
const envs = require('promo-builder/environments');
const logHelper = require('../helpers/log-helper');
const runSequence = require('run-sequence');
const basePath = process.cwd();
const settings = require('./settings')(basePath);

gulp.task('dev', ['lint'], function (){
    tasks.buildPromo(settings, envs.DEV);
});

gulp.task('prod', ['lint'], function () {
    tasks.buildPromo(settings, envs.PROD);
});

gulp.task('watch', ['lint'], function () {
    tasks.watch(settings, envs.DEV);
});

gulp.task('lint', function () {
    tasks.lint();
});

class Builder {
    static build(mode) {
        mode = mode ? mode : 'prod';
        if (mode === 'prod') {
            runSequence('prod');
        } else {
            runSequence('dev');
        }

    }

    static watch() {
        runSequence('watch');
    }

    static lint() {
        runSequence('lint');
    }

}

module.exports = Builder;