/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import ActionModel from './mongoose/model/action';
/**
 * アクションアダプター
 *
 * @class ActionAdapter
 */
export default class ActionAdapter {
    readonly actionModel: typeof ActionModel;
    constructor(connection: Connection);
}
