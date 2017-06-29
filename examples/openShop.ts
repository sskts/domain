/* tslint:disable */
import * as COA from '@motionpicture/coa-service';
import * as mongoose from 'mongoose';
import * as sskts from '../lib/index';

async function main() {
    (<any>mongoose).Promise = global.Promise;
    const connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    const requiredFields = await COA.MasterService.theater({
        theater_code: '118'
    }).then(sskts.factory.theater.createFromCOA);

    const theater: sskts.factory.theater.ITheater = {
        ...requiredFields,
        ...{
            address: {
                en: '',
                ja: ''
            },
            websites: [
                sskts.factory.theater.createWebsite({
                    group: sskts.factory.theaterWebsiteGroup.PORTAL,
                    name: {
                        "en": "portal site",
                        "ja": "ポータルサイト"
                    },
                    url: 'http://devssktsportal.azurewebsites.net/theater/aira/'
                })
            ],
            gmo: {
                site_id: '',
                shop_id: '',
                shop_pass: ''
            }
        }
    };

    await sskts.service.shop.open(theater)(sskts.adapter.theater(connection));

    mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
