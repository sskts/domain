/// <reference types="mongoose" />
/**
 * 所有者リポジトリ
 *
 * @class OwnerRepositoryInterpreter
 */
import * as monapt from 'monapt';
import * as mongoose from 'mongoose';
import ObjectId from '../../model/objectId';
import Owner from '../../model/owner';
import OwnerRepository from '../owner';
export default class OwnerRepositoryInterpreter implements OwnerRepository {
    readonly connection: mongoose.Connection;
    constructor(connection: mongoose.Connection);
    find(conditions: Object): Promise<Owner[]>;
    findById(id: ObjectId): Promise<monapt.Option<Owner>>;
    findPromoter(): Promise<monapt.Option<Owner.PromoterOwner>>;
    findOneAndUpdate(conditions: Object, update: Object): Promise<monapt.Option<Owner>>;
    store(owner: Owner): Promise<void>;
}
