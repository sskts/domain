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
import TransactionModel from './mongoose/model/transaction';
import TransactionEventModel from './mongoose/model/transactionEvent';

export type IAuthorization =
    Authorization.AssetAuthorization | Authorization.COASeatReservationAuthorization | Authorization.GMOAuthorization;
export type INotification = Notification.EmailNotification;

const debug = createDebug('sskts-domain:repository:transaction');

export default class TransactionRepositoryInterpreter implements TransactionRepository {
    private transactionModel: typeof TransactionModel;
    private transactionEventModel: typeof TransactionEventModel;

    constructor(readonly connection: Connection) {
        this.transactionModel = this.connection.model(TransactionModel.modelName);
        this.transactionEventModel = this.connection.model(TransactionEventModel.modelName);
    }

    public async find(conditions: any) {
        const docs = await this.transactionModel.find()
            .where(conditions)
            .populate('owner')
            .exec();

        return docs.map((doc) => Transaction.create(<any>doc.toObject()));
    }

    public async findById(id: string) {
        const doc = await this.transactionModel.findById(id)
            .populate('owners').exec();

        return (doc) ? monapt.Option(Transaction.create(<any>doc.toObject())) : monapt.None;
    }

    public async findOne(conditions: any) {
        const doc = await this.transactionModel.findOne(conditions).exec();

        return (doc) ? monapt.Option(Transaction.create(<any>doc.toObject())) : monapt.None;
    }

    public async findOneAndUpdate(conditions: any, update: any) {
        const doc = await this.transactionModel.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).exec();

        return (doc) ? monapt.Option(Transaction.create(<any>doc.toObject())) : monapt.None;
    }

    public async store(transaction: Transaction) {
        debug('updating a transaction...', transaction);
        await this.transactionModel.findByIdAndUpdate(transaction.id, transaction.toDocument(), {
            new: true,
            upsert: true
        }).lean().exec();
    }

    public async addEvent(transactionEvent: TransactionEvent) {
        await this.transactionEventModel.create([transactionEvent]);
    }

    public async findAuthorizationsById(id: string): Promise<IAuthorization[]> {
        const model = this.connection.model(TransactionEventModel.modelName);

        const authorizations = (await this.transactionEventModel.find(
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
        const model = this.connection.model(TransactionEventModel.modelName);

        const notifications = (await this.transactionEventModel.find(
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
