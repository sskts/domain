/**
 * 在庫サービス
 *
 * @namespace service/stock
 */

import * as COA from '@motionpicture/coa-service';
import * as createDebug from 'debug';

import ArgumentError from '../error/argument';

import * as PersonFactory from '../factory/person';
import * as PlaceOrderTransactionFactory from '../factory/transaction/placeOrder';

import OwnershipInfoAdapter from '../adapter/ownershipInfo';
import PersonAdapter from '../adapter/person';

const debug = createDebug('sskts-domain:service:stock');

export type IPlaceOrderTransaction = PlaceOrderTransactionFactory.ITransaction;

/**
 * 資産承認解除(COA座席予約)
 *
 * @memberof service/stock
 */
export function unauthorizeSeatReservation(transaction: IPlaceOrderTransaction) {
    return async () => {
        if (transaction.object.seatReservation !== undefined) {
            debug('calling deleteTmpReserve...');
            const authorization = transaction.object.seatReservation;
            await COA.services.reserve.delTmpReserve({
                theater_code: authorization.object.updTmpReserveSeatArgs.theater_code,
                date_jouei: authorization.object.updTmpReserveSeatArgs.date_jouei,
                title_code: authorization.object.updTmpReserveSeatArgs.title_code,
                title_branch_num: authorization.object.updTmpReserveSeatArgs.title_branch_num,
                time_begin: authorization.object.updTmpReserveSeatArgs.time_begin,
                tmp_reserve_num: authorization.result.tmp_reserve_num
            });
        }
    };
}

/**
 * 資産移動(COA座席予約)
 *
 * @param {ISeatReservationAuthorization} authorization
 * @memberof service/stock
 */
export function transferSeatReservation(transaction: IPlaceOrderTransaction) {
    // tslint:disable-next-line:max-func-body-length
    return async (ownershipInfoAdapter: OwnershipInfoAdapter, personAdapter: PersonAdapter) => {
        if (transaction.object.seatReservation !== undefined) {
            const authorization = transaction.object.seatReservation;

            const recipientDoc = await personAdapter.personModel.findById(transaction.agent.id).exec();
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
            if (transaction.result !== undefined) {
                await Promise.all(transaction.result.ownershipInfos.map(async (ownershipInfo) => {
                    // 所有権永続化
                    await ownershipInfoAdapter.ownershipInfoModel.findOneAndUpdate(
                        {
                            identifier: ownershipInfo.identifier
                        },
                        ownershipInfo,
                        { upsert: true }
                    ).exec();
                }));
            }
        }
    };
}
