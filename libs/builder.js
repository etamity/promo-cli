'use strict';
const gulp = require('gulp');
const tasks = require('promo-builder');
const envs = require('promo-builder/environments');
const logHelper = require('../helpers/log-helper');
const runSequence = require('run-sequence');

const basePath = process.cwd();
const settings = {
    sass: basePath + '/src/sass/**/*.scss',
    entryFile: basePath + '/src/jsx/Promo.jsx',
    extensions: ['.jsx'],
    autoprefixerLevel: ['last 3 versions', 'Android >= 4.3', 'iOS >= 7'], 
    staticFiles: {
        images: basePath + '/src/images/**/*',
        videos: basePath + '/src/video/**/*',
        javascript: basePath + '/src/js/**/*',
        html: basePath + '/src/index.html',
        json: basePath + '/src/*.json'
    }
};


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