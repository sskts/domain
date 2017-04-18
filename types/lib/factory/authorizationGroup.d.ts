/**
 * 承認グループ
 *
 * @namespace factory/authorizationGroup
 */
declare type AuthorizationGroup = 'ASSET' | 'COA_SEAT_RESERVATION' | 'GMO' | 'MVTK';
declare namespace AuthorizationGroup {
    /**
     * 内部資産管理
     */
    const ASSET = "ASSET";
    /**
     * COA座席予約資産管理
     */
    const COA_SEAT_RESERVATION = "COA_SEAT_RESERVATION";
    /**
     * GMO資産管理
     */
    const GMO = "GMO";
    /**
     * ムビチケ資産管理
     */
    const MVTK = "MVTK";
}
export default AuthorizationGroup;
