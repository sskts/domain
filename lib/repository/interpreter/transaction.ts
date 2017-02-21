/**
 * 取引リポジトリ
 *
 * @class TransactionRepositoryInterpreter
 */

import * as monapt from 'monapt';
import * as mongoose from 'mongoose';

import Authorization from '../../model/authorization';
import Notification from '../../model/notification';
import ObjectId from '../../model/objectId';
import Transaction from '../../model/transaction';
import TransactionEvent from '../../model/transactionEvent';
import TransactionEventGroup from '../../model/transactionEventGroup';
import TransactionRepository from '../transaction';
import TransactionModel from './mongoose/model/transaction';
import TransactionEventModel from './mongoose/model/transactionEvent';

export default class TransactionRepositoryInterpreter implements TransactionRepository {
    constructor(readonly connection: mongoose.Connection) {
    }

    public async find(conditions: Object) {
        const model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        const docs = <any[]>await model.find()
            .where(conditions)
            .populate('owner')
            .lean()
            .exec();

        return docs.map(Transaction.create);
    }

    public async findById(id: ObjectId) {
        const model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        const doc = <any>await model.findOne()
            .where('_id').equals(id)
            .populate('owners').lean().exec();

        return (doc) ? monapt.Option(Transaction.create(doc)) : monapt.None;
    }

    public async findOne(conditions: Object) {
        const model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        const doc = <any>await model.findOne(conditions).lean().exec();

        return (doc) ? monapt.Option(Transaction.create(doc)) : monapt.None;
    }

    public async findOneAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        const doc = <any>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).lean().exec();

        return (doc) ? monapt.Option(Transaction.create(doc)) : monapt.None;
    }

    public async store(transaction: Transaction) {
        const model = this.connection.model(TransactionModel.modelName, TransactionModel.schema);
        await model.findOneAndUpdate({ _id: transaction._id }, transaction, {
            new: true,
            upsert: true
        }).lean().exec();
    }

    public async addEvent(transactionEvent: TransactionEvent) {
        const model = this.connection.model(TransactionEventModel.modelName, TransactionEventModel.schema);
        await model.create([transactionEvent]);
    }

    public async findAuthorizationsById(id: ObjectId): Promise<Authorization[]> {
        const model = this.connection.model(TransactionEventModel.modelName, TransactionEventModel.schema);

        const authorizations = (<any[]>await model.find(
            {
                transaction: id,
                group: TransactionEventGroup.AUTHORIZE
            },
            'authorization'
        )
            .lean().exec())
            .map((doc) => doc.authorization);

        const removedAuthorizationIds = (<any[]>await model.find(
            {
                transaction: id,
                group: TransactionEventGroup.UNAUTHORIZE
            },
            'authorization._id'
        )
            .lean().exec())
            .map((doc) => doc.authorization._id.toString());

        return authorizations.filter(
            (authorization) => (removedAuthorizationIds.indexOf(authorization._id.toString()) < 0)
        );
    }

    public async findNotificationsById(id: ObjectId): Promise<Notification[]> {
        const model = this.connection.model(TransactionEventModel.modelName, TransactionEventModel.schema);

        const notifications = (<any[]>await model.find(
            {
                transaction: id,
                group: TransactionEventGroup.NOTIFICATION_ADD
            },
            'notification'
        )
            .lean().exec())
            .map((doc) => doc.notification);

        const removedNotificationIds = (<any[]>await model.find(
            {
                transaction: id,
                group: TransactionEventGroup.NOTIFICATION_REMOVE
            },
            'notification._id'
        )
            .lean().exec())
            .map((doc) => doc.notification._id.toString());

        return notifications.filter(
            (notification) => (removedNotificationIds.indexOf(notification._id.toString()) < 0)
        );
    }

    /**
     * 成立可能かどうか
     *
     * @returns {Promies<boolean>}
     */
    public async canBeClosed(id: ObjectId) {
        const authorizations = await this.findAuthorizationsById(id);
        const pricesByOwner: {
            [ownerId: string]: number
        } = {};

        authorizations.forEach((authorization) => {
            if (!pricesByOwner[authorization.owner_from.toString()]) {
                pricesByOwner[authorization.owner_from.toString()] = 0;
            }
            if (!pricesByOwner[authorization.owner_to.toString()]) {
                pricesByOwner[authorization.owner_to.toString()] = 0;
            }

            pricesByOwner[authorization.owner_from.toString()] -= authorization.price;
            pricesByOwner[authorization.owner_to.toString()] += authorization.price;
        });

        return Object.keys(pricesByOwner).every((ownerId) => (pricesByOwner[ownerId] === 0));
    }
}
