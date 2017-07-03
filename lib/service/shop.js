"use strict";
/**
 * ショップサービス
 *
 * @namespace service/shop
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
function open(theater) {
    return (theaterAdapter) => __awaiter(this, void 0, void 0, function* () {
        yield theaterAdapter.model.findByIdAndUpdate(theater.id, {
            // 存在しない場合のみ更新(既にあれば何もしない)
            $setOnInsert: theater
        }, { upsert: true }).exec();
    });
}
exports.open = open;
