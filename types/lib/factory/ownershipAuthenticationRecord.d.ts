/**
 * 所有権認証記録インターフェース
 *
 * @param {string} when いつ
 * @param {string} where どこで
 * @param {boolean} why 何のために
 * @param {boolean} how どうやって
 * @memberof factory/ownershipAuthenticationRecord
 */
export interface IOwnershipAuthenticationRecord {
    when: Date;
    where: string;
    why: string;
    how: string;
}
/**
 * 所有権認証記録を生成する
 *
 * @memberof factory/ownershipAuthenticationRecord
 */
export declare function create(args: {
    when: Date;
    where: string;
    why: string;
    how: string;
}): IOwnershipAuthenticationRecord;
