"use strict";
/**
 * placeOrder in progress transaction service
 * 進行中注文取引サービス
 * @namespace service/transaction/placeOrderInProgress
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
const factory = require("@motionpicture/sskts-factory");
const createDebug = require("debug");
const moment = require("moment");
const mongoose = require("mongoose");
const debug = createDebug('sskts-domain:service:transaction:placeOrderInProgress');
/**
 * 取引開始
 */
function start(args) {
    return (
        // personRepository: PersonRepository,
        organizationRepository, transactionRepository, transactionCountRepository) => __awaiter(this, void 0, void 0, function* () {
        // 利用可能かどうか
        const nextCount = yield transactionCountRepository.incr(args.scope);
        if (nextCount > args.maxCountPerUnit) {
            throw new factory.errors.NotFound('available transaction');
        }
        const agent = {
            typeOf: 'Person',
            id: args.agentId,
            url: ''
        };
        if (args.clientUser.username !== undefined) {
            agent.memberOf = {
                membershipNumber: args.agentId,
                programName: 'Amazon Cognito'
            };
        }
        // 売り手を取得
        const seller = yield organizationRepository.findMovieTheaterById(args.sellerId);
        // 取引ファクトリーで新しい進行中取引オブジェクトを作成
        const transaction = factory.transaction.placeOrder.create({
            id: mongoose.Types.ObjectId().toString(),
            status: factory.transactionStatusType.InProgress,
            agent: agent,
            seller: {
                // tslint:disable-next-line:no-suspicious-comment
                // TODO enum管理
                typeOf: 'MovieTheater',
                id: seller.id,
                name: seller.name.ja,
                url: seller.url
            },
            object: {
                clientUser: args.clientUser,
                paymentInfos: [],
                discountInfos: []
            },
            expires: args.expires,
            startDate: moment().toDate()
        });
        yield transactionRepository.startPlaceOrder(transaction);
        return transaction;
    });
}
exports.start = start;
/**
 * クレジットカードオーソリ取得
 */
// tslint:disable-next-line:max-func-body-length
function createCreditCardAuthorization(agentId, transactionId, orderId, amount, method, creditCard) {
    return (organizationRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        // GMOショップ情報取得
        const movieTheater = yield organizationRepository.findMovieTheaterById(transaction.seller.id);
        const authorizeStartDate = new Date();
        // GMOオーソリ取得
        let entryTranArgs;
        let execTranArgs;
        let entryTranResult;
        let execTranResult;
        try {
            entryTranArgs = {
                shopId: movieTheater.gmoInfo.shopId,
                shopPass: movieTheater.gmoInfo.shopPass,
                orderId: orderId,
                jobCd: GMO.utils.util.JobCd.Auth,
                amount: amount
            };
            entryTranResult = yield GMO.services.credit.entryTran(entryTranArgs);
            debug('entryTranResult:', entryTranResult);
            execTranArgs = Object.assign({
                accessId: entryTranResult.accessId,
                accessPass: entryTranResult.accessPass,
                orderId: orderId,
                method: method,
                siteId: process.env.GMO_SITE_ID,
                sitePass: process.env.GMO_SITE_PASS
            }, creditCard, {
                seqMode: GMO.utils.util.SeqMode.Physics
            });
            execTranResult = yield GMO.services.credit.execTran(execTranArgs);
            debug('execTranResult:', execTranResult);
        }
        catch (error) {
            console.error('fail at entryTran or execTran', error);
            if (error.name === 'GMOServiceBadRequestError') {
                // consider E92000001,E92000002
                // GMO流量制限オーバーエラーの場合
                const serviceUnavailableError = error.errors.find((gmoError) => gmoError.info.match(/^E92000001|E92000002$/));
                if (serviceUnavailableError !== undefined) {
                    throw new factory.errors.ServiceUnavailable('payment service unavailable temporarily');
                }
                else {
                    throw new factory.errors.Argument('payment');
                }
            }
            throw new Error(error);
        }
        // GMOオーソリ追加
        debug('adding authorizeActions gmo...');
        const authorizeAction = factory.action.authorize.creditCard.create({
            id: mongoose.Types.ObjectId().toString(),
            actionStatus: factory.actionStatusType.CompletedActionStatus,
            object: {
                entryTranArgs: entryTranArgs,
                execTranArgs: execTranArgs,
                payType: GMO.utils.util.PayType.Credit
            },
            result: {
                price: amount,
                execTranResult: execTranResult
            },
            agent: transaction.agent,
            recipient: transaction.seller,
            startDate: authorizeStartDate,
            endDate: new Date()
        });
        yield transactionRepository.transactionModel.findByIdAndUpdate(transactionId, { $push: { 'object.paymentInfos': authorizeAction } }).exec();
        debug('GMOAuthorization added.');
        return authorizeAction;
    });
}
exports.createCreditCardAuthorization = createCreditCardAuthorization;
function cancelGMOAuthorization(agentId, transactionId, actionId) {
    return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        const authorizeAction = transaction.object.paymentInfos.find((paymentInfo) => paymentInfo.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.CreditCard);
        if (authorizeAction === undefined) {
            throw new factory.errors.Argument('actionId', '指定されたオーソリは見つかりません');
        }
        if (authorizeAction.id !== actionId) {
            throw new factory.errors.Argument('actionId', '指定されたオーソリは見つかりません');
        }
        // 決済取消
        yield GMO.services.credit.alterTran({
            shopId: authorizeAction.object.entryTranArgs.shopId,
            shopPass: authorizeAction.object.entryTranArgs.shopPass,
            accessId: authorizeAction.object.execTranArgs.accessId,
            accessPass: authorizeAction.object.execTranArgs.accessPass,
            jobCd: GMO.utils.util.JobCd.Void
        });
        debug('alterTran processed', GMO.utils.util.JobCd.Void);
        yield transactionRepository.transactionModel.findByIdAndUpdate(transaction.id, {
            $pull: { 'object.paymentInfos': { id: actionId } }
        }).exec();
    });
}
exports.cancelGMOAuthorization = cancelGMOAuthorization;
function createSeatReservationAuthorization(agentId, transactionId, individualScreeningEvent, offers) {
    return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        const authorizeStartDate = new Date();
        // todo 座席コードがすでにキープ済みのものかどうかチェックできる？
        // COA仮予約
        const updTmpReserveSeatArgs = {
            theaterCode: individualScreeningEvent.coaInfo.theaterCode,
            dateJouei: individualScreeningEvent.coaInfo.dateJouei,
            titleCode: individualScreeningEvent.coaInfo.titleCode,
            titleBranchNum: individualScreeningEvent.coaInfo.titleBranchNum,
            timeBegin: individualScreeningEvent.coaInfo.timeBegin,
            screenCode: individualScreeningEvent.coaInfo.screenCode,
            listSeat: offers.map((offer) => {
                return {
                    seatSection: offer.seatSection,
                    seatNum: offer.seatNumber
                };
            })
        };
        debug('updTmpReserveSeat processing...', updTmpReserveSeatArgs);
        const reserveSeatsTemporarilyResult = yield COA.services.reserve.updTmpReserveSeat(updTmpReserveSeatArgs);
        debug('updTmpReserveSeat processed', reserveSeatsTemporarilyResult);
        // COAオーソリ追加
        debug('adding authorizeActions coaSeatReservation...');
        const authorizeAction = factory.action.authorize.seatReservation.createFromCOATmpReserve({
            actionStatus: factory.actionStatusType.CompletedActionStatus,
            agent: transaction.seller,
            recipient: transaction.agent,
            updTmpReserveSeatArgs: updTmpReserveSeatArgs,
            reserveSeatsTemporarilyResult: reserveSeatsTemporarilyResult,
            offers: offers,
            individualScreeningEvent: individualScreeningEvent,
            startDate: authorizeStartDate,
            endDate: new Date()
        });
        yield transactionRepository.transactionModel.findByIdAndUpdate(transaction.id, { 'object.seatReservation': authorizeAction }).exec();
        debug('coaAuthorization added.');
        return authorizeAction;
    });
}
exports.createSeatReservationAuthorization = createSeatReservationAuthorization;
function cancelSeatReservationAuthorization(agentId, transactionId, actionId) {
    return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        const authorizeAction = transaction.object.seatReservation;
        if (authorizeAction === undefined) {
            throw new factory.errors.Argument('actionId', '指定された座席予約は見つかりません');
        }
        if (authorizeAction.id !== actionId) {
            throw new factory.errors.Argument('actionId', '指定された座席予約は見つかりません');
        }
        // 座席仮予約削除
        debug('delTmpReserve processing...', authorizeAction);
        yield COA.services.reserve.delTmpReserve({
            theaterCode: authorizeAction.object.updTmpReserveSeatArgs.theaterCode,
            dateJouei: authorizeAction.object.updTmpReserveSeatArgs.dateJouei,
            titleCode: authorizeAction.object.updTmpReserveSeatArgs.titleCode,
            titleBranchNum: authorizeAction.object.updTmpReserveSeatArgs.titleBranchNum,
            timeBegin: authorizeAction.object.updTmpReserveSeatArgs.timeBegin,
            tmpReserveNum: authorizeAction.result.updTmpReserveSeatResult.tmpReserveNum
        });
        debug('delTmpReserve processed');
        yield transactionRepository.transactionModel.findByIdAndUpdate(transaction.id, {
            $unset: { 'object.seatReservation': 1 }
        }).exec();
    });
}
exports.cancelSeatReservationAuthorization = cancelSeatReservationAuthorization;
/**
 * create a mvtk authorizeAction
 * add the result of using a mvtk card
 * @export
 * @function
 * @param {string} transactionId
 * @param {factory.action.authorize.mvtk.IObject} authorizeActionObject
 * @return ITransactionOperation<factory.action.authorize.mvtk.IAuthorizeAction>
 * @memberof service/transaction/placeOrder
 */
function createMvtkAuthorization(agentId, transactionId, authorizeObject) {
    return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        const authorizeStartDate = new Date();
        const seatReservationAuthorization = transaction.object.seatReservation;
        // seatReservationAuthorization already exists?
        if (seatReservationAuthorization === undefined) {
            throw new Error('seat reservation authorizeAction not created yet');
        }
        const knyknrNoNumsByNoShouldBe = seatReservationAuthorization.object.acceptedOffers.reduce((a, b) => {
            const knyknrNo = b.itemOffered.reservedTicket.coaTicketInfo.mvtkNum;
            if (a[knyknrNo] === undefined) {
                a[knyknrNo] = 0;
            }
            a[knyknrNo] += 1;
            return a;
        }, {});
        const knyknrNoNumsByNo = authorizeObject.seatInfoSyncIn.knyknrNoInfo.reduce((a, b) => {
            if (a[b.knyknrNo] === undefined) {
                a[b.knyknrNo] = 0;
            }
            const knyknrNoNum = b.knshInfo.reduce((a2, b2) => a2 + b2.miNum, 0);
            a[b.knyknrNo] += knyknrNoNum;
            return a;
        }, {});
        debug('knyknrNoNumsByNo:', knyknrNoNumsByNo);
        debug('knyyknrNoNumsByNoShouldBe:', knyknrNoNumsByNoShouldBe);
        const knyknrNoExistsInSeatReservation = Object.keys(knyknrNoNumsByNo).every((knyknrNo) => knyknrNoNumsByNo[knyknrNo] === knyknrNoNumsByNoShouldBe[knyknrNo]);
        const knyknrNoExistsMvtkResult = Object.keys(knyknrNoNumsByNoShouldBe).every((knyknrNo) => knyknrNoNumsByNo[knyknrNo] === knyknrNoNumsByNoShouldBe[knyknrNo]);
        if (!knyknrNoExistsInSeatReservation || !knyknrNoExistsMvtkResult) {
            throw new factory.errors.Argument('authorizeActionResult', 'knyknrNoInfo not matched with seat reservation authorizeAction');
        }
        // stCd matched? (last two figures of theater code)
        // tslint:disable-next-line:no-magic-numbers
        const stCdShouldBe = seatReservationAuthorization.object.updTmpReserveSeatArgs.theaterCode.slice(-2);
        if (authorizeObject.seatInfoSyncIn.stCd !== stCdShouldBe) {
            throw new factory.errors.Argument('authorizeActionResult', 'stCd not matched with seat reservation authorizeAction');
        }
        // skhnCd matched?
        // tslint:disable-next-line:max-line-length
        const skhnCdShouldBe = `${seatReservationAuthorization.object.updTmpReserveSeatArgs.titleCode}${seatReservationAuthorization.object.updTmpReserveSeatArgs.titleBranchNum}`;
        if (authorizeObject.seatInfoSyncIn.skhnCd !== skhnCdShouldBe) {
            throw new factory.errors.Argument('authorizeActionResult', 'skhnCd not matched with seat reservation authorizeAction');
        }
        // screen code matched?
        if (authorizeObject.seatInfoSyncIn.screnCd !== seatReservationAuthorization.object.updTmpReserveSeatArgs.screenCode) {
            throw new factory.errors.Argument('authorizeActionResult', 'screnCd not matched with seat reservation authorizeAction');
        }
        // seat num matched?
        const seatNumsInSeatReservationAuthorization = seatReservationAuthorization.result.updTmpReserveSeatResult.listTmpReserve.map((tmpReserve) => tmpReserve.seatNum);
        if (!authorizeObject.seatInfoSyncIn.zskInfo.every((zskInfo) => seatNumsInSeatReservationAuthorization.indexOf(zskInfo.zskCd) >= 0)) {
            throw new factory.errors.Argument('authorizeActionResult', 'zskInfo not matched with seat reservation authorizeAction');
        }
        const authorizeAction = factory.action.authorize.mvtk.create({
            actionStatus: factory.actionStatusType.CompletedActionStatus,
            id: mongoose.Types.ObjectId().toString(),
            result: {
                price: authorizeObject.price
            },
            object: authorizeObject,
            agent: transaction.agent,
            recipient: transaction.seller,
            startDate: authorizeStartDate,
            endDate: new Date()
        });
        yield transactionRepository.transactionModel.findByIdAndUpdate(transactionId, { $push: { 'object.discountInfos': authorizeAction } }).exec();
        return authorizeAction;
    });
}
exports.createMvtkAuthorization = createMvtkAuthorization;
function cancelMvtkAuthorization(agentId, transactionId, actionId) {
    return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        const authorizeAction = transaction.object.discountInfos.find((discountInfo) => discountInfo.purpose.typeOf === factory.action.authorize.authorizeActionPurpose.Mvtk);
        if (authorizeAction === undefined) {
            throw new factory.errors.Argument('actionId', 'mvtk authorizeAction not found');
        }
        if (authorizeAction.id !== actionId) {
            throw new factory.errors.Argument('actionId', 'mvtk authorizeAction not found');
        }
        yield transactionRepository.transactionModel.findByIdAndUpdate(transaction.id, {
            $pull: { 'object.discountInfos': { id: actionId } }
        }).exec();
    });
}
exports.cancelMvtkAuthorization = cancelMvtkAuthorization;
/**
 * メール追加
 *
 * @param {string} transactionId
 * @param {EmailNotification} notification
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transaction/placeOrder
 */
// export function addEmail(transactionId: string, notification: EmailNotificationFactory.INotification) {
//     return async (transactionRepository: TransactionRepository) => {
//         // イベント作成
//         const event = AddNotificationTransactionEventFactory.create({
//             occurredAt: new Date(),
//             notification: notification
//         });
//         // 永続化
//         debug('adding an event...', event);
//         await pushEvent(transactionId, event)(transactionRepository);
//     };
// }
/**
 * メール削除
 *
 * @param {string} transactionId
 * @param {string} notificationId
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transaction/placeOrder
 */
// export function removeEmail(transactionId: string, notificationId: string) {
//     return async (transactionRepository: TransactionRepository) => {
//         const transaction = await findInProgressById(transactionId)(transactionRepository)
//             .then((option) => {
//                 if (option.isEmpty) {
//                     throw new factory.errors.Argument('transactionId', `transaction[${transactionId}] not found.`);
//                 }
//                 return option.get();
//             });
//         type ITransactionEvent = AddNotificationTransactionEventFactory.ITransactionEvent<EmailNotificationFactory.INotification>;
//         const addNotificationTransactionEvent = <ITransactionEvent>transaction.object.actionEvents.find(
//             (actionEvent) =>
//                 actionEvent.actionEventType === TransactionEventGroup.AddNotification &&
//                 (<ITransactionEvent>actionEvent).notification.id === notificationId
//         );
//         if (addNotificationTransactionEvent === undefined) {
//             throw new factory.errors.Argument('notificationId', `notification [${notificationId}] not found in the transaction.`);
//         }
//         // イベント作成
//         const event = RemoveNotificationTransactionEventFactory.create({
//             occurredAt: new Date(),
//             notification: addNotificationTransactionEvent.notification
//         });
//         // 永続化
//         await pushEvent(transactionId, event)(transactionRepository);
//     };
// }
/**
 * 取引中の購入者情報を変更する
 */
function setCustomerContacts(agentId, transactionId, contact) {
    return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        yield transactionRepository.setCustomerContactsOnPlaceOrderInProgress(transactionId, contact);
    });
}
exports.setCustomerContacts = setCustomerContacts;
/**
 * 取引確定
 */
function confirm(agentId, transactionId) {
    // tslint:disable-next-line:max-func-body-length
    return (transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        // 照会可能になっているかどうか
        if (!canBeClosed(transaction)) {
            throw new Error('transaction cannot be closed');
        }
        // 結果作成
        const order = factory.order.createFromPlaceOrderTransaction({
            transaction: transaction
        });
        const ownershipInfos = order.acceptedOffers.map((acceptedOffer) => {
            return factory.ownershipInfo.create({
                ownedBy: {
                    id: transaction.agent.id,
                    typeOf: transaction.agent.typeOf,
                    name: order.customer.name
                },
                acquiredFrom: transaction.seller,
                ownedFrom: new Date(),
                ownedThrough: moment().add(1, 'month').toDate(),
                typeOfGood: acceptedOffer.itemOffered
            });
        });
        const result = {
            order: order,
            ownershipInfos: ownershipInfos
        };
        // ステータス変更
        debug('updating transaction...');
        yield transactionRepository.confirmPlaceOrder(transaction.id, result);
        return order;
    });
}
exports.confirm = confirm;
/**
 * whether a transaction can be closed
 * @function
 * @returns {boolean}
 */
function canBeClosed(transaction) {
    // seatReservation exists?
    const seatReservationAuthorization = transaction.object.seatReservation;
    if (seatReservationAuthorization === undefined) {
        return false;
    }
    const paymentInfos = transaction.object.paymentInfos;
    const discountInfos = transaction.object.discountInfos;
    const priceBySeller = seatReservationAuthorization.result.price;
    const priceByAgent = paymentInfos.reduce((a, b) => a + b.result.price, 0) + discountInfos.reduce((a, b) => a + b.result.price, 0);
    // price matched between an agent and a seller?
    return priceByAgent === priceBySeller;
}
