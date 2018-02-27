/**
 * 劇場組織検索サンプル
 * @ignore
 */

const sskts = require('../');

async function main() {
    await sskts.mongoose.connect(process.env.MONGOLAB_URI);

    const repository = new sskts.repository.Organization(sskts.mongoose.connection);
    const theaters = await repository.searchMovieTheaters({});
    console.log('theaters:', theaters);

    await sskts.mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
