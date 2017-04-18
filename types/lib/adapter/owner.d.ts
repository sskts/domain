/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import ownerModel from './mongoose/model/owner';
/**
 * 所有者アダプター
 *
 * @class OwnerAdapter
 */
export default class OwnerAdapter {
    readonly model: typeof ownerModel;
    constructor(connection: Connection);
}
