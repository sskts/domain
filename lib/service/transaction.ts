/**
 * 取引サービス
 * 取引一般に対する処理はここで定義する
 * 特定の取引(ID指定)に対する処理はtransactionWithIdサービスで定義
 *
 * @namespace service/transaction
 */

import * as createDebug from 'debug';
import * as moment from 'moment';
import * as monapt from 'monapt';
import * as util from 'util';

import ArgumentError from '../error/argument';

import * as COASeatReservationAuthorizationFactory from '../factory/authorization/coaSeatReservation';
import * as GMOAuthorizationFactory from '../factory/authorization/gmo';
import * as MvtkAuthorizationFactory from '../factory/authorization/mvtk';
import AuthorizationGroup from '../factory/authorizationGroup';

import * as EmailNotificationFactory from '../factory/notification/email';
import NotificationGroup from '../factory/notificationGroup';

import * as clientUserFactory from '../factory/clientUser';
import * as OwnerFactor from '../factory/owner';
import * as AnonymousOwnerFactory from '../factory/owner/anonymous';
import * as MemberOwnerFactory from '../factory/owner/member';
import * as PromoterOwnerFactory from '../factory/owner/promoter';
import OwnerGroup from '../factory/ownerGroup';

import * as TaskFactory from '../factory/task';
import * as CancelGMOAuthorizationTaskFactory from '../factory/task/cancelGMOAuthorization';
import * as CancelMvtkAuthorizationTaskFactory from '../factory/task/cancelMvtkAuthorization';
import * as CancelSeatReservationAuthorizationTaskFactory from '../factory/task/cancelSeatReservationAuthorization';
import * as SendEmailNotificationTaskFactory from '../factory/task/sendEmailNotification';
import * as SettleGMOAuthorizationTaskFactoryTaskFactory from '../factory/task/settleGMOAuthorization';
import * as SettleMvtkAuthorizationTaskFactory from '../factory/task/settleMvtkAuthorization';
import * as SettleSeatReservationAuthorizationTaskFactory from '../factory/task/settleSeatReservationAuthorization';
import TaskStatus from '../factory/taskStatus';

import * as TransactionFactory from '../factory/transaction';
import * as TransactionInquiryKeyFactory from '../factory/transactionInquiryKey';
import * as TransactionScopeFactory from '../factory/transactionScope';
import TransactionStatus from '../factory/transactionStatus';
import TransactionTasksExportationStatus from '../factory/transactionTasksExportationStatus';

import OwnerAdapter from '../adapter/owner';
import TaskAdapter from '../adapter/task';
import TransactionAdapter from '../adapter/transaction';
import TransactionCountAdapter from '../adapter/transactionCount';

export type TaskAndTransactionOperation<T> =
    (taskAdapter: TaskAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export type OwnerAndTransactionAndTransactionCountOperation<T> =
    (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter, transactionCountAdapter: TransactionCountAdapter) => Promise<T>;
export type TransactionOperation<T> = (transactionAdapter: TransactionAdapter) => Promise<T>;

const debug = createDebug('sskts-domain:service:transaction');

/**
 * 取引を開始する
 *
 * @export
 * @param {Date} args.expiresAt 期限切れ予定日時
 * @param {number} args.maxCountPerUnit 単位期間あたりの最大取引数
 * @param {string} args.clientUser クライアントユーザー
 * @param {TransactionScopeFactory.ITransactionScope} args.scope 取引スコープ
 * @param {TransactionScopeFactory.ITransactionScope} [args.ownerId] 所有者ID
 * @returns {OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>>}
 * @memberof service/transaction
 */
export function start(args: {
    expiresAt: Date;
    maxCountPerUnit: number;
    clientUser: clientUserFactory.IClientUser;
    scope: TransactionScopeFactory.ITransactionScope;
    /**
     * 所有者ID
     * 会員などとして開始する場合は指定
     * 指定がない場合は匿名所有者としての開始
     */
    ownerId?: string;
}): OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>> {
    return async (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter, transactionCountAdapter: TransactionCountAdapter) => {
        // 利用可能かどうか
        const nextCount = await transactionCountAdapter.incr(args.scope);
        if (nextCount > args.maxCountPerUnit) {
            return monapt.None;
        }

        // 利用可能であれば、取引作成&匿名所有者作成
        let owner: OwnerFactor.IOwner;
        if (args.ownerId === undefined) {
            // 一般所有者作成
            owner = AnonymousOwnerFactory.create({});
        } else {
            // 所有者指定であれば存在確認
            const ownerDoc = await ownerAdapter.model.findById(args.ownerId).exec();
            if (ownerDoc === null) {
                throw new ArgumentError('ownerId', `owner[id:${args.ownerId}] not found`);
            }
            owner = <MemberOwnerFactory.IOwner>ownerDoc.toObject();
        }

        // 興行主取得
        const promoterOwnerDoc = await ownerAdapter.model.findOne({ group: OwnerGroup.PROMOTER }).exec();
        if (promoterOwnerDoc === null) {
            throw new Error('promoter not found');
        }
        const promoter = <PromoterOwnerFactory.IOwner>promoterOwnerDoc.toObject();

        // 取引ファクトリーで新しい進行中取引オブジェクトを作成
        const transaction = TransactionFactory.create({
            status: TransactionStatus.UNDERWAY,
            owners: [promoter, owner],
            client_user: args.clientUser,
            expires_at: args.expiresAt,
            started_at: moment().toDate()
        });

        // 所有者永続化
        // createコマンドで作成すること(ありえないはずだが、万が一所有者IDが重複するようなバグがあっても、ユニークインデックスではじかれる)
        if (owner.group === OwnerGroup.ANONYMOUS) {
            debug('creating anonymous owner...', owner);
            const anonymousOwnerDoc = { ...owner, ...{ _id: owner.id } };
            await ownerAdapter.model.create(anonymousOwnerDoc);
        }

        debug('creating transaction...');
        // mongoDBに追加するために_idとowners属性を拡張
        const transactionDoc = { ...transaction, ...{ _id: transaction.id, owners: [promoter.id, owner.id] } };
        await transactionAdapter.transactionModel.create(transactionDoc);

        return monapt.Option(transaction);
    };
}

/**
 * 匿名所有者として取引開始する
 *
 * @param {Date} args.expiresAt 期限切れ予定日時
 * @param {number} args.maxCountPerUnit 単位期間あたりの最大取引数
 * @param {string} args.state 所有者状態
 * @param {TransactionScopeFactory.ITransactionScope} args.scope 取引スコープ
 * @returns {OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>>}
 * @memberof service/transaction
 * @deprecated use start instead
 */
export function startAsAnonymous(args: {
    expiresAt: Date;
    maxCountPerUnit: number;
    state: string;
    scope: TransactionScopeFactory.ITransactionScope;
}): OwnerAndTransactionAndTransactionCountOperation<monapt.Option<TransactionFactory.ITransaction>> {
    const clientUser = clientUserFactory.create({
        client: '',
        state: args.state,
        scopes: []
    });

    return start({
        expiresAt: args.expiresAt,
        maxCountPerUnit: args.maxCountPerUnit,
        clientUser: clientUser,
        scope: args.scope
    });
}
exports.startAsAnonymous = util.deprecate(
    startAsAnonymous,
    'sskts-domain: service.transaction.startAsAnonymous is deprecated, use service.transaction.start instead'
);

/**
 * 照会する
 *
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transaction
 */
export function makeInquiry(key: TransactionInquiryKeyFactory.ITransactionInquiryKey) {
    debug('finding a transaction...', key);

    return async (transactionAdapter: TransactionAdapter) => {
        const doc = await transactionAdapter.transactionModel.findOne({
            'inquiry_key.theater_code': key.theater_code,
            'inquiry_key.reserve_num': key.reserve_num,
            'inquiry_key.tel': key.tel,
            status: TransactionStatus.CLOSED
        }).populate('owners').exec();

        return (doc === null) ? monapt.None : monapt.Option(<TransactionFactory.ITransaction>doc.toObject());
    };
}

/**
 * 取引を期限切れにする
 * @memberof service/transaction
 */
export function makeExpired() {
    return async (transactionAdapter: TransactionAdapter) => {
        const expiredAt = moment().toDate();

        // ステータスと期限を見て更新
        await transactionAdapter.transactionModel.update(
            {
                status: TransactionStatus.UNDERWAY,
                expires_at: { $lt: expiredAt }
            },
            {
                status: TransactionStatus.EXPIRED,
                expired_at: expiredAt
            },
            { multi: true }
        ).exec();
    };
}

/**
 * ひとつの取引のタスクをエクスポートする
 *
 * @param {TransactionStatus} statu 取引ステータス
 * @memberof service/transaction
 */
export function exportTasks(status: TransactionStatus): TaskAndTransactionOperation<void> {
    return async (taskAdapter: TaskAdapter, transactionAdapter: TransactionAdapter) => {
        const statusesTasksExportable = [TransactionStatus.EXPIRED, TransactionStatus.CLOSED];
        if (statusesTasksExportable.indexOf(status) < 0) {
            throw new ArgumentError('status', `transaction status should be in [${statusesTasksExportable.join(',')}]`);
        }

        const transactionDoc = await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                status: status,
                tasks_exportation_status: TransactionTasksExportationStatus.Unexported
            },
            { tasks_exportation_status: TransactionTasksExportationStatus.Exporting },
            { new: true }
        ).exec();

        if (transactionDoc === null) {
            return;
        }

        // 失敗してもここでは戻さない(RUNNINGのまま待機)
        const tasks = await exportTasksById(transactionDoc.get('id'))(
            taskAdapter,
            transactionAdapter
        );

        await transactionAdapter.transactionModel.findByIdAndUpdate(
            transactionDoc.get('id'),
            {
                tasks_exportation_status: TransactionTasksExportationStatus.Exported,
                tasks_exported_at: moment().toDate(),
                tasks: tasks
            }
        ).exec();
    };
}

/**
 * ID指定で取引のタスク出力
 *
 * @param {string} id
 * @returns {TaskAndTransactionOperation<void>}
 *
 * @memberof service/transaction
 */
export function exportTasksById(id: string): TaskAndTransactionOperation<TaskFactory.ITask[]> {
    // tslint:disable-next-line:max-func-body-length
    return async (taskAdapter: TaskAdapter, transactionAdapter: TransactionAdapter) => {
        const doc = await transactionAdapter.transactionModel.findById(id).populate('owners').exec();
        if (doc === null) {
            throw new Error(`transaction[${id}] not found.`);
        }
        const transaction = <TransactionFactory.ITransaction>doc.toObject();

        const tasks: TaskFactory.ITask[] = [];
        switch (transaction.status) {
            case TransactionStatus.CLOSED:
                // 取引イベントからタスクリストを作成
                (await transactionAdapter.findAuthorizationsById(transaction.id)).forEach((authorization) => {
                    if (authorization.group === AuthorizationGroup.COA_SEAT_RESERVATION) {
                        tasks.push(SettleSeatReservationAuthorizationTaskFactory.create({
                            status: TaskStatus.Ready,
                            runs_at: new Date(), // なるはやで実行
                            max_number_of_try: 10,
                            last_tried_at: null,
                            number_of_tried: 0,
                            execution_results: [],
                            data: {
                                authorization: <COASeatReservationAuthorizationFactory.IAuthorization>authorization
                            }
                        }));
                    } else if (authorization.group === AuthorizationGroup.GMO) {
                        tasks.push(SettleGMOAuthorizationTaskFactoryTaskFactory.create({
                            status: TaskStatus.Ready,
                            runs_at: new Date(), // なるはやで実行
                            max_number_of_try: 10,
                            last_tried_at: null,
                            number_of_tried: 0,
                            execution_results: [],
                            data: {
                                authorization: <GMOAuthorizationFactory.IAuthorization>authorization
                            }
                        }));
                    } else if (authorization.group === AuthorizationGroup.MVTK) {
                        tasks.push(SettleMvtkAuthorizationTaskFactory.create({
                            status: TaskStatus.Ready,
                            runs_at: new Date(), // なるはやで実行
                            max_number_of_try: 10,
                            last_tried_at: null,
                            number_of_tried: 0,
                            execution_results: [],
                            data: {
                                authorization: <MvtkAuthorizationFactory.IAuthorization>authorization
                            }
                        }));
                    }
                });

                (await transactionAdapter.findNotificationsById(transaction.id)).forEach((notification) => {
                    if (notification.group === NotificationGroup.EMAIL) {
                        tasks.push(SendEmailNotificationTaskFactory.create({
                            status: TaskStatus.Ready,
                            runs_at: new Date(), // todo emailのsent_atを指定
                            max_number_of_try: 10,
                            last_tried_at: null,
                            number_of_tried: 0,
                            execution_results: [],
                            data: {
                                notification: <EmailNotificationFactory.INotification>notification
                            }
                        }));
                    }
                });

                break;

            // 期限切れの場合は、タスクリストを作成する
            case TransactionStatus.EXPIRED:
                (await transactionAdapter.findAuthorizationsById(transaction.id)).forEach((authorization) => {
                    if (authorization.group === AuthorizationGroup.COA_SEAT_RESERVATION) {
                        tasks.push(CancelSeatReservationAuthorizationTaskFactory.create({
                            status: TaskStatus.Ready,
                            runs_at: new Date(), // なるはやで実行
                            max_number_of_try: 10,
                            last_tried_at: null,
                            number_of_tried: 0,
                            execution_results: [],
                            data: {
                                authorization: <COASeatReservationAuthorizationFactory.IAuthorization>authorization
                            }
                        }));
                    } else if (authorization.group === AuthorizationGroup.GMO) {
                        tasks.push(CancelGMOAuthorizationTaskFactory.create({
                            status: TaskStatus.Ready,
                            runs_at: new Date(), // なるはやで実行
                            max_number_of_try: 10,
                            last_tried_at: null,
                            number_of_tried: 0,
                            execution_results: [],
                            data: {
                                authorization: <GMOAuthorizationFactory.IAuthorization>authorization
                            }
                        }));
                    } else if (authorization.group === AuthorizationGroup.MVTK) {
                        tasks.push(CancelMvtkAuthorizationTaskFactory.create({
                            status: TaskStatus.Ready,
                            runs_at: new Date(), // なるはやで実行
                            max_number_of_try: 10,
                            last_tried_at: null,
                            number_of_tried: 0,
                            execution_results: [],
                            data: {
                                authorization: <MvtkAuthorizationFactory.IAuthorization>authorization
                            }
                        }));
                    }
                });

                break;

            default:
                throw new ArgumentError('id', 'transaction group not implemented.');
        }
        debug('tasks prepared', tasks);

        await Promise.all(tasks.map(async (task) => {
            debug('storing task...', task);
            await taskAdapter.taskModel.findByIdAndUpdate(task.id, task, { upsert: true }).exec();
        }));

        return tasks;
    };
}

/**
 * タスクエクスポートリトライ
 * todo updated_atを基準にしているが、タスクエクスポートトライ日時を持たせた方が安全か？
 *
 * @param {number} intervalInMinutes
 * @memberof service/transaction
 */
export function reexportTasks(intervalInMinutes: number) {
    return async (transactionAdapter: TransactionAdapter) => {
        await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                tasks_exportation_status: TransactionTasksExportationStatus.Exporting,
                updated_at: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() }
            },
            {
                tasks_exportation_status: TransactionTasksExportationStatus.Unexported
            }
        ).exec();
    };
}
