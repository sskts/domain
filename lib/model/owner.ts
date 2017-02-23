// tslint:disable:variable-name
import MultilingualString from '../model/multilingualString';
import OwnerGroup from './ownerGroup';

/**
 * 所有者
 *
 * @class Owner
 *
 * @param {string} id
 * @param {OwnerGroup} group 所有者グループ
 */
class Owner {
    constructor(
        readonly id: string,
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
         * @param {string} id
         * @param {string} name_first
         * @param {string} name_last
         * @param {string} email
         * @param {string} tel
         *
         * @memberOf AnonymousOwner
         */
        constructor(
            readonly id: string,
            readonly name_first: string,
            readonly name_last: string,
            readonly email: string,
            readonly tel: string
        ) {
            super(id, OwnerGroup.ANONYMOUS);

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
         * @param {string} id
         * @param {MultilingualString} name
         *
         * @memberOf PromoterOwner
         */
        constructor(
            readonly id: string,
            readonly name: MultilingualString
        ) {
            super(id, OwnerGroup.PROMOTER);

            // todo validation
        }
    }

    export interface IAnonymousOwner {
        id: string;
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
            args.id,
            (args.name_first) ? args.name_first : '',
            (args.name_last) ? args.name_last : '',
            (args.email) ? args.email : '',
            (args.tel) ? args.tel : ''
        );
    }

    export interface IPromoterOwner {
        id: string;
        name?: MultilingualString;
    }

    export function createPromoter(args: IPromoterOwner): PromoterOwner {
        return new PromoterOwner(
            args.id,
            (args.name) ? args.name : { ja: '', en: '' }
        );
    }
}

export default Owner;
