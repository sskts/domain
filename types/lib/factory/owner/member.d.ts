import IMultilingualString from '../multilingualString';
import * as AnonymousOwnerFactory from '../owner/anonymous';
/**
 * 会員所有者インターフェース
 *
 * @interface IMemberOwner
 * @extends {AnonymousOwnerFactory.IAnonymousOwner}
 * @memberof factory/owner/member
 */
export interface IMemberOwner extends AnonymousOwnerFactory.IAnonymousOwner {
    /**
     * ユーザーネーム
     */
    username: string;
    /**
     * パスワードハッシュ
     */
    password_hash: string;
    /**
     * 名
     */
    name_first: string;
    /**
     * 姓
     */
    name_last: string;
    /**
     * メールアドレス
     */
    email: string;
    /**
     * 電話番号
     */
    tel: string;
    /**
     * 説明
     */
    description: IMultilingualString;
    /**
     * 備考
     */
    notes: IMultilingualString;
}
export declare function create(args: {
    id?: string;
    username: string;
    password: string;
    name_first: string;
    name_last: string;
    email: string;
    tel?: string;
    state?: string;
    description?: IMultilingualString;
    notes?: IMultilingualString;
}): Promise<IMemberOwner>;
