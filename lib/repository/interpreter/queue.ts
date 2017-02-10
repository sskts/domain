import mongoose = require("mongoose");
import monapt = require("monapt");

import QueueRepository from "../queue";

import COASeatReservationAuthorization from "../../model/authorization/coaSeatReservation";
import GMOAuthorization from "../../model/authorization/gmo";
import AuthorizationGroup from "../../model/authorizationGroup";
import EmailNotification from "../../model/notification/email";
import NotificationGroup from "../../model/notificationGroup";
import ObjectId from "../../model/objectId";
import Queue from "../../model/queue";
import CancelAuthorizationQueue from "../../model/queue/cancelAuthorization";
import DisableTransactionInquiryQueue from "../../model/queue/disableTransactionInquiry";
import PushNotificationQueue from "../../model/queue/pushNotification";
import SettleAuthorizationQueue from "../../model/queue/settleAuthorization";
import QueueGroup from "../../model/queueGroup";

import QueueFactory from "../../factory/queue";

import QueueModel from "./mongoose/model/queue";

export default class QueueRepositoryInterpreter implements QueueRepository {
    constructor(readonly connection: mongoose.Connection) {
    }

    public async find(conditions: Object) {
        const model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        const docs = await model.find().where(conditions).exec() as any[];
        return docs.map((doc) => {
            return QueueFactory.create(doc);
        });
    }

    public async findById(id: ObjectId) {
        const model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        const doc = await model.findOne()
            .where("_id").equals(id).lean().exec() as any;

        return (doc) ? monapt.Option(QueueFactory.create(doc)) : monapt.None;
    }

    public async findOneAndUpdate(conditions: Object, update: Object) {
        const model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        const doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false,
        }).lean().exec() as any;

        return (doc) ? monapt.Option(QueueFactory.create(doc)) : monapt.None;
    }

    public async findOneSendEmailAndUpdate(conditions: Object, update: Object):
        Promise<monapt.Option<PushNotificationQueue<EmailNotification>>> {
        const model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        const doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false,
        })
            .where({
                "group": QueueGroup.PUSH_NOTIFICATION,
                "notification.group": NotificationGroup.EMAIL,
            }).lean().exec() as any;

        return (doc) ? monapt.Option(QueueFactory.createPushNotification<EmailNotification>(doc)) : monapt.None;
    }

    public async findOneSettleGMOAuthorizationAndUpdate(conditions: Object, update: Object):
        Promise<monapt.Option<SettleAuthorizationQueue<GMOAuthorization>>> {
        const model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        const doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false,
        })
            .where({
                "group": QueueGroup.SETTLE_AUTHORIZATION,
                "authorization.group": AuthorizationGroup.GMO,
            })
            .lean().exec() as any;

        return (doc) ? monapt.Option(QueueFactory.createSettleAuthorization<GMOAuthorization>(doc)) : monapt.None;
    }

    public async findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object):
        Promise<monapt.Option<SettleAuthorizationQueue<COASeatReservationAuthorization>>> {
        const model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        const doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false,
        })
            .where({
                "group": QueueGroup.SETTLE_AUTHORIZATION,
                "authorization.group": AuthorizationGroup.COA_SEAT_RESERVATION,
            })
            .lean().exec() as any;

        return (doc) ? monapt.Option(QueueFactory.createSettleAuthorization<COASeatReservationAuthorization>(doc)) : monapt.None;
    }

    public async findOneCancelGMOAuthorizationAndUpdate(conditions: Object, update: Object):
        Promise<monapt.Option<CancelAuthorizationQueue<GMOAuthorization>>> {
        const model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        const doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false,
        })
            .where({
                "group": QueueGroup.CANCEL_AUTHORIZATION,
                "authorization.group": AuthorizationGroup.GMO,
            })
            .lean().exec() as any;

        return (doc) ? monapt.Option(QueueFactory.createCancelAuthorization<GMOAuthorization>(doc)) : monapt.None;
    }

    public async findOneCancelCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object):
        Promise<monapt.Option<CancelAuthorizationQueue<COASeatReservationAuthorization>>> {
        const model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        const doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false,
        })
            .where({
                "group": QueueGroup.CANCEL_AUTHORIZATION,
                "authorization.group": AuthorizationGroup.COA_SEAT_RESERVATION,
            })
            .lean().exec() as any;

        return (doc) ? monapt.Option(QueueFactory.createCancelAuthorization<COASeatReservationAuthorization>(doc)) : monapt.None;
    }

    public async findOneDisableTransactionInquiryAndUpdate(conditions: Object, update: Object):
        Promise<monapt.Option<DisableTransactionInquiryQueue>> {
        const model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        const doc = await model.findOneAndUpdate(conditions, update, {
            new: true,
            upsert: false,
        })
            .where({
                group: QueueGroup.DISABLE_TRANSACTION_INQUIRY,
            })
            .lean().exec() as any;

        return (doc) ? monapt.Option(QueueFactory.createDisableTransactionInquiry(doc)) : monapt.None;
    }

    public async store(queue: Queue) {
        const model = this.connection.model(QueueModel.modelName, QueueModel.schema);
        await model.findOneAndUpdate({ _id: queue._id }, queue, {
            new: true,
            upsert: true,
        }).lean().exec();
    }
}