/**
 * 承認グループ
 *
 * @namespace factory/authorizationGroup
 */
declare enum AuthorizationGroup {
    /**
     * 内部資産管理
     */
    ASSET = "ASSET",
    /**
     * COA座席予約資産管理
     */
    COA_SEAT_RESERVATION = "COA_SEAT_RESERVATION",
    /**
     * GMO資産管理
     */
    GMO = "GMO",
    /**
     * ムビチケ資産管理
     */
    MVTK = "MVTK",
}
export default AuthorizationGroup;
