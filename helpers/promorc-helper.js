'use strict';
const FileHelper = require('./file-helper');
const PromptHelper = require('./prompt-helper');
const ConfigHelper = require('./config-helper');
const notifications = require('../services/notifications');
const _ = require('lodash');

class PromoRcHelper {
    static isPromoRcExist(processPath) {
        let promoRcFilePath = this.getPromoRcPath(processPath);

        return FileHelper.isFolderExist(promoRcFilePath);
    }

    static getPromoRcPath(processPath) {
        return `${processPath}/.promorc`;        
    }

    static createPromoRc(processPath) {
        let obj = {};

        return new Promise((resolve, reject) => {
            this.getTicket().then(ticket => {
                obj.ticket = ticket;
                
                this.getVip().then(vip => {
                    obj.vip = vip;
                    
                    this.getClientPath().then(path => {
                        obj.clientPath = path;
                        obj.promoID = ConfigHelper.getPromoId();
                        
                        let promoRcFilePath = this.getPromoRcPath(processPath);
                        FileHelper.jsonWrite(promoRcFilePath, obj);
                        resolve(obj);
                    });
                });
            });
        });
    }


    static getVip() {
        return new Promise((resolve, reject) => {
            PromptHelper.get('vip', 'is it vip (default n)? (y/n)').then(result => {
                let vip = false;
                if (result === 'y') vip = true; 
                resolve(vip);
            });
        });
    }

    static getTicket() {
        return this.getValue('ticketID', 'plase input jira ticket id:');
    }

    static getClientPath() {
        return this.getValue('clientPath', 'please input the client path:');
    }

    static getValue(varible, des) {
        return new Promise((resolve, reject) => {
            PromptHelper.get(varible, des).then(result => {
                resolve(result);
            });
        });
    }

    static getConfigFromPromoRc(processPath) {
        let promoRcFilePath = this.getPromoRcPath(processPath);
        
        try {
            return FileHelper.readJsonSync(promoRcFilePath);
        } catch (e) {
            return false;
        }
    }
}

module.exports = PromoRcHelper;