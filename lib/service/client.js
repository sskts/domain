"use strict";
/**
 * client service
 * @namespace service/client
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
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const debug = createDebug('sskts-domain:service:client');
function pushEvent(params) {
    return (clientAdapter) => __awaiter(this, void 0, void 0, function* () {
        // tslint:disable-next-line:no-suspicious-comment
        // TODO クライアントの存在確認
        // イベント作成
        const clientEvent = factory.clientEvent.create(params);
        debug('creating a clientEvent...', clientEvent);
        // ドキュメント作成(idが既に存在していればユニーク制約ではじかれる)
        yield clientAdapter.clientEventModel.findByIdAndUpdate(clientEvent.id, clientEvent, { upsert: true }).exec();
        return clientEvent;
    });
}
exports.pushEvent = pushEvent;
