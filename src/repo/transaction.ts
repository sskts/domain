import * as factory from '@motionpicture/sskts-factory';
import * as moment from 'moment';
import { Connection } from 'mongoose';

import TransactionModel from './mongoose/model/transaction';

/**
 * transaction repository
 * @class
 */
export class MongoRepository {
    public readonly transactionModel: typeof TransactionModel;

    constructor(connection: Connection) {
        this.transactionModel = connection.model(TransactionModel.modelName);
    }

    public async startPlaceOrder(
        transactionAttributes: factory.transaction.placeOrder.IAttributes
    ): Promise<factory.transaction.placeOrder.ITransaction> {
        return this.transactionModel.create(transactionAttributes).then(
            (doc) => <factory.transaction.placeOrder.ITransaction>doc.toObject()
        );
    }

    /**
     * find placeOrder transaction by id
     * @param {string} transactionId transaction id
     */
    public async findPlaceOrderById(transactionId: string): Promise<factory.transaction.placeOrder.ITransaction> {
        const doc = await this.transactionModel.findOne({
            _id: transactionId,
            typeOf: factory.transactionType.PlaceOrder
        }).exec();

        if (doc === null) {
            throw new factory.errors.NotFound('transaction');
        }

        return <factory.transaction.placeOrder.ITransaction>doc.toObject();
    }

    /**
     * 進行中の取引を取得する
     */
    public async findPlaceOrderInProgressById(transactionId: string): Promise<factory.transaction.placeOrder.ITransaction> {
        const doc = await this.transactionModel.findOne({
            _id: transactionId,
            typeOf: factory.transactionType.PlaceOrder,
            status: factory.transactionStatusType.InProgress
        }).exec();

        if (doc === null) {
            throw new factory.errors.NotFound('transaction in progress');
        }

        return <factory.transaction.placeOrder.ITransaction>doc.toObject();
    }

    /**
     * 取引中の所有者プロフィールを変更する
     * 匿名所有者として開始した場合のみ想定(匿名か会員に変更可能)
     */
    public async setCustomerContactOnPlaceOrderInProgress(
        transactionId: string,
        contact: factory.transaction.placeOrder.ICustomerContact
    ): Promise<void> {
        const doc = await this.transactionModel.findOneAndUpdate(
            {
                _id: transactionId,
                typeOf: factory.transactionType.PlaceOrder,
                status: factory.transactionStatusType.InProgress
            },
            {
                'object.customerContact': contact
            }
        ).exec();

        if (doc === null) {
            throw new factory.errors.NotFound('transaction in progress');
        }
    }

    /**
     * confirm a placeOrder
     * 注文取引を確定する
     * @param {string} transactionId transaction id
     * @param {Date} endDate end date
     * @param {factory.action.authorize.IAction[]} authorizeActions authorize actions
     * @param {factory.transaction.placeOrder.IResult} result transaction result
     */
    public async confirmPlaceOrder(
        transactionId: string,
        endDate: Date,
        authorizeActions: factory.action.authorize.IAction[],
        result: factory.transaction.placeOrder.IResult
    ): Promise<factory.transaction.placeOrder.ITransaction> {
        const doc = await this.transactionModel.findOneAndUpdate(
            {
                _id: transactionId,
                typeOf: factory.transactionType.PlaceOrder,
                status: factory.transactionStatusType.InProgress
            },
            {
                status: factory.transactionStatusType.Confirmed, // ステータス変更
                endDate: endDate,
                'object.authorizeActions': authorizeActions, // 認可アクションリストを更新
                result: result // resultを更新
            },
            { new: true }
        ).exec();

        if (doc === null) {
            throw new factory.errors.NotFound('transaction in progress');
        }

        return <factory.transaction.placeOrder.ITransaction>doc.toObject();
    }

    /**
     * タスクエクスポートリトライ
     * todo updatedAtを基準にしているが、タスクエクスポートトライ日時を持たせた方が安全か？
     * @param {number} intervalInMinutes
     */
    public async reexportTasks(intervalInMinutes: number): Promise<void> {
        await this.transactionModel.findOneAndUpdate(
            {
                tasksExportationStatus: factory.transactionTasksExportationStatus.Exporting,
                updatedAt: { $lt: moment().add(-intervalInMinutes, 'minutes').toISOString() }
            },
            {
                tasksExportationStatus: factory.transactionTasksExportationStatus.Unexported
            }
        ).exec();
    }

    /**
     * set task status exported by transaction id
     * IDでタスクをエクスポート済に変更する
     * @param transactionId transaction id
     */
    public async setTasksExportedById(transactionId: string) {
        await this.transactionModel.findByIdAndUpdate(
            transactionId,
            {
                tasksExportationStatus: factory.transactionTasksExportationStatus.Exported,
                tasksExportedAt: moment().toDate()
            }
        ).exec();
    }

    /**
     * 取引を期限切れにする
     */
    public async makeExpired(): Promise<void> {
        const endDate = moment().toDate();

        // ステータスと期限を見て更新
        await this.transactionModel.update(
            {
                status: factory.transactionStatusType.InProgress,
                expires: { $lt: endDate }
            },
            {
                status: factory.transactionStatusType.Expired,
                endDate: endDate
            },
            { multi: true }
        ).exec();
    }

    /**
     * 注文取引を検索する
     * @param searchConditions 検索条件
     */
    public async searchPlaceOrder(
        searchConditions: {
            startFrom: Date; // 取引開始日時fomr
            startThrough: Date; // 取引開始日時through
            status?: factory.transactionStatusType; // 取引ステータス
            agentId?: string; // 取引主体ID
            sellerId?: string; // 販売者ID
            object?: {
                customerContact?: { // 購入者連絡先情報
                    name?: string;
                    telephone?: string;
                    email?: string;
                }
            }
            result?: {
                order?: {
                    confirmationNumber?: number // 成立取引の場合、注文の確認番号
                    paymentMethods?: factory.paymentMethodType[] // 決済方法リスト(or検索)
                }
            }
        }
    ): Promise<factory.transaction.placeOrder.ITransaction[]> {
        const andConditions: any[] = [{
            typeOf: factory.transactionType.PlaceOrder
        }];
        andConditions.push({
            startDate: {
                $gte: searchConditions.startFrom,
                $lte: searchConditions.startThrough
            }
        });

        if (searchConditions.status !== undefined) {
            andConditions.push({ status: searchConditions.status });
        }

        if (searchConditions.agentId !== undefined) {
            andConditions.push({ 'agent.id': searchConditions.agentId });
        }

        if (searchConditions.sellerId !== undefined) {
            andConditions.push({ 'seller.id': searchConditions.sellerId });
        }

        if (searchConditions.object !== undefined) {
            if (searchConditions.object.customerContact !== undefined) {
                if (searchConditions.object.customerContact.email !== undefined) {
                    // メールアドレスはCase-Insensitiveで検索
                    const regex = new RegExp(searchConditions.object.customerContact.email, 'i');
                    andConditions.push({ 'object.customerContact.email': regex });
                }

                if (searchConditions.object.customerContact.name !== undefined) {
                    // 名前はCase-Insensitiveで検索
                    const regex = new RegExp(searchConditions.object.customerContact.name, 'i');
                    andConditions.push({
                        $or: [
                            { 'object.customerContact.givenName': regex },
                            { 'object.customerContact.familyName': regex }
                        ]
                    });
                }

                if (searchConditions.object.customerContact.telephone !== undefined) {
                    // DBにはE164フォーマットで保管されているので、生文字列と、頭の0を除いた文字列の両方でor検索
                    const telephoneTrimmedZero = searchConditions.object.customerContact.telephone.replace(/^0/, '');
                    // Case-Insensitiveで検索
                    const regex = new RegExp(`${searchConditions.object.customerContact.telephone}|${telephoneTrimmedZero}`, 'i');
                    andConditions.push({ 'object.customerContact.telephone': regex });
                }
            }
        }

        if (searchConditions.result !== undefined) {
            if (searchConditions.result.order !== undefined) {
                if (searchConditions.result.order.confirmationNumber !== undefined) {
                    // 確認番号は完全一致検索
                    andConditions.push({ 'result.order.confirmationNumber': searchConditions.result.order.confirmationNumber });
                }

                if (searchConditions.result.order.paymentMethods !== undefined) {
                    if (searchConditions.result.order.paymentMethods.length > 0) {
                        // 確認番号は完全一致検索
                        andConditions.push(
                            { 'result.order.paymentMethods.paymentMethod': { $in: searchConditions.result.order.paymentMethods } }
                        );
                    }
                }
            }
        }

        const limit = 100;
        const page = 1;
        const sort = { startDate: 1 };
        const select = {
            createdAt: 0,
            updatedAt: 0,
            __v: 0
        };

        return this.transactionModel.find({ $and: andConditions })
            .limit(limit)
            .skip(limit * (page - 1))
            .sort(sort)
            .select(select)
            .exec()
            .then((docs) => docs.map((doc) => <factory.transaction.placeOrder.ITransaction>doc.toObject()));
    }
}
