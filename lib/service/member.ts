/**
 * 会員サービス
 *
 * @namespace service/member
 */

// import * as GMO from '@motionpicture/gmo-service';
// import * as bcrypt from 'bcryptjs';
// import * as createDebug from 'debug';
// import * as monapt from 'monapt';

// import AlreadyInUseError from '../error/alreadyInUse';
// import ArgumentError from '../error/argument';

// import AssetAdapter from '../adapter/asset';
// import OwnerAdapter from '../adapter/owner';

// import * as GMOCardFactory from '../factory/card/gmo';
// import * as GMOCardIdFactory from '../factory/cardId/gmo';

// const debug = createDebug('sskts-domain:service:member');

// export type IOperation<T> = () => Promise<T>;
// export type IAssetOperation<T> = (assetAdapter: AssetAdapter) => Promise<T>;
// export type IOwnerOperation<T> = (ownerAdapter: OwnerAdapter) => Promise<T>;
// export type IAssetAndOwnerOperation<T> = (assetAdapter: AssetAdapter, ownerAdapter: OwnerAdapter) => Promise<T>;
// export interface ILoginResult {
//     id: string;
//     username: string;
// }

/**
 * 新規登録
 *
 * @export
 * @param {MemberOwnerFactory.IMemberOwner} owner 会員所有者
 * @returns {IOwnerOperation<void>} 結果を取得する操作
 */
// export function signUp(owner: MemberOwnerFactory.IOwner): IOwnerOperation<void> {
//     return async (ownerAdapter: OwnerAdapter) => {
//         // まずGMO会員登録
//         const saveMemberResult = await GMO.services.card.saveMember({
//             siteId: process.env.GMO_SITE_ID,
//             sitePass: process.env.GMO_SITE_PASS,
//             memberId: owner.id,
//             memberName: `${owner.name_last} ${owner.name_first}`
//         });
//         debug('GMO saveMember processed', saveMemberResult);

//         // 永続化
//         try {
//             const ownerDoc = await ownerAdapter.model.create({ ...owner, ...{ _id: owner.id } });
//             debug('owner created', ownerDoc);
//         } catch (error) {
//             // todo エラーコード管理を整理する
//             // tslint:disable-next-line:no-magic-numbers
//             if (error.name === 'MongoError' && error.code === 11000) {
//                 // throw new AlreadyInUseError('owners', ['username'], 'username already exsits');
//                 throw new AlreadyInUseError('owners', ['username']);
//             }

//             throw error;
//         }
//     };
// }

/**
 * ログイン
 *
 * @export
 * @param {string} username ユーザーネーム
 * @param {string} password パスワード
 * @returns {IOwnerOperation<monapt.Option<MemberOwnerFactory.IUnhashedFields>>} 所有者に対する操作
 * @memberof service/member
 */
// export function login(username: string, password: string): IOwnerOperation<monapt.Option<ILoginResult>> {
//     return async (ownerAdapter: OwnerAdapter) => {
//         // ユーザーネームで検索
//         const memberOwnerDoc = await ownerAdapter.model.findOne(
//             {
//                 username: username,
//                 group: OwnerGroup.MEMBER
//             },
//             'username password_hash'
//         ).exec();
//         debug('member owner doc found', memberOwnerDoc);

//         if (memberOwnerDoc === null) {
//             return monapt.None;
//         }

//         // パスワード整合性確認
//         debug('comparing passwords...');
//         if (!await bcrypt.compare(password, memberOwnerDoc.get('password_hash'))) {
//             return monapt.None;
//         }

//         // ハッシュ化パスワードは返さない
//         return monapt.Option({
//             id: memberOwnerDoc.get('id'),
//             username: memberOwnerDoc.get('username')
//         });
//     };
// }

/**
 * プロフィール取得
 *
 * @export
 * @param {string} ownerId 所有者ID
 * @returns {IOwnerOperation<monapt.Option<MemberOwnerFactory.IUnhashedFields>>} 会員のハッシュ化されていないフィールドを取得するための、所有者に対する操作
 */
// export function getProfile(ownerId: string): IOwnerOperation<monapt.Option<MemberOwnerFactory.IUnhashedFields>> {
//     return async (ownerAdapter: OwnerAdapter) => {
//         const memberOwnerDoc = await ownerAdapter.model.findById(ownerId).exec();
//         if (memberOwnerDoc === null) {
//             return monapt.None;
//         }

//         return monapt.Option(MemberOwnerFactory.createUnhashedFields(<any>memberOwnerDoc.toObject()));
//     };
// }

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
// export function updateProfile(ownerId: string, update: MemberOwnerFactory.IVariableFields): IOwnerOperation<void> {
//     return async (ownerAdapter: OwnerAdapter) => {
//         // バリデーション
//         const variableFields = MemberOwnerFactory.createVariableFields(update);
//         const memberOwnerDoc = await ownerAdapter.model.findByIdAndUpdate(
//             ownerId,
//             variableFields
//         ).exec();
//         if (memberOwnerDoc === null) {
//             throw new ArgumentError('ownerId', `owner[id:${ownerId}] not found`);
//         }
//     };
// }

/**
 * カードを追加する
 *
 * @export
 * @param {string} ownerId 所有者ID
 * @param {(GMOCardFactory.IGMOCardRaw | GMOCardFactory.IGMOCardTokenized)} card GMOカードオブジェクト
 * @returns {IOperation<GMOCardFactory.ICheckedCard>} 登録後カードを返す操作
 * @memberof service/member
 */
// export function addCard(
//     ownerId: string,
//     card: GMOCardFactory.IUncheckedCardRaw | GMOCardFactory.IUncheckedCardTokenized
// ): IOperation<GMOCardFactory.ICheckedCard> {
//     return async () => {
//         // GMOカード登録
//         debug('saving a card to GMO...', card);
//         const saveCardResult = await GMO.services.card.saveCard({
//             siteId: process.env.GMO_SITE_ID,
//             sitePass: process.env.GMO_SITE_PASS,
//             memberId: ownerId,
//             seqMode: GMO.utils.util.SEQ_MODE_PHYSICS,
//             cardNo: (<GMOCardFactory.IUncheckedCardRaw>card).card_no,
//             cardPass: (<GMOCardFactory.IUncheckedCardRaw>card).card_pass,
//             expire: (<GMOCardFactory.IUncheckedCardRaw>card).expire,
//             holderName: (<GMOCardFactory.IUncheckedCardRaw>card).holder_name,
//             token: (<GMOCardFactory.IUncheckedCardTokenized>card).token
//         });
//         debug('card saved', saveCardResult);

//         const searchCardResults = await GMO.services.card.searchCard({
//             siteId: process.env.GMO_SITE_ID,
//             sitePass: process.env.GMO_SITE_PASS,
//             memberId: ownerId,
//             seqMode: GMO.utils.util.SEQ_MODE_PHYSICS,
//             cardSeq: saveCardResult.cardSeq
//         });

//         return GMOCardFactory.createCheckedCardFromGMOSearchCardResult(searchCardResults[0], ownerId);
//     };
// }

/**
 * カード削除
 *
 * @export
 * @param {string} ownerId 所有者ID
 * @param {string} cardId カードID
 * @returns {IOperation<void>} 操作
 * @memberof service/member
 */
// export function removeCard(ownerId: string, cardId: string): IOperation<void> {
//     return async () => {
//         // GMOカード削除
//         debug('removing a card from GMO...cardSeq:', cardId);
//         const gmoCardId = GMOCardIdFactory.parse(cardId);
//         const deleteCardResult = await GMO.services.card.deleteCard({
//             siteId: process.env.GMO_SITE_ID,
//             sitePass: process.env.GMO_SITE_PASS,
//             memberId: ownerId,
//             seqMode: GMO.utils.util.SEQ_MODE_PHYSICS,
//             cardSeq: gmoCardId.cardSeq
//         });
//         debug('card deleted', deleteCardResult);
//     };
// }

/**
 * 会員カード検索
 *
 * @export
 * @param {string} ownerId 所有者ID
 * @returns {IOperation<GMOCardFactory.ICheckedCard[]>} カードリストを取得する操作
 * @memberof service/member
 */
// export function findCards(ownerId: string): IOperation<GMOCardFactory.ICheckedCard[]> {
//     return async () => {
//         // GMOカード検索
//         return await GMO.services.card.searchCard({
//             siteId: process.env.GMO_SITE_ID,
//             sitePass: process.env.GMO_SITE_PASS,
//             memberId: ownerId,
//             seqMode: GMO.utils.util.SEQ_MODE_PHYSICS
//         }).then((searchCardResults) => {
//             return searchCardResults
//                 // 未削除のものに絞り込む
//                 .filter((searchCardResult) => searchCardResult.deleteFlag === '0')
//                 .map((searchCardResult) => GMOCardFactory.createCheckedCardFromGMOSearchCardResult(searchCardResult, ownerId));
//         });
//     };
// }

/**
 * 会員の座席予約資産を検索する
 *
 * @export
 * @param {string} ownerId 所有者ID
 * @returns {IAssetOperation<SeatReservationAssetFactory.ISeatReservationAsset[]>} 資産に対する操作
 * @memberof service/member
 */
// export function findSeatReservationAssets(ownerId: string): IAssetOperation<SeatReservationAssetFactory.IAsset[]> {
//     return async (assetAdapter: AssetAdapter) => {
//         // 資産全検索
//         // todo add limit
//         return await assetAdapter.model.find({
//             group: AssetGroup.SEAT_RESERVATION,
//             'ownership.owner': ownerId
//         }).sort({ created_at: 1 })
//             .exec()
//             .then((docs) => docs.map((doc) => <SeatReservationAssetFactory.IAsset>doc.toObject()));
//     };
// }
