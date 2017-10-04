'use strict';

const logger = require('./log-helper');

class ErrorHelper {
    static handle(error) {
        logger.error(error);
    }    
}

module.exports = ErrorHelper;