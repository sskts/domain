/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import personModel from './mongoose/model/person';
/**
 * 人物アダプター
 *
 * @class PersonAdapter
 */
export default class PersonAdapter {
    readonly personModel: typeof personModel;
    constructor(connection: Connection);
}
