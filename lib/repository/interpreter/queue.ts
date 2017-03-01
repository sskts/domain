/**
 * キューリポジトリ
 *
 * @class QueueRepositoryInterpreter
 */

import * as monapt from 'monapt';
import { Connection } from 'mongoose';

import QueueRepository from '../queue';

import Authorization from '../../model/authorization';
import AuthorizationGroup from '../../model/authorizationGroup';
import Notification from '../../model/notification';
import NotificationGroup from '../../model/notificationGroup';
import Queue from '../../model/queue';
import QueueGroup from '../../model/queueGroup';
import Transaction from '../../model/transaction';
import queueModel from './mongoose/model/queue';

export default class QueueRepositoryInterpreter implements QueueRepository {
    private model: typeof queueModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(queueModel.modelName);
    }

    public async findOneAndUpdate(conditions: any, update: any) {
        const doc = await this.model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).exec();

        return (doc) ? monapt.Option(Queue.create(<any>doc.toObject())) : monapt.None;
    }

    public async findOneSendEmailAndUpdate(conditions: any, update: any) {
        const doc = await this.model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                group: QueueGroup.PUSH_NOTIFICATION,
                'notification.group': NotificationGroup.EMAIL
            }).exec();

        return (doc) ? monapt.Option(Queue.createPushNotification<Notification.EmailNotification>(<any>doc.toObject())) : monapt.None;
    }

    public async findOneSettleGMOAuthorizationAndUpdate(conditions: any, update: any) {
        const doc = await this.model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                group: QueueGroup.SETTLE_AUTHORIZATION,
                'authorization.group': AuthorizationGroup.GMO
            })
            .exec();

        return (doc) ? monapt.Option(Queue.createSettleAuthorization<Authorization.GMOAuthorization>(<any>doc.toObject())) : monapt.None;
    }

    public async findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: any, update: any) {
        const doc = await this.model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                group: QueueGroup.SETTLE_AUTHORIZATION,
                'authorization.group': AuthorizationGroup.COA_SEAT_RESERVATION
            })
            .exec();

        const queue = Queue.createSettleAuthorization<Authorization.COASeatReservationAuthorization>(<any>doc.toObject());
        return (doc) ? monapt.Option(queue) : monapt.None;
    }

    public async findOneCancelGMOAuthorizationAndUpdate(conditions: any, update: any) {
        const doc = await this.model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                group: QueueGroup.CANCEL_AUTHORIZATION,
                'authorization.group': AuthorizationGroup.GMO
            })
            .exec();

        return (doc) ? monapt.Option(Queue.createCancelAuthorization<Authorization.GMOAuthorization>(<any>doc.toObject())) : monapt.None;
    }

    public async findOneCancelCOASeatReservationAuthorizationAndUpdate(conditions: any, update: any) {
        const doc = await this.model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                group: QueueGroup.CANCEL_AUTHORIZATION,
                'authorization.group': AuthorizationGroup.COA_SEAT_RESERVATION
            })
            .exec();

        const queue = Queue.createCancelAuthorization<Authorization.COASeatReservationAuthorization>(<any>doc.toObject());
        return (doc) ? monapt.Option(queue) : monapt.None;
    }

    public async findOneDisableTransactionInquiryAndUpdate(conditions: any, update: any) {
        const doc = await this.model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                group: QueueGroup.DISABLE_TRANSACTION_INQUIRY
            })
            .exec();

        if (doc) {
            const object = <any>doc.toObject();
            object.transaction = Transaction.create(doc.get('transaction'));

            return monapt.Option(Queue.createDisableTransactionInquiry(object));
        } else {
            return monapt.None;
        }
    }

    public async store(queue: Queue) {
        await this.model.findByIdAndUpdate(queue.id, queue, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
