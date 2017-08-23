/**
 * タスク名
 *
 * @namespace factory/taskName
 */

enum TaskName {
    CancelSeatReservationAuthorization = 'cancelSeatReservationAuthorization',
    CancelGMOAuthorization = 'cancelGMOAuthorization',
    CancelMvtkAuthorization = 'cancelMvtkAuthorization',
    DisableTransactionInquiry = 'disableTransactionInquiry',
    SendEmailNotification = 'sendEmailNotification',
    SettleSeatReservationAuthorization = 'settleSeatReservationAuthorization',
    SettleGMOAuthorization = 'settleGMOAuthorization',
    SettleMvtkAuthorization = 'settleMvtkAuthorization'
}

export default TaskName;
