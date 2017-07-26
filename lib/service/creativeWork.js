"use strict";
/**
 * マスタサービス
 *
 * @namespace service/creativeWork
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
const createDebug = require("debug");
const MovieFactory = require("../factory/creativeWork/movie");
const creativeWorkType_1 = require("../factory/creativeWorkType");
const debug = createDebug('sskts-domain:service:creativeWork');
/**
 * 映画作品インポート
 */
function importMovies(theaterCode) {
    return (creativeWorkAdapter) => __awaiter(this, void 0, void 0, function* () {
        // COAから作品取得
        const filmsFromCOA = yield COA.services.master.title({ theaterCode: theaterCode });
        // 永続化
        yield Promise.all(filmsFromCOA.map((filmFromCOA) => __awaiter(this, void 0, void 0, function* () {
            const movie = MovieFactory.createFromCOA(filmFromCOA);
            debug('storing movie...', movie);
            yield creativeWorkAdapter.creativeWorkModel.findOneAndUpdate({
                identifier: movie.identifier,
                typeOf: creativeWorkType_1.default.Movie
            }, movie, { upsert: true }).exec();
            debug('movie stored.');
        })));
    });
}
exports.importMovies = importMovies;
