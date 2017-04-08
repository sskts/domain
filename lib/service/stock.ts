/**
 * 在庫サービス
 *
 * @namespace StockService
 */
import * as COA from '@motionpicture/coa-service';
import * as createDebug from 'debug';
import * as _ from 'underscore';

import ArgumentError from '../error/argument';

import * as COASeatReservationAuthorizationFactory from '../factory/authorization/coaSeatReservation';
import * as AnonymousOwnerFactory from '../factory/owner/anonymous';
import OwnerGroup from '../factory/ownerGroup';
import * as TransactionFactory from '../factory/transaction';
import * as TransactionInquiryKeyFactory from '../factory/transactionInquiryKey';

import AssetAdapter from '../adapter/asset';
import OwnerAdapter from '../adapter/owner';
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
    return async (assetAdapter: AssetAdapter, ownertAdapter: OwnerAdapter) => {
        const promises = authorization.assets.map(async (asset) => {
            // 資産永続化
            debug('storing asset...', asset);
            await assetAdapter.model.findByIdAndUpdate(asset.id, asset, { new: true, upsert: true }).exec();
            debug('asset stored.');
        });

        // 資産永続化は成功後もリトライできるのでCOA本予約の先に行う
        await Promise.all(promises);

        // 所有者情報を取得
        const ownerDoc = await ownertAdapter.model.findById(authorization.owner_to).exec();

        if (ownerDoc === null) {
            throw new ArgumentError('authorization.owner_to', 'owner not found');
        }

        // 一般以外は現時点で未対応
        // todo implemented error
        if (ownerDoc.get('group') !== OwnerGroup.ANONYMOUS) {
            throw new Error('owner group not implemented');
        }

        const owner = <AnonymousOwnerFactory.IAnonymousOwner>ownerDoc.toObject();

        // COA本予約
        // COA本予約は一度成功すると成功できない
        // この資産移動ファンクション自体はリトライ可能な前提でつくる必要があるので、要注意
        // すでに本予約済みかどうか確認
        const stateReserveResult = await COA.ReserveService.stateReserve({
            theater_code: authorization.coa_theater_code,
            reserve_num: authorization.coa_tmp_reserve_num,
            tel_num: owner.tel
        });

        if (stateReserveResult !== null) {
            // すでに本予約済み
            return;
        }

        await COA.ReserveService.updReserve({
            theater_code: authorization.coa_theater_code,
            date_jouei: authorization.coa_date_jouei,
            title_code: authorization.coa_title_code,
            title_branch_num: authorization.coa_title_branch_num,
            time_begin: authorization.coa_time_begin,
            tmp_reserve_num: authorization.coa_tmp_reserve_num,
            reserve_name: `${owner.name_last}　${owner.name_first}`,
            reserve_name_jkana: `${owner.name_last}　${owner.name_first}`,
            tel_num: owner.tel,
            mail_addr: owner.email,
            reserve_amount: authorization.assets.reduce(
                (a, b) => a + b.sale_price,
                0
            ),
            list_ticket: authorization.assets.map((asset) => {
                return {
                    ticket_code: asset.ticket_code,
                    std_price: asset.std_price,
                    add_price: asset.add_price,
                    dis_price: 0,
                    sale_price: (asset.std_price + asset.add_price),
                    ticket_count: 1,
                    mvtk_app_price: asset.mvtk_app_price,
                    seat_num: asset.seat_code,
                    add_glasses: asset.add_glasses
                };
            })
        });
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
        if (_.isEmpty(transaction.inquiry_key)) {
            throw new ArgumentError('transaction.inquiry_key', 'inquiry_key not created.');
        }

        const inquiryKey = <TransactionInquiryKeyFactory.ITransactionInquiryKey>transaction.inquiry_key;

        // COAから内容抽出
        const reservation = await COA.ReserveService.stateReserve({
            theater_code: inquiryKey.theater_code,
            reserve_num: inquiryKey.reserve_num,
            tel_num: inquiryKey.tel
        });

        if (reservation !== null) {
            // COA購入チケット取消
            debug('calling deleteReserve...');
            await COA.ReserveService.delReserve({
                theater_code: inquiryKey.theater_code,
                reserve_num: inquiryKey.reserve_num,
                tel_num: inquiryKey.tel,
                date_jouei: reservation.date_jouei,
                title_code: reservation.title_code,
                title_branch_num: reservation.title_branch_num,
                time_begin: reservation.time_begin,
                list_seat: reservation.list_ticket
            });
        }

        // 永続化
        debug('updating transaction...');
        await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                _id: transaction.id
            },
            { $unset: { inquiry_key: '' } } // 照会キーフィールドを削除する
        ).exec();
    };
}
