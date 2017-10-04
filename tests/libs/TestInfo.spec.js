'use strict';

const testinfo = require('../../libs/testinfo');
const config = require('../../configs/config');
const expect = require('chai').expect;
const logHelper = require('../../helpers/log-helper');

describe('testinfo', () => {
    it('Generate String', () => {
        const output = testinfo.generateTestinfo('virgingames','17-08-2017', 'aug17-the-quick-draw', true, config.info);
        logHelper.log(output);
    });
});