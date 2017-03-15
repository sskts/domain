/// <reference types="mongoose" />
/**
 * 所有者アダプター
 *
 * @class OwnerAdapter
 */
import { Connection } from 'mongoose';
import ownerModel from './mongoose/model/owner';
export default class OwnerAdapter {
    readonly connection: Connection;
    model: typeof ownerModel;
    constructor(connection: Connection);
}
