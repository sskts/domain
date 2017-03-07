/// <reference types="mongoose" />
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import QueueRepository from '../queue';
import * as Authorization from '../../model/authorization';
import * as Notification from '../../model/notification';
import * as Queue from '../../model/queue';
export default class QueueRepositoryInterpreter implements QueueRepository {
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
