/**
 * スクリーンリポジトリ
 *
 * @class ScreenRepositoryInterpreter
 */

import * as createDebug from 'debug';
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import Screen from '../../model/screen';
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

        return (doc) ? monapt.Option(Screen.create(<any>doc.toObject())) : monapt.None;
    }

    public async findByTheater(theaterId: string) {
        const docs = await this.model.find({ theater: theaterId })
            .populate('theater')
            .exec();

        return docs.map((doc) => Screen.create(<any>doc.toObject()));
    }

    public async store(screen: Screen) {
        debug('updating a screen...', screen);
        await this.model.findByIdAndUpdate(screen.id, screen.toDocument(), {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
