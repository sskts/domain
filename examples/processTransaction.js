"use strict";
/**
 * 取引プロセスサンプル
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const COA = require("@motionpicture/coa-service");
const createDebug = require("debug");
const moment = require("moment");
const mongoose = require("mongoose");
const redis = require("redis");
const sskts = require("../lib/index");
const debug = createDebug('sskts-domain:examples');
// tslint:disable-next-line:max-func-body-length
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        mongoose.Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const redisClient = redis.createClient({
            host: process.env.TEST_REDIS_HOST,
            port: process.env.TEST_REDIS_PORT,
            password: process.env.TEST_REDIS_KEY,
            tls: { servername: process.env.TEST_REDIS_HOST }
        });
        const eventAdapter = sskts.adapter.event(connection);
        const personAdapter = sskts.adapter.person(connection);
        const organizationAdapter = sskts.adapter.organization(connection);
        const actionAdapter = sskts.adapter.action(connection);
        const transactionCountAdapter = sskts.adapter.transactionCount(redisClient);
        // 取引開始
        debug('starting transaction...');
        const readyFrom = moment();
        const readyUntil = moment(readyFrom).add(1, 'minute');
        const scope = sskts.factory.actionScope.create({
            ready_from: readyFrom.toDate(),
            ready_until: readyUntil.toDate()
        });
        const transactionOption = yield sskts.service.trade.start({
            // tslint:disable-next-line:no-magic-numbers
            expires: moment().add(30, 'minutes').toDate(),
            maxCountPerUnit: 120,
            scope: scope,
            clientUser: {
                client: 'client',
                state: 'state',
                scopes: []
            },
            sellerId: '597012c4ca579a808193cde2'
        })(personAdapter, organizationAdapter, actionAdapter, transactionCountAdapter);
        if (transactionOption.isEmpty) {
            throw new Error('no ready transaction');
        }
        debug('transaction started.');
        const transaction = transactionOption.get();
        const transactionId = transaction.id;
        // 空席なくなったら変更する
        const indivisualScreeningEventIdentifier = '11816421020170723501515';
        const indivisualScreeningEventOption = yield sskts.service.master.findIndivisualScreeningEventByIdentifier(indivisualScreeningEventIdentifier)(eventAdapter);
        const indivisualScreeningEvent = indivisualScreeningEventOption.get();
        const theaterCode = indivisualScreeningEvent.superEvent.location.branchCode;
        const dateJouei = moment(indivisualScreeningEvent.startDate).locale('ja').format('YYYYMMDD');
        const titleCode = indivisualScreeningEvent.workPerformed.identifier;
        const titleBranchNum = indivisualScreeningEvent.superEvent.coaInfo.titleBranchNum;
        const timeBegin = moment(indivisualScreeningEvent.startDate).locale('ja').format('HHmm');
        const screenCode = indivisualScreeningEvent.location.branchCode;
        // 販売可能チケット検索
        const salesTicketResult = yield COA.services.reserve.salesTicket({
            theater_code: theaterCode,
            date_jouei: dateJouei,
            title_code: titleCode,
            title_branch_num: titleBranchNum,
            time_begin: timeBegin
        });
        // COA空席確認
        const getStateReserveSeatResult = yield COA.services.reserve.stateReserveSeat({
            theater_code: theaterCode,
            date_jouei: dateJouei,
            title_code: titleCode,
            title_branch_num: titleBranchNum,
            time_begin: timeBegin,
            screen_code: screenCode
        });
        const sectionCode = getStateReserveSeatResult.list_seat[0].seat_section;
        const freeSeatCodes = getStateReserveSeatResult.list_seat[0].list_free_seat.map((freeSeat) => {
            return freeSeat.seat_num;
        });
        debug('freeSeatCodes count', freeSeatCodes.length);
        if (getStateReserveSeatResult.cnt_reserve_free === 0)
            throw new Error('no available seats.');
        // COAオーソリ追加
        debug('adding authorizations coaSeatReservation...');
        const offers = [
            {
                seatSection: sectionCode,
                seatNumber: freeSeatCodes[0],
                ticket: {
                    ticket_code: salesTicketResult[0].ticket_code,
                    std_price: salesTicketResult[0].std_price,
                    add_price: salesTicketResult[0].add_price,
                    dis_price: 0,
                    sale_price: salesTicketResult[0].sale_price,
                    mvtk_app_price: 0,
                    add_glasses: 0,
                    kbn_eisyahousiki: '00',
                    mvtk_num: '',
                    mvtk_kbn_denshiken: '00',
                    mvtk_kbn_maeuriken: '00',
                    mvtk_kbn_kensyu: '00',
                    mvtk_sales_price: 0,
                    ticket_count: 1,
                    seat_num: freeSeatCodes[0]
                }
            },
            {
                seatSection: sectionCode,
                seatNumber: freeSeatCodes[1],
                ticket: {
                    ticket_code: salesTicketResult[0].ticket_code,
                    std_price: salesTicketResult[0].std_price,
                    add_price: salesTicketResult[0].add_price,
                    dis_price: 0,
                    sale_price: salesTicketResult[0].sale_price,
                    mvtk_app_price: 0,
                    add_glasses: 0,
                    kbn_eisyahousiki: '00',
                    mvtk_num: '',
                    mvtk_kbn_denshiken: '00',
                    mvtk_kbn_maeuriken: '00',
                    mvtk_kbn_kensyu: '00',
                    mvtk_sales_price: 0,
                    ticket_count: 1,
                    seat_num: freeSeatCodes[1]
                }
            }
        ];
        const totalPrice = salesTicketResult[0].sale_price + salesTicketResult[0].sale_price;
        let coaAuthorization = yield sskts.service.tradeInProgress.acceptIndivisualScreeningEventOffers(transactionId, indivisualScreeningEvent, offers)(actionAdapter);
        debug('coaAuthorization added');
        // COAオーソリ削除
        yield sskts.service.tradeInProgress.deleteAuthorization(transactionId, coaAuthorization.id)(actionAdapter);
        debug('coaAuthorization deleted');
        // COAオーソリ追加
        debug('adding authorizations coaSeatReservation...');
        coaAuthorization = yield sskts.service.tradeInProgress.acceptIndivisualScreeningEventOffers(transactionId, indivisualScreeningEvent, offers)(actionAdapter);
        debug('coaAuthorization added');
        // GMOオーソリ追加
        debug('adding authorizations gmo...');
        let orderId = Date.now().toString();
        const gmoAuthorization = yield sskts.service.tradeInProgress.authorizeGMOCard(transactionId, {
            orderId: orderId,
            amount: totalPrice,
            method: '1',
            cardNo: '4111111111111111',
            expire: '2012',
            securityCode: '123'
        })(organizationAdapter, actionAdapter);
        debug('GMOAuthorization added.');
        // GMO取消
        yield sskts.service.tradeInProgress.deleteAuthorization(transactionId, gmoAuthorization.id)(actionAdapter);
        debug('GMOAuthorization deleted');
        // GMOオーソリ追加
        debug('adding authorizations gmo...');
        orderId = Date.now().toString();
        yield sskts.service.tradeInProgress.authorizeGMOCard(transactionId, {
            orderId: orderId,
            amount: totalPrice,
            method: '1',
            cardNo: '4111111111111111',
            expire: '2012',
            securityCode: '123'
        })(organizationAdapter, actionAdapter);
        debug('GMOAuthorization added.');
        // 購入者情報登録
        debug('updating agent profile...');
        const telephone = '09012345678';
        const profile = {
            givenName: 'Tetsu',
            familyName: 'Yamazaki',
            telephone: telephone,
            email: process.env.SSKTS_DEVELOPER_EMAIL
        };
        yield sskts.service.tradeInProgress.setAgentProfile(transactionId, profile)(personAdapter, actionAdapter);
        debug('agent profile updated.');
        // 照会情報登録(購入番号と電話番号で照会する場合)
        debug('enabling inquiry...');
        const key = sskts.factory.orderInquiryKey.create({
            theaterCode: theaterCode,
            orderNumber: coaAuthorization.result.tmp_reserve_num,
            telephone: telephone
        });
        yield sskts.service.tradeInProgress.enableInquiry(transactionId, key)(actionAdapter);
        debug('inquiry enabled.');
        // メール追加
        const content = `
テスト 購入 ${profile.familyName} ${profile.givenName}様\n
-------------------------------------------------------------------\n
◆購入番号 ：${coaAuthorization.result.tmp_reserve_num}\n
◆電話番号 ：${profile.telephone}\n
◆合計金額 ：${totalPrice}円\n
-------------------------------------------------------------------\n
シネマサンシャイン\n
-------------------------------------------------------------------\n
`;
        debug('adding email...');
        const notification = sskts.factory.notification.email.create({
            from: 'noreply@example.net',
            to: process.env.SSKTS_DEVELOPER_EMAIL,
            subject: '購入完了',
            content: content
        });
        yield sskts.service.tradeInProgress.addEmail(transactionId, notification)(actionAdapter);
        debug('email added.');
        // 取引成立
        debug('closing transaction...');
        yield sskts.service.tradeInProgress.close(transactionId)(actionAdapter);
        debug('closed.');
        // 照会してみる
        const inquiryResult = yield sskts.service.trade.makeInquiryAboutOrder(key)(actionAdapter);
        debug('makeInquiry result:', inquiryResult.get());
        redisClient.quit();
        mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
