import * as monapt from 'monapt';
import Authorization from '../model/authorization';
import Notification from '../model/notification';
import Queue from '../model/queue';

/**
 * キューリポジトリ
 *
 * @interface QueueRepository
 */
interface QueueRepository {
    /**
     * ひとつ検索&更新
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneAndUpdate(conditions: any, update: any): Promise<monapt.Option<Queue>>;
    /**
     * メール送信キューをひとつ検索
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneSendEmailAndUpdate(conditions: any, update: any):
        Promise<monapt.Option<Queue.PushNotificationQueue<Notification.EmailNotification>>>;
    /**
     * GMOオーソリ実売上キューをひとつ検索
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneSettleGMOAuthorizationAndUpdate(conditions: any, update: any):
        Promise<monapt.Option<Queue.SettleAuthorizationQueue<Authorization.GMOAuthorization>>>;
    /**
     * GMOオーソリ取消キューをひとつ検索
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneCancelGMOAuthorizationAndUpdate(conditions: any, update: any):
        Promise<monapt.Option<Queue.CancelAuthorizationQueue<Authorization.GMOAuthorization>>>;
    /**
     * COA座席本予約キューをひとつ検索
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneSettleCOASeatReservationAuthorizationAndUpdate(conditions: any, update: any):
        Promise<monapt.Option<Queue.SettleAuthorizationQueue<Authorization.COASeatReservationAuthorization>>>;
    /**
     * COA座席仮予約削除キューをひとつ検索
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneCancelCOASeatReservationAuthorizationAndUpdate(conditions: any, update: any):
        Promise<monapt.Option<Queue.CancelAuthorizationQueue<Authorization.COASeatReservationAuthorization>>>;
    /**
     * 保管する
     *
     * @param {Queue} queue
     */
    store(queue: Queue): Promise<void>;
}

export default QueueRepository;
