/**
 * create credit card authorize action sample.
 * @ignore
 */

const moment = require('moment');
const sskts = require('../../');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);

    const movieTheater = await organizationRepo.findMovieTheaterById('59d20831e53ebc2b4e774466');

    let entryTranArgs;
    let execTranArgs;
    let entryTranResult;
    let execTranResult;

    const orderId = moment().format('YYYYMMDDHHmmss');
    const amount = 1234;
    const method = sskts.GMO.utils.util.Method.Lump;
    const creditCard = {
        cardNo: '4111111111111111',
        expire: '1220',
        holderName: 'AA BB'
    };

    // クレジットカード有効性チェック
    entryTranArgs = {
        shopId: movieTheater.gmoInfo.shopId,
        shopPass: movieTheater.gmoInfo.shopPass,
        orderId: orderId,
        jobCd: sskts.GMO.utils.util.JobCd.Check
        // amount: amount
    };
    entryTranResult = await sskts.GMO.services.credit.entryTran(entryTranArgs);
    console.log('entryTranResult:', entryTranResult);

    // entryTranArgs = {
    //     shopId: movieTheater.gmoInfo.shopId,
    //     shopPass: movieTheater.gmoInfo.shopPass,
    //     orderId: orderId,
    //     jobCd: sskts.GMO.utils.util.JobCd.Auth,
    //     amount: amount
    // };
    // entryTranResult = await sskts.GMO.services.credit.entryTran(entryTranArgs);
    // console.log('entryTranResult:', entryTranResult);

    execTranArgs = {
        ...{
            accessId: entryTranResult.accessId,
            accessPass: entryTranResult.accessPass,
            orderId: orderId,
            method: method,
            siteId: process.env.GMO_SITE_ID,
            sitePass: process.env.GMO_SITE_PASS
        },
        ...creditCard,
        ...{
            seqMode: sskts.GMO.utils.util.SeqMode.Physics
        }
    };
    execTranResult = await sskts.GMO.services.credit.execTran(execTranArgs);
    console.log('execTranResult:', execTranResult);

    let alterTranArgs = {
        shopId: movieTheater.gmoInfo.shopId,
        shopPass: movieTheater.gmoInfo.shopPass,
        accessId: entryTranResult.accessId,
        accessPass: entryTranResult.accessPass,
        jobCd: sskts.GMO.utils.util.JobCd.Auth,
        amount: amount,
        method: method,
    };
    let alterTranResult = await sskts.GMO.services.credit.alterTran(alterTranArgs);
    console.log('alterTranResult:', alterTranResult);
}

main().then(() => {
    console.log('succeess!');
}).catch((err) => {
    console.error(err);
}).then(() => {
    sskts.mongoose.disconnect();
});