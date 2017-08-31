"use strict";
/**
 * 場所サービス
 *
 * @namespace service/place
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
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const debug = createDebug('sskts-domain:service:place');
/**
 * 劇場インポート
 */
function importMovieTheater(theaterCode) {
    return (placeRepository) => __awaiter(this, void 0, void 0, function* () {
        const movieTheater = factory.place.movieTheater.createFromCOA(yield COA.services.master.theater({ theaterCode: theaterCode }), yield COA.services.master.screen({ theaterCode: theaterCode }));
        debug('storing movieTheater...', movieTheater);
        yield placeRepository.placeModel.findOneAndUpdate({
            branchCode: movieTheater.branchCode
        }, movieTheater, { upsert: true }).exec();
        debug('movieTheater stored.');
    });
}
exports.importMovieTheater = importMovieTheater;
/**
 * 劇場検索
 */
function searchMovieTheaters(searchConditions) {
    return (placeRepository) => __awaiter(this, void 0, void 0, function* () {
        // 検索条件を作成
        const conditions = {
            typeOf: factory.placeType.MovieTheater
        };
        debug('searchConditions:', searchConditions);
        // todo 検索条件を指定できるように改修
        debug('finding places...', conditions);
        return yield placeRepository.placeModel.find(conditions, 'typeOf branchCode name kanaName url')
            .setOptions({ maxTimeMS: 10000 })
            .exec()
            .then((docs) => {
            return docs.map((doc) => {
                const movieTheater = doc.toObject();
                return {
                    typeOf: movieTheater.typeOf,
                    screenCount: movieTheater.screenCount,
                    branchCode: movieTheater.branchCode,
                    name: movieTheater.name,
                    kanaName: movieTheater.kanaName,
                    url: movieTheater.url
                };
            });
        });
    });
}
exports.searchMovieTheaters = searchMovieTheaters;
/**
 * 枝番号で劇場検索
 */
function findMovieTheaterByBranchCode(branchCode) {
    return (placeRepository) => __awaiter(this, void 0, void 0, function* () {
        const doc = yield placeRepository.placeModel.findOne({
            typeOf: factory.placeType.MovieTheater,
            branchCode: branchCode
        }).exec();
        if (doc === null) {
            throw new factory.errors.NotFound('movieTheater');
        }
        return doc.toObject();
    });
}
exports.findMovieTheaterByBranchCode = findMovieTheaterByBranchCode;
