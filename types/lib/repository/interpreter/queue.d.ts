/// <reference types="mongoose" />
/**
 * キューリポジトリ
 *
 * @class QueueRepositoryInterpreter
 */
import * as monapt from 'monapt';
import * as mongoose from 'mongoose';
import QueueRepository from '../queue';
import Authorization from '../../model/authorization';
import Notification from '../../model/notification';
import Queue from '../../model/queue';
export default class QueueRepositoryInterpreter implements QueueRepository {
    readonly connection: mongoose.Connection;
    constructor(connection: mongoose.Connection);
    findOneSendEmailAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Queue.PushNotificationQueue<Notification.EmailNotification>>>;
    findOneSettleGMOAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Queue.SettleAuthorizationQueue<Authorization.GMOAuthorization>>>;
    findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Queue.SettleAuthorizationQueue<Authorization.COASeatReservationAuthorization>>>;
    findOneCancelGMOAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Queue.CancelAuthorizationQueue<Authorization.GMOAuthorization>>>;
    findOneCancelCOASeatReservationAuthorizationAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Queue.CancelAuthorizationQueue<Authorization.COASeatReservationAuthorization>>>;
    findOneDisableTransactionInquiryAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Queue.DisableTransactionInquiryQueue>>;
    store(queue: Queue): Promise<void>;
}
