/**
 * 会員クレジットカードサービス
 * @namespace service.person.creditCard
 */

import * as GMO from '@motionpicture/gmo-service';
import * as factory from '@motionpicture/sskts-factory';
import * as createDebug from 'debug';

const debug = createDebug('sskts-domain:service:person:creditCard');

export type IOperation<T> = () => Promise<T>;
export type IUncheckedCardRaw = factory.paymentMethod.paymentCard.creditCard.IUncheckedCardRaw;
export type IUncheckedCardTokenized = factory.paymentMethod.paymentCard.creditCard.IUncheckedCardTokenized;

/**
 * クレジットカード追加
 * @export
 * @function
 * @memberof service.person.creditCard
 */
export function save(
    personId: string,
    username: string,
    creditCard: IUncheckedCardRaw | IUncheckedCardTokenized
): IOperation<GMO.services.card.ISearchCardResult> {
    return async () => {
        // GMOカード登録
        let addedCreditCard: GMO.services.card.ISearchCardResult;
        try {
            // まずGMO会員登録
            const memberId = personId;
            const memberName = username;
            const gmoMember = await GMO.services.card.searchMember({
                siteId: <string>process.env.GMO_SITE_ID,
                sitePass: <string>process.env.GMO_SITE_PASS,
                memberId: memberId
            });
            if (gmoMember === null) {
                const saveMemberResult = await GMO.services.card.saveMember({
                    siteId: <string>process.env.GMO_SITE_ID,
                    sitePass: <string>process.env.GMO_SITE_PASS,
                    memberId: memberId,
                    memberName: memberName
                });
                debug('GMO saveMember processed', saveMemberResult);
            }

            debug('saving a card to GMO...');
            const saveCardResult = await GMO.services.card.saveCard({
                siteId: <string>process.env.GMO_SITE_ID,
                sitePass: <string>process.env.GMO_SITE_PASS,
                memberId: memberId,
                seqMode: GMO.utils.util.SeqMode.Physics,
                cardNo: (<IUncheckedCardRaw>creditCard).cardNo,
                cardPass: (<IUncheckedCardRaw>creditCard).cardPass,
                expire: (<IUncheckedCardRaw>creditCard).expire,
                holderName: (<IUncheckedCardRaw>creditCard).holderName,
                token: (<IUncheckedCardTokenized>creditCard).token
            });
            debug('card saved', saveCardResult);

            const searchCardResults = await GMO.services.card.searchCard({
                siteId: <string>process.env.GMO_SITE_ID,
                sitePass: <string>process.env.GMO_SITE_PASS,
                memberId: memberId,
                seqMode: GMO.utils.util.SeqMode.Physics,
                cardSeq: saveCardResult.cardSeq
            });

            addedCreditCard = searchCardResults[0];
        } catch (error) {
            if (error.name === 'GMOServiceBadRequestError') {
                throw new factory.errors.Argument('creditCard', error.errors[0].content);
            } else {
                throw error;
            }
        }

        return addedCreditCard;
    };
}

/**
 * クレジットカード削除
 * @export
 * @function
 * @memberof service.person.creditCard
 */
export function unsubscribe(personId: string, cardSeq: string): IOperation<void> {
    return async () => {
        try {
            // GMOからカード削除
            const memberId = personId;
            const deleteCardResult = await GMO.services.card.deleteCard({
                siteId: <string>process.env.GMO_SITE_ID,
                sitePass: <string>process.env.GMO_SITE_PASS,
                memberId: memberId,
                seqMode: GMO.utils.util.SeqMode.Physics,
                cardSeq: cardSeq
            });
            debug('credit card deleted', deleteCardResult);
        } catch (error) {
            if (error.name === 'GMOServiceBadRequestError') {
                throw new factory.errors.Argument('cardSeq', error.errors[0].content);
            } else {
                throw error;
            }
        }
    };
}

/**
 * クレジットカード検索
 * @export
 * @function
 * @memberof service.person.creditCard
 */
export function find(
    personId: string,
    username: string
): IOperation<GMO.services.card.ISearchCardResult[]> {
    return async () => {
        // まずGMO会員登録
        const memberId = personId;
        const memberName = username;
        const gmoMember = await GMO.services.card.searchMember({
            siteId: <string>process.env.GMO_SITE_ID,
            sitePass: <string>process.env.GMO_SITE_PASS,
            memberId: memberId
        });
        if (gmoMember === null) {
            const saveMemberResult = await GMO.services.card.saveMember({
                siteId: <string>process.env.GMO_SITE_ID,
                sitePass: <string>process.env.GMO_SITE_PASS,
                memberId: memberId,
                memberName: memberName
            });
            debug('GMO saveMember processed', saveMemberResult);
        }

        return GMO.services.card.searchCard({
            siteId: <string>process.env.GMO_SITE_ID,
            sitePass: <string>process.env.GMO_SITE_PASS,
            memberId: memberId,
            seqMode: GMO.utils.util.SeqMode.Physics
        }).then((results) => {
            // 未削除のものに絞り込む
            return results.filter((result) => result.deleteFlag === '0');
        });
    };
}
