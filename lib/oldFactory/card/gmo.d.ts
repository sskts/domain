/**
 * GMOカードファクトリー
 *
 * @namespace factory/card/gmo
 */
import * as GMO from '@motionpicture/gmo-service';
import * as CardFactory from '../card';
import * as GMOCardIDFactory from '../cardId/gmo';
/**
 * 有効性確認済みカード
 *
 * @export
 * @interface ICheckedCard
 * @extends {CardFactory.ICard}
 * @memberof factory/card/gmo
 */
export interface ICheckedCard extends CardFactory.ICard {
    /**
     * GMOカードID
     * @type {GMOCardIDFactory.GMOCardId}
     * @memberof ICheckedCard
     */
    id: GMOCardIDFactory.GMOCardId;
    /**
     * カード登録連番
     * @type {string}
     * @memberof ICheckedCard
     */
    card_seq: string;
    /**
     * カード会社略称
     * @type {string}
     * @memberof ICheckedCard
     */
    card_name: string;
    /**
     * カード番号
     * @type {string}
     * @memberof ICheckedCard
     */
    card_no: string;
    /**
     * 有効期限
     * @type {string}
     * @memberof ICheckedCard
     */
    expire: string;
    /**
     * 名義人
     * @type {string}
     * @memberof ICheckedCard
     */
    holder_name: string;
}
/**
 * 生の有効性確認前GMOカードインターフェース
 *
 * @interface IUncheckedCardRaw
 * @memberof factory/card/gmo
 */
export interface IUncheckedCardRaw {
    card_no: string;
    card_pass: string;
    expire: string;
    holder_name: string;
}
/**
 * トークン化有効性確認前GMOカードインターフェース
 *
 * @interface IUncheckedCardTokenized
 * @memberof factory/card/gmo
 */
export interface IUncheckedCardTokenized {
    token: string;
}
/**
 * GMOカード検索結果から有効性確認済みカードを作成する
 *
 * @export
 * @param {GMO.services.card.ISearchCardResult} searchCardResult GMOカード検索結果
 * @param {string} ownerId 所有者ID
 * @returns {ICheckedCard} 有効性確認済みカード
 * @memberof factory/card/gmo
 */
export declare function createCheckedCardFromGMOSearchCardResult(searchCardResult: GMO.services.card.ISearchCardResult, ownerId: string): ICheckedCard;
/**
 * 生の有効性確認前GMOカードを作成する
 *
 * @export
 * @param {string} args.card_no カード番号
 * @param {string} args.card_pass カードパスワード
 * @param {string} args.expire 有効期限 名義人
 * @param {string} args.holder_name
 * @returns {IUncheckedCardRaw} 生の有効性確認前GMOカード
 * @memberof factory/card/gmo
 */
export declare function createUncheckedCardRaw(args: {
    card_no: string;
    card_pass: string;
    expire: string;
    holder_name: string;
}): IUncheckedCardRaw;
/**
 * トークン化有効性確認前GMOカードを作成する
 *
 * @export
 * @param {string} args.token
 * @returns {IUncheckedCardTokenized} トークン化有効性確認前GMOカード
 * @memberof factory/card/gmo
 */
export declare function createUncheckedCardTokenized(args: {
    token: string;
}): IUncheckedCardTokenized;
