'use strict';

const promoRcHelper = require('../helpers/promorc-helper');
const gitHelper = require('../helpers/git-helper');
const notifications = require('../services/notifications');
const events = require('../constants/events');
const MESSAGES = require('../constants/msg');
const taskHelper = require('../helpers/task-helper');
const fileHelper = require('../helpers/file-helper');
const errorHelper= require('../helpers/error-helper');
const execHelper= require('../helpers/exec-helper');
const configHelper = require('../helpers/config-helper');
const pathHelper = require('../helpers/path-helper');
const promptHelper = require('../helpers/prompt-helper');
const logHelper = require('../helpers/log-helper');

class Release {
    constructor(commit, onFinished) {
        this.setupEvents();
        this.path = process.cwd();
        this.venture = taskHelper.getVentureFromScss(this.path);
        this.venturePath = this.venture ? pathHelper.getPath(this.venture) : null;
        this.commit = commit;
        this.config = promoRcHelper.getConfigFromPromoRc(this.path);
        this.onFinished = onFinished;

        if (!this.venture || !this.venturePath) {
            logHelper
        }

        if (promoRcHelper.isPromoRcExist(this.path)) {
            if (this.config.promoID === configHelper.getPromoId()) {
                notifications.pub(events.CHECKOUT_BRANCH);
            } else {
                 promptHelper.get('promorc', `this promo has be deployed with different promoId:[${this.config.promoID}] from config.json promoId:[${configHelper.getPromoId()}] file. Do you want to overwrite it? (y/n default is n)`)
                 .then((result) => {
                     if (isNaN(result) && result.toLowerCase() === 'y'){
                        promoRcHelper.createPromoRc(this.path).then((config) => {
                            this.config = config;
                            notifications.pub(events.CHECKOUT_BRANCH);
                        });
                     }

                 })
            }
     
        } else {
            promoRcHelper.createPromoRc(this.path).then((config) => {
                this.config = config;
                notifications.pub(events.CHECKOUT_BRANCH);
            });
        }
    }

    setupEvents() {
        notifications.sub(events.CHECKOUT_BRANCH, () => {
            this.checkoutPromotionBranch();
        });

        notifications.sub(events.CHECKOUT_CLIENT_BRANCH, () => {
            this.checkoutClientBranch();    
        });

        notifications.sub(events.BUILD_PROMO, () => {
            this.buildPromo();
        });

        notifications.sub(events.COPY_PROD, () => {
            this.copyPromo();
        });

        notifications.sub(events.PUSH_TO_CLIENT, () => {
            this.pushToClient();
        });

        notifications.sub(events.MERGE_CLIENT_TO_MASTER, () => {
            this.mergeClientToMater();
        });

        notifications.sub(events.PUSH_PROMOTION, () => {
            this.pushPromotion();
        });

        notifications.sub(events.MERGE_PROMO_TO_MASTER, () => {
            this.mergePromoToMater();
        });

        notifications.sub(events.ON_COMPLETE_RELEASE, () => {
            if (this.onFinished) {
                this.onFinished();
            }
        });
    }

    pushPromotion() {
        gitHelper.commitVentureChanges(this.path, this.config.ticket, this.commit, () => {
            notifications.pub(events.MERGE_PROMO_TO_MASTER);    
        });
    }

    mergePromoToMater() {
        promptHelper.get('mergeToMaster', MESSAGES.MERGE_PROMO_MASTER_MSG)
            .then((result) => {
                if (isNaN(result) && result.toLowerCase() === 'y'){
                    gitHelper.mergeVentureChanges(this.path, 'master', this.config.ticket, () => {
                        logHelper.log(MESSAGES.MERGE_PROMO_MASTER_SUCCESS_MSG);
                        notifications.pub(events.ON_COMPLETE_RELEASE);
                    });
                } else {
                    notifications.pub(events.ON_COMPLETE_RELEASE);
                }
            });
    }

    pushToClient() {
        gitHelper.commitVentureChanges(this.venturePath, this.config.ticket, this.commit, () => {
            notifications.pub(events.MERGE_CLIENT_TO_MASTER);    
        });
    }

    mergeClientToMater() {
        promptHelper.get('mergeToMaster', MESSAGES.MERGE_CLIENT_MSG)
            .then((result) => {
                if (isNaN(result) && result.toLowerCase() === 'y'){
                    gitHelper.mergeVentureChanges(this.venturePath, 'master', this.config.ticket, () => {
                        logHelper.log(MESSAGES.MERGE_CLIENT_SUCCESS_MSG);
                        notifications.pub(events.PUSH_PROMOTION);
                    });
                } else {
                    notifications.pub(events.PUSH_PROMOTION);
                }
            });
    }

    checkoutClientBranch() {
        gitHelper.checkoutVentureBranch(this.venturePath, this.config.ticket, () => {
            notifications.pub(events.COPY_PROD);
        });
    }

    copyPromo() {
        const from = `${this.path}/build/prod/`;
        const to = `${this.venturePath}${this.config.vip ? 'vip/' : ''}${this.config.clientPath}`;
        logHelper.log('client path', to);
        fileHelper.copyFiles(from, to).then(() => {
            logHelper.log('files has been copied');
            notifications.pub(events.PUSH_TO_CLIENT);
        });
    }

    checkoutPromotionBranch() {
        gitHelper.checkoutVentureBranch(this.path, this.config.ticket, () => {
            logHelper.log(`${this.config.ticket} branch has been checkout successfully`);
            notifications.pub(events.BUILD_PROMO);
        });
    }

    buildPromo() {
        let gulpPath = `${this.path}/node_modules/gulp/bin/gulp.js`;
        /**
        * if the path not exist, should not do anything and throws out error
        **/
        if (!fileHelper.isFolderExist(gulpPath)) {
            errorHelper.handle({error: 'please install the gulp dependency'});
            return;
        }

        let command = `node ${this.path}/node_modules/gulp/bin/gulp.js prod`;

        execHelper.exec(command, (error) => {
            if (error) {
                errorHelper.handle(error);
                return ;
            }

            //delete terms.html
            const termsPath = `${this.path}/build/prod/terms.html`;

            fileHelper.deleteFoler(termsPath, () => {
                logHelper.log('checkout client branch');
                notifications.pub(events.CHECKOUT_CLIENT_BRANCH);
            });
        });
    }
}

module.exports = Release;