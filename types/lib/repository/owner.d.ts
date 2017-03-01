import * as monapt from 'monapt';
import Owner from '../model/owner';
/**
 * 所有者リポジトリ
 *
 * @interface OwnerRepository
 */
interface OwnerRepository {
    /**
     * 検索
     *
     * @param {Object} conditions 検索条件
     */
    find(conditions: any): Promise<Owner[]>;
    /**
     * ID検索
     *
     * @param {string} id
     */
    findById(id: string): Promise<monapt.Option<Owner>>;
    /**
     * 興行所有者を検索
     */
    findPromoter(): Promise<monapt.Option<Owner.PromoterOwner>>;
    /**
     * ひとつ検索&更新
     *
     * @param {Object} conditions 検索条件
     * @param {Object} update 更新内容
     */
    findOneAndUpdate(conditions: any, update: any): Promise<monapt.Option<Owner>>;
    /**
     * 保管する
     *
     * @param {Owner} owner 所有者
     */
    store(owner: Owner): Promise<void>;
}
export default OwnerRepository;
