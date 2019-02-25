/**
 * 注文検索サンプル
 */
const moment = require('moment');
const mongoose = require('mongoose');

const sskts = require('../');

async function main() {
    await mongoose.connect(process.env.MONGOLAB_URI);

    const orderRepo = new sskts.repository.Order(mongoose.connection);
    const orders = await orderRepo.search({
        orderDateFrom: moment().add(-3, 'days').toDate(),
        orderDateThrough: moment().toDate(),
        // orderNumbers: ['MO118-180612-000074'],
        // sellerIds: ['59d20831e53ebc2b4e774466'],
        // customerMembershipNumbers: ['yamazaki']
        // orderStatus: sskts.factory.orderStatus.OrderReturned,
        orderStatuses: [sskts.factory.orderStatus.OrderDelivered, sskts.factory.orderStatus.OrderReturned],
        confirmationNumbers: ['476742'],
        reservedEventIdentifiers: ['11816227020180612901510']
    });
    console.log(orders.length, 'orders found.');

    // await mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
