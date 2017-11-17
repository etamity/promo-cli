#!/usr/bin/env node
'use strict';

const promo = require('commander');
const PromoRcHelper = require('./helpers/promorc-helper');
const FileHelper = require('./helpers/file-helper');
const logHelper = require('./helpers/log-helper');
const MESSAGES = require('./constants/msg');
const builder = require('./libs/builder');
const project = require('./libs/project');
const bundle = require('./libs/bundle');
const execHelper = require('./helpers/exec-helper');

global.__basedir = __dirname;

function checkConfigExists(callback) {
     const exist = FileHelper.isFolderExist(__dirname + '/configs/config.js');
     if (exist) {
         callback();
     } else {
        logHelper.error(MESSAGES.CONFIG_EXIST_MSG);
     }
}

promo.command('new <projectName>')
    .description('create new project from promo templates')
    .action(projectName => {
        new project(projectName);
    });

promo.command('deploy <comment>')
    .description('Push and deploy production build to client delivery platform.')
    .action(comment => {
        checkConfigExists(() => {
            const Release = require('./libs/release');
            new Release(comment, () => {
                const Testinfo = require('./libs/testinfo');
                new Testinfo();
            });
        })
    });

promo.command('build [mode]')
    .description('Make a development or production build. mode: [dev] or [prod]')
    .action((mode) => {
        mode = mode ? mode : 'prod';
        logHelper.log(`Starting [${mode}] build`);
        builder.build(mode);
    })

promo.command('bundles')
    .description('Bundle source files')
    .action(() => {
        const basePath = process.cwd();
        new bundle(basePath);
    })

promo.command('watch')
    .description('Start development watching')
    .action(() => {
        builder.watch();
    })

promo.command('lint')
    .description('Lint source files')
    .action(() => {
        builder.lint();
    })

promo.command('serve [mode]')
    .description('Start promo server. mode: [desktop] ')
    .action((mode) => {
        let command = 'promo-server open ';
        if (mode === 'desktop') {
            command = command + 'desktop';
            mode = 'desktop';
        } else {
            mode = 'unicron';
        }

        execHelper.exec(command, (error, result) => {
            if (!error) {
                logHelper.log(`Promo server is serving [${mode}] mode ...`);
            }else{
                errorHelper.handle(error);
            }
        }, true);
    })


promo.command('info')
    .description('Generate Test Instructions Information')
    .action(() => {
        checkConfigExists(() => {
            const Testinfo = require('./libs/testinfo');
            new Testinfo();
        });
    });

promo.parse(process.argv);