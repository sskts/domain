"use strict";
/**
 * placeOrder in progress transaction service
 * 進行中注文取引サービス
 * @namespace service.transaction.placeOrderInProgress
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
const debug = createDebug('sskts-domain:service:transaction:placeOrderInProgress');
/**
 * 取引開始
 */
function start(params) {
    return (organizationRepository, transactionRepository, transactionCountRepository) => __awaiter(this, void 0, void 0, function* () {
        // 利用可能かどうか
        const nextCount = yield transactionCountRepository.incr(params.scope);
        if (nextCount > params.maxCountPerUnit) {
            throw new factory.errors.NotFound('available transaction');
        }
        const agent = {
            typeOf: 'Person',
            id: params.agentId,
            url: ''
        };
        if (params.clientUser.username !== undefined) {
            agent.memberOf = {
                membershipNumber: params.agentId,
                programName: 'Amazon Cognito'
            };
        }
        // 売り手を取得
        const seller = yield organizationRepository.findMovieTheaterById(params.sellerId);
        // 取引ファクトリーで新しい進行中取引オブジェクトを作成
        const transactionAttributes = factory.transaction.placeOrder.createAttributes({
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
                clientUser: params.clientUser,
                authorizeActions: []
            },
            expires: params.expires,
            startDate: new Date()
        });
        return yield transactionRepository.startPlaceOrder(transactionAttributes);
    });
}
exports.start = start;
/**
 * クレジットカードオーソリ取得
 */
function authorizeCreditCard(agentId, transactionId, orderId, amount, method, creditCard) {
    // tslint:disable-next-line:max-func-body-length
    return (actionRepository, organizationRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        // GMOショップ情報取得
        const movieTheater = yield organizationRepository.findMovieTheaterById(transaction.seller.id);
        // 承認アクションを開始する
        const actionAttributes = factory.action.authorize.creditCard.createAttributes({
            actionStatus: factory.actionStatusType.ActiveActionStatus,
            object: {
                transactionId: transactionId,
                orderId: orderId,
                amount: amount,
                method: method,
                payType: GMO.utils.util.PayType.Credit
            },
            agent: transaction.agent,
            recipient: transaction.seller,
            startDate: new Date()
        });
        const action = yield actionRepository.actionModel.create(actionAttributes).then((doc) => doc.toObject());
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
            // actionにエラー結果を追加
            try {
                yield actionRepository.actionModel.findByIdAndUpdate(action.id, {
                    actionStatus: factory.actionStatusType.FailedActionStatus,
                    error: error,
                    endDate: new Date()
                }, { new: true }).exec();
            }
            catch (__) {
                // 失敗したら仕方ない
            }
            if (error.name === 'GMOServiceBadRequestError') {
                // consider E92000001,E92000002
                // GMO流量制限オーバーエラーの場合
                const serviceUnavailableError = error.errors.find((gmoError) => gmoError.info.match(/^E92000001|E92000002$/));
                if (serviceUnavailableError !== undefined) {
                    throw new factory.errors.ServiceUnavailable(serviceUnavailableError.userMessage);
                }
                // オーダーID重複エラーの場合
                const duplicateError = error.errors.find((gmoError) => gmoError.info.match(/^E01040010$/));
                if (duplicateError !== undefined) {
                    throw new factory.errors.AlreadyInUse('action.object', ['orderId'], duplicateError.userMessage);
                }
                // その他のGMOエラーに場合、なんらかのクライアントエラー
                throw new factory.errors.Argument('payment');
            }
            throw new Error(error);
        }
        // アクションを完了
        debug('ending authorize action...');
        return yield actionRepository.actionModel.findByIdAndUpdate(action.id, {
            actionStatus: factory.actionStatusType.CompletedActionStatus,
            result: {
                price: amount,
                entryTranArgs: entryTranArgs,
                execTranArgs: execTranArgs,
                execTranResult: execTranResult
            },
            endDate: new Date()
        }, { new: true }).exec().then((doc) => doc.toObject());
    });
}
exports.authorizeCreditCard = authorizeCreditCard;
function cancelCreditCardAuth(agentId, transactionId, actionId) {
    return (actionRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        const action = yield actionRepository.actionModel.findOneAndUpdate({
            _id: actionId,
            typeOf: factory.actionType.AuthorizeAction,
            'object.transactionId': transactionId,
            'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.CreditCard
        }, { actionStatus: factory.actionStatusType.CanceledActionStatus }, { new: true }).exec()
            .then((doc) => {
            if (doc === null) {
                throw new factory.errors.NotFound('actionId', 'AuthorizeAction not found.');
            }
            return doc.toObject();
        });
        const actionResult = action.result;
        // オーソリ取消
        // 現時点では、ここで失敗したらオーソリ取消をあきらめる
        // リトライするには処理を非同期に変更する必要あり
        try {
            yield GMO.services.credit.alterTran({
                shopId: actionResult.entryTranArgs.shopId,
                shopPass: actionResult.entryTranArgs.shopPass,
                accessId: actionResult.execTranArgs.accessId,
                accessPass: actionResult.execTranArgs.accessPass,
                jobCd: GMO.utils.util.JobCd.Void
            });
            debug('alterTran processed', GMO.utils.util.JobCd.Void);
        }
        catch (error) {
            console.error('GMO alterTran to Void error:', error);
            // tslint:disable-next-line:no-suspicious-comment
            // TODO GMO混雑エラーを判別(取消処理でも混雑エラーが発生することは確認済)
        }
    });
}
exports.cancelCreditCardAuth = cancelCreditCardAuth;
function authorizeSeatReservation(agentId, transactionId, individualScreeningEvent, offers) {
    return (actionRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        const actionAttributes = factory.action.authorize.seatReservation.createAttributes({
            object: {
                transactionId: transactionId,
                offers: offers,
                individualScreeningEvent: individualScreeningEvent
            },
            agent: transaction.seller,
            recipient: transaction.agent,
            actionStatus: factory.actionStatusType.ActiveActionStatus,
            startDate: new Date()
        });
        const action = yield actionRepository.actionModel.create(actionAttributes).then((doc) => {
            return doc.toObject();
        });
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
        let updTmpReserveSeatResult;
        try {
            debug('updTmpReserveSeat processing...', updTmpReserveSeatArgs);
            updTmpReserveSeatResult = yield COA.services.reserve.updTmpReserveSeat(updTmpReserveSeatArgs);
            debug('updTmpReserveSeat processed', updTmpReserveSeatResult);
        }
        catch (error) {
            // actionにエラー結果を追加
            try {
                yield actionRepository.actionModel.findByIdAndUpdate(action.id, {
                    actionStatus: factory.actionStatusType.FailedActionStatus,
                    error: error,
                    endDate: new Date()
                }, { new: true }).exec();
            }
            catch (__) {
                // 失敗したら仕方ない
            }
            // COAはクライアントエラーかサーバーエラーかに関わらずステータスコード500を返却する。メッセージ「座席取得失敗」の場合は、座席の重複とみなす
            if (error.message === '座席取得失敗') {
                throw new factory.errors.AlreadyInUse('action.object', ['offers'], error.message);
            }
            throw new factory.errors.ServiceUnavailable('reserve service temporarily unavailable.');
        }
        // COAオーソリ追加
        // アクションを完了
        debug('ending authorize action...');
        const price = offers.reduce((a, b) => a + b.ticketInfo.salePrice + b.ticketInfo.mvtkSalesPrice, 0);
        return yield actionRepository.actionModel.findByIdAndUpdate(action.id, {
            actionStatus: factory.actionStatusType.CompletedActionStatus,
            result: {
                price: price,
                updTmpReserveSeatArgs: updTmpReserveSeatArgs,
                updTmpReserveSeatResult: updTmpReserveSeatResult
            },
            endDate: new Date()
        }, { new: true }).exec().then((doc) => doc.toObject());
    });
}
exports.authorizeSeatReservation = authorizeSeatReservation;
function cancelSeatReservationAuth(agentId, transactionId, actionId) {
    return (actionRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        // MongoDBでcompleteステータスであるにも関わらず、COAでは削除されている、というのが最悪の状況
        // それだけは回避するためにMongoDBを先に変更
        const action = yield actionRepository.actionModel.findOneAndUpdate({
            _id: actionId,
            typeOf: factory.actionType.AuthorizeAction,
            'object.transactionId': transactionId,
            'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.SeatReservation
        }, { actionStatus: factory.actionStatusType.CanceledActionStatus }, { new: true }).exec()
            .then((doc) => {
            if (doc === null) {
                throw new factory.errors.NotFound('actionId', 'AuthorizeAction not found.');
            }
            return doc.toObject();
        });
        const actionResult = action.result;
        // 座席仮予約削除
        debug('delTmpReserve processing...', action);
        yield COA.services.reserve.delTmpReserve({
            theaterCode: actionResult.updTmpReserveSeatArgs.theaterCode,
            dateJouei: actionResult.updTmpReserveSeatArgs.dateJouei,
            titleCode: actionResult.updTmpReserveSeatArgs.titleCode,
            titleBranchNum: actionResult.updTmpReserveSeatArgs.titleBranchNum,
            timeBegin: actionResult.updTmpReserveSeatArgs.timeBegin,
            tmpReserveNum: actionResult.updTmpReserveSeatResult.tmpReserveNum
        });
        debug('delTmpReserve processed');
    });
}
exports.cancelSeatReservationAuth = cancelSeatReservationAuth;
/**
 * create a mvtk authorizeAction
 * add the result of using a mvtk card
 * @export
 * @function
 * @memberof service.transaction.placeOrderInProgress
 */
function authorizeMvtk(agentId, transactionId, authorizeObject) {
    // tslint:disable-next-line:max-func-body-length
    return (actionRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        // 座席予約承認を取得
        const seatReservationAuthorizeAction = yield actionRepository.actionModel.findOne({
            'object.transactionId': transactionId,
            'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.SeatReservation,
            typeOf: factory.actionType.AuthorizeAction,
            actionStatus: factory.actionStatusType.CompletedActionStatus
        }).exec().then((doc) => {
            // seatReservationAuthorization already exists?
            if (doc === null) {
                throw new factory.errors.NotFound('action.object', 'seat reservation authorizeAction not created yet');
            }
            return doc.toObject();
        });
        const seatReservationAuthorizeActionObject = seatReservationAuthorizeAction.object;
        const seatReservationAuthorizeActionResult = seatReservationAuthorizeAction.result;
        const knyknrNoNumsByNoShouldBe = seatReservationAuthorizeActionObject.offers.reduce((a, b) => {
            const knyknrNo = b.ticketInfo.mvtkNum;
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
        const stCdShouldBe = seatReservationAuthorizeActionResult.updTmpReserveSeatArgs.theaterCode.slice(-2);
        if (authorizeObject.seatInfoSyncIn.stCd !== stCdShouldBe) {
            throw new factory.errors.Argument('authorizeActionResult', 'stCd not matched with seat reservation authorizeAction');
        }
        // skhnCd matched?
        // tslint:disable-next-line:max-line-length
        const skhnCdShouldBe = `${seatReservationAuthorizeActionResult.updTmpReserveSeatArgs.titleCode}${seatReservationAuthorizeActionResult.updTmpReserveSeatArgs.titleBranchNum}`;
        if (authorizeObject.seatInfoSyncIn.skhnCd !== skhnCdShouldBe) {
            throw new factory.errors.Argument('authorizeActionResult', 'skhnCd not matched with seat reservation authorizeAction');
        }
        // screen code matched?
        if (authorizeObject.seatInfoSyncIn.screnCd !== seatReservationAuthorizeActionResult.updTmpReserveSeatArgs.screenCode) {
            throw new factory.errors.Argument('authorizeActionResult', 'screnCd not matched with seat reservation authorizeAction');
        }
        // seat num matched?
        const seatNumsInSeatReservationAuthorization = seatReservationAuthorizeActionResult.updTmpReserveSeatResult.listTmpReserve.map((tmpReserve) => tmpReserve.seatNum);
        if (!authorizeObject.seatInfoSyncIn.zskInfo.every((zskInfo) => seatNumsInSeatReservationAuthorization.indexOf(zskInfo.zskCd) >= 0)) {
            throw new factory.errors.Argument('authorizeActionResult', 'zskInfo not matched with seat reservation authorizeAction');
        }
        const actionAttributes = factory.action.authorize.mvtk.createAttributes({
            actionStatus: factory.actionStatusType.ActiveActionStatus,
            object: authorizeObject,
            agent: transaction.agent,
            recipient: transaction.seller,
            startDate: new Date()
        });
        // start action
        const action = yield actionRepository.actionModel.create(actionAttributes).then((doc) => doc.toObject());
        // 特に何もしない
        // アクションを完了
        return yield actionRepository.actionModel.findByIdAndUpdate(action.id, {
            actionStatus: factory.actionStatusType.CompletedActionStatus,
            result: {
                price: authorizeObject.price
            },
            endDate: new Date()
        }, { new: true }).exec().then((doc) => doc.toObject());
    });
}
exports.authorizeMvtk = authorizeMvtk;
function cancelMvtkAuth(agentId, transactionId, actionId) {
    return (actionRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        yield actionRepository.actionModel.findOneAndUpdate({
            _id: actionId,
            typeOf: factory.actionType.AuthorizeAction,
            'object.transactionId': transactionId,
            'purpose.typeOf': factory.action.authorize.authorizeActionPurpose.Mvtk
        }, { actionStatus: factory.actionStatusType.CanceledActionStatus }, { new: true }).exec()
            .then((doc) => {
            if (doc === null) {
                throw new factory.errors.NotFound('actionId', 'AuthorizeAction not found.');
            }
            return doc.toObject();
        });
        // 特に何もしない
    });
}
exports.cancelMvtkAuth = cancelMvtkAuth;
/**
 * メール追加
 *
 * @param {string} transactionId
 * @param {EmailNotification} notification
 * @returns {TransactionOperation<void>}
 *
 * @memberof service.transaction.placeOrderInProgress
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
 * @memberof service.transaction.placeOrderInProgress
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
    return (actionRepository, transactionRepository) => __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        const transaction = yield transactionRepository.findPlaceOrderInProgressById(transactionId);
        if (transaction.agent.id !== agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }
        // authorizeActionsを取得
        const authorizeActions = yield actionRepository.actionModel.find({
            'object.transactionId': transactionId,
            typeOf: factory.actionType.AuthorizeAction,
            endDate: { $lt: now } // 万が一このプロセス中に他処理が発生しても無視するように
        }).exec().then((docs) => docs.map((doc) => doc.toObject()));
        transaction.object.authorizeActions = authorizeActions;
        // 照会可能になっているかどうか
        if (!canBeClosed(transaction)) {
            throw new factory.errors.Argument('transactionId', 'Transaction cannot be confirmed because prices are not matched.');
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
                ownedFrom: now,
                // tslint:disable-next-line:no-suspicious-comment
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
        yield transactionRepository.transactionModel.findOneAndUpdate({
            _id: transactionId,
            typeOf: factory.transactionType.PlaceOrder,
            status: factory.transactionStatusType.InProgress
        }, {
            status: factory.transactionStatusType.Confirmed,
            endDate: now,
            'object.authorizeActions': authorizeActions,
            result: result // resultを更新
        }, { new: true }).exec();
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
    const priceByAgent = transaction.object.authorizeActions
        .filter((action) => action.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((action) => action.agent.id === transaction.agent.id)
        .reduce((a, b) => a + b.result.price, 0);
    const priceBySeller = transaction.object.authorizeActions
        .filter((action) => action.actionStatus === factory.actionStatusType.CompletedActionStatus)
        .filter((action) => action.agent.id === transaction.seller.id)
        .reduce((a, b) => a + b.result.price, 0);
    return (priceByAgent > 0 && priceByAgent === priceBySeller);
}
