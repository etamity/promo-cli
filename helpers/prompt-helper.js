'use strict';

const prompt = require('prompt');
const logger = require('./log-helper');

class PromptHelper {
    static get(varname, vardesc) {
        return new Promise((resolve, reject) => {
            logger.log('');

            prompt.get({name: varname, description: vardesc}, (err, result) => {
                if (err) {
                    logger.error(err);
                    reject(err);
                    return ;
                }

                resolve(result[varname]);
            });
        });
    }
}

module.exports = PromptHelper;