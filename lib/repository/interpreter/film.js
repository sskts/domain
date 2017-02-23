/**
 * 作品リポジトリ
 *
 * @class FilmRepositoryInterpreter
 */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const createDebug = require("debug");
const monapt = require("monapt");
const film_1 = require("../../model/film");
const film_2 = require("./mongoose/model/film");
const debug = createDebug('sskts-domain:repository:film');
class FilmRepositoryInterpreter {
    constructor(connection) {
        this.connection = connection;
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(film_2.default.modelName);
            const doc = yield model.findOne({ _id: id }).exec();
            return (doc) ? monapt.Option(film_1.default.create(doc.toObject())) : monapt.None;
        });
    }
    store(film) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(film_2.default.modelName);
            debug('updating a film...', film);
            yield model.findOneAndUpdate({ _id: film.id }, film.toDocument(), {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FilmRepositoryInterpreter;
