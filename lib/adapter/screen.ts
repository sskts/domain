/**
 * スクリーンリポジトリ
 *
 * @class ScreenAdapter
 */

import * as clone from 'clone';
import * as createDebug from 'debug';
import { Connection } from 'mongoose';
import * as Screen from '../factory/screen';

import screenModel from './mongoose/model/screen';

const debug = createDebug('sskts-domain:adapter:screen');

export default class ScreenAdapter {
    public model: typeof screenModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(screenModel.modelName);
    }

    public async store(screen: Screen.IScreen) {
        debug('updating a screen...', screen);
        const update = clone(screen, false);
        await this.model.findByIdAndUpdate(update.id, update, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
