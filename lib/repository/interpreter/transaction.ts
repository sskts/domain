/**
 * 取引リポジトリ
 *
 * @class TransactionRepositoryInterpreter
 */

import * as createDebug from 'debug';
import * as monapt from 'monapt';
import { Connection } from 'mongoose';

import Authorization from '../../model/authorization';
import Notification from '../../model/notification';
import Transaction from '../../model/transaction';
import TransactionEvent from '../../model/transactionEvent';
import TransactionEventGroup from '../../model/transactionEventGroup';
import TransactionRepository from '../transaction';
import transactionModel from './mongoose/model/transaction';
import transactionEventModel from './mongoose/model/transactionEvent';

export type IAuthorization =
    Authorization.AssetAuthorization | Authorization.COASeatReservationAuthorization | Authorization.GMOAuthorization;
export type INotification = Notification.EmailNotification;

const debug = createDebug('sskts-domain:repository:transaction');

export default class TransactionRepositoryInterpreter implements TransactionRepository {
    constructor(readonly connection: Connection) {
    }

    public async find(conditions: Object) {
        const model = this.connection.model(transactionModel.modelName);
        const docs = await model.find()
            .where(conditions)
            .populate('owner')
            .exec();

        return docs.map((doc) => Transaction.create(<any>doc.toObject()));
    }

    public async findById(id: string) {
        const model = this.connection.model(transactionModel.modelName);
        const doc = await model.findById(id)
            .populate('owners').exec();

        return (doc) ? monapt.Option(Transaction.create(<any>doc.toObject())) : monapt.None;
    }

    public async findOne(conditions: Object) {
        const model = this.connection.model(transactionModel.modelName);
        const doc = await model.findOne(conditions).exec();

        return (doc) ? monapt.Option(Transaction.create(<any>doc.toObject())) : monapt.None;
    }

    public async findOneAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(transactionModel.modelName);
        const doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).exec();

        return (doc) ? monapt.Option(Transaction.create(<any>doc.toObject())) : monapt.None;
    }

    public async store(transaction: Transaction) {
        const model = this.connection.model(transactionModel.modelName);
        debug('updating a transaction...', transaction);
        await model.findByIdAndUpdate(transaction.id, transaction.toDocument(), {
            new: true,
            upsert: true
        }).lean().exec();
    }

    public async addEvent(transactionEvent: TransactionEvent) {
        const model = this.connection.model(transactionEventModel.modelName);
        await model.create([transactionEvent]);
    }

    public async findAuthorizationsById(id: string): Promise<IAuthorization[]> {
        const model = this.connection.model(transactionEventModel.modelName);

        const authorizations = (await model.find(
            {
                transaction: id,
                group: TransactionEventGroup.AUTHORIZE
            },
            'authorization'
        )
            .exec())
            .map((doc) => <IAuthorization>doc.get('authorization'));

        const removedAuthorizationIds = (await model.find(
            {
                transaction: id,
                group: TransactionEventGroup.UNAUTHORIZE
            },
            'authorization._id'
        )
            .exec())
            .map((doc) => doc.get('id'));

        return authorizations.filter(
            (authorization) => removedAuthorizationIds.indexOf(authorization.id) < 0
        );
    }

    public async findNotificationsById(id: string): Promise<INotification[]> {
        const model = this.connection.model(transactionEventModel.modelName);

        const notifications = (await model.find(
            {
                transaction: id,
                group: TransactionEventGroup.NOTIFICATION_ADD
            },
            'notification'
        )
            .exec())
            .map((doc) => <INotification>doc.get('notification'));

        const removedNotificationIds = (await model.find(
            {
                transaction: id,
                group: TransactionEventGroup.NOTIFICATION_REMOVE
            },
            'notification._id'
        )
            .exec())
            .map((doc) => doc.get('id'));

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
}
