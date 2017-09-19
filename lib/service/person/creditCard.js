"use strict";
/**
 * 会員クレジットカードサービス
 * @namespace service.person.creditCard
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
const GMO = require("@motionpicture/gmo-service");
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const debug = createDebug('sskts-domain:service:person:creditCard');
/**
 * クレジットカード追加
 * @export
 * @function
 * @memberof service.person.creditCard
 */
function save(personId, username, creditCard) {
    return () => __awaiter(this, void 0, void 0, function* () {
        // GMOカード登録
        let addedCreditCard;
        try {
            // まずGMO会員登録
            const memberId = personId;
            const memberName = username;
            const gmoMember = yield GMO.services.card.searchMember({
                siteId: process.env.GMO_SITE_ID,
                sitePass: process.env.GMO_SITE_PASS,
                memberId: memberId
            });
            if (gmoMember === null) {
                const saveMemberResult = yield GMO.services.card.saveMember({
                    siteId: process.env.GMO_SITE_ID,
                    sitePass: process.env.GMO_SITE_PASS,
                    memberId: memberId,
                    memberName: memberName
                });
                debug('GMO saveMember processed', saveMemberResult);
            }
            debug('saving a card to GMO...');
            const saveCardResult = yield GMO.services.card.saveCard({
                siteId: process.env.GMO_SITE_ID,
                sitePass: process.env.GMO_SITE_PASS,
                memberId: memberId,
                seqMode: GMO.utils.util.SeqMode.Physics,
                cardNo: creditCard.cardNo,
                cardPass: creditCard.cardPass,
                expire: creditCard.expire,
                holderName: creditCard.holderName,
                token: creditCard.token
            });
            debug('card saved', saveCardResult);
            const searchCardResults = yield GMO.services.card.searchCard({
                siteId: process.env.GMO_SITE_ID,
                sitePass: process.env.GMO_SITE_PASS,
                memberId: memberId,
                seqMode: GMO.utils.util.SeqMode.Physics,
                cardSeq: saveCardResult.cardSeq
            });
            addedCreditCard = searchCardResults[0];
        }
        catch (error) {
            if (error.name === 'GMOServiceBadRequestError') {
                throw new factory.errors.Argument('creditCard', error.errors[0].content);
            }
            else {
                throw error;
            }
        }
        return addedCreditCard;
    });
}
exports.save = save;
/**
 * クレジットカード削除
 * @export
 * @function
 * @memberof service.person.creditCard
 */
function unsubscribe(personId, cardSeq) {
    return () => __awaiter(this, void 0, void 0, function* () {
        try {
            // GMOからカード削除
            const memberId = personId;
            const deleteCardResult = yield GMO.services.card.deleteCard({
                siteId: process.env.GMO_SITE_ID,
                sitePass: process.env.GMO_SITE_PASS,
                memberId: memberId,
                seqMode: GMO.utils.util.SeqMode.Physics,
                cardSeq: cardSeq
            });
            debug('credit card deleted', deleteCardResult);
        }
        catch (error) {
            if (error.name === 'GMOServiceBadRequestError') {
                throw new factory.errors.Argument('cardSeq', error.errors[0].content);
            }
            else {
                throw error;
            }
        }
    });
}
exports.unsubscribe = unsubscribe;
/**
 * クレジットカード検索
 * @export
 * @function
 * @memberof service.person.creditCard
 */
function find(personId, username) {
    return () => __awaiter(this, void 0, void 0, function* () {
        // まずGMO会員登録
        const memberId = personId;
        const memberName = username;
        const gmoMember = yield GMO.services.card.searchMember({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: memberId
        });
        if (gmoMember === null) {
            const saveMemberResult = yield GMO.services.card.saveMember({
                siteId: process.env.GMO_SITE_ID,
                sitePass: process.env.GMO_SITE_PASS,
                memberId: memberId,
                memberName: memberName
            });
            debug('GMO saveMember processed', saveMemberResult);
        }
        return yield GMO.services.card.searchCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: memberId,
            seqMode: GMO.utils.util.SeqMode.Physics
        }).then((results) => {
            // 未削除のものに絞り込む
            return results.filter((result) => result.deleteFlag === '0');
        });
    });
}
exports.find = find;
