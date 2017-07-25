/**
 * タスク名
 *
 * @namespace factory/taskName
 */
declare enum TaskName {
    CancelSeatReservation = "cancelSeatReservation",
    CancelGMO = "cancelGMO",
    CancelMvtk = "cancelMvtk",
    SendEmailNotification = "sendEmailNotification",
    SettleSeatReservation = "settleSeatReservation",
    SettleGMO = "settleGMO",
    SettleMvtk = "settleMvtk",
    CreateOrder = "createOrder",
}
export default TaskName;
