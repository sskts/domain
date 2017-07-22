/**
 * 在庫サービス
 *
 * @namespace service/stock
 */

import * as COA from '@motionpicture/coa-service';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as _ from 'underscore';

import ArgumentError from '../error/argument';

import * as BuyActionFactory from '../factory/action/buyAction';
import * as COASeatReservationAuthorizationFactory from '../factory/authorization/coaSeatReservation';
import * as OrderInquiryKeyFactory from '../factory/orderInquiryKey';
import * as OwnershipInfoFactory from '../factory/ownershipInfo';
import * as PersonFactory from '../factory/person';
import ReservationStatusType from '../factory/reservationStatusType';

import OwnershipInfoAdapter from '../adapter/ownershipInfo';
import PersonAdapter from '../adapter/person';
import TransactionAdapter from '../adapter/transaction';

const debug = createDebug('sskts-domain:service:stock');

export type ICOASeatReservationAuthorization = COASeatReservationAuthorizationFactory.IAuthorization;

/**
 * 資産承認解除(COA座席予約)
 *
 * @param {ICOASeatReservationAuthorization} authorization
 * @memberof service/stock
 */
export function unauthorizeCOASeatReservation(authorization: ICOASeatReservationAuthorization) {
    return async () => {
        debug('calling deleteTmpReserve...');
        await COA.services.reserve.delTmpReserve({
            theater_code: authorization.object.updTmpReserveSeatArgs.theater_code,
            date_jouei: authorization.object.updTmpReserveSeatArgs.date_jouei,
            title_code: authorization.object.updTmpReserveSeatArgs.title_code,
            title_branch_num: authorization.object.updTmpReserveSeatArgs.title_branch_num,
            time_begin: authorization.object.updTmpReserveSeatArgs.time_begin,
            tmp_reserve_num: authorization.result.tmp_reserve_num
        });
    };
}

/**
 * 資産移動(COA座席予約)
 *
 * @param {ICOASeatReservationAuthorization} authorization
 * @memberof service/stock
 */
export function transferCOASeatReservation(authorization: ICOASeatReservationAuthorization) {
    // tslint:disable-next-line:max-func-body-length
    return async (ownershipInfoAdapter: OwnershipInfoAdapter, personAdapter: PersonAdapter) => {
        const recipientDoc = await personAdapter.personModel.findById(authorization.recipient.id).exec();
        if (recipientDoc === null) {
            throw new ArgumentError('authorization.recipient', 'recipient not found');
        }

        const recipient = <PersonFactory.IPerson>recipientDoc.toObject();
        debug('recipient:', recipient);

        // この資産移動ファンクション自体はリトライ可能な前提でつくる必要があるので、要注意
        // すでに本予約済みかどうか確認
        const stateReserveResult = await COA.services.reserve.stateReserve({
            theater_code: authorization.object.updTmpReserveSeatArgs.theater_code,
            reserve_num: authorization.result.tmp_reserve_num,
            tel_num: recipient.telephone
        });

        // COA本予約
        // 未本予約であれば実行(COA本予約は一度成功すると成功できない)
        let updReserveResult: COA.services.reserve.IUpdReserveResult;
        if (stateReserveResult === null) {
            updReserveResult = await COA.services.reserve.updReserve({
                theater_code: authorization.object.updTmpReserveSeatArgs.theater_code,
                date_jouei: authorization.object.updTmpReserveSeatArgs.date_jouei,
                title_code: authorization.object.updTmpReserveSeatArgs.title_code,
                title_branch_num: authorization.object.updTmpReserveSeatArgs.title_branch_num,
                time_begin: authorization.object.updTmpReserveSeatArgs.time_begin,
                tmp_reserve_num: authorization.result.tmp_reserve_num,
                reserve_name: `${recipient.familyName}　${recipient.givenName}`,
                reserve_name_jkana: `${recipient.familyName}　${recipient.givenName}`,
                tel_num: recipient.telephone,
                mail_addr: recipient.email,
                reserve_amount: authorization.object.acceptedOffer.reduce(
                    (a, b) => a + b.price,
                    0
                ),
                list_ticket: authorization.object.acceptedOffer.map((offer) => offer.itemOffered.reservedTicket.coaTicketInfo)
            });
        }

        // 資産永続化(リトライできるように)
        const ownershipInfos = authorization.object.acceptedOffer.map((offer) => {
            const reservation = offer.itemOffered;
            reservation.reservationStatus = ReservationStatusType.ReservationConfirmed;
            reservation.underName.name = `${recipient.familyName} ${recipient.givenName}`;
            reservation.reservedTicket.underName.name = `${recipient.familyName} ${recipient.givenName}`;

            return OwnershipInfoFactory.create({
                acquiredFrom: authorization.agent,
                ownedFrom: moment().toDate(),
                ownedThrough: moment().add(1, 'month').toDate(), // todo 期間いつまで？
                typeOfGood: reservation
            });
        });

        await Promise.all(ownershipInfos.map(async (ownershipInfo) => {
            // 所有権永続化
            await ownershipInfoAdapter.ownershipInfoModel.findOneAndUpdate(
                {
                    identifier: ownershipInfo.identifier
                },
                ownershipInfo,
                { upsert: true }
            ).exec();
        }));
    };
}

/**
 * 取引照会を無効にする
 * COAのゴミ購入データを削除する
 *
 * @memberof service/stock
 */
export function disableTransactionInquiry(buyAction: BuyActionFactory.IAction) {
    return async (transactionAdapter: TransactionAdapter) => {
        if (_.isEmpty(buyAction.object.orderInquiryKey)) {
            throw new ArgumentError('transaction.inquiryKey', 'inquiryKey not created.');
        }

        const inquiryKey = <OrderInquiryKeyFactory.IOrderInquiryKey>buyAction.object.orderInquiryKey;

        // COAから内容抽出
        const reservation = await COA.services.reserve.stateReserve({
            theater_code: inquiryKey.theaterCode,
            reserve_num: inquiryKey.orderNumber,
            tel_num: inquiryKey.telephone
        });

        if (reservation !== null) {
            // COA購入チケット取消
            debug('calling deleteReserve...');
            await COA.services.reserve.delReserve({
                theater_code: inquiryKey.theaterCode,
                reserve_num: inquiryKey.orderNumber,
                tel_num: inquiryKey.telephone,
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
                _id: buyAction.id
            },
            { $unset: { 'object.orderInquiryKey': '' } } // 照会キーフィールドを削除する
        ).exec();
    };
}
