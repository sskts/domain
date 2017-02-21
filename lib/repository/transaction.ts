import * as monapt from 'monapt';
import Authorization from '../model/authorization';
import Notification from '../model/notification';
import ObjectId from '../model/objectId';
import Transaction from '../model/transaction';
import TransactionEvent from '../model/transactionEvent';

/**
 * 取引リポジトリ
 *
 * @interface TransactionRepository
 */
interface TransactionRepository {
    /**
     * 検索
     *
     * @param {Object} conditions 検索条件
     */
    find(conditions: Object): Promise<Transaction[]>;
    /**
     * ID検索
     *
     * @param {ObjectId} id
     */
    findById(id: ObjectId): Promise<monapt.Option<Transaction>>;
    /**
     * ひとつ検索
     *
     * @param {Object} conditions 検索条件
     */
    findOne(conditions: Object): Promise<monapt.Option<Transaction>>;
    /**
     * ひとつ検索&更新
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Transaction>>;
    /**
     * 保管する
     *
     * @param {Transaction} transaction 取引
     */
    store(transaction: Transaction): Promise<void>;
    /**
     * イベント追加する
     *
     * @param {TransactionEvent} transactionEvent 取引イベント
     */
    addEvent(transactionEvent: TransactionEvent): Promise<void>;
    /**
     * 取引IDから承認リストを取得する
     *
     * @param {ObjectId} id 取引ID
     */
    findAuthorizationsById(id: ObjectId): Promise<Authorization[]>;
    /**
     * 取引IDから通知リストを取得する
     *
     * @param {ObjectId} id 取引ID
     */
    findNotificationsById(id: ObjectId): Promise<Notification[]>;
    /**
     * 成立可能かどうか
     *
     * @returns {Promies<boolean>}
     */
    canBeClosed(id: ObjectId): Promise<boolean>;
}

export default TransactionRepository;
