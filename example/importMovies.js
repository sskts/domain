/**
 * 映画作品インポートサンプル
 * @ignore
 */

const sskts = require('../');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    await Promise.all(['118', '112'].map(async (theaterCode) => {
        await sskts.service.masterSync.importMovies(theaterCode)(
            new sskts.repository.CreativeWork(sskts.mongoose.connection)
        );
    }));

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
