/**
 * 取引(ID指定)サービス
 *
 * @namespace service/transactionWithId
 */

import * as bcrypt from 'bcryptjs';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as monapt from 'monapt';
import * as _ from 'underscore';
import * as util from 'util';

import ArgumentError from '../error/argument';

import * as AuthorizationFactory from '../factory/authorization';
import * as COASeatReservationAuthorizationFactory from '../factory/authorization/coaSeatReservation';
import * as GMOAuthorizationFactory from '../factory/authorization/gmo';
import * as MvtkAuthorizationFactory from '../factory/authorization/mvtk';
import * as EmailNotificationFactory from '../factory/notification/email';
import OwnerGroup from '../factory/ownerGroup';
import * as TransactionFactory from '../factory/transaction';
import * as AddNotificationTransactionEventFactory from '../factory/transactionEvent/addNotification';
import * as AuthorizeTransactionEventFactory from '../factory/transactionEvent/authorize';
import * as RemoveNotificationTransactionEventFactory from '../factory/transactionEvent/removeNotification';
import * as UnauthorizeTransactionEventFactory from '../factory/transactionEvent/unauthorize';
import * as TransactionInquiryKeyFactory from '../factory/transactionInquiryKey';
import TransactionStatus from '../factory/transactionStatus';

import OwnerAdapter from '../adapter/owner';
import QueueAdapter from '../adapter/queue';
import TransactionAdapter from '../adapter/transaction';

export type TransactionAndQueueOperation<T> =
    (transactionAdapter: TransactionAdapter, queueAdapter: QueueAdapter) => Promise<T>;
export type OwnerAndTransactionOperation<T> =
    (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter) => Promise<T>;
export type TransactionOperation<T> = (transactionAdapter: TransactionAdapter) => Promise<T>;

const debug = createDebug('sskts-domain:service:transaction');

/**
 * IDから取得する
 *
 * @param {string} id
 * @returns {TransactionOperation<monapt.Option<Transaction>>}
 *
 * @memberof service/transactionWithId
 */
export function findById(id: string): TransactionOperation<monapt.Option<TransactionFactory.ITransaction>> {
    return async (transactionAdapter: TransactionAdapter) => {
        const doc = await transactionAdapter.transactionModel.findById(id).populate('owners').exec();

        return (doc === null) ? monapt.None : monapt.Option(<TransactionFactory.ITransaction>doc.toObject());
    };
}

export function addAuthorization(transactionId: string, authorization: AuthorizationFactory.IAuthorization) {
    return async (transactionAdapter: TransactionAdapter) => {
        // 取引取得
        const doc = await transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec();
        if (doc === null) {
            throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
        }
        const transaction = <TransactionFactory.ITransaction>doc.toObject();

        // 所有者が取引に存在するかチェック
        const ownerIds = transaction.owners.map((owner) => {
            return owner.id;
        });
        if (ownerIds.indexOf(authorization.owner_from) < 0) {
            throw new ArgumentError(
                'authorization.owner_from',
                `transaction[${transactionId}] does not contain a owner[${authorization.owner_from}].`
            );
        }
        if (ownerIds.indexOf(authorization.owner_to) < 0) {
            throw new ArgumentError(
                'authorization.owner_to',
                `transaction[${transactionId}] does not contain a owner[${authorization.owner_to}].`
            );
        }

        // イベント作成
        const event = AuthorizeTransactionEventFactory.create({
            transaction: transaction.id,
            occurred_at: new Date(),
            authorization: authorization
        });

        // 永続化
        debug('adding an event...', event);
        await transactionAdapter.addEvent(event);
    };
}

/**
 * GMO資産承認
 *
 * @param {string} transactionId
 * @param {GMOAuthorization} authorization
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transactionWithId
 */
export function addGMOAuthorization(transactionId: string, authorization: GMOAuthorizationFactory.IGMOAuthorization) {
    return addAuthorization(transactionId, authorization);
}

/**
 * COA資産承認
 *
 * @param {string} transactionId
 * @param {COASeatReservationAuthorization} authorization
 * @returns {OwnerAndTransactionOperation<void>}
 *
 * @memberof service/transactionWithId
 */
export function addCOASeatReservationAuthorization(
    transactionId: string,
    authorization: COASeatReservationAuthorizationFactory.ICOASeatReservationAuthorization
) {
    return addAuthorization(transactionId, authorization);
}

/**
 * ムビチケ着券承認追加
 *
 * @param {string} transactionId
 * @param {MvtkAuthorization.IMvtkAuthorization} authorization
 * @returns {OwnerAndTransactionOperation<void>}
 *
 * @memberof service/transactionWithId
 */
export function addMvtkAuthorization(transactionId: string, authorization: MvtkAuthorizationFactory.IMvtkAuthorization) {
    return addAuthorization(transactionId, authorization);
}

/**
 * 資産承認解除
 *
 * @param {string} transactionId
 * @param {string} authorizationId
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transactionWithId
 */
export function removeAuthorization(transactionId: string, authorizationId: string) {
    return async (transactionAdapter: TransactionAdapter) => {
        // 取引取得
        const doc = await transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec();
        if (doc === null) {
            throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
        }

        const authorizations = await transactionAdapter.findAuthorizationsById(doc.get('id'));

        const removedAuthorization = authorizations.find((authorization) => authorization.id === authorizationId);
        if (removedAuthorization === undefined) {
            throw new ArgumentError('authorizationId', `authorization [${authorizationId}] not found in the transaction.`);
        }

        // イベント作成
        const event = UnauthorizeTransactionEventFactory.create({
            transaction: doc.get('id'),
            occurred_at: new Date(),
            authorization: removedAuthorization
        });

        // 永続化
        debug('adding an event...', event);
        await transactionAdapter.addEvent(event);
    };
}

/**
 * メール追加
 *
 * @param {string} transactionId
 * @param {EmailNotification} notification
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transactionWithId
 */
export function addEmail(transactionId: string, notification: EmailNotificationFactory.IEmailNotification) {
    return async (transactionAdapter: TransactionAdapter) => {
        // イベント作成
        const event = AddNotificationTransactionEventFactory.create({
            transaction: transactionId,
            occurred_at: new Date(),
            notification: notification
        });

        // 永続化
        debug('adding an event...', event);
        await transactionAdapter.addEvent(event);
    };
}

/**
 * メール削除
 *
 * @param {string} transactionId
 * @param {string} notificationId
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transactionWithId
 */
export function removeEmail(transactionId: string, notificationId: string) {
    return async (transactionAdapter: TransactionAdapter) => {
        // 取引取得
        const doc = await transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec();
        if (doc === null) {
            throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
        }

        const notifications = await transactionAdapter.findNotificationsById(doc.get('id'));

        const removedNotification = notifications.find((notification) => notification.id === notificationId);
        if (removedNotification === undefined) {
            throw new ArgumentError('notificationId', `notification [${notificationId}] not found in the transaction.`);
        }

        // イベント作成
        const event = RemoveNotificationTransactionEventFactory.create({
            transaction: doc.get('id'),
            occurred_at: new Date(),
            notification: removedNotification
        });

        // 永続化
        await transactionAdapter.addEvent(event);
    };
}

/**
 * 匿名所有者更新
 *
 * @returns {OwnerAndTransactionOperation<void>}
 * @memberof service/transactionWithId
 * @deprecated use setAnonymousOwnerProfile instead
 */
export function updateAnonymousOwner(args: {
    transaction_id: string,
    name_first?: string,
    name_last?: string,
    email?: string,
    tel?: string
}) {
    return setAnonymousOwnerProfile(args.transaction_id, {
        name_first: (args.name_first !== undefined) ? args.name_first : '',
        name_last: (args.name_last !== undefined) ? args.name_last : '',
        email: (args.email !== undefined) ? args.email : '',
        tel: (args.tel !== undefined) ? args.tel : '',
        group: OwnerGroup.ANONYMOUS
    });
}
exports.updateAnonymousOwner = util.deprecate(
    updateAnonymousOwner, 'updateAnonymousOwner is deprecated, use setAnonymousOwnerProfile instead'
);

export function setAnonymousOwnerProfile(transactionId: string, profile: {
    username?: string;
    password?: string;
    name_first: string,
    name_last: string,
    email: string,
    tel: string,
    /**
     * カードトークン
     */
    token?: string,
    group: OwnerGroup
}) {
    return async (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter) => {
        // 取引取得
        const doc = await transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec();
        if (doc === null) {
            throw new ArgumentError('transactionId', `transaction[${transactionId}] not found.`);
        }
        const transaction = <TransactionFactory.ITransaction>doc.toObject();

        // todo 今は、興行主⇔匿名or会員の取引しかないので、これで問題ないが、もっと分かりやすい仕様にすること
        const anonymousOwner = transaction.owners.find((owner) => {
            return (owner.group === OwnerGroup.ANONYMOUS || owner.group === OwnerGroup.MEMBER);
        });
        if (anonymousOwner === undefined) {
            throw new ArgumentError('transactionId', 'anonymous owner not found');
        }

        switch (profile.group) {
            case OwnerGroup.ANONYMOUS:
                break;

            case OwnerGroup.MEMBER:
                // GMO会員登録

                // GMOカード登録

                // GMO決済代行会社会員作成

                break;

            default:
                throw new Error('owner group not implemented');
        }

        // パスワードをハッシュ化
        const SALT_LENGTH = 8;
        const passwordHash = (profile.password !== undefined) ? await bcrypt.hash(profile.password, SALT_LENGTH) : undefined;

        // 永続化
        debug('updating anonymous owner...');
        await ownerAdapter.model.findByIdAndUpdate(
            anonymousOwner.id,
            {
                username: profile.username,
                password_hash: passwordHash,
                name_first: profile.name_first,
                name_last: profile.name_last,
                email: profile.email,
                tel: profile.tel,
                group: profile.group
            }
        ).exec();
    };
}

/**
 * 照合を可能にする
 *
 * @param {string} transactionId
 * @param {TransactionInquiryKey} key
 * @returns {TransactionOperation<monapt.Option<Transaction>>}
 *
 * @memberof service/transactionWithId
 */
export function enableInquiry(id: string, key: TransactionInquiryKeyFactory.ITransactionInquiryKey) {
    return async (transactionAdapter: TransactionAdapter) => {
        // 進行中の取引に照会キー情報を追加
        debug('updating transaction...');
        const doc = await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                _id: id,
                status: TransactionStatus.UNDERWAY
            },
            {
                inquiry_key: key
            },
            { new: true }
        ).exec();

        if (doc === null) {
            throw new Error('UNDERWAY transaction not found');
        }
    };
}

/**
 * 取引成立
 *
 * @param {string} transactionId
 * @returns {TransactionOperation<void>}
 *
 * @memberof service/transactionWithId
 */
export function close(id: string) {
    return async (transactionAdapter: TransactionAdapter) => {
        // 取引取得
        const doc = await transactionAdapter.transactionModel.findById(id).exec();
        if (doc === null) {
            throw new ArgumentError('id', `transaction[${id}] not found.`);
        }

        // 照会可能になっているかどうか
        if (_.isEmpty(doc.get('inquiry_key'))) {
            throw new Error('inquiry is not available');
        }

        // 条件が対等かどうかチェック
        if (!await transactionAdapter.canBeClosed(doc.get('id'))) {
            throw new Error('transaction cannot be closed');
        }

        // ステータス変更
        debug('updating transaction...');
        const closedTransactionDoc = await transactionAdapter.transactionModel.findOneAndUpdate(
            {
                _id: doc.get('id'),
                status: TransactionStatus.UNDERWAY
            },
            {
                status: TransactionStatus.CLOSED,
                closed_at: moment().toDate()
            },
            { new: true }
        ).exec();

        if (closedTransactionDoc === null) {
            throw new Error('UNDERWAY transaction not found');
        }
    };
}
