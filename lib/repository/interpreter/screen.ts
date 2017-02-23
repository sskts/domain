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
    constructor(readonly connection: Connection) {
    }

    public async findById(id: string) {
        const model = this.connection.model(screenModel.modelName);
        const doc = await model.findOne({ _id: id })
            .populate('theater')
            .exec();

        return (doc) ? monapt.Option(Screen.create(<any>doc.toObject())) : monapt.None;
    }

    public async findByTheater(theaterId: string) {
        const model = this.connection.model(screenModel.modelName);
        const docs = await model.find({ theater: theaterId })
            .populate('theater')
            .exec();

        return docs.map((doc) => Screen.create(<any>doc.toObject()));
    }

    public async store(screen: Screen) {
        const model = this.connection.model(screenModel.modelName);
        debug('updating a screen...', screen);
        await model.findOneAndUpdate({ _id: screen.id }, screen.toDocument(), {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
