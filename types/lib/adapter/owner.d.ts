/// <reference types="mongoose" />
import { Connection } from 'mongoose';
import ownerModel from './mongoose/model/owner';
/**
 * 所有者アダプター
 *
 * @export
 * @class OwnerAdapter
 */
export default class OwnerAdapter {
    model: typeof ownerModel;
    private readonly connection;
    constructor(connection: Connection);
}
