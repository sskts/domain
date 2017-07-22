"use strict";
/**
 * 進行中取引サービス
 *
 * @namespace service/tradeInProgress
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const createDebug = require("debug");
const moment = require("moment");
const monapt = require("monapt");
const _ = require("underscore");
const argument_1 = require("../error/argument");
const AddNotificationActionEventFactory = require("../factory/actionEvent/addNotification");
const AuthorizeActionEventFactory = require("../factory/actionEvent/authorize");
const RemoveNotificationActionEventFactory = require("../factory/actionEvent/removeNotification");
const UnauthorizeActionEventFactory = require("../factory/actionEvent/unauthorize");
const actionEventType_1 = require("../factory/actionEventType");
const actionStatusType_1 = require("../factory/actionStatusType");
const COASeatReservationAuthorizationFactory = require("../factory/authorization/coaSeatReservation");
const GMOAuthorizationFactory = require("../factory/authorization/gmo");
const authorizationGroup_1 = require("../factory/authorizationGroup");
const OrderFactory = require("../factory/order");
const OwnershipInfoFactory = require("../factory/ownershipInfo");
const debug = createDebug('sskts-domain:service:buyAction');
/**
 * アクションIDから取得する
 */
function findByActionId(actionId) {
    return (actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        return yield actionAdapter.actionModel.findOne({
            _id: actionId,
            typeOf: 'BuyAction',
            actionStatus: actionStatusType_1.default.ActiveActionStatus
        })
            .exec()
            .then((doc) => {
            return (doc === null) ? monapt.None : monapt.Option(doc.toObject());
        });
    });
}
exports.findByActionId = findByActionId;
function pushEvent(actionId, actionEvent) {
    return (actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        yield actionAdapter.actionModel.findByIdAndUpdate(actionId, { $push: { 'object.actionEvents': actionEvent } }).exec();
    });
}
function addAuthorization(actionId, authorization) {
    return (actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const buyAction = yield findByActionId(actionId)(actionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('actionId', `action[${actionId}] not found.`);
            }
            return option.get();
        });
        // 所有者が取引に存在するかチェック
        if (buyAction.agent.id !== authorization.agent.id && buyAction.seller.id !== authorization.agent.id) {
            throw new argument_1.default('authorization.agent', `action[${actionId}] does not contain an agent[${authorization.agent.id}].`);
        }
        // イベント作成
        const event = AuthorizeActionEventFactory.create({
            occurredAt: new Date(),
            authorization: authorization
        });
        // 永続化
        debug('adding an event...', event);
        yield pushEvent(actionId, event)(actionAdapter);
    });
}
exports.addAuthorization = addAuthorization;
/**
 * GMOクレジットカードオーソリ
 */
function authorizeGMOCard(actionId, gmoAction) {
    return (organizationAdapter, actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const buyAction = yield findByActionId(actionId)(actionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('actionId', `action[${actionId}] not found.`);
            }
            return option.get();
        });
        // GMOショップ情報取得
        const movieTheater = yield organizationAdapter.organizationModel.findById(buyAction.seller.id).exec()
            .then((doc) => {
            if (doc === null) {
                throw new Error('movieTheater not found');
            }
            return doc.toObject();
        });
        // GMOオーソリ取得
        const entryTranResult = yield GMO.CreditService.entryTran({
            shopId: movieTheater.gmoInfo.shopID,
            shopPass: movieTheater.gmoInfo.shopPass,
            orderId: gmoAction.orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
            amount: gmoAction.amount
        });
        const execTranResult = yield GMO.CreditService.execTran({
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
        yield addAuthorization(actionId, gmoAuthorization)(actionAdapter);
        debug('GMOAuthorization added.');
        return gmoAuthorization;
    });
}
exports.authorizeGMOCard = authorizeGMOCard;
function acceptIndivisualScreeningEventOffers(actionId, indivisualScreeningEvent, offers) {
    // tslint:disable-next-line:max-func-body-length
    return (actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const buyAction = yield findByActionId(actionId)(actionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('actionId', `action[${actionId}] not found.`);
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
        const reserveSeatsTemporarilyResult = yield COA.services.reserve.updTmpReserveSeat(updTmpReserveSeatArgs);
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
        yield addAuthorization(actionId, coaAuthorization)(actionAdapter);
        debug('coaAuthorization added.');
        return coaAuthorization;
    });
}
exports.acceptIndivisualScreeningEventOffers = acceptIndivisualScreeningEventOffers;
/**
 * ムビチケ着券承認追加
 *
 * @param {string} actionId
 * @param {MvtkAuthorization.IMvtkAuthorization} authorization
 * @returns {PersonAndActionOperation<void>}
 *
 * @memberof service/orderById
 */
function addMvtkAuthorization(actionId, authorization) {
    return addAuthorization(actionId, authorization);
}
exports.addMvtkAuthorization = addMvtkAuthorization;
function deleteAuthorization(actionId, authorizationId) {
    return (actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const buyAction = yield findByActionId(actionId)(actionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('actionId', `action[${actionId}] not found.`);
            }
            return option.get();
        });
        const authorizeActionEvent = buyAction.object.actionEvents.find((actionEvent) => actionEvent.actionEventType === actionEventType_1.default.Authorize &&
            actionEvent.authorization.id === authorizationId);
        if (authorizeActionEvent === undefined) {
            throw new argument_1.default('authorizationId', `authorization [${authorizationId}] not found in the buyAction.`);
        }
        const authorization = authorizeActionEvent.authorization;
        switch (authorization.group) {
            case authorizationGroup_1.default.COA_SEAT_RESERVATION:
                yield COA.services.reserve.delTmpReserve({
                    theater_code: authorization.object.updTmpReserveSeatArgs.theater_code,
                    date_jouei: authorization.object.updTmpReserveSeatArgs.date_jouei,
                    title_code: authorization.object.updTmpReserveSeatArgs.title_code,
                    title_branch_num: authorization.object.updTmpReserveSeatArgs.title_branch_num,
                    time_begin: authorization.object.updTmpReserveSeatArgs.time_begin,
                    tmp_reserve_num: authorization.result.tmp_reserve_num
                });
                break;
            case authorizationGroup_1.default.GMO:
                yield GMO.services.credit.alterTran({
                    shopId: authorization.object.shopId,
                    shopPass: authorization.object.shopPass,
                    accessId: authorization.object.accessId,
                    accessPass: authorization.object.accessPass,
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
        yield pushEvent(actionId, event)(actionAdapter);
    });
}
exports.deleteAuthorization = deleteAuthorization;
/**
 * メール追加
 *
 * @param {string} actionId
 * @param {EmailNotification} notification
 * @returns {ActionOperation<void>}
 *
 * @memberof service/orderById
 */
function addEmail(actionId, notification) {
    return (actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        // イベント作成
        const event = AddNotificationActionEventFactory.create({
            occurredAt: new Date(),
            notification: notification
        });
        // 永続化
        debug('adding an event...', event);
        yield pushEvent(actionId, event)(actionAdapter);
    });
}
exports.addEmail = addEmail;
/**
 * メール削除
 *
 * @param {string} actionId
 * @param {string} notificationId
 * @returns {ActionOperation<void>}
 *
 * @memberof service/orderById
 */
function removeEmail(actionId, notificationId) {
    return (actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const buyAction = yield findByActionId(actionId)(actionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('actionId', `action[${actionId}] not found.`);
            }
            return option.get();
        });
        const addNotificationActionEvent = buyAction.object.actionEvents.find((actionEvent) => actionEvent.actionEventType === actionEventType_1.default.AddNotification &&
            actionEvent.notification.id === notificationId);
        if (addNotificationActionEvent === undefined) {
            throw new argument_1.default('notificationId', `notification [${notificationId}] not found in the buyAction.`);
        }
        // イベント作成
        const event = RemoveNotificationActionEventFactory.create({
            occurredAt: new Date(),
            notification: addNotificationActionEvent.notification
        });
        // 永続化
        yield pushEvent(actionId, event)(actionAdapter);
    });
}
exports.removeEmail = removeEmail;
/**
 * 取引中の所有者プロフィールを変更する
 * 匿名所有者として開始した場合のみ想定(匿名か会員に変更可能)
 */
function setAgentProfile(actionId, profile) {
    return (personAdapter, actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const buyAction = yield findByActionId(actionId)(actionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('actionId', `action[${actionId}] not found.`);
            }
            return option.get();
        });
        // 永続化
        yield actionAdapter.actionModel.findOneAndUpdate({
            _id: actionId,
            actionStatus: actionStatusType_1.default.ActiveActionStatus
        }, {
            'agent.name': `${profile.familyName} ${profile.givenName}`
        }).exec();
        debug('setting person profile...');
        yield personAdapter.personModel.findByIdAndUpdate(buyAction.agent.id, profile).exec();
        debug('person updated');
    });
}
exports.setAgentProfile = setAgentProfile;
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
function enableInquiry(actionId, orderInquiryKey) {
    return (actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        debug('updating buyAction...');
        yield actionAdapter.actionModel.findOneAndUpdate({
            _id: actionId,
            actionStatus: actionStatusType_1.default.ActiveActionStatus
        }, {
            'object.orderInquiryKey': orderInquiryKey
        }, { new: true }).exec()
            .then((doc) => {
            if (doc === null) {
                throw new Error('UNDERWAY buyAction not found');
            }
        });
    });
}
exports.enableInquiry = enableInquiry;
/**
 * 取引成立
 *
 * @param {string} actionId
 * @returns {ActionOperation<void>}
 *
 * @memberof service/orderById
 */
function close(actionId) {
    return (actionAdapter) => __awaiter(this, void 0, void 0, function* () {
        const buyAction = yield findByActionId(actionId)(actionAdapter)
            .then((option) => {
            if (option.isEmpty) {
                throw new argument_1.default('actionId', `action[${actionId}] not found.`);
            }
            return option.get();
        });
        // 照会可能になっているかどうか
        const orderInquiryKey = buyAction.object.orderInquiryKey;
        if (_.isEmpty(orderInquiryKey)) {
            throw new Error('inquiry is not available');
        }
        // 条件が対等かどうかチェック
        if (!canBeClosed(buyAction)) {
            throw new Error('buyAction cannot be closed');
        }
        // 結果作成
        const coaSeatReservationAuthorization = buyAction.object.actionEvents
            .filter((actionEvent) => actionEvent.actionEventType === actionEventType_1.default.Authorize)
            .map((actionEvent) => actionEvent.authorization)
            .find((authorization) => authorization.group === authorizationGroup_1.default.COA_SEAT_RESERVATION);
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
        const result = {
            order: order,
            ownershipInfos: ownershipInfos
        };
        // ステータス変更
        debug('updating buyAction...');
        yield actionAdapter.actionModel.findOneAndUpdate({
            _id: actionId,
            actionStatus: actionStatusType_1.default.ActiveActionStatus
        }, {
            actionStatus: actionStatusType_1.default.CompletedActionStatus,
            endDate: moment().toDate(),
            result: result
        }, { new: true }).exec()
            .then((doc) => {
            if (doc === null) {
                throw new Error('進行中の購入アクションはありません');
            }
        });
    });
}
exports.close = close;
/**
 * 成立可能かどうか
 *
 * @returns {boolean}
 */
function canBeClosed(buyAction) {
    // 承認リストを取り出す
    const removedAuthorizationIds = buyAction.object.actionEvents
        .filter((actionEvent) => actionEvent.actionEventType === actionEventType_1.default.Unauthorize)
        .map((actionEvent) => actionEvent.authorization.id);
    const authorizations = buyAction.object.actionEvents
        .filter((actionEvent) => actionEvent.actionEventType === actionEventType_1.default.Authorize)
        .map((actionEvent) => actionEvent.authorization)
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
