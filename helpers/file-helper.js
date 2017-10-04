'use strict';

const fs = require('fs');
const _ = require('lodash');
const ExecHelper = require('./exec-helper');
const logger = require('./log-helper');
const errorHelper = require('./error-helper');
const jsonfile = require('jsonfile');
const logHelper = require('./log-helper');

class FileHelper {
    static isFolderExist(path) {
        return fs.existsSync(path);
    }

    static getDirs(path) {
        return fs.readdirSync(path).sort();
    }

    static createFolder(path, callback) {
        try{
            fs.mkdirSync(path);
            
            if (_.isFunction(callback)) {
                callback();
            }
        }catch(error) {
            if (_.isFunction(callback)) {
                callback(error);
            }
        }
    }

    static deleteFoler(path, callback) {
        ExecHelper.exec(`rm -rf ${path}`, (error) => {
            logHelper.log('delete folder', error);
            if (error) {
                errorHelper.handle(error);
                return ;
            }

            if (_.isFunction(callback)) {
                callback();
            }
        });
    }

    static read(path, callback) {
        fs.readFile(path, 'utf8', function (error, data) {
            if (error) {
                errorHelper.handle(error);
                return ;
            }
            if (_.isFunction(callback)) {
                callback(data);
            }
        });
    }

    static write(path, data) {
        fs.writeFile(path, data, function(error) {
            if(error) {
                errorHelper.handle(error);
            }
        }); 
    }

    static readJson(path, callback) {
        jsonfile.readFile(path, (error, obj) => {
            if (error) {
                errorHelper.handle(error);
                return ;
            }
            if (_.isFunction(callback)) {
                callback(obj);
            }
        })
    }

    static readJsonSync(path) {
        return jsonfile.readFileSync(path);
    }

    static jsonWrite(path, data) {
        jsonfile.writeFileSync(path, data, {spaces: 2})
    }

    static getTemplatesName(filePath) {
        return fs.readdirSync(filePath).filter(v => {
            return fs.lstatSync(`${filePath}${v}`).isDirectory() && v !== '.git';
        });
    }

    static copyFiles(from, to) {    
        let command = `cp -r ${from} ${to}`;

        logger.log('running command: ' + command);
        
        return new Promise((resolve, reject) => {
            ExecHelper.exec(command, (err) => {
                if (err) {
                    reject(err);
                }else{
                    resolve('file copied')
                }
            });
        });
    }

     static getFiles(filePath) {
        return fs.readdirSync(filePath).filter((v) => {
            return v !== 'node_modules' 
                && v !== 'build'
                && v !== '.DS_Store';
                // && v !== 'screenshots'
                // && v !== '.editorconfig';
        });
    }

    static copyTemplate(from, to) {
        if (!FileHelper.isFolderExist(to)) {
           FileHelper.mkdir(to);
        };


        let lists = FileHelper.getFiles(from);
        let promises = [];

        lists.map((v) => {
            let fromPath = `${from}/${v}`;
            promises.push(FileHelper.copyFiles(fromPath, to)); 
        });

        return Promise.all(promises);
    }
}

module.exports = FileHelper;