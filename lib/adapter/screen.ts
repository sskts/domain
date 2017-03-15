/**
 * スクリーンアダプター
 *
 * @class ScreenAdapter
 */
import { Connection } from 'mongoose';
import screenModel from './mongoose/model/screen';

export default class ScreenAdapter {
    public model: typeof screenModel;

    constructor(readonly connection: Connection) {
        this.model = this.connection.model(screenModel.modelName);
    }
}
