/**
 * 映画作品インポートサンプル
 *
 * @ignore
 */

const sskts = require('../');

async function main() {
    try {
        const connection = sskts.mongoose.createConnection(process.env.MONGOLAB_URI);
        await sskts.service.creativeWork.importMovies('118')(
            sskts.adapter.creativeWork(connection)
        );
    } catch (error) {
        console.error(error);
    }

    sskts.mongoose.disconnect();
}

main();
