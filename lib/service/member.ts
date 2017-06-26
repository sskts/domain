/**
 * 会員サービス
 *
 * @namespace service/member
 */

import * as GMO from '@motionpicture/gmo-service';
import * as bcrypt from 'bcryptjs';
import * as createDebug from 'debug';
import * as monapt from 'monapt';

import ArgumentError from '../error/argument';

import AssetAdapter from '../adapter/asset';
import OwnerAdapter from '../adapter/owner';

import * as SeatReservationAssetFactory from '../factory/asset/seatReservation';
import AssetGroup from '../factory/assetGroup';
import * as GMOCardFactory from '../factory/card/gmo';
import * as MemberOwnerFactory from '../factory/owner/member';
import OwnerGroup from '../factory/ownerGroup';

const debug = createDebug('sskts-domain:service:member');

export type IOperation<T> = () => Promise<T>;
export type IOwnerOperation<T> = (ownerAdapter: OwnerAdapter) => Promise<T>;
export type IAssetAndOwnerOperation<T> = (assetAdapter: AssetAdapter, ownerAdapter: OwnerAdapter) => Promise<T>;
export interface ILoginResult {
    id: string;
    username: string;
}

/**
 * ログイン
 *
 * @export
 * @param {string} username ユーザーネーム
 * @param {string} password パスワード
 * @returns {IOwnerOperation<monapt.Option<MemberOwnerFactory.IUnhashedFields>>} 所有者に対する操作
 * @memberof service/member
 */
export function login(username: string, password: string): IOwnerOperation<monapt.Option<ILoginResult>> {
    return async (ownerAdapter: OwnerAdapter) => {
        // ユーザーネームで検索
        const memberOwnerDoc = await ownerAdapter.model.findOne(
            {
                username: username,
                group: OwnerGroup.MEMBER
            },
            'username password_hash'
        ).exec();
        debug('member owner doc found', memberOwnerDoc);

        if (memberOwnerDoc === null) {
            return monapt.None;
        }

        // パスワード整合性確認
        debug('comparing passwords...');
        if (!await bcrypt.compare(password, memberOwnerDoc.get('password_hash'))) {
            return monapt.None;
        }

        // ハッシュ化パスワードは返さない
        return monapt.Option({
            id: memberOwnerDoc.get('id'),
            username: memberOwnerDoc.get('username')
        });
    };
}

/**
 * プロフィール更新
 * 更新フィールドを全て上書きするので注意
 *
 * @export
 * @param {string} ownerId 所有者ID
 * @param {MemberOwnerFactory.IVariableFields} update 更新フィールド
 * @returns {IOwnerOperation<void>} 所有者に対する操作
 * @memberof service/member
 */
export function updateProfile(ownerId: string, update: MemberOwnerFactory.IVariableFields): IOwnerOperation<void> {
    return async (ownerAdapter: OwnerAdapter) => {
        // バリデーション
        MemberOwnerFactory.validateVariableFields(update);

        const memberOwnerDoc = await ownerAdapter.model.findByIdAndUpdate(
            ownerId,
            {
                name_first: update.name_first,
                name_last: update.name_last,
                email: update.email,
                tel: update.tel,
                description: update.description,
                notes: update.notes
            }
        ).exec();
        if (memberOwnerDoc === null) {
            throw new ArgumentError('ownerId', `owner[id:${ownerId}] not found`);
        }
    };
}

/**
 * カードを追加する
 *
 * @export
 * @param {string} ownerId 所有者ID
 * @param {(GMOCardFactory.IGMOCardRaw | GMOCardFactory.IGMOCardTokenized)} card GMOカードオブジェクト
 * @returns {IOperation<string>} 操作
 * @memberof service/member
 */
export function addCard(ownerId: string, card: GMOCardFactory.IGMOCardRaw | GMOCardFactory.IGMOCardTokenized): IOperation<string> {
    return async () => {
        // GMOカード登録
        debug('saving a card to GMO...', card);
        const saveCardResult = await GMO.services.card.saveCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: ownerId,
            seqMode: GMO.utils.util.SEQ_MODE_PHYSICS,
            cardNo: (<GMOCardFactory.IGMOCardRaw>card).cardNo,
            cardPass: (<GMOCardFactory.IGMOCardRaw>card).cardPass,
            expire: (<GMOCardFactory.IGMOCardRaw>card).expire,
            holderName: (<GMOCardFactory.IGMOCardRaw>card).holderName,
            token: (<GMOCardFactory.IGMOCardTokenized>card).token
        });
        debug('card saved', saveCardResult);

        return saveCardResult.cardSeq;
    };
}

/**
 * カード削除
 *
 * @export
 * @param {string} ownerId 所有者ID
 * @param {string} cardSeq GMO側のカード登録連番
 * @returns {IOperation<void>} 操作
 * @memberof service/member
 */
export function removeCard(ownerId: string, cardSeq: string): IOperation<void> {
    return async () => {
        // GMOカード削除
        debug('removing a card from GMO...cardSeq:', cardSeq);
        const deleteCardResult = await GMO.services.card.deleteCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: ownerId,
            seqMode: GMO.utils.util.SEQ_MODE_PHYSICS,
            cardSeq: cardSeq
        });
        debug('card deleted', deleteCardResult);
    };
}

export function findSeatReservationAssets(ownerId: string): IAssetAndOwnerOperation<SeatReservationAssetFactory.ISeatReservationAsset[]> {
    return async (assetAdapter: AssetAdapter, ownerAdapter: OwnerAdapter) => {
        // 会員存在確認
        const memberOwnerDoc = await ownerAdapter.model.findById(ownerId, '_id').exec();
        debug('member owner doc found', memberOwnerDoc);

        // 資産全検索
        // todo add limit
        return await assetAdapter.model.find({
            group: AssetGroup.SEAT_RESERVATION,
            'ownership.owner': ownerId
        }).exec()
            .then((docs) => docs.map((doc) => <SeatReservationAssetFactory.ISeatReservationAsset>doc.toObject()));
    };
}
