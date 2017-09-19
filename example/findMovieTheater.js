/**
 * a sample finding movie theater
 *
 * @ignore
 */

const sskts = require('../');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    const repo = new sskts.repository.Place(sskts.mongoose.connection);
    const theater = await repo.findMovieTheaterByBranchCode('118');
    console.log('theater:', theater);

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
