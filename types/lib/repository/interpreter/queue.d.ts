/// <reference types="mongoose" />
import mongoose = require("mongoose");
import monapt = require("monapt");
import QueueRepository from "../queue";
import COASeatReservationAuthorization from "../../model/authorization/coaSeatReservation";
import GMOAuthorization from "../../model/authorization/gmo";
import EmailNotification from "../../model/notification/email";
import ObjectId from "../../model/objectId";
import Queue from "../../model/queue";
import CancelAuthorizationQueue from "../../model/queue/cancelAuthorization";
import DisableTransactionInquiryQueue from "../../model/queue/disableTransactionInquiry";
import PushNotificationQueue from "../../model/queue/pushNotification";
import SettleAuthorizationQueue from "../../model/queue/settleAuthorization";
export default class QueueRepositoryInterpreter implements QueueRepository {
    readonly connection: mongoose.Connection;
    constructor(connection: mongoose.Connection);
    find(conditions: Object): Promise<Queue[]>;
    findById(id: ObjectId): Promise<monapt.Option<Queue>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Queue>>;
    findOneSendEmailAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<PushNotificationQueue<EmailNotification>>>;
    findOneSettleGMOAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<SettleAuthorizationQueue<GMOAuthorization>>>;
    findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<SettleAuthorizationQueue<COASeatReservationAuthorization>>>;
    findOneCancelGMOAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<CancelAuthorizationQueue<GMOAuthorization>>>;
    findOneCancelCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<CancelAuthorizationQueue<COASeatReservationAuthorization>>>;
    findOneDisableTransactionInquiryAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<DisableTransactionInquiryQueue>>;
    store(queue: Queue): Promise<void>;
}
