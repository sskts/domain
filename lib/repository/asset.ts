import * as Asset from '../model/asset';

/**
 * 資産リポジトリ
 *
 * @interface AssetRepository
 */
interface IAssetRepository {
    /**
     * 保管する
     *
     * @param {Asset} asset 資産
     */
    store(asset: Asset.IAsset): Promise<void>;
}

export default IAssetRepository;
