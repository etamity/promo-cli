'use strict';

const FileHelper = require('../helpers/file-helper');
const PromptHelper = require('../helpers/prompt-helper');
const TaskHelper = require('../helpers/task-helper');
const logger = require('../helpers/log-helper');
const GitHelper = require('../helpers/git-helper');
const ExecHelper = require('../helpers/exec-helper');
const Messages = require('../constants/msg');
class project {
    constructor(projectName) {
        this.projectName = projectName;
        this.templatePath = __basedir + '/templates/';
        this.createProjectFolder();
    }

    checkTemplates () {
          if (!FileHelper.isFolderExist(this.templatePath)) {
              GitHelper.cloneAllTemplates(this.getTemplate.bind(this));
          } else {
              GitHelper.pullAllTemplates(this.getTemplate.bind(this));
          }
    }

    createProjectFolder() {
        this.destFolderPath = `${process.cwd()}/${this.projectName}`;

        if (!FileHelper.isFolderExist(this.destFolderPath)) {
            FileHelper.createFolder(this.destFolderPath, (err) => {
                if (err) {
                    logger.log('err', err);
                } else {
                    logger.log(' folder created success');

                    this.checkTemplates();
                }
            });
        } else {
            PromptHelper.get('Folder existed', Messages.FOLDER_EXISTED_MSG).then(result => {
                if (result === 'y') {
                    FileHelper.deleteFoler( this.destFolderPath, () => {
                        FileHelper.createFolder(this.destFolderPath, (err) => {
                            if (err) {
                                logger.log('err', err);
                            } else {
                                logger.log(' folder created success');

                                this.checkTemplates();
                            }
                        });
                    });
                } else {
                    logger.error('Aborted opration!');
                }
            });

        }
    }


    getTemplate() {
        const templates = FileHelper.getTemplateNames(this.templatePath);

        PromptHelper.get('answer', TaskHelper.listTemplates(templates)).then(answer => {
            try{
                console.log(answer, templates.length);
                if (!isNaN(answer) && answer >= 0 && answer <= templates.length)
                {
                    this.template = templates[answer - 1];
                    this.copyTemplate();
                } else {
                    logger.error('Wrong Input! Please input number.');
                    this.getTemplate();
                }
            } catch (e) {
                logger.error(e);
            }
        });
    }

    copyTemplate() {
        let from = `${this.templatePath}/${this.template}/`;
        
        const command = `cd ${this.destFolderPath} && npm i`;

        logger.log('installing dependencies ....');

        TaskHelper.copyTemplate(from, this.destFolderPath).then(() => {

            ExecHelper.exec(command, (err) => {
                if (err) {
                    logger.error(err);
                }
                logger.log(`${this.destFolderPath} has been created successfully!`);
            });
        });
    }
}

module.exports = project;