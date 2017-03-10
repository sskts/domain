/**
 * キューリポジトリ
 *
 * @class QueueAdapterInterpreter
 */

import * as clone from 'clone';
import * as monapt from 'monapt';
import { Connection } from 'mongoose';

import QueueAdapter from '../queue';

import * as Authorization from '../../factory/authorization';
import AuthorizationGroup from '../../factory/authorizationGroup';
import * as Notification from '../../factory/notification';
import NotificationGroup from '../../factory/notificationGroup';
import * as Queue from '../../factory/queue';
import QueueGroup from '../../factory/queueGroup';
import queueModel from './mongoose/model/queue';

export default class QueueAdapterInterpreter implements QueueAdapter {
    private model: typeof queueModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(queueModel.modelName);
    }

    public async findOneAndUpdate(conditions: any, update: any) {
        const doc = await this.model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false
        }).exec();

        return (doc) ? monapt.Option(<Queue.IQueue>doc.toObject()) : monapt.None;
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

        return (doc) ? monapt.Option(<Queue.IPushNotificationQueue<Notification.IEmailNotification>>doc.toObject()) : monapt.None;
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

        return (doc) ? monapt.Option(<Queue.ISettleAuthorizationQueue<Authorization.IGMOAuthorization>>doc.toObject()) : monapt.None;
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

        return (doc)
            ? monapt.Option(<Queue.ISettleAuthorizationQueue<Authorization.ICOASeatReservationAuthorization>>doc.toObject())
            : monapt.None;
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

        return (doc) ? monapt.Option(<Queue.ICancelAuthorizationQueue<Authorization.IGMOAuthorization>>doc.toObject()) : monapt.None;
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

        return (doc)
            ? monapt.Option(<Queue.ICancelAuthorizationQueue<Authorization.ICOASeatReservationAuthorization>>doc.toObject())
            : monapt.None;
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

        return (doc) ? monapt.Option(<Queue.IDisableTransactionInquiryQueue>doc.toObject()) : monapt.None;
    }

    public async store(queue: Queue.IQueue) {
        const update = clone(queue, false);
        await this.model.findByIdAndUpdate(update.id, update, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
