/**
 * スクリーンリポジトリ
 *
 * @class ScreenAdapter
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
const screen_1 = require("./mongoose/model/screen");
const debug = createDebug('sskts-domain:adapter:screen');
class ScreenAdapter {
    constructor(connection) {
        this.connection = connection;
        this.model = this.connection.model(screen_1.default.modelName);
    }
    store(screen) {
        return __awaiter(this, void 0, void 0, function* () {
            debug('updating a screen...', screen);
            const update = clone(screen, false);
            yield this.model.findByIdAndUpdate(update.id, update, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
}
exports.default = ScreenAdapter;
