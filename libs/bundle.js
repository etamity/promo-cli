'use strict';
const gulp = require('gulp');
const sass = require('gulp-sass');
const minifyCSS = require('gulp-minify-css');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const logHelper = require('../helpers/log-helper');
const fileHelper = require('../helpers/file-helper');
const rename = require("gulp-rename");
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const ventures = ['heartbingo', 'jackpotjoy', 'jackpotjoy-sweden', 'starspins', 'monopoly', 'virgingames', 'botemania'];
const themes = ['default', 'vip', 'interactive', 'interactive-white', 'starspins']
let environment = 'prod';


class Bundle {

    constructor(path, output = '_output') {
        this.basePath = path;
        this.output = output;
        this.templateNames = fileHelper.getTemplateNames([path, ''].join('/'));
        this.settingsList = this.buildSassPromisesIndex();
        //this.buildSass();
        this.bundleJS();
    }
    buildSassPromisesIndex() {
        const promises = [];
        let id = 0;
        logHelper.log('[Sass] Building Indexes ...');
        this.templateNames.forEach(templateName => {
            ventures.forEach(venture => {
                themes.forEach(theme => {
                    id++;
                    const settings = {
                        id: id,
                        templateName,
                        venture,
                        theme
                    };
                    promises.push(settings);
                })
            })
        });
        return promises;
    }

    getTemplatePath(name) {
        return [this.basePath, name].join('/');
    }
    getSrcPath(name) {
        return [this.getTemplatePath(name), 'src/jsx/**/*.jsx'].join('/');
    }
    getSassPath(name) {
        return [this.getTemplatePath(name), 'src/sass/**/*.scss'].join('/');
    }
    getSassFile(name) {
        return [this.getTemplatePath(name), 'src/sass/style.scss'].join('/');
    }
    buildSass() {
        const promiseSerial = settings =>
            settings.reduce((promise, setting, index) =>
                promise.then(result => {
                    const func = this.preprocessSASS(setting);
                    return (new Promise(func)).then(logHelper.log)
                }),
                Promise.resolve([]));

        this.totalPromisesAmount = this.settingsList.length;
        promiseSerial(this.settingsList);
    }
    bundleJS() {
        const promiseSerial = templateNames =>
            templateNames.reduce((promise, templateName, index) =>
                promise.then(result => {
                    const func = this.preprocessJS(templateName, index);
                    return (new Promise(func)).then(logHelper.log)
                }),
                Promise.resolve([]));

        this.totalPromisesAmount = this.templateNames.length;
        promiseSerial(this.templateNames);
    }

    lintFiles(templateName) {
        const fs = require('fs');
        const projectEslintConfigPath = this.getTemplatePath(templateName) + '/.eslintrc';
        const defaultEslintConfigPath = global.__basedir + '/.eslintrc';

        // Check project directory already has .eslintrc file
        const eslintConfigPath = fs.existsSync(projectEslintConfigPath) ? projectEslintConfigPath : defaultEslintConfigPath;

        return gulp.src([this.getSrcPath(templateName)])

            // Attach lint output to the eslint property of the file object so it can be used by other modules
            .pipe(eslint({
                configFile: eslintConfigPath
            }))

            // Output lint results to the console
            .pipe(eslint.format())

            // Process exit with an error code (1) on lint error, return the stream and pipe to failAfterError last
            .pipe(eslint.failAfterError());
    }
    preprocessJS(templateName, index) {
        const browserifyEnv = {
            debug: false
        };
        return (resolve, reject) => {

            const onError = msg => {
                error = true;
                logHelper.error(msg);
                reject(msg);
            };
            const output = [this.basePath, this.output, 'js'].join('/');
            const file = [templateName, 'bundle'].join('-') + '.js';
            this.lintFiles(templateName);
            let stream = browserify(browserifyEnv)
                .transform(babelify, { presets: ['babel-preset-es2015', 'babel-preset-react'] })
                .bundle()
                .on('error', onError)
                .pipe(source('bundle.js'));

            // uglify if needed
            if (environment === 'prod') {
                stream = stream.pipe(buffer()).pipe(uglify());
            }

            return stream.pipe(gulp.dest(output))
                .on('readable', () => {
                    logHelper.log('[bundle] starting : ', templateName);
                })
                .on('end', () => {
                    logHelper.log(`[bundle] [${index + 1}/${this.totalPromisesAmount}] complete :`, file);
                    resolve();
                });
        }
    }

    preprocessSASS(settings) {
        const { templateName, venture, theme } = settings;
        return (resolve, reject) => {
            let error = false;
            let stream = gulp.src(this.getSassPath(templateName));
            const onError = msg => {
                error = true;
                sass.logError.call(this, msg);
                reject(msg);
            };

            const prefix = autoprefixer({
                browsers: ['last 3 versions', 'Android >= 4.3', 'iOS >= 7'],
                cascade: false
            });

            const includePaths = { includePaths: ['node_modules/breakpoint-sass/stylesheets', 'node_modules'] };

            // If env is dev we add sourcemaps
            if (environment === 'dev') {
                stream = stream.pipe(sourcemaps.init())
                    .pipe(sass(includePaths))
                    .on('error', onError)
                    .pipe(prefix)
                    .pipe(sourcemaps.write());

                // If env is prod we minify
            } else {
                stream = stream.pipe(sass(includePaths))
                    .on('error', onError)
                    .pipe(prefix)
                    .pipe(minifyCSS());
            }

            const output = [this.basePath, this.output, 'css'].join('/');
            const file = [templateName, venture, theme].join('-') + '.css';
            stream.pipe(rename(file)).pipe(gulp.dest(output))
                .on('readable', () => {
                    logHelper.log('[sass] starting : ', templateName);
                })
                .on('end', () => {
                    if (!error) {
                        logHelper.log(`[sass] [${settings.id}/${this.totalPromisesAmount}] complete : `, file);
                        resolve(file);
                    }
                });
        }

    }

    buildJsBundle() {

    }
}

module.exports = Bundle;