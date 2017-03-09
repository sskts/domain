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
Object.defineProperty(exports, "__esModule", { value: true });
const clone = require("clone");
const createDebug = require("debug");
const monapt = require("monapt");
const performance_1 = require("./mongoose/model/performance");
const debug = createDebug('sskts-domain:repository:performance');
class PerformanceRepositoryInterpreter {
    constructor(connection) {
        this.connection = connection;
        this.model = this.connection.model(performance_1.default.modelName);
    }
    find(conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = yield this.model.find(conditions)
                .setOptions({ maxTimeMS: 10000 })
                .populate('film')
                .populate('theater')
                .populate('screen')
                .exec();
            return docs.map((doc) => {
                return {
                    id: doc.get('id'),
                    theater: {
                        id: doc.get('theater').id,
                        name: doc.get('theater').name
                    },
                    screen: {
                        id: doc.get('screen').id,
                        name: doc.get('screen').name
                    },
                    film: {
                        id: doc.get('film').id,
                        name: doc.get('film').name,
                        name_kana: doc.get('film').name_kana,
                        name_short: doc.get('film').name_short,
                        name_original: doc.get('film').name_original,
                        minutes: doc.get('film').minutes
                    },
                    day: doc.get('day'),
                    time_start: doc.get('time_start'),
                    time_end: doc.get('time_end'),
                    canceled: doc.get('canceled')
                };
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.model.findById(id)
                .populate('film')
                .populate('theater')
                .populate('screen')
                .exec();
            if (doc) {
                return monapt.Option({
                    id: doc.get('id'),
                    theater: {
                        id: doc.get('theater').id,
                        name: doc.get('theater').name
                    },
                    screen: {
                        id: doc.get('screen').id,
                        name: doc.get('screen').name
                    },
                    film: {
                        id: doc.get('film').id,
                        name: doc.get('film').name,
                        name_kana: doc.get('film').name_kana,
                        name_short: doc.get('film').name_short,
                        name_original: doc.get('film').name_original,
                        minutes: doc.get('film').minutes
                    },
                    day: doc.get('day'),
                    time_start: doc.get('time_start'),
                    time_end: doc.get('time_end'),
                    canceled: doc.get('canceled')
                });
            }
            else {
                return monapt.None;
            }
        });
    }
    store(performance) {
        return __awaiter(this, void 0, void 0, function* () {
            debug('updating a performance...', performance);
            const update = clone(performance);
            yield this.model.findByIdAndUpdate(update.id, update, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
exports.default = PerformanceRepositoryInterpreter;
