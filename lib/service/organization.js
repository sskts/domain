"use strict";
/**
 * 組織サービス
 *
 * @namespace service/organization
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
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const debug = createDebug('sskts-domain:service:organization');
/**
 * 劇場検索
 */
function searchMovieTheaters(searchConditions) {
    return (organizationRepository) => __awaiter(this, void 0, void 0, function* () {
        // 検索条件を作成
        const conditions = {
            typeOf: factory.organizationType.MovieTheater
        };
        debug('searchConditions:', searchConditions);
        // todo 検索条件を指定できるように改修
        debug('searching movie theaters...', conditions);
        // GMOのセキュアな情報を公開しないように注意
        return yield organizationRepository.organizationModel.find(conditions, 'identifier name legalName typeOf location url branchCode parentOrganization gmoInfo.shopId')
            .setOptions({ maxTimeMS: 10000 })
            .exec()
            .then((docs) => docs.map((doc) => doc.toObject()));
    });
}
exports.searchMovieTheaters = searchMovieTheaters;
/**
 * 枝番号で劇場検索
 */
function findMovieTheaterByBranchCode(branchCode) {
    return (organizationRepository) => __awaiter(this, void 0, void 0, function* () {
        const doc = yield organizationRepository.organizationModel.findOne({
            typeOf: factory.organizationType.MovieTheater,
            'location.branchCode': branchCode
        }, 'identifier name legalName typeOf location url branchCode parentOrganization gmoInfo.shopId').exec();
        if (doc === null) {
            throw new factory.errors.NotFound('movieTheater');
        }
        return doc.toObject();
    });
}
exports.findMovieTheaterByBranchCode = findMovieTheaterByBranchCode;
