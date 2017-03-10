/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import QueueAdapter from '../queue';
import * as Authorization from '../../factory/authorization';
import * as Notification from '../../factory/notification';
import * as Queue from '../../factory/queue';
export default class QueueAdapterInterpreter implements QueueAdapter {
    readonly connection: Connection;
    private model;
    constructor(connection: Connection);
    findOneAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.IQueue>>;
    findOneSendEmailAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.IPushNotificationQueue<Notification.IEmailNotification>>>;
    findOneSettleGMOAuthorizationAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.ISettleAuthorizationQueue<Authorization.IGMOAuthorization>>>;
    findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.ISettleAuthorizationQueue<Authorization.ICOASeatReservationAuthorization>>>;
    findOneCancelGMOAuthorizationAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.ICancelAuthorizationQueue<Authorization.IGMOAuthorization>>>;
    findOneCancelCOASeatReservationAuthorizationAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.ICancelAuthorizationQueue<Authorization.ICOASeatReservationAuthorization>>>;
    findOneDisableTransactionInquiryAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue.IDisableTransactionInquiryQueue>>;
    store(queue: Queue.IQueue): Promise<void>;
}
