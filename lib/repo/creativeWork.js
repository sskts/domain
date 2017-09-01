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
const creativeWork_1 = require("./mongoose/model/creativeWork");
/**
 * 作品レポジトリー
 *
 * @class CreativeWorkRepository
 */
class CreativeWorkRepository {
    constructor(connection) {
        this.creativeWorkModel = connection.model(creativeWork_1.default.modelName);
    }
    /**
     * save a movie
     * 映画作品を保管する
     * @param movie movie object
     */
    saveMovie(movie) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.creativeWorkModel.findOneAndUpdate({
                identifier: movie.identifier,
                typeOf: factory.creativeWorkType.Movie
            }, movie, { upsert: true }).exec();
        });
    }
}
exports.default = CreativeWorkRepository;
