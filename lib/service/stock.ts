/**
 * 在庫サービス
 *
 * @namespace service/stock
 */

import * as COA from '@motionpicture/coa-service';
import * as createDebug from 'debug';
import * as _ from 'underscore';

import ArgumentError from '../error/argument';

import * as SeatReservationAssetFactory from '../factory/asset/seatReservation';
import * as COASeatReservationAuthorizationFactory from '../factory/authorization/coaSeatReservation';
import AuthorizationGroup from '../factory/authorizationGroup';
import * as AnonymousOwnerFactory from '../factory/owner/anonymous';
import OwnerGroup from '../factory/ownerGroup';
import * as OwnershipFactory from '../factory/ownership';
import * as PerformanceFactory from '../factory/performance';
import * as TransactionFactory from '../factory/transaction';
import * as TransactionInquiryKeyFactory from '../factory/transactionInquiryKey';
import TransactionStatus from '../factory/transactionStatus';

import AssetAdapter from '../adapter/asset';
import OwnerAdapter from '../adapter/owner';
import PerformanceAdapter from '../adapter/performance';
import TransactionAdapter from '../adapter/transaction';

const debug = createDebug('sskts-domain:service:stock');
export type ICOASeatReservationAuthorization = COASeatReservationAuthorizationFactory.IAuthorization;
export type AssetAndOwnerAndPerformanceAndTransactionOperation<T> =
    // tslint:disable-next-line:max-line-length
    (assetAdapter: AssetAdapter, ownerAdapter: OwnerAdapter, performanceAdapter: PerformanceAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;

/**
 * 資産承認解除(COA座席予約)
 *
 * @param {COASeatReservationAuthorization.ICOASeatReservationAuthorization} authorization
 *
 * @memberof service/stock
 */
export function unauthorizeCOASeatReservation(authorization: COASeatReservationAuthorizationFactory.IAuthorization) {
    return async () => {
        debug('calling deleteTmpReserve...');
        await COA.services.reserve.delTmpReserve({
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
 * @memberof service/stock
 */
export function transferCOASeatReservation(authorization: ICOASeatReservationAuthorization) {
    // tslint:disable-next-line:max-func-body-length
    return async (assetAdapter: AssetAdapter, ownerAdapter: OwnerAdapter, performanceAdapter: PerformanceAdapter) => {
        // 所有者情報を取得
        const ownerDoc = await ownerAdapter.model.findById(authorization.owner_to).exec();

        if (ownerDoc === null) {
            throw new ArgumentError('authorization.owner_to', 'owner not found');
        }

        // 一般以外は現時点で未対応
        // todo implemented error
        if (ownerDoc.get('group') !== OwnerGroup.ANONYMOUS) {
            throw new Error('owner group not implemented');
        }

        const owner = <AnonymousOwnerFactory.IOwner>ownerDoc.toObject();
        debug('owner:', owner);

        // パフォーマンス情報詳細を取得
        const performanceDoc = await performanceAdapter.model.findById(authorization.assets[0].performance)
            .populate('theater')
            .populate('screen')
            .populate('film')
            .exec();

        if (performanceDoc === null) {
            throw new ArgumentError('authorization.assets[0].performance', 'performance not found');
        }

        const performance = <PerformanceFactory.IPerformanceWithReferenceDetails>performanceDoc.toObject();

        // この資産移動ファンクション自体はリトライ可能な前提でつくる必要があるので、要注意
        // すでに本予約済みかどうか確認
        const stateReserveResult = await COA.services.reserve.stateReserve({
            theater_code: authorization.coa_theater_code,
            reserve_num: authorization.coa_tmp_reserve_num,
            tel_num: owner.tel
        });

        // COA本予約
        // 未本予約であれば実行(COA本予約は一度成功すると成功できない)
        let updReserveResult: COA.services.reserve.IUpdReserveResult;
        if (stateReserveResult === null) {
            updReserveResult = await COA.services.reserve.updReserve({
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
                        add_glasses: asset.add_glasses,
                        kbn_eisyahousiki: asset.kbn_eisyahousiki,
                        mvtk_num: asset.mvtk_num,
                        mvtk_kbn_denshiken: asset.mvtk_kbn_denshiken,
                        mvtk_kbn_maeuriken: asset.mvtk_kbn_maeuriken,
                        mvtk_kbn_kensyu: asset.mvtk_kbn_kensyu,
                        mvtk_sales_price: asset.mvtk_sales_price
                    };
                })
            });
        }

        // 資産永続化(リトライできるように)
        await Promise.all(authorization.assets.map(async (asset) => {
            // 座席予約資産に詳細情報を追加
            // 本来この時点でownershop.idは決定しているはずだが、COAとの連携の場合本予約で初めてQR文字列を取得できるので、ここで置き換える
            // 具体的には、本予約結果もしくは購入チケット内容抽出結果から該当座席コードのQR文字列を取り出す
            // let qr: string;
            const qr = (stateReserveResult !== null)
                // tslint:disable-next-line:max-line-length
                ? (<COA.services.reserve.IStateReserveTicket>stateReserveResult.list_ticket.find((stateReserveTicket) => (stateReserveTicket.seat_num === asset.seat_code))).seat_qrcode
                // tslint:disable-next-line:max-line-length
                : (<COA.services.reserve.IUpdReserveQR>updReserveResult.list_qr.find((updReserveQR) => (updReserveQR.seat_num === asset.seat_code))).seat_qrcode;

            const args = {
                ...asset,
                ...{
                    ownership: OwnershipFactory.create({
                        id: qr,
                        owner: owner.id
                    }),
                    performance_day: performance.day,
                    performance_time_start: performance.time_start,
                    performance_time_end: performance.time_end,
                    theater: performance.theater.id,
                    theater_name: performance.theater.name,
                    theater_name_kana: performance.theater.name_kana,
                    theater_address: performance.theater.address,
                    screen: performance.screen.id,
                    screen_name: performance.screen.name,
                    film: performance.film.id,
                    film_name: performance.film.name,
                    film_name_kana: performance.film.name_kana,
                    film_name_short: performance.film.name_short,
                    film_name_original: performance.film.name_original,
                    film_minutes: performance.film.minutes,
                    film_kbn_eirin: performance.film.kbn_eirin,
                    film_kbn_eizou: performance.film.kbn_eizou,
                    film_kbn_joueihousiki: performance.film.kbn_joueihousiki,
                    film_kbn_jimakufukikae: performance.film.kbn_jimakufukikae,
                    film_copyright: performance.film.copyright,
                    transaction_inquiry_key: TransactionInquiryKeyFactory.create({
                        theater_code: performance.theater.id,
                        reserve_num: authorization.coa_tmp_reserve_num,
                        tel: owner.tel
                    })
                },
                group: undefined
            };
            const seatReservationAsset = SeatReservationAssetFactory.create(args);

            // 資産永続化
            debug('storing asset...', asset);
            await assetAdapter.model.findByIdAndUpdate(seatReservationAsset.id, seatReservationAsset, { new: true, upsert: true }).exec();
            debug('asset stored.');
        }));
    };
}

/**
 * 取引IDからCOA座席予約資産移動を実行する
 *
 * @param transactionId 取引ID
 * @return {AssetAndOwnerAndPerformanceAndTransactionOperation<void>}
 */
export function transferCOASeatReservationByTransactionId(
    transactionId: string
): AssetAndOwnerAndPerformanceAndTransactionOperation<void> {
    // tslint:disable-next-line:max-line-length
    return async (assetAdapter: AssetAdapter, ownerAdapter: OwnerAdapter, performanceAdapter: PerformanceAdapter, transactionAdapter: TransactionAdapter) => {
        // 取引検索
        const transactionDoc = await transactionAdapter.transactionModel.findById(transactionId, 'status').exec();
        if (transactionDoc === null) {
            throw new ArgumentError('transactionId', 'transaction not found');
        }
        if (transactionDoc.get('status') !== TransactionStatus.CLOSED) {
            throw new ArgumentError('transactionId', 'transaction not closed');
        }

        // 取引の承認を取得
        const authorizations = await transactionAdapter.findAuthorizationsById(transactionId);
        debug('authorizations:', authorizations);
        if (authorizations.length === 0) {
            throw new ArgumentError('transactionId', 'transaction has no authorizations');
        }

        // COA座席予約承認を取り出す
        const coaSeatReservationAuthorization =
            authorizations.find((authorization) => authorization.group === AuthorizationGroup.COA_SEAT_RESERVATION);
        if (coaSeatReservationAuthorization === undefined) {
            throw new ArgumentError('transactionId', 'transaction has no coaSeatReservationAuthorization');
        }

        // tslint:disable-next-line:max-line-length
        await transferCOASeatReservation(<ICOASeatReservationAuthorization>coaSeatReservationAuthorization)(assetAdapter, ownerAdapter, performanceAdapter);
    };
}

/**
 * 取引照会を無効にする
 * COAのゴミ購入データを削除する
 *
 * @memberof service/stock
 */
export function disableTransactionInquiry(transaction: TransactionFactory.ITransaction) {
    return async (transactionAdapter: TransactionAdapter) => {
        if (_.isEmpty(transaction.inquiry_key)) {
            throw new ArgumentError('transaction.inquiry_key', 'inquiry_key not created.');
        }

        const inquiryKey = <TransactionInquiryKeyFactory.ITransactionInquiryKey>transaction.inquiry_key;

        // COAから内容抽出
        const reservation = await COA.services.reserve.stateReserve({
            theater_code: inquiryKey.theater_code,
            reserve_num: inquiryKey.reserve_num,
            tel_num: inquiryKey.tel
        });

        if (reservation !== null) {
            // COA購入チケット取消
            debug('calling deleteReserve...');
            await COA.services.reserve.delReserve({
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
