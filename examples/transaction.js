"use strict";
/**
 * 取フローの例
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
const GMO = require("@motionpicture/gmo-service");
const createDebug = require("debug");
const moment = require("moment");
const mongoose = require("mongoose");
const sskts = require("../lib/index");
const debug = createDebug('sskts-domain:example:transaction');
// tslint:disable-next-line:max-func-body-length
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        mongoose.Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const gmoShopId = 'tshop00026096';
        const gmoShopPass = 'xbxmkaa6';
        const transactionService = sskts.service.transaction;
        const ownerAdapter = sskts.adapter.owner(connection);
        const transactionAdapter = sskts.adapter.transaction(connection);
        // 取引開始
        // 30分後のunix timestampを送信する場合
        // https://ja.wikipedia.org/wiki/UNIX%E6%99%82%E9%96%93
        // tslint:disable-next-line:no-console
        debug('starting transaction...');
        // tslint:disable-next-line:no-magic-numbers max-line-length
        const transactionOption = yield sskts.service.transaction.startIfPossible(moment().add(30, 'minutes').toDate())(ownerAdapter, transactionAdapter);
        if (transactionOption.isEmpty) {
            throw new Error('no ready transaction');
        }
        debug('transaction started.');
        const transaction = transactionOption.get();
        const transactionId = transaction.id;
        const promoterOwner = transaction.owners.find((owner) => {
            return (owner.group === 'PROMOTER');
        });
        if (!promoterOwner)
            throw new Error('promoterOwner not found.');
        const promoterOwnerId = promoterOwner.id;
        const anonymousOwner = transaction.owners.find((owner) => {
            return (owner.group === 'ANONYMOUS');
        });
        if (!anonymousOwner)
            throw new Error('anonymousOwner not found.');
        const anonymousOwnerId = anonymousOwner.id;
        // 空席なくなったら変更する
        const theaterCode = '118';
        const dateJouei = '20170519';
        const titleCode = '99500';
        const titleBranchNum = '0';
        const timeBegin = '0920';
        const screenCode = '60';
        // 販売可能チケット検索
        const salesTicketResult = yield COA.ReserveService.salesTicket({
            theater_code: theaterCode,
            date_jouei: dateJouei,
            title_code: titleCode,
            title_branch_num: titleBranchNum,
            time_begin: timeBegin
        });
        // COA空席確認
        const getStateReserveSeatResult = yield COA.ReserveService.stateReserveSeat({
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
        // COA仮予約
        const reserveSeatsTemporarilyResult = yield COA.ReserveService.updTmpReserveSeat({
            theater_code: theaterCode,
            date_jouei: dateJouei,
            title_code: titleCode,
            title_branch_num: titleBranchNum,
            time_begin: timeBegin,
            screen_code: screenCode,
            list_seat: [{
                    seat_section: sectionCode,
                    seat_num: freeSeatCodes[0]
                }, {
                    seat_section: sectionCode,
                    seat_num: freeSeatCodes[1]
                }]
        });
        debug(reserveSeatsTemporarilyResult);
        // COAオーソリ追加
        debug('adding authorizations coaSeatReservation...');
        const totalPrice = salesTicketResult[0].sale_price + salesTicketResult[0].sale_price;
        const coaAuthorization = sskts.factory.authorization.coaSeatReservation.create({
            owner_from: promoterOwnerId,
            owner_to: anonymousOwnerId,
            coa_tmp_reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num,
            coa_theater_code: theaterCode,
            coa_date_jouei: dateJouei,
            coa_title_code: titleCode,
            coa_title_branch_num: titleBranchNum,
            coa_time_begin: timeBegin,
            coa_screen_code: screenCode,
            assets: reserveSeatsTemporarilyResult.list_tmp_reserve.map((tmpReserve) => {
                return sskts.factory.asset.seatReservation.create({
                    ownership: sskts.factory.ownership.create({
                        owner: anonymousOwnerId,
                        authenticated: false
                    }),
                    authorizations: [],
                    performance: '001201701208513021010',
                    section: tmpReserve.seat_section,
                    seat_code: tmpReserve.seat_num,
                    ticket_code: salesTicketResult[0].ticket_code,
                    ticket_name: {
                        en: salesTicketResult[0].ticket_name_eng,
                        ja: salesTicketResult[0].ticket_name
                    },
                    ticket_name_kana: salesTicketResult[0].ticket_name_kana,
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
                    mvtk_sales_price: 0
                });
            }),
            price: totalPrice
        });
        yield sskts.service.transactionWithId.addCOASeatReservationAuthorization(transactionId, coaAuthorization)(transactionAdapter);
        debug('coaAuthorization added.');
        // GMOオーソリ取得
        const orderId = Date.now().toString();
        const entryTranResult = yield GMO.CreditService.entryTran({
            shopId: gmoShopId,
            shopPass: gmoShopPass,
            orderId: orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
            amount: totalPrice
        });
        const execTranResult = yield GMO.CreditService.execTran({
            accessId: entryTranResult.accessId,
            accessPass: entryTranResult.accessPass,
            orderId: orderId,
            method: '1',
            cardNo: '4111111111111111',
            expire: '2012',
            securityCode: '123'
        });
        debug(execTranResult);
        // GMOオーソリ追加
        debug('adding authorizations gmo...');
        const gmoAuthorization = sskts.factory.authorization.gmo.create({
            owner_from: anonymousOwnerId,
            owner_to: promoterOwnerId,
            gmo_shop_id: gmoShopId,
            gmo_shop_pass: gmoShopPass,
            gmo_order_id: orderId,
            gmo_amount: totalPrice,
            gmo_access_id: entryTranResult.accessId,
            gmo_access_pass: entryTranResult.accessPass,
            gmo_job_cd: GMO.Util.JOB_CD_AUTH,
            gmo_pay_type: GMO.Util.PAY_TYPE_CREDIT,
            price: totalPrice
        });
        yield sskts.service.transactionWithId.addGMOAuthorization(transactionId, gmoAuthorization)(transactionAdapter);
        debug('GMOAuthorization added.');
        // 購入者情報登録
        debug('updating anonymous...');
        const tel = '09012345678';
        yield sskts.service.transactionWithId.updateAnonymousOwner({
            transaction_id: transactionId,
            name_first: 'Tetsu',
            name_last: 'Yamazaki',
            tel: tel,
            email: process.env.SSKTS_DEVELOPER_EMAIL
        })(ownerAdapter, transactionAdapter);
        debug('anonymousOwner updated.');
        // 照会情報登録(購入番号と電話番号で照会する場合)
        debug('enabling inquiry...');
        const key = sskts.factory.transactionInquiryKey.create({
            theater_code: theaterCode,
            reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num,
            tel: tel
        });
        yield sskts.service.transactionWithId.enableInquiry(transactionId, key)(transactionAdapter);
        debug('inquiry enabled.');
        // メール追加
        const content = `
テスト 購入 様\n
\n
-------------------------------------------------------------------\n
この度はご購入いただき誠にありがとうございます。\n
\n
※チケット発券時は、自動発券機に下記チケットQRコードをかざしていただくか、購入番号と電話番号を入力していただく必要があります。\n
-------------------------------------------------------------------\n
\n
◆購入番号 ：${reserveSeatsTemporarilyResult.tmp_reserve_num}\n
◆電話番号 ：09012345678\n
◆合計金額 ：${totalPrice}円\n
\n
※このアドレスは送信専用です。返信はできませんのであらかじめご了承下さい。\n
-------------------------------------------------------------------\n
シネマサンシャイン\n
http://www.cinemasunshine.co.jp/\n
-------------------------------------------------------------------\n
`;
        debug('adding email...');
        const notification = sskts.factory.notification.email.create({
            from: 'noreply@example.net',
            to: process.env.SSKTS_DEVELOPER_EMAIL,
            subject: '購入完了',
            content: content
        });
        yield sskts.service.transactionWithId.addEmail(transactionId, notification)(transactionAdapter);
        debug('email added.');
        // let notificationId = notification._id;
        // 取引成立
        debug('closing transaction...');
        yield sskts.service.transactionWithId.close(transactionId)(transactionAdapter);
        debug('closed.');
        // 照会してみる
        const inquiryResult = yield transactionService.makeInquiry(key)(transactionAdapter);
        debug('makeInquiry result:', inquiryResult);
        mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
