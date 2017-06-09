/**
 * 取引スコープファクトリー
 *
 * @namespace factory/transactionScope
 */
import OwnerGroup from './ownerGroup';
/**
 * 取引スコープインターフェース
 * todo 仮実装なので、調整あるいは拡張していくこと
 *
 * @interface ITransactionScope
 * @memberof factory/transactionScope
 */
export interface ITransactionScope {
    client?: string;
    theater?: string;
    owner_group?: OwnerGroup;
}
/**
 * 取引スコープを作成する
 *
 * @returns {ITransactionScope}
 * @memberof factory/transactionScope
 */
export declare function create(args: {
    client?: string;
    theater?: string;
    owner_group?: OwnerGroup;
}): ITransactionScope;
/**
 * スコープを文字列に変換する
 *
 * @param {ITransactionScope} scope 取引スコープ
 */
export declare function scope2String(scope: ITransactionScope): string;
