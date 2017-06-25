/**
 * 取引(ID指定)サービス
 *
 * @namespace service/transactionWithId
 */

import * as GMO from '@motionpicture/gmo-service';
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
import * as GMOCardFactory from '../factory/card/gmo';
import * as EmailNotificationFactory from '../factory/notification/email';
import * as AnonymousOwnerFactory from '../factory/owner/anonymous';
import * as MemberOwnerFactory from '../factory/owner/member';
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
    return async (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter) => {
        // 取引取得
        const doc = await transactionAdapter.transactionModel.findById(args.transaction_id).populate('owners').exec();
        if (doc === null) {
            throw new ArgumentError('transactionId', `transaction[id:${args.transaction_id}] not found.`);
        }
        const transaction = <TransactionFactory.ITransaction>doc.toObject();

        // 取引から、更新対象の所有者を取り出す
        const anonymousOwnerInTransaction = <AnonymousOwnerFactory.IAnonymousOwner>transaction.owners.find((ownerInTransaction) => {
            return (ownerInTransaction.group === OwnerGroup.ANONYMOUS);
        });
        if (anonymousOwnerInTransaction === undefined) {
            throw new ArgumentError('owner', 'anonymous owner not found');
        }

        const anonymousOwner = AnonymousOwnerFactory.create({
            id: anonymousOwnerInTransaction.id,
            name_first: args.name_first,
            name_last: args.name_last,
            email: args.email,
            tel: args.tel,
            state: anonymousOwnerInTransaction.state
        });

        return setOwnerProfile(args.transaction_id, anonymousOwner)(ownerAdapter, transactionAdapter);
    };
}
exports.updateAnonymousOwner = util.deprecate(
    updateAnonymousOwner,
    'sskts-domain: service.transactionWithId.updateAnonymousOwner is deprecated, use service.transactionWithId.setOwnerProfile instead'
);

/**
 * 取引中の所有者プロフィールを変更する
 * 匿名所有者として開始した場合のみ想定(匿名か会員に変更可能)
 *
 * @export
 * @param {string} transactionId 取引ID
 * @param {(AnonymousOwnerFactory.IAnonymousOwner | MemberOwnerFactory.IMemberOwner)} owner 所有者
 * @returns {OwnerAndTransactionOperation<void>} 所有者と取引に対する操作
 */
export function setOwnerProfile(
    transactionId: string,
    owner: AnonymousOwnerFactory.IAnonymousOwner | MemberOwnerFactory.IMemberOwner
): OwnerAndTransactionOperation<void> {
    return async (ownerAdapter: OwnerAdapter, transactionAdapter: TransactionAdapter) => {
        // 取引取得
        const transaction = await transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec()
            .then((doc) => {
                if (doc === null) {
                    throw new ArgumentError('transactionId', `transaction[id:${transactionId}] not found.`);
                }

                return <TransactionFactory.ITransaction>doc.toObject();
            });

        // 取引から、更新対象の所有者を取り出す
        const existingOwner = transaction.owners.find((ownerInTransaction) => ownerInTransaction.id === owner.id);
        if (existingOwner === undefined) {
            throw new ArgumentError('owner', `owner[id:${owner.id}] not found`);
        }

        if (owner.group === OwnerGroup.MEMBER) {
            // 会員に更新の場合、まずGMO会員登録
            await saveGMOMember(<MemberOwnerFactory.IMemberOwner>owner);
        }

        // 永続化
        // 上書きすることがポイント(匿名になったり会員になったりするので)
        debug('setting owner profile...');
        const result = await ownerAdapter.model.update(
            { _id: owner.id },
            owner,
            { overwrite: true }
        ).exec();
        debug('owner updated', result);

        if (result.ok !== 1 || result.nModified !== 1) {
            console.error('fail in updating owner', result);
            throw new Error('fail in updating owner');
        }
    };
}

/**
 * 会員情報をGMO会員として保管する
 *
 * @param {MemberOwnerFactory.IMemberOwner} memberOwner 会員所有者
 */
async function saveGMOMember(memberOwner: MemberOwnerFactory.IMemberOwner) {
    // GMO会員登録
    // GMOサイト情報は環境変数に持たせる(1システムにつき1サイト)
    // 2回目かもしれないので、存在チェック
    const searchMemberResult = await GMO.services.card.searchMember({
        siteId: process.env.GMO_SITE_ID,
        sitePass: process.env.GMO_SITE_PASS,
        memberId: memberOwner.id
    });
    debug('GMO searchMember processed', searchMemberResult);

    if (searchMemberResult !== null) {
        // 存在していれば変更
        const updateMemberResult = await GMO.services.card.updateMember({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: memberOwner.id,
            memberName: `${memberOwner.name_last} ${memberOwner.name_first}`
        });
        debug('GMO updateMember processed', updateMemberResult);
    } else {
        const saveMemberResult = await GMO.services.card.saveMember({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: memberOwner.id,
            memberName: `${memberOwner.name_last} ${memberOwner.name_first}`
        });
        debug('GMO saveMember processed', saveMemberResult);
    }
}

/**
 * 取引中の所有者に対してカード情報を保管する
 *
 * @export
 * @param {string} transactionId 取引ID
 * @param {string} ownerId 所有者ID
 * @param {(GMOCardFactory.IGMOCardRaw | GMOCardFactory.IGMOCardTokenized)} gmoCard GMOカード情報
 * @returns {TransactionOperation<void>} 取引に対する操作
 */
export function saveCard(
    transactionId: string,
    ownerId: string,
    gmoCard: GMOCardFactory.IGMOCardRaw | GMOCardFactory.IGMOCardTokenized
): TransactionOperation<void> {
    return async (transactionAdapter: TransactionAdapter) => {
        // 取引取得
        const transaction = await transactionAdapter.transactionModel.findById(transactionId).populate('owners').exec()
            .then((doc) => {
                if (doc === null) {
                    throw new ArgumentError('transactionId', `transaction[id:${transactionId}] not found.`);
                }

                return <TransactionFactory.ITransaction>doc.toObject();
            });

        // 取引から、更新対象の所有者を取り出す
        const existingOwner = transaction.owners.find((ownerInTransaction) => ownerInTransaction.id === ownerId);
        if (existingOwner === undefined) {
            throw new ArgumentError('ownerId', `owner[id:${ownerId}] not found`);
        }
        // 万が一会員所有者でなければ不適切な操作
        if (existingOwner.group !== OwnerGroup.MEMBER) {
            throw new ArgumentError('ownerId', `owner[id:${ownerId}] is not a member`);
        }

        // 登録済みのカードがあれば削除
        // もし会員未登録でこのサービスを使えば、この時点でGMOエラー
        const searchCardResults = await GMO.services.card.searchCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: ownerId,
            seqMode: GMO.utils.util.SEQ_MODE_PHYSICS
        });
        debug('GMO searchCard processed', searchCardResults);

        await Promise.all(searchCardResults.map(async (searchCardResult) => {
            // 未削除であれば削除
            if (searchCardResult.deleteFlag !== '1') {
                const deleteCardResult = await GMO.services.card.deleteCard({
                    siteId: process.env.GMO_SITE_ID,
                    sitePass: process.env.GMO_SITE_PASS,
                    memberId: ownerId,
                    seqMode: GMO.utils.util.SEQ_MODE_PHYSICS,
                    cardSeq: searchCardResult.cardSeq
                });
                debug('GMO deleteCard processed', deleteCardResult);
            }
        }));

        // GMOカード登録
        const saveCardResult = await GMO.services.card.saveCard({
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS,
            memberId: ownerId,
            seqMode: GMO.utils.util.SEQ_MODE_PHYSICS,
            cardNo: (<GMOCardFactory.IGMOCardRaw>gmoCard).cardNo,
            cardPass: (<GMOCardFactory.IGMOCardRaw>gmoCard).cardPass,
            expire: (<GMOCardFactory.IGMOCardRaw>gmoCard).expire,
            holderName: (<GMOCardFactory.IGMOCardRaw>gmoCard).holderName,
            token: (<GMOCardFactory.IGMOCardTokenized>gmoCard).token
        });
        debug('GMO saveCard processed', saveCardResult);
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
