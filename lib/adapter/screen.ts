import { Connection } from 'mongoose';
import screenModel from './mongoose/model/screen';

/**
 * スクリーンアダプター
 *
 * @export
 * @class ScreenAdapter
 */
export default class ScreenAdapter {
    public readonly model: typeof screenModel;

    constructor(connection: Connection) {
        this.model = connection.model(screenModel.modelName);
    }
}
