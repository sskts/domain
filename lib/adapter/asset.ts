import * as Asset from '../factory/asset';

/**
 * 資産リポジトリ
 *
 * @interface AssetAdapter
 */
interface IAssetAdapter {
    /**
     * 保管する
     *
     * @param {Asset} asset 資産
     */
    store(asset: Asset.IAsset): Promise<void>;
}

export default IAssetAdapter;
