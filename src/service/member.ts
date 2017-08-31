/**
 * 会員サービス
 *
 * @namespace service/member
 */

// import * as GMO from '@motionpicture/gmo-service';
// import * as bcrypt from 'bcryptjs';
import * as createDebug from 'debug';

// import AlreadyInUseError from '../error/alreadyInUse';
// import ArgumentError from '../error/argument';

// import AssetRepository from '../repository/asset';
// import OwnerRepository from '../repository/owner';

// import * as GMOCardFactory from '../factory/card/gmo';
// import * as GMOCardIdFactory from '../factory/cardId/gmo';

createDebug('sskts-domain:service:member');

// export type IOperation<T> = () => Promise<T>;
// export type IAssetOperation<T> = (assetRepository: AssetRepository) => Promise<T>;
// export type IOwnerOperation<T> = (ownerRepository: OwnerRepository) => Promise<T>;
// export type IAssetAndOwnerOperation<T> = (assetRepository: AssetRepository, ownerRepository: OwnerRepository) => Promise<T>;
// export interface ILoginResult {
//     id: string;
//     username: string;
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
//     return async (assetRepository: AssetRepository) => {
//         // 資産全検索
//         // todo add limit
//         return await assetRepository.model.find({
//             group: AssetGroup.SEAT_RESERVATION,
//             'ownership.owner': ownerId
//         }).sort({ created_at: 1 })
//             .exec()
//             .then((docs) => docs.map((doc) => <SeatReservationAssetFactory.IAsset>doc.toObject()));
//     };
// }
