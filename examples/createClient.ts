/* tslint:disable */

import * as mongoose from 'mongoose';

import ClientAdapter from '../lib/adapter/client';
import * as clientService from '../lib/service/client';

async function main() {
    try {
        (<any>mongoose).Promise = global.Promise;
        const connection = mongoose.createConnection(process.env.MONGOLAB_URI);

        const clientAdapter = new ClientAdapter(connection);
        const args = {
            id: 'motionpicture',
            secret: 'motionpicture',
            name: {
                en: 'motionpicture',
                ja: 'モーションピクチャー'
            },
            description: {
                en: 'motionpicture',
                ja: 'モーションピクチャー'
            },
            notes: {
                en: 'motionpicture',
                ja: 'モーションピクチャー'
            },
            email: 'hello@motionpicture,jp'
        };
        await clientService.create(args)(clientAdapter);
    } catch (error) {
        console.error(error);
    }

    mongoose.disconnect();
}

main();
