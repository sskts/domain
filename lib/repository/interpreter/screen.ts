/**
 * スクリーンリポジトリ
 *
 * @class ScreenRepositoryInterpreter
 */

import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import Screen from '../../model/screen';
import ScreenRepository from '../screen';
import screenModel from './mongoose/model/screen';

export default class ScreenRepositoryInterpreter implements ScreenRepository {
    constructor(readonly connection: Connection) {
    }

    public async findById(id: string) {
        const model = this.connection.model(screenModel.modelName);
        const screen = <Screen>await model.findOne({ _id: id })
            .populate('theater')
            .lean()
            .exec();

        return (screen) ? monapt.Option(screen) : monapt.None;
    }

    public async findByTheater(args: {
        /**
         * 劇場ID
         */
        theater_id: string
    }) {
        const model = this.connection.model(screenModel.modelName);
        return <Screen[]>await model.find({ theater: args.theater_id })
            .populate('theater')
            .lean()
            .exec();
    }

    public async store(screen: Screen) {
        const model = this.connection.model(screenModel.modelName);
        await model.findOneAndUpdate({ _id: screen._id }, screen, {
            new: true,
            upsert: true
        }).lean().exec();
    }
}
