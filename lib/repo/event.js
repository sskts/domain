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
const event_1 = require("./mongoose/model/event");
class Repository {
}
exports.Repository = Repository;
class StubRepository {
    // tslint:disable-next-line:prefer-function-over-method
    saveScreeningEvent(__) {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    // tslint:disable-next-line:prefer-function-over-method
    saveIndividualScreeningEvent(__) {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
}
exports.StubRepository = StubRepository;
/**
 * イベントレポジトリー
 *
 * @class EventRepository
 */
class MongoRepository {
    constructor(connection) {
        this.eventModel = connection.model(event_1.default.modelName);
    }
    /**
     * save a screening event
     * 上映イベントを保管する
     * @param screeningEvent screeningEvent object
     */
    saveScreeningEvent(screeningEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.eventModel.findOneAndUpdate({
                identifier: screeningEvent.identifier,
                typeOf: factory.eventType.ScreeningEvent
            }, screeningEvent, { upsert: true }).exec();
        });
    }
    /**
     * save a individual screening event
     * 個々の上映イベントを保管する
     * @param individualScreeningEvent individualScreeningEvent object
     */
    saveIndividualScreeningEvent(individualScreeningEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.eventModel.findOneAndUpdate({
                identifier: individualScreeningEvent.identifier,
                typeOf: factory.eventType.IndividualScreeningEvent
            }, individualScreeningEvent, { new: true, upsert: true }).exec();
        });
    }
}
exports.MongoRepository = MongoRepository;
