/**
 * スクリーンリポジトリ
 *
 * @class ScreenRepositoryInterpreter
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
const screen_1 = require("../../model/screen");
const screen_2 = require("./mongoose/model/screen");
const debug = createDebug('sskts-domain:repository:screen');
class ScreenRepositoryInterpreter {
    constructor(connection) {
        this.connection = connection;
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(screen_2.default.modelName);
            const doc = yield model.findOne({ _id: id })
                .populate('theater')
                .exec();
            return (doc) ? monapt.Option(screen_1.default.create(doc.toObject())) : monapt.None;
        });
    }
    findByTheater(theaterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(screen_2.default.modelName);
            const docs = yield model.find({ theater: theaterId })
                .populate('theater')
                .exec();
            return docs.map((doc) => screen_1.default.create(doc.toObject()));
        });
    }
    store(screen) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(screen_2.default.modelName);
            debug('updating a screen...', screen);
            yield model.findOneAndUpdate({ _id: screen.id }, screen.toDocument(), {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ScreenRepositoryInterpreter;
