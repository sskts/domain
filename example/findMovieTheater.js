/**
 * a sample finding movie theater
 *
 * @ignore
 */

const sskts = require('../lib/index');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    const theaterOption = await sskts.service.place.findMovieTheaterByBranchCode(
        '118'
    )(sskts.adapter.place(sskts.mongoose.connection));
    console.log('theaterOption', theaterOption);

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
