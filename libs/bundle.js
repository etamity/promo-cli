'use strict';
const gulp = require('gulp');
const sass = require('gulp-sass');
const minifyCSS = require('gulp-minify-css');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const logHelper = require('../helpers/log-helper');
const FileHelper = require('../helpers/file-helper');
const PromoRtHelper = require('../helpers/prompt-helper');
const TaskHelper = require('../helpers/task-helper');
const rename = require("gulp-rename");
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const replace = require('gulp-replace');

const ventures = ['heartbingo', 'jackpotjoy', 'jackpotjoy-sweden', 'starspins', 'monopoly', 'virgingames', 'botemania'];
const themes = ['default', 'vip', 'interactive', 'interactive-white', 'starspins']
process.env.NODE_ENV = 'production';
class Bundle {

    constructor(path, output = '_output') {
        this.basePath = path;
        this.output = output;
        this.templateNames = FileHelper.getTemplateNames([path, ''].join('/'));
    }

    bundleTemplate() {
        const templates = this.templateNames;

        PromoRtHelper.get('answer', TaskHelper.listTemplates(templates)).then(answer => {
            try {
                if (!isNaN(answer) && answer >= 0 && answer <= templates.length) {
                    const template = templates[answer - 1];
                    logHelper.log(`Bundling [${answer}] ${template} ...`);
                    this.buildBundleJS(template).then(result => {
                        logHelper.log('');
                        logHelper.log(`******** ${result} ********`);
                        logHelper.log('');
                        this.buildAllSass(this.buildTemplateSassIndex(template));
                    });
                } else {
                    logHelper.error('Wrong Input! Please input number.');
                    this.bundleTemplate();
                }
            } catch (e) {
                logHelper.error(e);
            }
        });
    }
    buildBundleJS(templateName) {
        this.totalJSPromisesAmount = 1;
        const promise = new Promise(this.preprocessJS(templateName));
        return promise;
    }
    buildBundleSass(templateName, venture, theme, index) {
        this.totalSassPromisesAmount = 1;
        const settings = {
            templateName,
            venture,
            theme
        };
        return new Promise(this.preprocessSASS(settings));
    }

    preprocessJS(templateName, index = 1) {
        const input = this.getTemplatePath(templateName);
        const srcPath = [templateName, 'src/jsx'].join('/');
        const browserifyEnv = {
            entries: [[srcPath, 'Promo.jsx'].join('/')],
            paths: ['./node_modules', srcPath],
            extensions: ['.jsx'],
            globals: false,
            debug: false // enables source maps
        };
        return (resolve, reject) => {
            const file = [templateName, 'bundle'].join('-') + '.js';
            let error = false;
            const onError = msg => {
                error = true;
                logHelper.error(msg);
                reject(msg);
            };
            const output = [this.basePath, this.output, 'js'].join('/');
            let stream = browserify(browserifyEnv)
                .transform(babelify, { presets: ['babel-preset-es2015', 'babel-preset-react'] })
                .bundle()
                .on('error', onError)
                .pipe(source('bundle.js'));

            stream = stream.pipe(buffer()).pipe(uglify());
            stream.pipe(rename(file))
                .pipe(gulp.dest(output))
                .on('data', (chunk) => {
                    logHelper.log('[bundle] starting : ', templateName);
                    logHelper.log('[bundle] proccessing : ', chunk.path);
                })
                .on('end', () => {
                    logHelper.log(`[bundle] [${index}/${this.totalJSPromisesAmount}] complete :`, file);
                    resolve(file);
                });
        }
    }

    preprocessSASS(settings, index = 1) {
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

            const variables = {
                venture: `${venture}`,
                theme: `${theme}`
            }
            stream = stream.pipe(replace(/\$venture(.*)\"(.*)\"\;/g, `$venture: "${venture}";`))
                .pipe(replace(/\$theme(.*)\"(.*)\"\;/g, `$theme: "${theme}";`))
                .pipe(sass(includePaths))
                .on('error', onError)
                .pipe(prefix)
                .pipe(minifyCSS());

            const output = [this.basePath, this.output, 'css'].join('/');
            const file = [templateName, venture, theme].join('-') + '.css';
            stream.pipe(rename(file)).pipe(gulp.dest(output))
                .on('data', (chunk) => {
                    logHelper.log('[sass] starting : ', templateName, 'venture:', venture, 'theme:', theme);
                    logHelper.log('[bundle] proccessing : ', chunk.path);
                })
                .on('end', () => {
                    if (!error) {
                        logHelper.log(`[sass] [${index}/${this.totalSassPromisesAmount}] complete : `, file);
                        resolve(file);
                    }
                });
        }
    }

    bundleAll() {
        const settings = this.buildSassPromisesIndex();
        this.bundleAllJS().then(() => {
            this.buildAllSass(settings);
        });
    }
    buildTemplateSassIndex(templateName) {
        const promises = [];
        logHelper.log(`[sass] Building [${templateName}] Indexes ...`);
        ventures.forEach(venture => {
            themes.forEach(theme => {
                const settings = {
                    templateName,
                    venture,
                    theme
                };
                promises.push(settings);
            })
        });
        this.totalSassPromisesAmount = promises.length;
        return promises;
    }
    buildSassPromisesIndex() {
        let promises = [];
        logHelper.log('[sass] Building sass Indexes ...');
        this.templateNames.forEach(templateName => {
            promises = promises.concat(this.buildTemplateSassIndex(templateName));
        });
        this.totalSassPromisesAmount = promises.length;
        return promises;
    }

    buildAllSass(settingsList) {
        const promiseSerial = settings =>
            settings.reduce((promise, setting, index) =>
                promise.then(result => {
                    const func = this.preprocessSASS(setting, index + 1);
                    if (index === settingsList.length) {
                        Promise.resolve([]);
                    }
                    return (new Promise(func)).then(logHelper.log);
                }),
                Promise.resolve([]));
        return promiseSerial(settingsList);
    }

    bundleAllJS() {
        const promiseSerial = templateNames =>
            templateNames.reduce((promise, templateName, index) =>
                promise.then(result => {
                    const func = this.preprocessJS(templateName, index + 1);

                    return (new Promise(func)).then((result) => {
                        logHelper.log(result);
                        if (index === templateNames.length) {
                            Promise.resolve([]);
                        }
                    });
                }),
                Promise.resolve([]));

        this.totalJSPromisesAmount = this.templateNames.length;
        return promiseSerial(this.templateNames);
    }
    lintJS() {
        const promiseSerial = templateNames =>
            templateNames.reduce((promise, templateName, index) =>
                promise.then(result => {
                    const func = this.preprocessLintFiles(templateName, index);
                    return (new Promise(func)).then(logHelper.log)
                }),
                Promise.resolve([]));

        this.totalJSPromisesAmount = this.templateNames.length;
        promiseSerial(this.templateNames);
    }
    preprocessLintFiles(templateName, index = 1) {
        return (resolve, reject) => {
            const file = [templateName, 'bundle'].join('-') + '.js';
            const fs = require('fs');
            const projectEslintConfigPath = this.getTemplatePath(templateName) + '/.eslintrc';
            const defaultEslintConfigPath = global.__basedir + '/.eslintrc';

            // Check project directory already has .eslintrc file
            const eslintConfigPath = fs.existsSync(projectEslintConfigPath) ? projectEslintConfigPath : defaultEslintConfigPath;
            let error = false;
            const onError = msg => {
                error = true;
                logHelper.error(msg);
                reject(msg);
            };
  
            gulp.src([this.getSrcFiles(templateName)])

                // Attach lint output to the eslint property of the file object so it can be used by other modules
                .pipe(eslint({
                    configFile: eslintConfigPath
                }))

                // Output lint results to the console
                .pipe(eslint.format())
                .on('readable', () => {
                    logHelper.log('[lint] starting : ', templateName);
                })
                .on('error', onError)
                .on('end', () => {
                    if (!error) {
                        logHelper.log(`[lint] [${index}/${this.totalJSPromisesAmount}] complete : `, file);
                        resolve(file);
                    }
                })
                // Process exit with an error code (1) on lint error, return the stream and pipe to failAfterError last
                .pipe(eslint.failAfterError());

        }
    }

    getTemplatePath(name) {
        return [this.basePath, name].join('/');
    }
    getSrcMainFile(name) {
        return [this.getTemplatePath(name), 'src/jsx/Promo.jsx'].join('/');
    }
    getSrcPath(name) {
        return [this.getTemplatePath(name), 'src/jsx/**/*.jsx'].join('/');
    }
    getSrcFiles(name) {
        return [this.getTemplatePath(name), 'src/jsx/**/*.jsx'].join('/');
    }
    getSassPath(name) {
        return [this.getTemplatePath(name), 'src/sass/**/*.scss'].join('/');
    }
    getSassFile(name) {
        return [this.getTemplatePath(name), 'src/sass/style.scss'].join('/');
    }
}

module.exports = Bundle;