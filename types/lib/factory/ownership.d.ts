import * as OwnershipAuthenticationRecordFactory from './ownershipAuthenticationRecord';
/**
 * 認証記録インターフェース
 */
export declare type IAuthenticationRecord = OwnershipAuthenticationRecordFactory.IOwnershipAuthenticationRecord;
/**
 * 所有権インターフェース
 *
 * @param {string} id
 * @param {string} owner 所有者
 * @param {[]} authentication_records 認証履歴
 * @memberof factory/ownership
 */
export interface IOwnership {
    id: string;
    owner: string;
    authentication_records: IAuthenticationRecord[];
}
/**
 * 所有権を生成する
 *
 * @memberof factory/ownership
 */
export declare function create(args: {
    id?: string;
    owner: string;
    authentication_records?: IAuthenticationRecord[];
}): IOwnership;
