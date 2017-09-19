"use strict";
/**
 * 会員サービス
 * @namespace service.person
 */
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
createDebug('sskts-domain:service:person');
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
