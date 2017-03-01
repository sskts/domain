"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ownerGroup_1 = require("./ownerGroup");
/**
 * 所有者
 *
 * @class Owner
 *
 * @param {string} id
 * @param {OwnerGroup} group 所有者グループ
 */
class Owner {
    constructor(id, group) {
        this.id = id;
        this.group = group;
        // todo validation
    }
}
(function (Owner) {
    /**
     * 匿名所有者
     *
     *
     * @class AnonymousOwner
     * @extends {Owner}
     */
    // tslint:disable-next-line:max-classes-per-file
    class AnonymousOwner extends Owner {
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
        constructor(id, name_first, name_last, email, tel) {
            super(id, ownerGroup_1.default.ANONYMOUS);
            this.id = id;
            this.name_first = name_first;
            this.name_last = name_last;
            this.email = email;
            this.tel = tel;
            // todo validation
        }
    }
    Owner.AnonymousOwner = AnonymousOwner;
    /**
     * 興行所有者
     *
     *
     * @class PromoterOwner
     * @extends {Owner}
     */
    // tslint:disable-next-line:max-classes-per-file
    class PromoterOwner extends Owner {
        /**
         * Creates an instance of PromoterOwner.
         *
         * @param {string} id
         * @param {MultilingualString} name
         *
         * @memberOf PromoterOwner
         */
        constructor(id, name) {
            super(id, ownerGroup_1.default.PROMOTER);
            this.id = id;
            this.name = name;
            // todo validation
        }
    }
    Owner.PromoterOwner = PromoterOwner;
    /**
     * 一般所有者を作成する
     * IDは、メソッドを使用する側で事前に作成する想定
     * 確実にAnonymousOwnerモデルを作成する責任を持つ
     */
    function createAnonymous(args) {
        return new AnonymousOwner(args.id, (args.name_first) ? args.name_first : '', (args.name_last) ? args.name_last : '', (args.email) ? args.email : '', (args.tel) ? args.tel : '');
    }
    Owner.createAnonymous = createAnonymous;
    function createPromoter(args) {
        return new PromoterOwner(args.id, (args.name) ? args.name : { ja: '', en: '' });
    }
    Owner.createPromoter = createPromoter;
})(Owner || (Owner = {}));
exports.default = Owner;
