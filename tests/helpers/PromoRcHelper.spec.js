'use strict';

var expect = require('chai').expect;
var PromoRcHelper = require('../../helpers/promorc-helper');
var FileHelper = require('../../helpers/file-helper');

describe('PromoRcHelper', () => {
    let testPath = '/Users/enhui.zhu/Documents/workspace/promotions/starspins/star-kitchen';
    let testPath2 = '/Users/enhui.zhu/Documents/workspace/promotions/virgingames/prize-tag';
    
    it('isPromoRcExist', () => {
        if (FileHelper.isFolderExist(testPath)) {
            expect(PromoRcHelper.isPromoRcExist(testPath)).to.be.false;
            // expect(PromoRcHelper.isPromoRcExist(test2Path)).to.be.false;
        }
    });

    it('createPromoRc', () => {
        PromoRcHelper.createPromoRc(testPath2);
    });

    it('getConfigFromPromoRc', () => {
        let result = PromoRcHelper.getConfigFromPromoRc(testPath2);
        expect(result).to.be.false;
    });
});
