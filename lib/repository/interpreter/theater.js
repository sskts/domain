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
const monapt = require("monapt");
const theater_1 = require("./mongoose/model/theater");
class TheaterRepositoryInterpreter {
    constructor(connection) {
        this.connection = connection;
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(theater_1.default.modelName, theater_1.default.schema);
            const theater = yield model.findOne({ _id: id }).lean().exec();
            return (theater) ? monapt.Option(theater) : monapt.None;
        });
    }
    store(theater) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(theater_1.default.modelName, theater_1.default.schema);
            yield model.findOneAndUpdate({ _id: theater._id }, theater, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TheaterRepositoryInterpreter;
