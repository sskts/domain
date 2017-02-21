"use strict";
const ownerGroup_1 = require("./ownerGroup");
/**
 * 所有者
 *
 * @class Owner
 *
 * @param {ObjectId} _id
 * @param {OwnerGroup} group 所有者グループ
 */
class Owner {
    constructor(_id, group) {
        this._id = _id;
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
         * @param {ObjectId} _id
         * @param {string} name_first
         * @param {string} name_last
         * @param {string} email
         * @param {string} tel
         *
         * @memberOf AnonymousOwner
         */
        constructor(_id, name_first, name_last, email, tel) {
            super(_id, ownerGroup_1.default.ANONYMOUS);
            this._id = _id;
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
         * @param {ObjectId} _id
         * @param {MultilingualString} name
         *
         * @memberOf PromoterOwner
         */
        constructor(_id, name) {
            super(_id, ownerGroup_1.default.PROMOTER);
            this._id = _id;
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
        return new AnonymousOwner(args._id, (args.name_first) ? args.name_first : '', (args.name_last) ? args.name_last : '', (args.email) ? args.email : '', (args.tel) ? args.tel : '');
    }
    Owner.createAnonymous = createAnonymous;
    function createPromoter(args) {
        return new PromoterOwner(args._id, (args.name) ? args.name : { ja: '', en: '' });
    }
    Owner.createPromoter = createPromoter;
})(Owner || (Owner = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Owner;
