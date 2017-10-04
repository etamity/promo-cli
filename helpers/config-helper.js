'use strict';

const fileHelper = require('./file-helper');

class ConfigHelper {
    static getStartDate() {
        return this.getConfig().settings.startDate.replace(new RegExp('/', 'g'), '-');
    }

    static getPromoId() {
        return this.getConfig().settings.env.prod.promoID;
    }

    static getConfig() {
        if(!this.config) {
            const file = `${process.cwd()}/src/config.json`;
            this.config = fileHelper.readJsonSync(file);
        }

        return this.config;
    }
}

module.exports = ConfigHelper;
