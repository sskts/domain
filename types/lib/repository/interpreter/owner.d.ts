/// <reference types="mongoose" />
/**
 * 所有者リポジトリ
 *
 * @class OwnerRepositoryInterpreter
 */
import * as monapt from 'monapt';
import { Connection } from 'mongoose';
import Owner from '../../model/owner';
import OwnerRepository from '../owner';
export default class OwnerRepositoryInterpreter implements OwnerRepository {
    readonly connection: Connection;
    private model;
    constructor(connection: Connection);
    find(conditions: any): Promise<Owner[]>;
    findById(id: string): Promise<monapt.Option<Owner>>;
    findPromoter(): Promise<monapt.Option<Owner.PromoterOwner>>;
    findOneAndUpdate(conditions: any, update: any): Promise<monapt.Option<Owner>>;
    store(owner: Owner): Promise<void>;
}
