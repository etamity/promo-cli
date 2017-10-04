'use strict';

const Ventures = require('../configs/ventures');
const Config = require('../configs/config');

module.exports = {
    getPath(venture, type) {
        let typePath = Config.PROMOTION_FOLDER;
        switch (type) {
            case 'PROMO': 
            typePath = Config.PROMOTION_FOLDER;
            break;
            case 'OFFER':
            typePath = Config.OFFER_FOLDER;
            break;
            default:
            typePath = Config.PROMOTION_FOLDER;
            break;
        }
        return Config.CLIENT_CONTENT_PATH + '/' + Ventures[venture].path + '/' + typePath;
    },

    getPromotionPath() {
        return config.PROMOTIONS_SOURCE_PATH;
    },

    getVenturePath(venture) {
        return Ventures[venture].path;
    }
}

