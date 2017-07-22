/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import creativeWorkModel from './mongoose/model/creativeWork';
/**
 * 作品アダプター
 *
 * @class CreativeWorkAdapter
 */
export default class CreativeWorkAdapter {
    readonly creativeWorkModel: typeof creativeWorkModel;
    constructor(connection: Connection);
}
