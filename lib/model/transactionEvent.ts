// tslint:disable:variable-name
import ObjectId from './objectId';
import TransactionEventGroup from './transactionEventGroup';

/**
 * 取引イベント
 *
 * @class TransactionEvent
 *
 * @param {ObjectId} _id
 * @param {ObjectId} transaction 取引ID
 * @param {TransactionEventGroup} group 取引イベントグループ
 * @param {Date} occurred_at 発生日時
 */
export default class TransactionEvent {
    constructor(
        readonly _id: ObjectId,
        readonly transaction: ObjectId,
        readonly group: TransactionEventGroup,
        readonly occurred_at: Date
    ) {
        // todo validation
    }
}
