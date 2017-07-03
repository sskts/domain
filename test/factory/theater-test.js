"use strict";
/**
 * 劇場ファクトリーテスト
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const COA = require("@motionpicture/coa-service");
const assert = require("assert");
const argumentNull_1 = require("../../lib/error/argumentNull");
const TheaterFactory = require("../../lib/factory/theater");
const theaterWebsiteGroup_1 = require("../../lib/factory/theaterWebsiteGroup");
const TEST_THEATER_CODE = '118';
const TEST_CREATE_WEBSITE_ARGS = {
    group: theaterWebsiteGroup_1.default.PORTAL,
    name: {
        en: 'xxx',
        ja: 'xxx'
    },
    // tslint:disable-next-line:no-http-string
    url: 'http://example.com'
};
describe('取引ファクトリー COA情報から必須フィールドを作成する', () => {
    it('作成できる', () => __awaiter(this, void 0, void 0, function* () {
        const theaterFromCOA = yield COA.MasterService.theater({
            theater_code: TEST_THEATER_CODE
        });
        assert.doesNotThrow(() => {
            TheaterFactory.createFromCOA(theaterFromCOA);
        });
    }));
});
describe('取引ファクトリー オプショナルな初期情報を作成する', () => {
    it('作成できる', () => __awaiter(this, void 0, void 0, function* () {
        assert.doesNotThrow(() => {
            TheaterFactory.createInitialOptionalFields();
        });
    }));
});
describe('取引ファクトリー ウェブサイト作成', () => {
    it('作成できる', () => {
        assert.doesNotThrow(() => {
            TheaterFactory.createWebsite(TEST_CREATE_WEBSITE_ARGS);
        });
    });
    it('グループが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_WEBSITE_ARGS, { group: '' });
        assert.throws(() => {
            TheaterFactory.createWebsite(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'group');
            return true;
        });
    });
    it('名称enが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_WEBSITE_ARGS, { name: { en: '', ja: 'xxx' } });
        assert.throws(() => {
            TheaterFactory.createWebsite(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'name.en');
            return true;
        });
    });
    it('名称jaが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_WEBSITE_ARGS, { name: { en: 'xxx', ja: '' } });
        assert.throws(() => {
            TheaterFactory.createWebsite(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'name.ja');
            return true;
        });
    });
    it('urlが空なので作成できない', () => {
        const args = Object.assign({}, TEST_CREATE_WEBSITE_ARGS, { url: '' });
        assert.throws(() => {
            TheaterFactory.createWebsite(args);
        }, (err) => {
            assert(err instanceof argumentNull_1.default);
            assert.equal(err.argumentName, 'url');
            return true;
        });
    });
});
