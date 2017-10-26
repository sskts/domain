/**
 * 枝番号で劇場組織検索サンプル
 * @ignore
 */

const sskts = require('../');

async function main() {
    sskts.mongoose.connect(process.env.MONGOLAB_URI);

    const repository = new sskts.repository.Organization(sskts.mongoose.connection);
    const movieTheater = await repository.findMovieTheaterByBranchCode('118');
    console.log('movieTheater:', movieTheater);

    sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
