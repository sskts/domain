"use strict";
/**
 * GMOカードファクトリー
 *
 * @namespace factory/card/gmo
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cardGroup_1 = require("../cardGroup");
function createCheckedCardFromGMOSearchCardResult(args) {
    return {
        group: cardGroup_1.default.GMO,
        card_seq: args.cardSeq,
        card_name: args.cardName,
        card_no: args.cardNo,
        expire: args.expire,
        holder_name: args.holderName
    };
}
exports.createCheckedCardFromGMOSearchCardResult = createCheckedCardFromGMOSearchCardResult;
