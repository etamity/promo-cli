'use strict';

const fs = require('fs');
const _ = require('lodash');
const logHelper = require('./log-helper');
const FileHelper = require('./file-helper');
// const templatePath = require('../configs/config').template;

class TaskHelper {
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


    static getVentureFromScss(path) {
        const sassPath = `${path}/src/sass/style.scss`;
        let ventureName = '';
        try {
            const file = fs.readFileSync(sassPath, "utf8");
            ventureName = this.getVentureValueFromString(file);
        } catch (err) {
            logHelper.error(err);
            ventureName = null;
        }
        return ventureName;
    }

    static trim(s, mask) {
        while (~mask.indexOf(s[0])) {
            s = s.slice(1);
        }
        while (~mask.indexOf(s[s.length - 1])) {
            s = s.slice(0, -1);
        }
        return s;
    }

    static getVentureValueFromString(str) {
        const matches = str.match(/\$venture: "[a-z|-]+";/);
        const trimChars = ['"', " ", ";"];

        if (_.isEmpty(matches)) {
            return false;
        }

        const rawVentureName = matches[0].split(":")[1];
        const ventureName = this.trim(rawVentureName, trimChars);

        return ventureName;
    }


    static listTemplates(templates) {
        let msg = 'which template do you want to use? \n';
        let index = 1;

        _.each(templates, (v, k) => {
            msg += `[${index}]: ${v} \n`;
            index++;
        });

        return msg;
    }
}

module.exports = TaskHelper;