'use strict';

const logger = require('./log-helper');
const exec = require('child_process').exec;

class ExecHelper {
    static exec(command, callback, returnResult) {
        let child = exec(command, (error, stdout, stderr) => {
            if (error) {
                if (callback) {
                    callback(error)
                }
                logger.error(error);
                return ;
            }
            logger.log(stdout);
            if (returnResult) {
                if (callback) {
                    callback(false, stdout);
                }
            }else{
                if (callback) {
                    callback(error)
                }
            }
        });

        child.stdout.on('data', (chunk) => {
             logger.log(chunk);
        })
        child.stderr.on('data', (chunk) => {
             logger.error(chunk);
        })
    }
}

module.exports = ExecHelper;