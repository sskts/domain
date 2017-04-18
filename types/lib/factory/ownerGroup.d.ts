/**
 * 所有者グループ
 *
 * @namespace factory/ownerGroup
 */
declare type OwnerGroup = 'ANONYMOUS' | 'PROMOTER' | 'MEMBER';
declare namespace OwnerGroup {
    /**
     * 匿名
     */
    const ANONYMOUS = "ANONYMOUS";
    /**
     * 興行主
     */
    const PROMOTER = "PROMOTER";
    /**
     * 会員
     */
    const MEMBER = "MEMBER";
}
export default OwnerGroup;
