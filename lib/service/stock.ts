/**
 * 在庫サービス
 *
 * @namespace StockService
 */
import * as COA from '@motionpicture/coa-service';
import * as createDebug from 'debug';

import * as COASeatReservationAuthorizationFactory from '../factory/authorization/coaSeatReservation';
import * as TransactionFactory from '../factory/transaction';

import AssetAdapter from '../adapter/asset';
import TransactionAdapter from '../adapter/transaction';

const debug = createDebug('sskts-domain:service:stock');

/**
 * 資産承認解除(COA座席予約)
 *
 * @param {COASeatReservationAuthorization.ICOASeatReservationAuthorization} authorization
 *
 * @memberOf StockService
 */
export function unauthorizeCOASeatReservation(authorization: COASeatReservationAuthorizationFactory.ICOASeatReservationAuthorization) {
    return async () => {
        debug('calling deleteTmpReserve...');
        await COA.ReserveService.delTmpReserve({
            theater_code: authorization.coa_theater_code,
            date_jouei: authorization.coa_date_jouei,
            title_code: authorization.coa_title_code,
            title_branch_num: authorization.coa_title_branch_num,
            time_begin: authorization.coa_time_begin,
            tmp_reserve_num: authorization.coa_tmp_reserve_num
        });
    };
}

/**
 * 資産移動(COA座席予約)
 *
 * @param {COASeatReservationAuthorization} authorization
 * @returns {AssetOperation<void>}
 *
 * @memberOf StockService
 */
export function transferCOASeatReservation(authorization: COASeatReservationAuthorizationFactory.ICOASeatReservationAuthorization) {
    return async (assetAdapter: AssetAdapter) => {
        const promises = authorization.assets.map(async (asset) => {
            // 資産永続化
            debug('storing asset...', asset);
            await assetAdapter.model.findByIdAndUpdate(asset.id, asset, { new: true, upsert: true }).exec();
            debug('asset stored.');
        });

        await Promise.all(promises);

        // 所有者情報を取得
        // await owner = assetAdapter.model.findById(authorization.assets[0].ownership.owner).exec();

        // COA本予約
        // let reserveAmount = 0;
        // authorization.assets.forEach((asset) => {
        //     reserveAmount += asset.sale_price;
        // });

        // await COA.ReserveService.updReserve({
        //     theater_code: authorization.coa_theater_code,
        //     date_jouei: authorization.coa_date_jouei,
        //     title_code: authorization.coa_title_code,
        //     title_branch_num: authorization.coa_title_branch_num,
        //     time_begin: authorization.coa_time_begin,
        //     tmp_reserve_num: authorization.coa_tmp_reserve_num,

        //     reserve_name: authorization.coa_date_jouei,
        //     reserve_name_jkana: authorization.coa_date_jouei,
        //     tel_num: authorization.coa_date_jouei,
        //     mail_addr: authorization.coa_date_jouei,

        //     reserve_amount: reserveAmount,
        //     list_ticket: authorization.assets.map((asset) => {
        //         return {
        //             ticket_code: asset.ticket_code,
        //             std_price: asset.std_price,
        //             add_price: asset.add_price,
        //             dis_price: 0,
        //             sale_price: (asset.std_price + asset.add_price),
        //             ticket_count: 1,
        //             mvtk_app_price: asset.mvtk_app_price,
        //             seat_num: asset.seat_code,
        //             add_glasses: asset.add_glasses
        //         };
        //     })
        // });
    };
}

/**
 * 取引照会を無効にする
 * COAのゴミ購入データを削除する
 *
 * @memberOf StockService
 */
export function disableTransactionInquiry(transaction: TransactionFactory.ITransaction) {
    return async (transactionAdapter: TransactionAdapter) => {
        if (transaction.inquiry_key === undefined) {
            throw new Error('inquiry_key not created.');
        }

        // COAから内容抽出
        const reservation = await COA.ReserveService.stateReserve({
            theater_code: transaction.inquiry_key.theater_code,
            reserve_num: transaction.inquiry_key.reserve_num,
            tel_num: transaction.inquiry_key.tel
        });

        // COA購入チケット取消
        debug('calling deleteReserve...');
        await COA.ReserveService.delReserve({
            theater_code: transaction.inquiry_key.theater_code,
            reserve_num: transaction.inquiry_key.reserve_num,
            tel_num: transaction.inquiry_key.tel,
            date_jouei: reservation.date_jouei,
            title_code: reservation.title_code,
            title_branch_num: reservation.title_branch_num,
            time_begin: reservation.time_begin,
            list_seat: reservation.list_ticket
        });

        // 永続化
        debug('updating transaction...');
        await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                _id: transaction.id
            },
            { $unset: { inquiry_key: '' } }
        ).exec();
    };
}
