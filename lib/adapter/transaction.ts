import * as clone from 'clone';
import * as createDebug from 'debug';
import { Connection } from 'mongoose';

import * as Authorization from '../factory/authorization';
import * as Notification from '../factory/notification';
import * as TransactionEvent from '../factory/transactionEvent';
import TransactionEventGroup from '../factory/transactionEventGroup';

import TransactionModel from './mongoose/model/transaction';
import TransactionEventModel from './mongoose/model/transactionEvent';

const debug = createDebug('sskts-domain:adapter:transaction');

/**
 * 取引アダプター
 *
 * todo ITransactionにIOwnerが結合しているために、デフォルトで.populate('owner')したりしている
 * Ownerをjoinするしないを必要に応じて使い分けられるようにする
 *
 * @export
 * @class TransactionAdapter
 */
export default class TransactionAdapter {
    public readonly transactionModel: typeof TransactionModel;
    public readonly transactionEventModel: typeof TransactionEventModel;
    private readonly connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
        this.transactionModel = this.connection.model(TransactionModel.modelName);
        this.transactionEventModel = this.connection.model(TransactionEventModel.modelName);
    }

    public async addEvent(transactionEvent: TransactionEvent.ITransactionEvent) {
        debug('creating transactionEvent...', transactionEvent);
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
                group: TransactionEventGroup.ADD_NOTIFICATION
            },
            'notification'
        )
            .setOptions({ maxTimeMS: 10000 })
            .exec())
            .map((doc) => <Notification.INotification>doc.get('notification'));

        const removedNotificationIds = (await this.transactionEventModel.find(
            {
                transaction: id,
                group: TransactionEventGroup.REMOVE_NOTIFICATION
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
            if (pricesByOwner[authorization.owner_from] === undefined) {
                pricesByOwner[authorization.owner_from] = 0;
            }
            if (pricesByOwner[authorization.owner_to] === undefined) {
                pricesByOwner[authorization.owner_to] = 0;
            }

            pricesByOwner[authorization.owner_from] -= authorization.price;
            pricesByOwner[authorization.owner_to] += authorization.price;
        });

        return Object.keys(pricesByOwner).every((ownerId) => (pricesByOwner[ownerId] === 0));
    }
}
