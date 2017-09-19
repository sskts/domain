/**
 * 劇場インポートサンプル
 * @ignore
 */

const sskts = require('../');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    await sskts.service.masterSync.importMovieTheater('118')(
        new sskts.repository.Place(sskts.mongoose.connection
        ));

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
