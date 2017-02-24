/* tslint:disable */
import * as SSKTS from '../lib/sskts-domain';

async function main() {
    const token = await SSKTS.OAuthService.sign(process.env.SSKTS_API_REFRESH_TOKEN, 'admin');

    const decoded = await SSKTS.OAuthService.verify(token);
    console.log(decoded);
}

main().then(() => {
    console.log('main processed.');
}).catch((err) => {
    console.error(err.message);
});
