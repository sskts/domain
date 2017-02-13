import Asset from '../asset';
import Authorization from '../authorization';
import AuthorizationGroup from '../authorizationGroup';
import ObjectId from '../objectId';

/**
 * 資産承認
 * 誰が、誰に対して、何(資産)の所有を、承認するのか
 *
 *
 * @class AssetAuthorization
 * @extends {Authorization}
 */
export default class AssetAuthorization extends Authorization {
    /**
     * Creates an instance of AssetAuthorization.
     *
     * @param {ObjectId} _id
     * @param {Asset} asset 資産
     * @param {number} price 資産価格
     * @param {ObjectId} owner_from 誰が
     * @param {ObjectId} owner_to 誰に対して
     *
     * @memberOf AssetAuthorization
     */
    constructor(
        readonly _id: ObjectId,
        readonly asset: Asset,
        readonly price: number,
        readonly owner_from: ObjectId,
        readonly owner_to: ObjectId
    ) {
        super(_id, AuthorizationGroup.ASSET, price, owner_from, owner_to);

        // todo validation
    }
}
