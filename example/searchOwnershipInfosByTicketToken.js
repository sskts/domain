/**
 * チケットトークンで所有権を検索するサンプル
 * @ignore
 */

const moment = require('moment');
const sskts = require('../');

async function main() {
    await sskts.mongoose.connect(process.env.MONGOLAB_URI);

    const ownershipInfoRepo = new sskts.repository.OwnershipInfo(sskts.mongoose.connection);
    const docs = await ownershipInfoRepo.ownershipInfoModel.find({
        'typeOfGood.reservedTicket.ticketToken': {
            $exists: true,
            $eq: '1182017101100047296001'
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
