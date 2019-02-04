/**
 * 予約サービス
 * 予約の保管先はChevre | COAです
 */
import { service } from '@cinerino/domain';

/**
 * 予約を確定する
 */
export const confirmReservation = service.reservation.confirmReservation;
