/**
 * mockgoose test
 * @ignore
 */

import { Mockgoose } from 'mockgoose';
import * as mongoose from 'mongoose';

import * as sskts from './index';

let mockgoose: Mockgoose;

before(async () => {
    mockgoose = new Mockgoose(mongoose);
    // await mockgoose.prepareStorage();

    mongoose.connect(process.env.MONGOLAB_URI);
    // mongoose.connection.on('connected', () => {
    //     console.log('db connection is now open');
    // });
});

describe('...', () => {
    it('...', async () => {
        // ...
        const eventAdapter = sskts.repository.event(mongoose.connection);
        await eventAdapter.eventModel.findOne({
            identifier: '11899100020170904102025'
        }).exec();
    });
});
