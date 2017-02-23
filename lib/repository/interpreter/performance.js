/**
 * パフォーマンスリポジトリ
 *
 * todo パフォーマンス取得時にpopulateする必要がないようにスキーマを見直す
 *
 * @class PerformanceRepositoryInterpreter
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
const performance_1 = require("../../model/performance");
const screen_1 = require("../../model/screen");
const theater_1 = require("../../model/theater");
const performance_2 = require("./mongoose/model/performance");
const debug = createDebug('sskts-domain:repository:performance');
class PerformanceRepositoryInterpreter {
    constructor(connection) {
        this.connection = connection;
    }
    find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(performance_2.default.modelName);
            const docs = yield model.find(conditions)
                .populate('film')
                .populate('theater')
                .populate('screen')
                .exec();
            return docs.map((doc) => {
                const object = doc.toObject();
                object.theater = theater_1.default.create(doc.get('theater'));
                object.screen = screen_1.default.create(doc.get('screen'));
                object.film = film_1.default.create(doc.get('film'));
                return performance_1.default.create(object);
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(performance_2.default.modelName);
            const doc = yield model.findById(id)
                .populate('film')
                .populate('theater')
                .populate('screen')
                .exec();
            if (doc) {
                const object = doc.toObject();
                object.theater = theater_1.default.create(doc.get('theater'));
                object.screen = screen_1.default.create(doc.get('screen'));
                object.film = film_1.default.create(doc.get('film'));
                return monapt.Option(performance_1.default.create(object));
            }
            else {
                return monapt.None;
            }
        });
    }
    store(performance) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.connection.model(performance_2.default.modelName);
            debug('updating a performance...', performance);
            yield model.findByIdAndUpdate(performance.id, performance.toDocument(), {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PerformanceRepositoryInterpreter;
