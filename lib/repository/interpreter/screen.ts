/**
 * スクリーンリポジトリ
 *
 * @class ScreenRepositoryInterpreter
 */

import * as clone from 'clone';
import * as createDebug from 'debug';
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import * as Screen from '../../model/screen';
import ScreenRepository from '../screen';
import screenModel from './mongoose/model/screen';

const debug = createDebug('sskts-domain:repository:screen');

export default class ScreenRepositoryInterpreter implements ScreenRepository {
    private model: typeof screenModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(screenModel.modelName);
    }

    public async findById(id: string) {
        const doc = await this.model.findById(id)
            .populate('theater')
            .exec();

        return (doc) ? monapt.Option(<Screen.IScreen>doc.toObject()) : monapt.None;
    }

    public async findByTheater(theaterId: string) {
        const docs = await this.model.find({ theater: theaterId })
            .populate('theater')
            .exec();

        return docs.map((doc) => <Screen.IScreen>doc.toObject());
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
