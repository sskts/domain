// tslint:disable:no-console
/**
 * 取フローの例
 *
 * @ignore
 */

import * as COA from '@motionpicture/coa-service';
import * as GMO from '@motionpicture/gmo-service';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

// tslint:disable-next-line:max-func-body-length
async function main() {
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
    console.log('starting transaction...');
    // tslint:disable-next-line:no-magic-numbers max-line-length
    const transactionOption = await transactionService.startIfPossible(moment().add(30, 'minutes').toDate())(ownerAdapter, transactionAdapter);
    if (transactionOption.isEmpty) {
        throw new Error('no ready transaction');
    }

    console.log('transaction started.');
    const transaction = transactionOption.get();
    const transactionId = transaction.id;

    const promoterOwner = transaction.owners.find((owner) => {
        return (owner.group === 'PROMOTER');
    });
    if (!promoterOwner) throw new Error('promoterOwner not found.');
    const promoterOwnerId = promoterOwner.id;
    const anonymousOwner = transaction.owners.find((owner) => {
        return (owner.group === 'ANONYMOUS');
    });
    if (!anonymousOwner) throw new Error('anonymousOwner not found.');
    const anonymousOwnerId = anonymousOwner.id;

    // 空席なくなったら変更する
    const theaterCode = '118';
    const dateJouei = '20170309';
    const titleCode = '17062';
    const titleBranchNum = '0';
    const timeBegin = '1450';
    const screenCode = '2';

    // 販売可能チケット検索
    const salesTicketResult = await COA.ReserveService.salesTicket({
        theater_code: theaterCode,
        date_jouei: dateJouei,
        title_code: titleCode,
        title_branch_num: titleBranchNum,
        time_begin: timeBegin
    });

    // COA空席確認
    const getStateReserveSeatResult = await COA.ReserveService.stateReserveSeat({
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
    console.log('freeSeatCodes count', freeSeatCodes.length);
    if (getStateReserveSeatResult.cnt_reserve_free === 0) throw new Error('no available seats.');

    // COA仮予約
    const reserveSeatsTemporarilyResult = await COA.ReserveService.updTmpReserveSeat({
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
    console.log(reserveSeatsTemporarilyResult);

    // COAオーソリ追加
    console.log('adding authorizations coaSeatReservation...');
    const totalPrice = salesTicketResult[0].sale_price + salesTicketResult[0].sale_price;
    const coaAuthorization = sskts.factory.authorization.createCOASeatReservation({
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
            return sskts.factory.asset.createSeatReservation({
                ownership: sskts.factory.ownership.create({
                    owner: anonymousOwnerId,
                    authenticated: false
                }),
                authorizations: [],
                performance: '001201701208513021010',
                section: tmpReserve.seat_section,
                seat_code: tmpReserve.seat_num,
                ticket_code: salesTicketResult[0].ticket_code,
                ticket_name_ja: salesTicketResult[0].ticket_name,
                ticket_name_en: salesTicketResult[0].ticket_name_eng,
                ticket_name_kana: salesTicketResult[0].ticket_name_kana,
                std_price: salesTicketResult[0].std_price,
                add_price: salesTicketResult[0].add_price,
                dis_price: 0,
                sale_price: salesTicketResult[0].sale_price
            });
        }),
        price: totalPrice
    });
    await transactionService.addCOASeatReservationAuthorization(transactionId, coaAuthorization)(transactionAdapter);
    console.log('coaAuthorization added.');

    // GMOオーソリ取得
    const orderId = Date.now().toString();
    const entryTranResult = await GMO.CreditService.entryTran({
        shopId: gmoShopId,
        shopPass: gmoShopPass,
        orderId: orderId,
        jobCd: GMO.Util.JOB_CD_AUTH,
        amount: totalPrice
    });

    const execTranResult = await GMO.CreditService.execTran({
        accessId: entryTranResult.accessId,
        accessPass: entryTranResult.accessPass,
        orderId: orderId,
        method: '1',
        cardNo: '4111111111111111',
        expire: '2012',
        securityCode: '123'
    });
    console.log(execTranResult);

    // GMOオーソリ追加
    console.log('adding authorizations gmo...');
    const gmoAuthorization = sskts.factory.authorization.createGMO({
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
    await transactionService.addGMOAuthorization(transactionId, gmoAuthorization)(transactionAdapter);
    console.log('GMOAuthorization added.');

    // 購入者情報登録
    console.log('updating anonymous...');
    await transactionService.updateAnonymousOwner({
        transaction_id: transactionId,
        name_first: 'Tetsu',
        name_last: 'Yamazaki',
        tel: '09012345678',
        email: process.env.SSKTS_DEVELOPER_EMAIL
    })(ownerAdapter, transactionAdapter);
    console.log('anonymousOwner updated.');

    // COA本予約
    const tel = '09012345678';
    const updateReserveResult = await COA.ReserveService.updReserve({
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
                ticket_code: salesTicketResult[0].ticket_code,
                std_price: salesTicketResult[0].std_price,
                add_price: salesTicketResult[0].add_price,
                dis_price: 0,
                sale_price: salesTicketResult[0].sale_price,
                mvtk_app_price: 0,
                ticket_count: 1,
                seat_num: tmpReserve.seat_num,
                add_glasses: 0
            };
        })
    });
    console.log('updateReserveResult:', updateReserveResult);

    // 照会情報登録(購入番号と電話番号で照会する場合)
    console.log('enabling inquiry...');
    const key = sskts.factory.transactionInquiryKey.create({
        theater_code: theaterCode,
        reserve_num: updateReserveResult.reserve_num,
        tel: tel
    });
    await transactionService.enableInquiry(transactionId, key)(transactionAdapter);
    console.log('inquiry enabled.');

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
◆購入番号 ：${updateReserveResult.reserve_num}\n
◆電話番号 ：09012345678\n
◆合計金額 ：${totalPrice}円\n
\n
※このアドレスは送信専用です。返信はできませんのであらかじめご了承下さい。\n
-------------------------------------------------------------------\n
シネマサンシャイン\n
http://www.cinemasunshine.co.jp/\n
-------------------------------------------------------------------\n
`;
    console.log('adding email...');
    const notification = sskts.factory.notification.createEmail({
        from: 'noreply@localhost',
        to: process.env.SSKTS_DEVELOPER_EMAIL,
        subject: '購入完了',
        content: content
    });
    await transactionService.addEmail(transactionId, notification)(transactionAdapter);
    console.log('email added.');
    // let notificationId = notification._id;

    // 取引成立
    console.log('closing transaction...');
    await transactionService.close(transactionId)(transactionAdapter);
    console.log('closed.');

    // 照会してみる
    const inquiryResult = await transactionService.makeInquiry(key)(transactionAdapter);
    console.log('makeInquiry result:', inquiryResult);

    mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
