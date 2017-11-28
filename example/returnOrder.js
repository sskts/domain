/**
 * 注文返品サンプル
 * @ignore
 */

const moment = require('moment');
const googleLibphonenumber = require('google-libphonenumber');

const sskts = require('../');

// tslint:disable-next-line:max-func-body-length
async function main(confirmationNumber) {
    const now = new Date();

    const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
    const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
    const transactionRepo = new sskts.repository.Transaction(sskts.mongoose.connection);

    // まず注文照会
    const orderInquiryKey = {
        theaterCode: '118',
        confirmationNumber: confirmationNumber,
        telephone: '+819012345678'
    };
    const order = await orderRepo.findByOrderInquiryKey(orderInquiryKey);
    console.log('order found.', order);

    if (order.orderStatus !== sskts.factory.orderStatus.OrderDelivered) {
        throw new Error(`注文ステータスが${order.orderStatus}なので返品できません。`);
    }

    // 注文取引を検索
    const transaction = await transactionRepo.transactionModel.findOne({
        typeOf: sskts.factory.transactionType.PlaceOrder,
        status: sskts.factory.transactionStatusType.Confirmed,
        'result.order.orderNumber': order.orderNumber
    }).exec().then((doc) => doc.toObject());
    console.log('placeOrder transaction is', transaction);

    // const originalTransaction = originalTransactionOption.get();
    // console.log('originalTransaction found', originalTransaction);
    // const authorizations = await transactionAdapter.findAuthorizationsById(originalTransaction.id);
    // console.log('authorizations found', authorizations);

    // 所有者から興行へ座席返却のオーソリ
    // const originalCOASeatReservationAuthorization = sskts.factory.authorization.coaSeatReservation.create(
    // <any>authorizations.find(
    //         (authorization) => authorization.group === sskts.factory.authorizationGroup.COA_SEAT_RESERVATION
    //     )
    // );
    // console.log('originalCOASeatReservationAuthorization.assets:', originalCOASeatReservationAuthorization.assets);

    // 取引でやりとりされた座席予約資産の状態を確認
    // const assets = await assetAdapter.model.find({
    //     _id: { $in: originalCOASeatReservationAuthorization.assets.map((asset) => asset.id) }
    // }).exec()
    //     .then((docs) => {
    //         return docs.map((doc) => sskts.factory.asset.seatReservation.create(doc.toObject()));
    //     });
    // console.log('assets found', assets);

    // 数の一致を確認
    // if (assets.length !== originalCOASeatReservationAuthorization.assets.length) {
    //     throw new Error(`assets length not matched ${assets.length} !== ${originalCOASeatReservationAuthorization.assets.length}`);
    // }

    // 返品可能な条件
    // 取引照会キーの一致、現在承認中ではないかどうか、すでに認証済みでないかどうか、を確認
    // const isReturnable = assets.every((asset) => {
    //     return (asset.transaction_inquiry_key.theater_code === inquiryKey.theater_code
    //         && asset.transaction_inquiry_key.reserve_num === inquiryKey.reserve_num
    //         && asset.authorizations.length === 0
    //         && asset.ownership.authentication_records.length === 0);
    // });
    // console.log('isReturnable:', isReturnable);

    // if (!isReturnable) {
    //     throw new Error('not returnable');
    // }

    // GMO承認を取り出す
    // const originalGMOAuthorization = sskts.factory.authorization.gmo.create(
    //     authorizations.find(
    //         (authorization) => authorization.group === sskts.factory.authorizationGroup.GMO
    //     )
    // );

    // 購入者を取り出す
    // const purchaserInTransaction = originalTransaction.owners.find((owner) => owner.id === originalGMOAuthorization.owner_from);
    // if (purchaserInTransaction === undefined) {
    //     throw new Error('purchaserInTransaction undefined');
    // }
    // let purchaser;
    // switch (purchaserInTransaction.group) {
    //     case sskts.factory.ownerGroup.ANONYMOUS:
    //         purchaser = sskts.factory.owner.anonymous.create(purchaserInTransaction);
    //     // case sskts.factory.ownerGroup.MEMBER:
    //     //     return sskts.factory.owner.member.create(owner);
    //     default:
    //         break;
    // }

    // 取引開始
    // const transaction = sskts.factory.transaction.create({
    //     status: sskts.factory.transactionStatus.UNDERWAY,
    //     owners: originalTransaction.owners,
    //     // tslint:disable-next-line:no-magic-numbers
    //     expires_at: moment().add(10, 'minutes').toDate(),
    //     started_at: moment().toDate()
    // });

    // const transactionDoc = {
    //     ...transaction,
    //     ...{
    //         _id: transaction.id,
    //         owners: transaction.owners.map((owner) => owner.id)
    //     }
    // };
    // await transactionAdapter.transactionModel.create(transactionDoc);
    // console.log('trasaction started', transaction);

    // 所有者を逆にして座席予約承認を作成する
    // const coaSeatReservationAuthorization = sskts.factory.authorization.coaSeatReservation.create(
    //     {
    //         price: originalCOASeatReservationAuthorization.price,
    //         owner_from: originalCOASeatReservationAuthorization.owner_to,
    //         owner_to: originalCOASeatReservationAuthorization.owner_from,
    //         coa_tmp_reserve_num: originalCOASeatReservationAuthorization.coa_tmp_reserve_num,
    //         coa_theater_code: originalCOASeatReservationAuthorization.coa_theater_code,
    //         coa_date_jouei: originalCOASeatReservationAuthorization.coa_date_jouei,
    //         coa_title_code: originalCOASeatReservationAuthorization.coa_title_code,
    //         coa_title_branch_num: originalCOASeatReservationAuthorization.coa_title_branch_num,
    //         coa_time_begin: originalCOASeatReservationAuthorization.coa_time_begin,
    //         coa_screen_code: originalCOASeatReservationAuthorization.coa_screen_code,
    //         assets: originalCOASeatReservationAuthorization.assets
    //     }
    // );
    // console.log('adding coaSeatReservationAuthorization...', coaSeatReservationAuthorization);

    // 興行から所有者へGMO金額変更のオーソリ
    // const gmoAuthorization = sskts.factory.authorization.gmo.create({
    //     price: originalGMOAuthorization.price,
    //     owner_from: originalGMOAuthorization.owner_to,
    //     owner_to: originalGMOAuthorization.owner_from,
    //     gmo_shop_id: originalGMOAuthorization.gmo_shop_id,
    //     gmo_shop_pass: originalGMOAuthorization.gmo_shop_pass,
    //     gmo_order_id: originalGMOAuthorization.gmo_order_id,
    //     gmo_amount: originalGMOAuthorization.gmo_amount,
    //     gmo_access_id: originalGMOAuthorization.gmo_access_id,
    //     gmo_access_pass: originalGMOAuthorization.gmo_access_pass,
    //     gmo_job_cd: originalGMOAuthorization.gmo_job_cd,
    //     gmo_pay_type: originalGMOAuthorization.gmo_pay_type
    // });
    // console.log('adding gmoAuthorization...', gmoAuthorization);

    // 取引成立
    // await transactionAdapter.transactionModel.findByIdAndUpdate(transaction.id, {
    //     status: sskts.factory.transactionStatus.CLOSED,
    //     closed_at: moment().toDate()
    // }).exec();

    // 所有権無効化(所有期間を現在までに変更する)
    const ownershipInfos = transaction.result.ownershipInfos;
    console.log('invalidating ownershipInfos...', ownershipInfos);
    await Promise.all(ownershipInfos.map(async (ownershipInfo) => {
        await ownershipInfoRepo.ownershipInfoModel.findOneAndUpdate(
            {
                identifier: ownershipInfo.identifier
            },
            {
                ownedThrough: now
            }
        ).exec();
    }));

    // 非同期でCOA本予約取消
    // COAから内容抽出
    // 電話番号のフォーマットを日本人にリーダブルに調整(COAではこのフォーマットで扱うので)
    const phoneUtil = googleLibphonenumber.PhoneNumberUtil.getInstance();
    const phoneNumber = phoneUtil.parse(orderInquiryKey.telephone, 'JP');
    const telNum = phoneUtil.format(phoneNumber, googleLibphonenumber.PhoneNumberFormat.NATIONAL);
    const stateReserveResult = await sskts.COA.services.reserve.stateReserve({
        theaterCode: orderInquiryKey.theaterCode,
        reserveNum: orderInquiryKey.confirmationNumber,
        telNum: telNum
    });
    console.log('COA stateReserveResult is', stateReserveResult);

    if (stateReserveResult !== null) {
        // COA購入チケット取消
        console.log('deleting COA reservation...');
        await sskts.COA.services.reserve.delReserve({
            theaterCode: orderInquiryKey.theaterCode,
            reserveNum: orderInquiryKey.confirmationNumber,
            telNum: telNum,
            dateJouei: stateReserveResult.dateJouei,
            titleCode: stateReserveResult.titleCode,
            titleBranchNum: stateReserveResult.titleBranchNum,
            timeBegin: stateReserveResult.timeBegin,
            listSeat: stateReserveResult.listTicket
        });
        console.log('COA delReserve processed.');
    }

    // 非同期でGMO金額変更実行
    const creditCardAuthorizeAction = transaction.object.authorizeActions.find((action) => {
        return action.purpose.typeOf === sskts.factory.action.authorize.authorizeActionPurpose.CreditCard &&
            action.actionStatus === sskts.factory.actionStatusType.CompletedActionStatus
    });
    if (creditCardAuthorizeAction !== undefined) {
        // GMO取引検索
        const gmoTrade = await sskts.GMO.services.credit.searchTrade({
            shopId: creditCardAuthorizeAction.result.entryTranArgs.shopId,
            shopPass: creditCardAuthorizeAction.result.entryTranArgs.shopPass,
            orderId: creditCardAuthorizeAction.result.entryTranArgs.orderId
        });
        console.log('gmoTrade is', gmoTrade);
        // 実売上状態であれば取消
        // 手数料がかかるのであれば、ChangeTran、かからないのであれば、AlterTran
        if (gmoTrade.status === sskts.GMO.utils.util.Status.Sales) {
            console.log('canceling credit card sales...', creditCardAuthorizeAction);
            // const SERVICE_CHARGE = 100;
            const alterTranResult = await sskts.GMO.services.credit.alterTran({
                shopId: creditCardAuthorizeAction.result.entryTranArgs.shopId,
                shopPass: creditCardAuthorizeAction.result.entryTranArgs.shopPass,
                accessId: gmoTrade.accessId,
                accessPass: gmoTrade.accessPass,
                jobCd: sskts.GMO.utils.util.JobCd.Void
            });
            console.log('GMO alterTranResult is', alterTranResult);
        }
    }

    // ムビチケ着券取消
    const mvtkAuthorizeAction = transaction.object.authorizeActions.find((action) => {
        return action.purpose.typeOf === sskts.factory.action.authorize.authorizeActionPurpose.Mvtk &&
            action.actionStatus === sskts.factory.actionStatusType.CompletedActionStatus
    });
    if (mvtkAuthorizeAction !== undefined) {
    }

    // 注文ステータス変更
    console.log('changing orderStatus...');
    await orderRepo.orderModel.findByIdAndUpdate(
        order.id,
        {
            orderStatus: sskts.factory.orderStatus.OrderReturned
        }
    ).exec();

    // 非同期で通知送信
    const emailMessage = sskts.factory.creativeWork.message.email.create({
        identifier: `returnOrderTransaction-${transaction.id}`,
        sender: {
            typeOf: transaction.seller.typeOf,
            name: transaction.seller.name,
            email: 'noreply@ticket-cinemasunshine.com'
        },
        toRecipient: {
            typeOf: transaction.agent.typeOf,
            name: `${transaction.object.customerContact.givenName} ${transaction.object.customerContact.familyName}`,
            email: transaction.object.customerContact.email
        },
        about: `${transaction.seller.name} 返品完了`,
        text: `${transaction.object.customerContact.givenName} ${transaction.object.customerContact.familyName} 様
----------------------------------------

下記購入について、返金処理が完了いたしました。

またのご利用、心よりお待ちしております。

----------------------------------------

◆購入番号 ：${orderInquiryKey.confirmationNumber}
◆合計金額 ：${order.price}円

※このアドレスは送信専用です。返信はできませんのであらかじめご了承下さい。

----------------------------------------

シネマサンシャイン

http://www.cinemasunshine.co.jp/

----------------------------------------
`
    });

    await sskts.service.notification.sendEmail(emailMessage)();
}

sskts.mongoose.connect(process.env.MONGOLAB_URI, { useMongoClient: true });

const confirmationNumbers = require('./returnOrder.json');
Promise.all(confirmationNumbers.map(async (confirmationNumber) => {
    try {
        await main(confirmationNumber);
    } catch (error) {
        console.error(error);
    }
}))
    .then(() => {
        console.log('all success!');
    })
    .catch((err) => {
        console.error(err);
    })
    .then(() => {
        sskts.mongoose.disconnect();
    });
