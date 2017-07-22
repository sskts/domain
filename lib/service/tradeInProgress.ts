/**
 * 進行中取引サービス
 *
 * @namespace service/tradeInProgress
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as monapt from 'monapt';
import * as _ from 'underscore';

import ArgumentError from '../error/argument';

import * as BuyActionFactory from '../factory/action/buyAction';
import * as ActionEventFactory from '../factory/actionEvent';
import * as AddNotificationActionEventFactory from '../factory/actionEvent/addNotification';
import * as AuthorizeActionEventFactory from '../factory/actionEvent/authorize';
import * as RemoveNotificationActionEventFactory from '../factory/actionEvent/removeNotification';
import * as UnauthorizeActionEventFactory from '../factory/actionEvent/unauthorize';
import ActionEventGroup from '../factory/actionEventType';
import ActionStatusType from '../factory/actionStatusType';
import * as OrderInquiryKeyFactory from '../factory/orderInquiryKey';

import * as AuthorizationFactory from '../factory/authorization';
import * as COASeatReservationAuthorizationFactory from '../factory/authorization/coaSeatReservation';
import * as GMOAuthorizationFactory from '../factory/authorization/gmo';
import * as MvtkAuthorizationFactory from '../factory/authorization/mvtk';
import AuthorizationGroup from '../factory/authorizationGroup';
import * as IndivisualScreeningEventFactory from '../factory/event/indivisualScreeningEvent';
// import * as GMOCardFactory from '../factory/card/gmo';
import * as EmailNotificationFactory from '../factory/notification/email';
import * as OrderFactory from '../factory/order';
import * as MovieTheaterOrganizationFactory from '../factory/organization/movieTheater';
import * as OwnershipInfoFactory from '../factory/ownershipInfo';
import * as PersonFactory from '../factory/person';

import ActionAdapter from '../adapter/action';
import OrganizationAdapter from '../adapter/organization';
import PersonAdapter from '../adapter/person';

export type PersonAndActionOperation<T> =
    (personAdapter: PersonAdapter, actionAdapter: ActionAdapter) => Promise<T>;
export type ActionOperation<T> = (actionAdapter: ActionAdapter) => Promise<T>;

const debug = createDebug('sskts-domain:service:buyAction');

/**
 * アクションIDから取得する
 */
export function findByActionId(actionId: string) {
    return async (actionAdapter: ActionAdapter) => {
        return await actionAdapter.actionModel.findOne({
            _id: actionId,
            typeOf: 'BuyAction',
            actionStatus: ActionStatusType.ActiveActionStatus
        })
            .exec()
            .then((doc) => {
                return (doc === null) ? monapt.None : monapt.Option(<BuyActionFactory.IAction>doc.toObject());
            });
    };
}

function pushEvent(actionId: string, actionEvent: ActionEventFactory.IActionEvent) {
    return async (actionAdapter: ActionAdapter) => {
        await actionAdapter.actionModel.findByIdAndUpdate(
            actionId,
            { $push: { 'object.actionEvents': actionEvent } }
        ).exec();
    };
}

export function addAuthorization(actionId: string, authorization: AuthorizationFactory.IAuthorization) {
    return async (actionAdapter: ActionAdapter) => {
        const buyAction = await findByActionId(actionId)(actionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('actionId', `action[${actionId}] not found.`);
                }

                return option.get();
            });

        // 所有者が取引に存在するかチェック
        if (buyAction.agent.id !== authorization.agent.id && buyAction.seller.id !== authorization.agent.id) {
            throw new ArgumentError(
                'authorization.agent',
                `action[${actionId}] does not contain an agent[${authorization.agent.id}].`
            );
        }

        // イベント作成
        const event = AuthorizeActionEventFactory.create({
            occurredAt: new Date(),
            authorization: authorization
        });

        // 永続化
        debug('adding an event...', event);
        await pushEvent(actionId, event)(actionAdapter);
    };
}

/**
 * GMOクレジットカードオーソリ
 */
export function authorizeGMOCard(actionId: string, gmoAction: {
    orderId: string;
    amount: number;
    method?: string;
    cardNo?: string;
    expire?: string;
    securityCode?: string;
    token?: string;
}) {
    return async (organizationAdapter: OrganizationAdapter, actionAdapter: ActionAdapter) => {
        const buyAction = await findByActionId(actionId)(actionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('actionId', `action[${actionId}] not found.`);
                }

                return option.get();
            });

        // GMOショップ情報取得
        const movieTheater = await organizationAdapter.organizationModel.findById(buyAction.seller.id).exec()
            .then((doc) => {
                if (doc === null) {
                    throw new Error('movieTheater not found');
                }

                return <MovieTheaterOrganizationFactory.IOrganization>doc.toObject();
            });

        // GMOオーソリ取得
        const entryTranResult = await GMO.CreditService.entryTran({
            shopId: movieTheater.gmoInfo.shopID,
            shopPass: movieTheater.gmoInfo.shopPass,
            orderId: gmoAction.orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
            amount: gmoAction.amount
        });
        const execTranResult = await GMO.CreditService.execTran({
            accessId: entryTranResult.accessId,
            accessPass: entryTranResult.accessPass,
            orderId: gmoAction.orderId,
            method: gmoAction.method,
            cardNo: gmoAction.cardNo,
            expire: gmoAction.expire,
            securityCode: gmoAction.securityCode,
            token: gmoAction.token
        });
        debug(execTranResult);

        // GMOオーソリ追加
        debug('adding authorizations gmo...');
        const gmoAuthorization = GMOAuthorizationFactory.create({
            price: gmoAction.amount,
            recipient: buyAction.seller,
            agent: buyAction.agent,
            object: {
                shopId: movieTheater.gmoInfo.shopID,
                shopPass: movieTheater.gmoInfo.shopPass,
                orderId: gmoAction.orderId,
                amount: gmoAction.amount,
                accessId: entryTranResult.accessId,
                accessPass: entryTranResult.accessPass,
                jobCd: GMO.Util.JOB_CD_AUTH,
                payType: GMO.Util.PAY_TYPE_CREDIT
            },
            result: execTranResult
        });

        await addAuthorization(actionId, gmoAuthorization)(actionAdapter);
        debug('GMOAuthorization added.');

        return gmoAuthorization;
    };
}

export function acceptIndivisualScreeningEventOffers(
    actionId: string,
    indivisualScreeningEvent: IndivisualScreeningEventFactory.IEvent,
    offers: {
        seatSection: string;
        seatNumber: string;
        ticket: COA.services.reserve.IUpdReserveTicket;
    }[]
) {
    // tslint:disable-next-line:max-func-body-length
    return async (actionAdapter: ActionAdapter) => {
        const buyAction = await findByActionId(actionId)(actionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('actionId', `action[${actionId}] not found.`);
                }

                return option.get();
            });

        // 販売可能チケット検索
        // const salesTicketResult = await COA.services.reserve.salesTicket({
        //     theater_code: indivisualScreeningEvent.coaInfo.theaterCode,
        //     date_jouei: indivisualScreeningEvent.coaInfo.dateJouei,
        //     title_code: indivisualScreeningEvent.coaInfo.titleCode,
        //     title_branch_num: indivisualScreeningEvent.coaInfo.titleBranchNum,
        //     time_begin: indivisualScreeningEvent.coaInfo.timeBegin
        // });
        // const ticketsValid = offers.every(
        //     (offer) => salesTicketResult.find((salesTicket) => salesTicket.ticket_code === offer.ticket.ticket_code) !== undefined
        // );
        // if (!ticketsValid) {
        //     throw new ArgumentError('offers', 'チケットコードが存在しません');
        // }

        // todo 座席コードがすでにキープ済みのものかどうかチェックできる？

        // COA仮予約
        const updTmpReserveSeatArgs = {
            theater_code: indivisualScreeningEvent.coaInfo.theaterCode,
            date_jouei: indivisualScreeningEvent.coaInfo.dateJouei,
            title_code: indivisualScreeningEvent.coaInfo.titleCode,
            title_branch_num: indivisualScreeningEvent.coaInfo.titleBranchNum,
            time_begin: indivisualScreeningEvent.coaInfo.timeBegin,
            screen_code: indivisualScreeningEvent.coaInfo.screenCode,
            list_seat: offers.map((offer) => {
                return {
                    seat_section: offer.seatSection,
                    seat_num: offer.seatNumber
                };
            })
        };
        debug('updTmpReserveSeat processing...', updTmpReserveSeatArgs);
        const reserveSeatsTemporarilyResult = await COA.services.reserve.updTmpReserveSeat(updTmpReserveSeatArgs);
        debug('updTmpReserveSeat processed', reserveSeatsTemporarilyResult);

        // COAオーソリ追加
        debug('adding authorizations coaSeatReservation...');
        const coaAuthorization = COASeatReservationAuthorizationFactory.createFromCOATmpReserve({
            price: offers.reduce((a, b) => a + b.ticket.sale_price, 0),
            recipient: buyAction.agent,
            agent: buyAction.seller,
            updTmpReserveSeatArgs: updTmpReserveSeatArgs,
            reserveSeatsTemporarilyResult: reserveSeatsTemporarilyResult,
            tickets: offers.map((offer) => offer.ticket),
            indivisualScreeningEvent: indivisualScreeningEvent
        });
        await addAuthorization(actionId, coaAuthorization)(actionAdapter);
        debug('coaAuthorization added.');

        return coaAuthorization;
    };
}

/**
 * ムビチケ着券承認追加
 *
 * @param {string} actionId
 * @param {MvtkAuthorization.IMvtkAuthorization} authorization
 * @returns {PersonAndActionOperation<void>}
 *
 * @memberof service/orderById
 */
export function addMvtkAuthorization(actionId: string, authorization: MvtkAuthorizationFactory.IAuthorization) {
    return addAuthorization(actionId, authorization);
}

export function deleteAuthorization(actionId: string, authorizationId: string) {
    return async (actionAdapter: ActionAdapter) => {
        const buyAction = await findByActionId(actionId)(actionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('actionId', `action[${actionId}] not found.`);
                }

                return option.get();
            });

        const authorizeActionEvent = <AuthorizeActionEventFactory.IActionEvent>buyAction.object.actionEvents.find(
            (actionEvent) =>
                actionEvent.actionEventType === ActionEventGroup.Authorize &&
                (<AuthorizeActionEventFactory.IActionEvent>actionEvent).authorization.id === authorizationId
        );
        if (authorizeActionEvent === undefined) {
            throw new ArgumentError('authorizationId', `authorization [${authorizationId}] not found in the buyAction.`);
        }

        const authorization = authorizeActionEvent.authorization;

        switch (authorization.group) {
            case AuthorizationGroup.COA_SEAT_RESERVATION:
                // 座席仮予約削除
                type COASeatReservationAuthorization = COASeatReservationAuthorizationFactory.IAuthorization;
                await COA.services.reserve.delTmpReserve({
                    theater_code: (<COASeatReservationAuthorization>authorization).object.updTmpReserveSeatArgs.theater_code,
                    date_jouei: (<COASeatReservationAuthorization>authorization).object.updTmpReserveSeatArgs.date_jouei,
                    title_code: (<COASeatReservationAuthorization>authorization).object.updTmpReserveSeatArgs.title_code,
                    title_branch_num: (<COASeatReservationAuthorization>authorization).object.updTmpReserveSeatArgs.title_branch_num,
                    time_begin: (<COASeatReservationAuthorization>authorization).object.updTmpReserveSeatArgs.time_begin,
                    tmp_reserve_num: (<COASeatReservationAuthorization>authorization).result.tmp_reserve_num
                });

                break;

            case AuthorizationGroup.GMO:
                // 決済取消
                type GMOAuthorization = GMOAuthorizationFactory.IAuthorization;
                await GMO.services.credit.alterTran({
                    shopId: (<GMOAuthorization>authorization).object.shopId,
                    shopPass: (<GMOAuthorization>authorization).object.shopPass,
                    accessId: (<GMOAuthorization>authorization).object.accessId,
                    accessPass: (<GMOAuthorization>authorization).object.accessPass,
                    jobCd: GMO.utils.util.JOB_CD_VOID
                });

                break;

            default:
                break;
        }

        // イベント作成
        const event = UnauthorizeActionEventFactory.create({
            occurredAt: new Date(),
            authorization: authorizeActionEvent.authorization
        });

        // 永続化
        debug('adding an event...', event);
        await pushEvent(actionId, event)(actionAdapter);
    };
}

/**
 * メール追加
 *
 * @param {string} actionId
 * @param {EmailNotification} notification
 * @returns {ActionOperation<void>}
 *
 * @memberof service/orderById
 */
export function addEmail(actionId: string, notification: EmailNotificationFactory.INotification) {
    return async (actionAdapter: ActionAdapter) => {
        // イベント作成
        const event = AddNotificationActionEventFactory.create({
            occurredAt: new Date(),
            notification: notification
        });

        // 永続化
        debug('adding an event...', event);
        await pushEvent(actionId, event)(actionAdapter);
    };
}

/**
 * メール削除
 *
 * @param {string} actionId
 * @param {string} notificationId
 * @returns {ActionOperation<void>}
 *
 * @memberof service/orderById
 */
export function removeEmail(actionId: string, notificationId: string) {
    return async (actionAdapter: ActionAdapter) => {
        const buyAction = await findByActionId(actionId)(actionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('actionId', `action[${actionId}] not found.`);
                }

                return option.get();
            });

        type IActionEvent = AddNotificationActionEventFactory.IActionEvent<EmailNotificationFactory.INotification>;
        const addNotificationActionEvent = <IActionEvent>buyAction.object.actionEvents.find(
            (actionEvent) =>
                actionEvent.actionEventType === ActionEventGroup.AddNotification &&
                (<IActionEvent>actionEvent).notification.id === notificationId
        );
        if (addNotificationActionEvent === undefined) {
            throw new ArgumentError('notificationId', `notification [${notificationId}] not found in the buyAction.`);
        }

        // イベント作成
        const event = RemoveNotificationActionEventFactory.create({
            occurredAt: new Date(),
            notification: addNotificationActionEvent.notification
        });

        // 永続化
        await pushEvent(actionId, event)(actionAdapter);
    };
}

/**
 * 取引中の所有者プロフィールを変更する
 * 匿名所有者として開始した場合のみ想定(匿名か会員に変更可能)
 */
export function setAgentProfile(
    actionId: string,
    profile: PersonFactory.IProfile
): PersonAndActionOperation<void> {
    return async (personAdapter: PersonAdapter, actionAdapter: ActionAdapter) => {
        const buyAction = await findByActionId(actionId)(actionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('actionId', `action[${actionId}] not found.`);
                }

                return option.get();
            });

        // 永続化
        await actionAdapter.actionModel.findOneAndUpdate(
            {
                _id: actionId,
                actionStatus: ActionStatusType.ActiveActionStatus
            },
            {
                'agent.name': `${profile.familyName} ${profile.givenName}`
            }
        ).exec();

        debug('setting person profile...');
        await personAdapter.personModel.findByIdAndUpdate(
            buyAction.agent.id,
            profile
        ).exec();
        debug('person updated');
    };
}

/**
 * 会員情報をGMO会員として保管する
 *
 * @param {MemberOwnerFactory.IMemberOwner} memberOwner 会員所有者
 */
// async function saveGMOMember(memberOwner: MemberOwnerFactory.IOwner) {
//     // GMO会員登録
//     // GMOサイト情報は環境変数に持たせる(1システムにつき1サイト)
//     // 2回目かもしれないので、存在チェック
//     const searchMemberResult = await GMO.services.card.searchMember({
//         siteId: process.env.GMO_SITE_ID,
//         sitePass: process.env.GMO_SITE_PASS,
//         memberId: memberOwner.id
//     });
//     debug('GMO searchMember processed', searchMemberResult);

//     if (searchMemberResult !== null) {
//         // 存在していれば変更
//         const updateMemberResult = await GMO.services.card.updateMember({
//             siteId: process.env.GMO_SITE_ID,
//             sitePass: process.env.GMO_SITE_PASS,
//             memberId: memberOwner.id,
//             memberName: `${memberOwner.name_last} ${memberOwner.name_first}`
//         });
//         debug('GMO updateMember processed', updateMemberResult);
//     } else {
//         const saveMemberResult = await GMO.services.card.saveMember({
//             siteId: process.env.GMO_SITE_ID,
//             sitePass: process.env.GMO_SITE_PASS,
//             memberId: memberOwner.id,
//             memberName: `${memberOwner.name_last} ${memberOwner.name_first}`
//         });
//         debug('GMO saveMember processed', saveMemberResult);
//     }
// }

/**
 * 取引中の所有者に対してカード情報を保管する
 *
 * @export
 * @param {string} actionId 取引ID
 * @param {string} ownerId 所有者ID
 * @param {(GMOCardFactory.IGMOCardRaw | GMOCardFactory.IGMOCardTokenized)} gmoCard GMOカード情報
 * @returns {ActionOperation<void>} 取引に対する操作
 */
// export function saveCard(
//     actionId: string,
//     ownerId: string,
//     gmoCard: GMOCardFactory.IUncheckedCardRaw | GMOCardFactory.IUncheckedCardTokenized
// ): ActionOperation<void> {
//     return async (actionAdapter: ActionAdapter) => {
//         // 取引取得
//         const buyAction = await actionAdapter.actionModel.findById(actionId).populate('owners').exec()
//             .then((doc) => {
//                 if (doc === null) {
//                     throw new ArgumentError('actionId', `buyAction[id:${actionId}] not found.`);
//                 }

//                 return <ActionFactory.IAction>doc.toObject();
//             });

//         // 取引から、更新対象の所有者を取り出す
//         const existingOwner = buyAction.owners.find((ownerInAction) => ownerInAction.id === ownerId);
//         if (existingOwner === undefined) {
//             throw new ArgumentError('ownerId', `owner[id:${ownerId}] not found`);
//         }
//         // 万が一会員所有者でなければ不適切な操作
//         if (existingOwner.group !== OwnerGroup.MEMBER) {
//             throw new ArgumentError('ownerId', `owner[id:${ownerId}] is not a member`);
//         }

//         // 登録済みのカードがあれば削除
//         // もし会員未登録でこのサービスを使えば、この時点でGMOエラー
//         const searchCardResults = await GMO.services.card.searchCard({
//             siteId: process.env.GMO_SITE_ID,
//             sitePass: process.env.GMO_SITE_PASS,
//             memberId: ownerId,
//             seqMode: GMO.utils.util.SEQ_MODE_PHYSICS
//         });
//         debug('GMO searchCard processed', searchCardResults);

//         await Promise.all(searchCardResults.map(async (searchCardResult) => {
//             // 未削除であれば削除
//             if (searchCardResult.deleteFlag !== '1') {
//                 const deleteCardResult = await GMO.services.card.deleteCard({
//                     siteId: process.env.GMO_SITE_ID,
//                     sitePass: process.env.GMO_SITE_PASS,
//                     memberId: ownerId,
//                     seqMode: GMO.utils.util.SEQ_MODE_PHYSICS,
//                     cardSeq: searchCardResult.cardSeq
//                 });
//                 debug('GMO deleteCard processed', deleteCardResult);
//             }
//         }));

//         // GMOカード登録
//         const saveCardResult = await GMO.services.card.saveCard({
//             siteId: process.env.GMO_SITE_ID,
//             sitePass: process.env.GMO_SITE_PASS,
//             memberId: ownerId,
//             seqMode: GMO.utils.util.SEQ_MODE_PHYSICS,
//             cardNo: (<GMOCardFactory.IUncheckedCardRaw>gmoCard).card_no,
//             cardPass: (<GMOCardFactory.IUncheckedCardRaw>gmoCard).card_pass,
//             expire: (<GMOCardFactory.IUncheckedCardRaw>gmoCard).expire,
//             holderName: (<GMOCardFactory.IUncheckedCardRaw>gmoCard).holder_name,
//             token: (<GMOCardFactory.IUncheckedCardTokenized>gmoCard).token
//         });
//         debug('GMO saveCard processed', saveCardResult);
//     };
// }

/**
 * 照合を可能にする
 *
 * @param {string} actionId
 * @param {ActionInquiryKey} key
 * @returns {ActionOperation<monapt.Option<Action>>}
 *
 * @memberof service/orderById
 */
export function enableInquiry(actionId: string, orderInquiryKey: OrderInquiryKeyFactory.IOrderInquiryKey) {
    return async (actionAdapter: ActionAdapter) => {
        debug('updating buyAction...');
        await actionAdapter.actionModel.findOneAndUpdate(
            {
                _id: actionId,
                actionStatus: ActionStatusType.ActiveActionStatus
            },
            {
                'object.orderInquiryKey': orderInquiryKey
            },
            { new: true }
        ).exec()
            .then((doc) => {
                if (doc === null) {
                    throw new Error('UNDERWAY buyAction not found');
                }
            });
    };
}

/**
 * 取引成立
 *
 * @param {string} actionId
 * @returns {ActionOperation<void>}
 *
 * @memberof service/orderById
 */
export function close(actionId: string) {
    return async (actionAdapter: ActionAdapter) => {
        const buyAction = await findByActionId(actionId)(actionAdapter)
            .then((option) => {
                if (option.isEmpty) {
                    throw new ArgumentError('actionId', `action[${actionId}] not found.`);
                }

                return option.get();
            });

        // 照会可能になっているかどうか
        const orderInquiryKey = <OrderInquiryKeyFactory.IOrderInquiryKey>buyAction.object.orderInquiryKey;
        if (_.isEmpty(orderInquiryKey)) {
            throw new Error('inquiry is not available');
        }

        // 条件が対等かどうかチェック
        if (!canBeClosed(buyAction)) {
            throw new Error('buyAction cannot be closed');
        }

        // 結果作成
        const coaSeatReservationAuthorization = <COASeatReservationAuthorizationFactory.IAuthorization>buyAction.object.actionEvents
            .filter((actionEvent) => actionEvent.actionEventType === ActionEventGroup.Authorize)
            .map((actionEvent: AuthorizeActionEventFactory.IActionEvent) => actionEvent.authorization)
            .find((authorization) => authorization.group === AuthorizationGroup.COA_SEAT_RESERVATION);
        const order = OrderFactory.createFromBuyAction({
            coaSeatReservationAuthorization: coaSeatReservationAuthorization,
            customerName: buyAction.agent.name,
            seller: {
                name: buyAction.seller.name,
                sameAs: ''
            },
            orderNumber: `${orderInquiryKey.theaterCode}-${orderInquiryKey.orderNumber}`,
            orderInquiryKey: orderInquiryKey
        });
        const ownershipInfos = order.acceptedOffer.map((reservation) => {
            return OwnershipInfoFactory.create({
                acquiredFrom: buyAction.seller,
                ownedFrom: new Date(),
                ownedThrough: moment().add(1, 'month').toDate(),
                typeOfGood: reservation
            });
        });
        const result: BuyActionFactory.IResult = {
            order: order,
            ownershipInfos: ownershipInfos
        };

        // ステータス変更
        debug('updating buyAction...');
        await actionAdapter.actionModel.findOneAndUpdate(
            {
                _id: actionId,
                actionStatus: ActionStatusType.ActiveActionStatus
            },
            {
                actionStatus: ActionStatusType.CompletedActionStatus,
                endDate: moment().toDate(),
                result: result
            },
            { new: true }
        ).exec()
            .then((doc) => {
                if (doc === null) {
                    throw new Error('進行中の購入アクションはありません');
                }
            });
    };
}

/**
 * 成立可能かどうか
 *
 * @returns {boolean}
 */
function canBeClosed(buyAction: BuyActionFactory.IAction) {
    // 承認リストを取り出す
    const removedAuthorizationIds = buyAction.object.actionEvents
        .filter((actionEvent) => actionEvent.actionEventType === ActionEventGroup.Unauthorize)
        .map((actionEvent: UnauthorizeActionEventFactory.IActionEvent) => actionEvent.authorization.id);
    const authorizations = buyAction.object.actionEvents
        .filter((actionEvent) => actionEvent.actionEventType === ActionEventGroup.Authorize)
        .map((actionEvent: AuthorizeActionEventFactory.IActionEvent) => actionEvent.authorization)
        .filter((authorization) => removedAuthorizationIds.indexOf(authorization.id) < 0);

    const priceByAgent = authorizations
        .filter((authorization) => authorization.agent.id === buyAction.agent.id)
        .reduce((a, b) => a + b.price, 0);
    const priceBySeller = authorizations
        .filter((authorization) => authorization.agent.id === buyAction.seller.id)
        .reduce((a, b) => a + b.price, 0);

    debug('prices:', priceByAgent, priceBySeller);

    return priceByAgent === priceBySeller;
}
