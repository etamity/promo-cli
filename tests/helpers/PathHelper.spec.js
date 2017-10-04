'use strict';

var PathHelper = require('../../helpers/path-helper');
var expect = require('chai').expect;


describe('PathHelper', () => {
    it('getPromotionPath', () => {
        expect(PathHelper.getPromotionPath()).to.be.a('string');
    });

    it('getVenturePath', () => {
        expect(PathHelper.getVenturePath('heartbingo')).to.be.a('string');
    });
});