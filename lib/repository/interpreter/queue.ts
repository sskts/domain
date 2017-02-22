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
        const doc = <any>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).lean().exec();

        return (doc) ? monapt.Option(Queue.create(doc)) : monapt.None;
    }

    public async findOneSendEmailAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(queueModel.modelName);
        const doc = <any>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                group: QueueGroup.PUSH_NOTIFICATION,
                'notification.group': NotificationGroup.EMAIL
            }).lean().exec();

        return (doc) ? monapt.Option(Queue.createPushNotification<Notification.EmailNotification>(doc)) : monapt.None;
    }

    public async findOneSettleGMOAuthorizationAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(queueModel.modelName);
        const doc = <any>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                group: QueueGroup.SETTLE_AUTHORIZATION,
                'authorization.group': AuthorizationGroup.GMO
            })
            .lean().exec();

        return (doc) ? monapt.Option(Queue.createSettleAuthorization<Authorization.GMOAuthorization>(doc)) : monapt.None;
    }

    public async findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(queueModel.modelName);
        const doc = <any>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                group: QueueGroup.SETTLE_AUTHORIZATION,
                'authorization.group': AuthorizationGroup.COA_SEAT_RESERVATION
            })
            .lean().exec();

        const queue = Queue.createSettleAuthorization<Authorization.COASeatReservationAuthorization>(doc);
        return (doc) ? monapt.Option(queue) : monapt.None;
    }

    public async findOneCancelGMOAuthorizationAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(queueModel.modelName);
        const doc = <any>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                group: QueueGroup.CANCEL_AUTHORIZATION,
                'authorization.group': AuthorizationGroup.GMO
            })
            .lean().exec();

        return (doc) ? monapt.Option(Queue.createCancelAuthorization<Authorization.GMOAuthorization>(doc)) : monapt.None;
    }

    public async findOneCancelCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(queueModel.modelName);
        const doc = <any>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                group: QueueGroup.CANCEL_AUTHORIZATION,
                'authorization.group': AuthorizationGroup.COA_SEAT_RESERVATION
            })
            .lean().exec();

        const queue = Queue.createCancelAuthorization<Authorization.COASeatReservationAuthorization>(doc);
        return (doc) ? monapt.Option(queue) : monapt.None;
    }

    public async findOneDisableTransactionInquiryAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(queueModel.modelName);
        const doc = <any>await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        })
            .where({
                group: QueueGroup.DISABLE_TRANSACTION_INQUIRY
            })
            .lean().exec();

        return (doc) ? monapt.Option(Queue.createDisableTransactionInquiry(doc)) : monapt.None;
    }

    public async store(queue: Queue) {
        const model = this.connection.model(queueModel.modelName);
        await model.findOneAndUpdate({ _id: queue._id }, queue, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
