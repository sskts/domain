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
import queueModel from './mongoose/model/queue';

export default class QueueRepositoryInterpreter implements QueueRepository {
    constructor(readonly connection: Connection) {
    }

    public async findOneAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(queueModel.modelName);
        const doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).exec();

        return (doc) ? monapt.Option(Queue.create(<any>doc.toObject())) : monapt.None;
    }

    public async findOneSendEmailAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(queueModel.modelName);
        const doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                group: QueueGroup.PUSH_NOTIFICATION,
                'notification.group': NotificationGroup.EMAIL
            }).exec();

        return (doc) ? monapt.Option(Queue.createPushNotification<Notification.EmailNotification>(<any>doc.toObject())) : monapt.None;
    }

    public async findOneSettleGMOAuthorizationAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(queueModel.modelName);
        const doc = await model.findOneAndUpdate(conditions, update, {
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

    public async findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(queueModel.modelName);
        const doc = await model.findOneAndUpdate(conditions, update, {
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

    public async findOneCancelGMOAuthorizationAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(queueModel.modelName);
        const doc = await model.findOneAndUpdate(conditions, update, {
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

    public async findOneCancelCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(queueModel.modelName);
        const doc = await model.findOneAndUpdate(conditions, update, {
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

    public async findOneDisableTransactionInquiryAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(queueModel.modelName);
        const doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                group: QueueGroup.DISABLE_TRANSACTION_INQUIRY
            })
            .exec();

        return (doc) ? monapt.Option(Queue.createDisableTransactionInquiry(<any>doc.toObject())) : monapt.None;
    }

    public async store(queue: Queue) {
        const model = this.connection.model(queueModel.modelName);
        await model.findOneAndUpdate({ _id: queue.id }, queue, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
