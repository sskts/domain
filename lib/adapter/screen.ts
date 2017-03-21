import { Connection } from 'mongoose';
import screenModel from './mongoose/model/screen';

/**
 * スクリーンアダプター
 *
 * @export
 * @class ScreenAdapter
 */
export default class ScreenAdapter {
    public model: typeof screenModel;
    private readonly connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
        this.model = this.connection.model(screenModel.modelName);
    }
}
