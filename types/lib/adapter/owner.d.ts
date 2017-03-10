import * as monapt from 'monapt';
import * as Owner from '../factory/owner';
/**
 * 所有者リポジトリ
 *
 * @interface OwnerAdapter
 */
interface IOwnerAdapter {
    /**
     * ID検索
     *
     * @param {string} id
     */
    findById(id: string): Promise<monapt.Option<Owner.IOwner>>;
    /**
     * 興行所有者を検索
     */
    findPromoter(): Promise<monapt.Option<Owner.IPromoterOwner>>;
    /**
     * ひとつ検索&更新
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneAndUpdate(conditions: any, update: any): Promise<monapt.Option<Owner.IOwner>>;
    /**
     * 保管する
     *
     * @param {Owner} owner 所有者
     */
    store(owner: Owner.IOwner): Promise<void>;
}
export default IOwnerAdapter;
