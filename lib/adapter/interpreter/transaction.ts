/**
 * 取引リポジトリ
 *
 * todo ITransactionにIOwnerが結合しているために、デフォルトで.populate('owner')したりしている
 * Ownerをjoinするしないを必要に応じて使い分けられるようにする
 *
 * @class TransactionAdapterInterpreter
 */

import * as clone from 'clone';
import * as createDebug from 'debug';
import * as monapt from 'monapt';
import { Connection, Types } from 'mongoose';

import * as Authorization from '../../factory/authorization';
import * as Notification from '../../factory/notification';
import * as Transaction from '../../factory/transaction';
import * as TransactionEvent from '../../factory/transactionEvent';
import TransactionEventGroup from '../../factory/transactionEventGroup';
import TransactionAdapter from '../transaction';
import TransactionModel from './mongoose/model/transaction';
import TransactionEventModel from './mongoose/model/transactionEvent';

const debug = createDebug('sskts-domain:adapter:transaction');

export default class TransactionAdapterInterpreter implements TransactionAdapter {
    private transactionModel: typeof TransactionModel;
    private transactionEventModel: typeof TransactionEventModel;

    constructor(readonly connection: Connection) {
        this.transactionModel = this.connection.model(TransactionModel.modelName);
        this.transactionEventModel = this.connection.model(TransactionEventModel.modelName);
    }

    public async find(conditions: any) {
        const docs = await this.transactionModel.find()
            .setOptions({ maxTimeMS: 10000 })
            .where(conditions)
            .populate('owner')
            .exec();

        return docs.map((doc) => <Transaction.ITransaction>doc.toObject());
    }

    public async findById(id: string) {
        const doc = await this.transactionModel.findById(id).populate('owners').exec();

        return (doc) ? monapt.Option(<Transaction.ITransaction>doc.toObject()) : monapt.None;
    }

    public async findOne(conditions: any) {
        const doc = await this.transactionModel.findOne(conditions).populate('owners').exec();

        return (doc) ? monapt.Option(<Transaction.ITransaction>doc.toObject()) : monapt.None;
    }

    public async findOneAndUpdate(conditions: any, update: any) {
        const doc = await this.transactionModel.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).exec();

        return (doc) ? monapt.Option(<any>doc.toObject()) : monapt.None;
    }

    public async store(transaction: Transaction.ITransaction) {
        debug('findByIdAndUpdate...', transaction);

        const update = clone(transaction, false);
        update.owners = <any[]>update.owners.map((owner) => owner.id);
        await this.transactionModel.findByIdAndUpdate(update.id, update, {
            new: true,
            upsert: true
        }).lean().exec();
    }

    public async create(transactions: Transaction.ITransaction[]) {
        const updates = transactions.map((transaction) => {
            const update = clone(transaction);
            (<any>update)._id = Types.ObjectId(update.id);
            update.owners = <any[]>update.owners.map((owner) => owner.id);
            return update;
        });

        await this.transactionModel.create(updates);
    }

    public async addEvent(transactionEvent: TransactionEvent.ITransactionEvent) {
        const update = clone(transactionEvent, false);
        await this.transactionEventModel.create([update]);
    }

    public async findAuthorizationsById(id: string): Promise<Authorization.IAuthorization[]> {
        const authorizations = (await this.transactionEventModel.find(
            {
                transaction: id,
                group: TransactionEventGroup.AUTHORIZE
            },
            'authorization'
        )
            .setOptions({ maxTimeMS: 10000 })
            .exec())
            .map((doc) => <Authorization.IAuthorization>doc.get('authorization'));

        const removedAuthorizationIds = (await this.transactionEventModel.find(
            {
                transaction: id,
                group: TransactionEventGroup.UNAUTHORIZE
            },
            'authorization.id'
        )
            .setOptions({ maxTimeMS: 10000 })
            .exec())
            .map((doc) => doc.get('authorization.id'));

        return authorizations.filter(
            (authorization) => removedAuthorizationIds.indexOf(authorization.id) < 0
        );
    }

    public async findNotificationsById(id: string): Promise<Notification.INotification[]> {
        const notifications = (await this.transactionEventModel.find(
            {
                transaction: id,
                group: TransactionEventGroup.NOTIFICATION_ADD
            },
            'notification'
        )
            .setOptions({ maxTimeMS: 10000 })
            .exec())
            .map((doc) => <Notification.INotification>doc.get('notification'));

        const removedNotificationIds = (await this.transactionEventModel.find(
            {
                transaction: id,
                group: TransactionEventGroup.NOTIFICATION_REMOVE
            },
            'notification.id'
        )
            .setOptions({ maxTimeMS: 10000 })
            .exec())
            .map((doc) => doc.get('notification.id'));

        return notifications.filter(
            (notification) => (removedNotificationIds.indexOf(notification.id) < 0)
        );
    }

    /**
     * 成立可能かどうか
     *
     * @returns {Promies<boolean>}
     */
    public async canBeClosed(id: string) {
        const authorizations = await this.findAuthorizationsById(id);
        const pricesByOwner: {
            [ownerId: string]: number
        } = {};

        authorizations.forEach((authorization) => {
            if (!pricesByOwner[authorization.owner_from]) {
                pricesByOwner[authorization.owner_from] = 0;
            }
            if (!pricesByOwner[authorization.owner_to]) {
                pricesByOwner[authorization.owner_to] = 0;
            }

            pricesByOwner[authorization.owner_from] -= authorization.price;
            pricesByOwner[authorization.owner_to] += authorization.price;
        });

        return Object.keys(pricesByOwner).every((ownerId) => (pricesByOwner[ownerId] === 0));
    }

    public async remove(conditions: any) {
        await this.transactionModel.remove(conditions).exec();
    }
}
