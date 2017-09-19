/**
 * 取引を期限切れにするサンプル
 * @ignore
 */

const sskts = require('../');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    const repository = new sskts.repository.Transaction(sskts.mongoose.connection);
    await repository.makeExpired();

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
