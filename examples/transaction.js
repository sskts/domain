"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* tslint:disable */
process.env.MONGOLAB_URI = 'mongodb://testsasakiticketmongodbuser:aZHGD262LNsBTQgG9UGQpA6QvbFkKbAhBfxf3vvz@ds056379-a0.mlab.com:56379,ds056379-a1.mlab.com:56372/testsasakiticketmongodb?replicaSet=rs-ds056379';
process.env.SENDGRID_API_KEY = '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';
process.env.GMO_ENDPOINT = 'https://pt01.mul-pay.jp';
process.env.COA_ENDPOINT = 'http://coacinema.aa0.netvolante.jp';
process.env.COA_REFRESH_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkX2F0IjoxNDc5MjYwODQ4LCJhdXRoX2lkIjoiMzMxNSJ9.jx-w7D3YLP7UbY4mzJYC9xr368FiKWcpR2_L9mZfehQ';
const COA = require("@motionpicture/coa-service");
const GMO = require("@motionpicture/gmo-service");
const moment = require("moment");
const mongoose = require("mongoose");
const SSKTS = require("../lib/sskts-domain");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);
        const gmoShopId = 'tshop00026096';
        const gmoShopPass = 'xbxmkaa6';
        const transactionService = SSKTS.TransactionService;
        const ownerRepository = SSKTS.createOwnerRepository(connection);
        const transactionRepository = SSKTS.createTransactionRepository(connection);
        // 取引開始
        // 30分後のunix timestampを送信する場合
        // https://ja.wikipedia.org/wiki/UNIX%E6%99%82%E9%96%93
        // tslint:disable-next-line:no-console
        console.log('starting transaction...');
        const transaction = yield transactionService.start(moment().add(30, 'minutes').toDate())(ownerRepository, transactionRepository);
        console.log('transaction started.');
        const transactionId = transaction._id;
        const promoterOwner = transaction.owners.find((owner) => {
            return (owner.group === 'PROMOTER');
        });
        if (!promoterOwner)
            throw new Error('promoterOwner not found.');
        const promoterOwnerId = promoterOwner._id;
        const anonymousOwner = transaction.owners.find((owner) => {
            return (owner.group === 'ANONYMOUS');
        });
        if (!anonymousOwner)
            throw new Error('anonymousOwner not found.');
        const anonymousOwnerId = anonymousOwner._id;
        // 空席なくなったら変更する
        const theaterCode = '001';
        const dateJouei = '20170210';
        const titleCode = '8513';
        const titleBranchNum = '0';
        const timeBegin = '1010';
        const screenCode = '2';
        // 販売可能チケット検索
        const salesTicketResult = yield COA.salesTicketInterface.call({
            theater_code: theaterCode,
            date_jouei: dateJouei,
            title_code: titleCode,
            title_branch_num: titleBranchNum,
            time_begin: timeBegin,
        });
        // COA空席確認
        const getStateReserveSeatResult = yield COA.getStateReserveSeatInterface.call({
            theater_code: theaterCode,
            date_jouei: dateJouei,
            title_code: titleCode,
            title_branch_num: titleBranchNum,
            time_begin: timeBegin,
            screen_code: screenCode,
        });
        const sectionCode = getStateReserveSeatResult.list_seat[0].seat_section;
        const freeSeatCodes = getStateReserveSeatResult.list_seat[0].list_free_seat.map((freeSeat) => {
            return freeSeat.seat_num;
        });
        console.log('freeSeatCodes count', freeSeatCodes.length);
        if (getStateReserveSeatResult.cnt_reserve_free === 0)
            throw new Error('no available seats.');
        // COA仮予約
        const reserveSeatsTemporarilyResult = yield COA.reserveSeatsTemporarilyInterface.call({
            theater_code: theaterCode,
            date_jouei: dateJouei,
            title_code: titleCode,
            title_branch_num: titleBranchNum,
            time_begin: timeBegin,
            screen_code: screenCode,
            list_seat: [{
                    seat_section: sectionCode,
                    seat_num: freeSeatCodes[0],
                }, {
                    seat_section: sectionCode,
                    seat_num: freeSeatCodes[1]
                }],
        });
        console.log(reserveSeatsTemporarilyResult);
        // COAオーソリ追加
        console.log('adding authorizations coaSeatReservation...');
        const totalPrice = salesTicketResult.list_ticket[0].sale_price + salesTicketResult.list_ticket[0].sale_price;
        const coaAuthorization = SSKTS.Authorization.createCOASeatReservation({
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
                return SSKTS.Asset.createSeatReservation({
                    ownership: SSKTS.Ownership.create({
                        owner: anonymousOwnerId,
                        authenticated: false,
                    }),
                    authorizations: [],
                    performance: '001201701208513021010',
                    section: tmpReserve.seat_section,
                    seat_code: tmpReserve.seat_num,
                    ticket_code: salesTicketResult.list_ticket[0].ticket_code,
                    ticket_name_ja: salesTicketResult.list_ticket[0].ticket_name,
                    ticket_name_en: salesTicketResult.list_ticket[0].ticket_name_eng,
                    ticket_name_kana: salesTicketResult.list_ticket[0].ticket_name_kana,
                    std_price: salesTicketResult.list_ticket[0].std_price,
                    add_price: salesTicketResult.list_ticket[0].add_price,
                    dis_price: 0,
                    sale_price: salesTicketResult.list_ticket[0].sale_price,
                });
            }),
            price: totalPrice
        });
        yield transactionService.addCOASeatReservationAuthorization(transactionId.toString(), coaAuthorization)(transactionRepository);
        console.log('coaAuthorization added.');
        // GMOオーソリ取得
        const orderId = Date.now().toString();
        const entryTranResult = yield GMO.CreditService.entryTran({
            shopId: gmoShopId,
            shopPass: gmoShopPass,
            orderId: orderId,
            jobCd: GMO.Util.JOB_CD_AUTH,
            amount: totalPrice,
        });
        const execTranResult = yield GMO.CreditService.execTran({
            accessId: entryTranResult.accessId,
            accessPass: entryTranResult.accessPass,
            orderId: orderId,
            method: '1',
            cardNo: '4111111111111111',
            expire: '2012',
            securityCode: '123',
        });
        console.log(execTranResult);
        // GMOオーソリ追加
        console.log('adding authorizations gmo...');
        const gmoAuthorization = SSKTS.Authorization.createGMO({
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
            price: totalPrice,
        });
        yield transactionService.addGMOAuthorization(transactionId.toString(), gmoAuthorization)(transactionRepository);
        console.log('GMOAuthorization added.');
        // 購入者情報登録
        console.log('updating anonymous...');
        yield transactionService.updateAnonymousOwner({
            transaction_id: transactionId.toString(),
            name_first: 'Tetsu',
            name_last: 'Yamazaki',
            tel: '09012345678',
            email: 'hello@motionpicture.jp',
        })(ownerRepository, transactionRepository);
        console.log('anonymousOwner updated.');
        // COA本予約
        const tel = '09012345678';
        const updateReserveResult = yield COA.updateReserveInterface.call({
            theater_code: theaterCode,
            date_jouei: dateJouei,
            title_code: titleCode,
            title_branch_num: titleBranchNum,
            time_begin: timeBegin,
            // screen_code: screenCode,
            tmp_reserve_num: reserveSeatsTemporarilyResult.tmp_reserve_num,
            reserve_name: '山崎 哲',
            reserve_name_jkana: 'ヤマザキ テツ',
            tel_num: '09012345678',
            mail_addr: 'yamazaki@motionpicture.jp',
            reserve_amount: totalPrice,
            list_ticket: reserveSeatsTemporarilyResult.list_tmp_reserve.map((tmpReserve) => {
                return {
                    ticket_code: salesTicketResult.list_ticket[0].ticket_code,
                    std_price: salesTicketResult.list_ticket[0].std_price,
                    add_price: salesTicketResult.list_ticket[0].add_price,
                    dis_price: 0,
                    sale_price: salesTicketResult.list_ticket[0].sale_price,
                    mvtk_app_price: 0,
                    ticket_count: 1,
                    seat_num: tmpReserve.seat_num
                };
            }),
        });
        console.log('updateReserveResult:', updateReserveResult);
        // 照会情報登録(購入番号と電話番号で照会する場合)
        console.log('enabling inquiry...');
        const key = SSKTS.TransactionInquiryKey.create({
            theater_code: theaterCode,
            reserve_num: updateReserveResult.reserve_num,
            tel: tel,
        });
        yield transactionService.enableInquiry(transactionId.toString(), key)(transactionRepository);
        console.log('inquiry enabled.');
        // メール追加
        const content = `
<!DOCTYPE html>
<html lang="ja">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>購入完了</title>
</head>
<body>
<h1>この度はご購入いただき誠にありがとうございます。</h1>
<h3>購入番号 (Transaction number) :</h3>
<strong>${updateReserveResult.reserve_num}</strong>
</body>
</html>
`;
        console.log('adding email...');
        const notification = SSKTS.Notification.createEmail({
            from: 'noreply@localhost',
            to: 'hello@motionpicture.jp',
            subject: '購入完了',
            content: content,
        });
        yield transactionService.addEmail(transactionId.toString(), notification)(transactionRepository);
        console.log('email added.');
        // let notificationId = notification._id;
        // 取引成立
        console.log('closing transaction...');
        yield transactionService.close(transactionId.toString())(transactionRepository);
        console.log('closed.');
        // 照会してみる
        const inquiryResult = yield transactionService.makeInquiry(key)(transactionRepository);
        console.log('makeInquiry result:', inquiryResult);
    });
}
main().then(() => {
    console.log('main processed.');
}).catch((err) => {
    console.error(err.message);
});
