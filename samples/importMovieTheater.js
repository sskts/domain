/**
 * 劇場インポートサンプル
 *
 * @ignore
 */

const sskts = require('../lib/index');

async function main() {
    try {
        const connection = sskts.mongoose.createConnection(process.env.MONGOLAB_URI);
        await sskts.service.place.importMovieTheater('118')(sskts.adapter.place(connection));
    } catch (error) {
        console.error(error);
    }

    sskts.mongoose.disconnect();
}

main();
