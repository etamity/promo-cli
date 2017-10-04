'use strict';

const PromoRcHelper = require('../helpers/promorc-helper');
const execHelper= require('../helpers/exec-helper');
const pathHelper= require('../helpers/path-helper');
const TestConfig = require('../constants/info');
const promptHelper = require('../helpers/prompt-helper');
const logHelper = require('../helpers/log-helper');
const TaskHelper = require('../helpers/task-helper');
const ConfigHelper = require('../helpers/config-helper');
const util = require('util')

class Testinfo {
    constructor() {
        this.path = process.cwd();
        this.venture = TaskHelper.getVentureFromScss(this.path);
        this.venturePath = pathHelper.getPath(this.venture);
        this.configRc = null;
        this.date = ConfigHelper.getStartDate();
        
        if (PromoRcHelper.isPromoRcExist(this.path)) {
            this.configRc = PromoRcHelper.getConfigFromPromoRc(this.path);
            const venture = pathHelper.getVenturePath(this.venture);
            logHelper.log(Testinfo.generateTestinfo(
                venture, 
                this.date,
                this.configRc.clientPath, 
                this.configRc.vip, 
                TestConfig
            ));
        } else {
            logHelper.error('Please make a release first.\n');
        }
    }

   static generateTestinfo(venture, date, pathName, isVip, config) {
        const diver = '\n*************** Test Instructions ***************\n\n';
        const endDiver = '\n\n********************* End *********************\n'
        const ventureItem = config[venture];
        const vip = isVip ? 'vip/' : '';
        const folder = pathName.toLowerCase();
        const user = ventureItem.testUsers[0];
        const unicornUrl= `https://${ventureItem.url}/api/content/promotions/${vip}${folder}/?previewDate=${date}&m=${user}`;
        const desktopUrl= `https://${ventureItem.desktopUrl}/promotions/detailedpromotionstory/${folder}/?previewDate=${date}&m=${user}`;
        const outputText = `\nDesktop: \n${desktopUrl}\n\nUnicorn: \n${unicornUrl}\n\nTest Users:\n${ventureItem.testUsers.join(', ').toString()}\n`;
        return diver + outputText + endDiver;
    }
}

module.exports = Testinfo;