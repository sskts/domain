const sskts = require('../');

async function main() {
    await sskts.mongoose.connect(process.env.MONGOLAB_URI, { useMongoClient: true });

    const db = sskts.mongoose.connection.db;

    const mongoCommand = { copydb: 1, fromdb: 'sskts-development', todb: 'sskts-development-v2' };
    const result = await db.admin().command(mongoCommand);
    console.log('result:', result);

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
