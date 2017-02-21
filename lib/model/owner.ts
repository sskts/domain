// tslint:disable:variable-name
import MultilingualString from '../model/multilingualString';
import ObjectId from './objectId';
import OwnerGroup from './ownerGroup';

/**
 * 所有者
 *
 * @class Owner
 *
 * @param {ObjectId} _id
 * @param {OwnerGroup} group 所有者グループ
 */
class Owner {
    constructor(
        readonly _id: ObjectId,
        readonly group: OwnerGroup
    ) {
        // todo validation
    }
}

namespace Owner {
    /**
     * 匿名所有者
     *
     *
     * @class AnonymousOwner
     * @extends {Owner}
     */
    // tslint:disable-next-line:max-classes-per-file
    export class AnonymousOwner extends Owner {
        /**
         * Creates an instance of AnonymousOwner.
         *
         * @param {ObjectId} _id
         * @param {string} name_first
         * @param {string} name_last
         * @param {string} email
         * @param {string} tel
         *
         * @memberOf AnonymousOwner
         */
        constructor(
            readonly _id: ObjectId,
            readonly name_first: string,
            readonly name_last: string,
            readonly email: string,
            readonly tel: string
        ) {
            super(_id, OwnerGroup.ANONYMOUS);

            // todo validation
        }
    }

    /**
     * 興行所有者
     *
     *
     * @class PromoterOwner
     * @extends {Owner}
     */
    // tslint:disable-next-line:max-classes-per-file
    export class PromoterOwner extends Owner {
        /**
         * Creates an instance of PromoterOwner.
         *
         * @param {ObjectId} _id
         * @param {MultilingualString} name
         *
         * @memberOf PromoterOwner
         */
        constructor(
            readonly _id: ObjectId,
            readonly name: MultilingualString
        ) {
            super(_id, OwnerGroup.PROMOTER);

            // todo validation
        }
    }

    export interface IAnonymousOwner {
        _id: ObjectId;
        name_first?: string;
        name_last?: string;
        email?: string;
        tel?: string;
    }

    /**
     * 一般所有者を作成する
     * IDは、メソッドを使用する側で事前に作成する想定
     * 確実にAnonymousOwnerモデルを作成する責任を持つ
     */
    export function createAnonymous(args: IAnonymousOwner) {
        return new AnonymousOwner(
            args._id,
            (args.name_first) ? args.name_first : '',
            (args.name_last) ? args.name_last : '',
            (args.email) ? args.email : '',
            (args.tel) ? args.tel : ''
        );
    }

    export interface IPromoterOwner {
        _id: ObjectId;
        name?: MultilingualString;
    }

    export function createPromoter(args: IPromoterOwner): PromoterOwner {
        return new PromoterOwner(
            args._id,
            (args.name) ? args.name : { ja: '', en: '' }
        );
    }
}

export default Owner;
