"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * レポートサービステスト
 *
 * @ignore
 */
const assert = require("assert");
const moment = require("moment");
const mongoose = require("mongoose");
const gmoNotification_1 = require("../../lib/adapter/gmoNotification");
const queue_1 = require("../../lib/adapter/queue");
const transaction_1 = require("../../lib/adapter/transaction");
const ReportService = require("../../lib/service/report");
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
    const gmoNotificationAdapter = new gmoNotification_1.default(connection);
    yield gmoNotificationAdapter.gmoNotificationModel.remove({}).exec();
}));
describe('レポートサービス 取引状態', () => {
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        yield ReportService.transactionStatuses()(new queue_1.default(connection), new transaction_1.default(connection));
    }));
});
describe('レポートサービス GMO実売上検索', () => {
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        // tslint:disable-next-line:no-magic-numbers
        const dateFrom = moment().add(-10, 'minutes').toDate();
        const dateTo = moment().toDate();
        const gmoNotificationAdapter = new gmoNotification_1.default(connection);
        const notifications = [
            {
                shop_id: 'tshop00026096',
                access_id: 'c2ab15af0e7459291913adede0657f12',
                order_id: '201704151180000151900',
                status: 'SALES',
                job_cd: 'SALES',
                amount: '2000',
                tax: '0',
                currency: 'JPN',
                forward: '2a99662',
                method: '1',
                pay_times: '',
                tran_id: '1704152300111111111111877098',
                approve: '2980559',
                tran_date: moment(dateFrom).format('YYYYMMDDHHmmss'),
                err_code: '',
                err_info: '',
                pay_type: '0'
            },
            {
                shop_id: 'tshop00026096',
                access_id: 'c2ab15af0e7459291913adede0657f12',
                order_id: '201704151180000151900',
                status: 'SALES',
                job_cd: 'SALES',
                amount: '2000',
                tax: '0',
                currency: 'JPN',
                forward: '2a99662',
                method: '1',
                pay_times: '',
                tran_id: '1704152300111111111111877098',
                approve: '2980559',
                tran_date: moment(dateFrom).add(-1, 'seconds').format('YYYYMMDDHHmmss'),
                err_code: '',
                err_info: '',
                pay_type: '0'
            }
        ];
        const notificationDocs = yield gmoNotificationAdapter.gmoNotificationModel.create(notifications);
        const sales = yield ReportService.searchGMOSales(dateFrom, dateTo)(gmoNotificationAdapter);
        assert.equal(sales.length, 1);
        const promises = notificationDocs.map((notificationDoc) => __awaiter(this, void 0, void 0, function* () {
            yield notificationDoc.remove();
        }));
        yield Promise.all(promises);
    }));
});
