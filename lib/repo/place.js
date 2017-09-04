"use strict";
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
const place_1 = require("./mongoose/model/place");
const debug = createDebug('sskts-domain:repository:place');
/**
 * 場所レポジトリー
 *
 * @class PlaceRepository
 */
class PlaceRepository {
    constructor(connection) {
        this.placeModel = connection.model(place_1.default.modelName);
    }
    /**
     * save a movie theater
     * 劇場を保管する
     * @param movieTheater movieTheater object
     */
    saveMovieTheater(movieTheater) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.placeModel.findOneAndUpdate({
                branchCode: movieTheater.branchCode
            }, movieTheater, { upsert: true }).exec();
        });
    }
    /**
     * 劇場検索
     */
    searchMovieTheaters(searchConditions) {
        return __awaiter(this, void 0, void 0, function* () {
            // 検索条件を作成
            const conditions = {
                typeOf: factory.placeType.MovieTheater
            };
            debug('searchConditions:', searchConditions);
            // todo 検索条件を指定できるように改修
            debug('finding places...', conditions);
            // containsPlaceを含めるとデータサイズが大きくなるので、検索結果には含めない
            return yield this.placeModel.find(conditions, 'typeOf branchCode name kanaName url')
                .setOptions({ maxTimeMS: 10000 })
                .exec()
                .then((docs) => {
                return docs.map((doc) => {
                    const movieTheater = doc.toObject();
                    return {
                        typeOf: movieTheater.typeOf,
                        identifier: movieTheater.identifier,
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
    /**
     * 枝番号で劇場検索
     */
    findMovieTheaterByBranchCode(branchCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.placeModel.findOne({
                typeOf: factory.placeType.MovieTheater,
                branchCode: branchCode
            }).exec();
            if (doc === null) {
                throw new factory.errors.NotFound('movieTheater');
            }
            return doc.toObject();
        });
    }
}
exports.default = PlaceRepository;
