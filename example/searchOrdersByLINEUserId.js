/**
 * LINEユーザーIDで注文検索するサンプル
 * @ignore
 */

const moment = require('moment');
const sskts = require('../');

async function main() {
    await sskts.mongoose.connect(process.env.MONGOLAB_URI);

    const orderRepo = new sskts.repository.Order(sskts.mongoose.connection);
    const docs = await orderRepo.orderModel.find({
        orderDate: { $gt: moment().add(-1, 'month').toDate() },
        'customer.memberOf.membershipNumber': {
            $exists: true,
            $eq: 'U28fba84b4008d60291fc861e2562b34f'
        },
        'customer.memberOf.programName': {
            $exists: true,
            $eq: 'LINE'
        }
    }).exec();
    console.log('docs:', docs);

    await sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
