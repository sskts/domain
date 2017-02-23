/**
 * 劇場リポジトリ
 *
 * @class TheaterRepositoryInterpreter
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
const theater_1 = require("../../model/theater");
const theater_2 = require("./mongoose/model/theater");
const debug = createDebug('sskts-domain:repository:theater');
class TheaterRepositoryInterpreter {
    constructor(connection) {
        this.connection = connection;
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(theater_2.default.modelName);
            debug('finding theater...', id);
            const doc = yield model.findOne({ _id: id }).exec();
            debug('theater found.', doc);
            return (doc) ? monapt.Option(theater_1.default.create(doc.toObject())) : monapt.None;
        });
    }
    store(theater) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(theater_2.default.modelName);
            debug('waiting findOneAndUpdate...', theater);
            yield model.findOneAndUpdate({ _id: theater.id }, theater, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TheaterRepositoryInterpreter;
