import TransactionService from "../transaction";
import monapt = require("monapt");

import Authorization from "../../model/authorization";
import COASeatReservationAuthorization from "../../model/authorization/coaSeatReservation";
import GMOAuthorization from "../../model/authorization/gmo";
import EmailNotification from "../../model/notification/email";
import ObjectId from "../../model/objectId";
import OwnerGroup from "../../model/ownerGroup";
import Queue from "../../model/queue";
import QueueStatus from "../../model/queueStatus";
import Transaction from "../../model/transaction";
import TransactionEventGroup from "../../model/transactionEventGroup";
import TransactionInquiryKey from "../../model/transactionInquiryKey";
import TransactionStatus from "../../model/transactionStatus";

import OwnerRepository from "../../repository/owner";
import QueueRepository from "../../repository/queue";
import TransactionRepository from "../../repository/transaction";

import * as NotificationFactory from "../../factory/notification";
import * as OwnerFactory from "../../factory/owner";
import * as QueueFactory from "../../factory/queue";
import * as TransactionFactory from "../../factory/transaction";
import * as TransactionEventFactory from "../../factory/transactionEvent";

export type TransactionAndQueueOperation<T> = (transastionRepository: TransactionRepository, queueRepository: QueueRepository) => Promise<T>;
export type OwnerAndTransactionOperation<T> = (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => Promise<T>;
export type TransactionOperation<T> = (repository: TransactionRepository) => Promise<T>;

/**
 * 取引サービス
 *
 * @class TransactionServiceInterpreter
 * @implements {TransactionService}
 */
export default class TransactionServiceInterpreter implements TransactionService {
    /**
     * 匿名所有者更新
     *
     * @returns {OwnerAndTransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    public updateAnonymousOwner(args: {
        /**
         *
         *
         * @type {string}
         */
        transaction_id: string,
        /**
         *
         *
         * @type {string}
         */
        name_first?: string,
        /**
         *
         *
         * @type {string}
         */
        name_last?: string,
        /**
         *
         *
         * @type {string}
         */
        email?: string,
        /**
         *
         *
         * @type {string}
         */
        tel?: string,
    }): OwnerAndTransactionOperation<void> {
        return async (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => {
            // 取引取得
            const optionTransaction = await transactionRepository.findById(ObjectId(args.transaction_id));
            if (optionTransaction.isEmpty) throw new Error(`transaction[${ObjectId(args.transaction_id)}] not found.`);
            const transaction = optionTransaction.get();

            const anonymousOwner = transaction.owners.find((owner) => {
                return (owner.group === OwnerGroup.ANONYMOUS);
            });
            if (!anonymousOwner) throw new Error("anonymous owner not found.");

            // 永続化
            const option = await ownerRepository.findOneAndUpdate({
                _id: anonymousOwner._id,
            }, {
                    $set: {
                        name_first: args.name_first,
                        name_last: args.name_last,
                        email: args.email,
                        tel: args.tel,
                    },
                });
            if (option.isEmpty) throw new Error("owner not found.");
        };
    }

    /**
     * IDから取得する
     *
     * @param {string} transactionId
     * @returns {TransactionOperation<monapt.Option<Transaction>>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    public findById(transactionId: string): TransactionOperation<monapt.Option<Transaction>> {
        return async (transactionRepository: TransactionRepository) => {
            return await transactionRepository.findById(ObjectId(transactionId));
        };
    }

    /**
     * 取引開始
     *
     * @param {Date} expiredAt
     * @returns {OwnerAndTransactionOperation<Transaction>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    public start(expiredAt: Date) {
        return async (ownerRepository: OwnerRepository, transactionRepository: TransactionRepository) => {
            // 一般所有者作成
            const anonymousOwner = OwnerFactory.createAnonymous({
                _id: ObjectId(),
            });

            // 興行主取得
            const option = await ownerRepository.findPromoter();
            if (option.isEmpty) throw new Error("promoter not found.");
            const promoter = option.get();

            // イベント作成
            const event = TransactionEventFactory.create({
                _id: ObjectId(),
                group: TransactionEventGroup.START,
                occurred_at: new Date(),
            });

            // 取引作成
            const transaction = TransactionFactory.create({
                _id: ObjectId(),
                status: TransactionStatus.UNDERWAY,
                events: [event],
                owners: [promoter, anonymousOwner],
                expired_at: expiredAt,
            });

            // 永続化
            await ownerRepository.store(anonymousOwner);
            await transactionRepository.store(transaction);

            return transaction;
        };
    }

    /**
     * GMO資産承認
     *
     * @param {string} transactionId
     * @param {GMOAuthorization} authorization
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    public addGMOAuthorization(transactionId: string, authorization: GMOAuthorization) {
        return async (transactionRepository: TransactionRepository) => {
            // 取引取得
            const optionTransaction = await transactionRepository.findById(ObjectId(transactionId));
            if (optionTransaction.isEmpty) throw new Error(`transaction[${ObjectId(transactionId)}] not found.`);
            const transaction = optionTransaction.get();

            // 所有者が取引に存在するかチェック
            const ownerIds = transaction.owners.map((owner) => {
                return owner._id.toString();
            });
            if (ownerIds.indexOf(authorization.owner_from.toString()) < 0) {
                throw new Error(`transaction[${ObjectId(transactionId)}] does not contain a owner[${authorization.owner_from.toString()}].`);
            }
            if (ownerIds.indexOf(authorization.owner_to.toString()) < 0) {
                throw new Error(`transaction[${ObjectId(transactionId)}] does not contain a owner[${authorization.owner_to.toString()}].`);
            }

            // 永続化
            await this.pushAuthorization({
                transaction_id: transactionId,
                authorization: authorization,
            })(transactionRepository);

            // return authorization;
        };
    }

    /**
     * COA資産承認
     *
     * @param {string} transactionId
     * @param {COASeatReservationAuthorization} authorization
     * @returns {OwnerAndTransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    public addCOASeatReservationAuthorization(transactionId: string, authorization: COASeatReservationAuthorization) {
        return async (transactionRepository: TransactionRepository) => {
            // 取引取得
            const optionTransaction = await transactionRepository.findById(ObjectId(transactionId));
            if (optionTransaction.isEmpty) throw new Error(`transaction[${ObjectId(transactionId)}] not found.`);
            const transaction = optionTransaction.get();

            const ownerIds = transaction.owners.map((owner) => {
                return owner._id.toString();
            });
            if (ownerIds.indexOf(authorization.owner_from.toString()) < 0) {
                throw new Error(`transaction[${ObjectId(transactionId)}] does not contain a owner[${authorization.owner_from.toString()}].`);
            }
            if (ownerIds.indexOf(authorization.owner_to.toString()) < 0) {
                throw new Error(`transaction[${ObjectId(transactionId)}] does not contain a owner[${authorization.owner_to.toString()}].`);
            }

            // 永続化
            await this.pushAuthorization({
                transaction_id: transactionId,
                authorization: authorization,
            })(transactionRepository);

            // return authorization;
        };
    }

    /**
     * 資産承認解除
     *
     * @param {string} transactionId
     * @param {string} authorizationId
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    public removeAuthorization(transactionId: string, authorizationId: string) {
        return async (transactionRepository: TransactionRepository) => {
            // 取引取得
            const optionTransacton = await transactionRepository.findById(ObjectId(transactionId));
            if (optionTransacton.isEmpty) throw new Error("tranasction not found.");

            const transaction = optionTransacton.get();
            const authorizations = transaction.authorizations();

            const removedAuthorization = authorizations.find((authorization) => {
                return (authorization._id.toString() === authorizationId);
            });
            if (!removedAuthorization) throw new Error(`authorization [${authorizationId}] not found in the transaction.`);

            // イベント作成
            const event = TransactionEventFactory.createUnauthorize({
                _id: ObjectId(),
                occurred_at: new Date(),
                authorization: removedAuthorization,
            });

            // 永続化
            const option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(transactionId),
                status: TransactionStatus.UNDERWAY,
            }, {
                    $push: {
                        events: event,
                    },
                });
            if (option.isEmpty) throw new Error("UNDERWAY transaction not found.");
        };
    }

    /**
     * 照合を可能にする
     *
     * @param {string} transactionId
     * @param {TransactionInquiryKey} key
     * @returns {TransactionOperation<monapt.Option<Transaction>>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    public enableInquiry(transactionId: string, key: TransactionInquiryKey) {
        return async (transactionRepository: TransactionRepository) => {
            // 永続化
            const option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(transactionId),
                status: TransactionStatus.UNDERWAY,
            }, {
                    $set: {
                        inquiry_key: key,
                    },
                });
            if (option.isEmpty) throw new Error("UNDERWAY transaction not found.");
        };
    }

    /**
     * 照会する
     *
     * @param {TransactionInquiryKey} key
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    public makeInquiry(key: TransactionInquiryKey): TransactionOperation<monapt.Option<Transaction>> {
        return async (transactionRepository: TransactionRepository) => {
            // 取引取得
            return await transactionRepository.findOne({
                inquiry_key: key,
                status: TransactionStatus.CLOSED,
            });
        };
    }

    /**
     * 取引成立
     *
     * @param {string} transactionId
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    public close(transactionId: string) {
        return async (transactionRepository: TransactionRepository) => {
            // 取引取得
            const optionTransaction = await transactionRepository.findById(ObjectId(transactionId));
            if (optionTransaction.isEmpty) throw new Error("transaction not found.");
            const transaction = optionTransaction.get();

            // 照会可能になっているかどうか
            if (!transaction.isInquiryAvailable()) throw new Error("inquiry is not available.");

            // 条件が対等かどうかチェック
            if (!transaction.canBeClosed()) throw new Error("transaction cannot be closed.");

            // キューリストを事前作成
            const queues: Queue[] = [];
            transaction.authorizations().forEach((authorization) => {
                queues.push(QueueFactory.createSettleAuthorization({
                    _id: ObjectId(),
                    authorization: authorization,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(), // なるはやで実行
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: [],
                }));
            });
            transaction.notifications().forEach((notification) => {
                queues.push(QueueFactory.createPushNotification({
                    _id: ObjectId(),
                    notification: notification,
                    status: QueueStatus.UNEXECUTED,
                    run_at: new Date(), // TODO emailのsent_atを指定
                    max_count_try: 10,
                    last_tried_at: null,
                    count_tried: 0,
                    results: [],
                }));
            });

            // イベント作成
            const event = TransactionEventFactory.create({
                _id: ObjectId(),
                group: TransactionEventGroup.CLOSE,
                occurred_at: new Date(),
            });

            // 永続化
            const option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(transactionId),
                status: TransactionStatus.UNDERWAY,
            }, {
                    $set: {
                        status: TransactionStatus.CLOSED,
                        queues: queues,
                    },
                    $push: {
                        events: event,
                    },
                });
            if (option.isEmpty) throw new Error("UNDERWAY transaction not found.");
        };
    }

    /**
     * 取引期限切れ
     *
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    public expireOne() {
        return async (transactionRepository: TransactionRepository) => {
            // イベント作成
            const event = TransactionEventFactory.create({
                _id: ObjectId(),
                group: TransactionEventGroup.EXPIRE,
                occurred_at: new Date(),
            });

            // 永続化
            await transactionRepository.findOneAndUpdate({
                status: TransactionStatus.UNDERWAY,
                expired_at: { $lt: new Date() },
            }, {
                    $set: {
                        status: TransactionStatus.EXPIRED,
                    },
                    $push: {
                        events: event,
                    },
                });

            // 永続化結果がemptyの場合は、もう取引中ステータスではないということなので、期限切れタスクとしては成功
        };
    }

    /**
     * キュー出力
     *
     * @param {string} transactionId
     * @returns {TransactionAndQueueOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    public exportQueues(transactionId: string) {
        return async (transactionRepository: TransactionRepository, queueRepository: QueueRepository) => {
            const option = await transactionRepository.findById(ObjectId(transactionId));
            if (option.isEmpty) throw new Error("transaction not found.");

            const transaction = option.get();

            let queues: Queue[];
            switch (transaction.status) {
                // 成立の場合は、あらかじめキューリストが作成されている
                case TransactionStatus.CLOSED:
                    queues = transaction.queues;
                    break;

                // 期限切れの場合は、キューリストを作成する
                case TransactionStatus.EXPIRED:
                    queues = [];
                    transaction.authorizations().forEach((authorization) => {
                        queues.push(QueueFactory.createCancelAuthorization({
                            _id: ObjectId(),
                            authorization: authorization,
                            status: QueueStatus.UNEXECUTED,
                            run_at: new Date(),
                            max_count_try: 10,
                            last_tried_at: null,
                            count_tried: 0,
                            results: [],
                        }));
                    });

                    // COA本予約があれば取消
                    if (transaction.isInquiryAvailable()) {
                        queues.push(QueueFactory.createDisableTransactionInquiry({
                            _id: ObjectId(),
                            transaction_id: transaction._id,
                            status: QueueStatus.UNEXECUTED,
                            run_at: new Date(),
                            max_count_try: 10,
                            last_tried_at: null,
                            count_tried: 0,
                            results: [],
                        }));
                    }

                    // TODO おそらく開発時のみ
                    const eventStart = transaction.events.find((event) => (event.group === TransactionEventGroup.START));
                    queues.push(QueueFactory.createPushNotification({
                        _id: ObjectId(),
                        notification: NotificationFactory.createEmail({
                            _id: ObjectId(),
                            from: "noreply@localhost",
                            to: "hello@motionpicture.jp",
                            subject: "transaction expired",
                            content: `
取引の期限がきれました
_id: ${transaction._id}
created_at: ${(eventStart) ? eventStart.occurred_at : ""}
`,
                        }),
                        status: QueueStatus.UNEXECUTED,
                        run_at: new Date(),
                        max_count_try: 10,
                        last_tried_at: null,
                        count_tried: 0,
                        results: [],
                    }));

                    break;

                default:
                    throw new Error("transaction group not implemented.");
            }

            const promises = queues.map(async (queue) => {
                await queueRepository.store(queue);
            });
            await Promise.all(promises);
        };
    }

    /**
     * メール追加
     *
     * @param {string} transactionId
     * @param {EmailNotification} notification
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    public addEmail(transactionId: string, notification: EmailNotification) {
        return async (transactionRepository: TransactionRepository) => {
            // イベント作成
            const event = TransactionEventFactory.createNotificationAdd({
                _id: ObjectId(),
                occurred_at: new Date(),
                notification: notification,
            });

            // 永続化
            const option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(transactionId),
                status: TransactionStatus.UNDERWAY,
            }, {
                    $push: {
                        events: event,
                    },
                });

            if (option.isEmpty) throw new Error("UNDERWAY transaction not found.");
        };
    }

    /**
     * メール削除
     *
     * @param {string} transactionId
     * @param {string} notificationId
     * @returns {TransactionOperation<void>}
     *
     * @memberOf TransactionServiceInterpreter
     */
    public removeEmail(transactionId: string, notificationId: string) {
        return async (transactionRepository: TransactionRepository) => {
            // 取引取得
            const optionTransacton = await transactionRepository.findById(ObjectId(transactionId));
            if (optionTransacton.isEmpty) throw new Error("tranasction not found.");

            const transaction = optionTransacton.get();
            const notifications = transaction.notifications();

            const removedNotification = notifications.find((notification) => {
                return (notification._id.toString() === notificationId);
            });
            if (!removedNotification) throw new Error(`notification [${notificationId}] not found in the transaction.`);

            // イベント作成
            const event = TransactionEventFactory.createNotificationRemove({
                _id: ObjectId(),
                occurred_at: new Date(),
                notification: removedNotification,
            });

            // 永続化
            const option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(transactionId),
                status: TransactionStatus.UNDERWAY,
            }, {
                    $push: {
                        events: event,
                    },
                });

            if (option.isEmpty) throw new Error("UNDERWAY transaction not found.");
        };
    }

    private pushAuthorization(args: {
        /**
         *
         *
         * @type {string}
         */
        transaction_id: string,
        /**
         *
         *
         * @type {Authorization}
         */
        authorization: Authorization,
    }) {
        return async (transactionRepository: TransactionRepository) => {
            // イベント作成
            const event = TransactionEventFactory.createAuthorize({
                _id: ObjectId(),
                occurred_at: new Date(),
                authorization: args.authorization,
            });

            // 永続化
            const option = await transactionRepository.findOneAndUpdate({
                _id: ObjectId(args.transaction_id),
                status: TransactionStatus.UNDERWAY,
            }, {
                    $push: {
                        events: event,
                    },
                });
            if (option.isEmpty) throw new Error("UNDERWAY transaction not found.");
        };
    }
}