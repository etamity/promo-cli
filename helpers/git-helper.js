'use strict';

const _ = require('lodash');
const execHelper = require('./exec-helper');
const errorHelper = require('./error-helper');
const logger = require('./log-helper');
const fileHelper = require('./file-helper');

class GitHelper {
    static getVentureBranchInfo(path, callback) {
        let venturePath = path;
        /**
        * should check if the folder exist or not
        **/
        if (!fileHelper.isFolderExist(venturePath)) {
            callback(true, {});
            return ;
        }

        let command = `cd ${venturePath} && git branch`;

        execHelper.exec(command, (error, result) => {
            if (!error) {
                let newResult = result.split('\n').filter(v => {
                    return !_.isEmpty(v);
                }).map(v => {
                    return _.trim(v);
                });

                let currentBranch = newResult.find(v => {
                    return v.indexOf('*') === 0;
                });

                if (_.isEmpty(currentBranch)) {
                    errorHelper.handle({error:  'can not find current branch'});
                    return ;
                }

                currentBranch = currentBranch.substr(2);

                let branchInfo = {
                    currentBranch: currentBranch,
                    branches: newResult
                }
                
                callback(false, branchInfo);
            }else{
                errorHelper.handle(error);
            }
        }, true);
    }

    static checkoutVentureBranch(path, branchName, callback) {
        let venturePath = path;

        if (!fileHelper.isFolderExist(venturePath)) {
            throw `please make sure ${venturePath} exist`;
            return ;
        }

        this.getVentureBranchInfo(venturePath, (error, result) => {
            if (error) {
                callback(error, result)
            }else{
                if (result.currentBranch == branchName) {
                    callback(false, {});
                    return false;
                }

                let currentPath = process.cwd();            
                let command = `cd ${venturePath}`;
                
                if (result.branches.indexOf(branchName) === -1) {
                    command = `${command} && git checkout master && git pull && git checkout -b ${branchName}`;
                }else{
                    command = `${command} && git checkout ${branchName} && git pull origin master`;
                }

                /**
                * everything is done should go back to the original path
                **/
                command = `${command} && cd ${currentPath}`;
                this.exec(command, callback, true);
            }
        });
    }

    static commitVentureChanges(path, branch, commit, callback) {
        let venturePath = path
        let currentPath = process.cwd();            
        let command = `cd ${venturePath} && git add . && git commit -m "[${branch}] ${commit}" && git push -u origin HEAD && cd ${currentPath}`;

        this.exec(command, callback);
    }

    static mergeVentureChanges(path, mainBranch,  featureBranch, callback) {
        let venturePath = path
        let currentPath = process.cwd();
        let command = `cd ${venturePath} && git checkout ${mainBranch} && git pull && git merge ${featureBranch} && git push -u origin HEAD && git checkout ${featureBranch} && cd ${currentPath}`;

        this.exec(command,  (error) => {
            if (!_.isEmpty(error)) {
                /**
                * should reset branch
                **/
                this.resetVentureBranch(venturePath, () => {
                    callback(error);
                })
            }else{
                callback(error);
            }
        });
    }

    static resetVentureBranch(path, callback) {
        let venturePath = path
        let currentPath = process.cwd();
        let command = `cd ${venturePath} && git reset head --hard && cd ${currentPath}`;

        this.exec(command, callback);
    }

    static exec(command, callback, isStandard) {
        execHelper.exec(command, (error) => {
            if (_.isFunction(callback)) {
                if (error) {
                    isStandard ? callback(error, {}) : callback(error);
                    return ;
                }

                isStandard ? callback(false, {}) : callback();
            }
        });
    }

    static updateResponsitory(path, callback) {
         /**
        * should check if the path is exist
        **/
        
        if (!fileHelper.isFolderExist(path)) {
            if (_.isFunction(callback)) {
                callback({error: `${path} doesn't exist, please clone the responsitory first`});
            }
            return ;
        }

        let currentPath = process.cwd();
        let command = `cd ${path} && git checkout master && git pull && cd ${currentPath}`;

        this.exec(command, callback);
    }   
    
    static cloneAllTemplates(callback) {
        let command = `git clone https://github.gamesys.co.uk/gamesys-design/promo-templates.git ${__basedir}/templates`;
        this.exec(command, callback);
    }

    static pullAllTemplates(callback) {
        let command = `cd ${__basedir}/templates && git pull`;
        this.exec(command, callback);
    }
}

module.exports = GitHelper;