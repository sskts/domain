/**
 * 進行中取引サービス
 *
 * @namespace service/tradeInProgress
 */
import * as COA from '@motionpicture/coa-service';
import * as monapt from 'monapt';
import * as BuyActionFactory from '../factory/action/buyAction';
import * as OrderInquiryKeyFactory from '../factory/orderInquiryKey';
import * as AuthorizationFactory from '../factory/authorization';
import * as COASeatReservationAuthorizationFactory from '../factory/authorization/coaSeatReservation';
import * as GMOAuthorizationFactory from '../factory/authorization/gmo';
import * as MvtkAuthorizationFactory from '../factory/authorization/mvtk';
import * as IndivisualScreeningEventFactory from '../factory/event/indivisualScreeningEvent';
import * as EmailNotificationFactory from '../factory/notification/email';
import * as PersonFactory from '../factory/person';
import ActionAdapter from '../adapter/action';
import OrganizationAdapter from '../adapter/organization';
import PersonAdapter from '../adapter/person';
export declare type PersonAndActionOperation<T> = (personAdapter: PersonAdapter, actionAdapter: ActionAdapter) => Promise<T>;
export declare type ActionOperation<T> = (actionAdapter: ActionAdapter) => Promise<T>;
/**
 * アクションIDから取得する
 */
export declare function findByActionId(actionId: string): (actionAdapter: ActionAdapter) => Promise<monapt.Option<BuyActionFactory.IAction>>;
export declare function addAuthorization(actionId: string, authorization: AuthorizationFactory.IAuthorization): (actionAdapter: ActionAdapter) => Promise<void>;
/**
 * GMOクレジットカードオーソリ
 */
export declare function authorizeGMOCard(actionId: string, gmoAction: {
    orderId: string;
    amount: number;
    method?: string;
    cardNo?: string;
    expire?: string;
    securityCode?: string;
    token?: string;
}): (organizationAdapter: OrganizationAdapter, actionAdapter: ActionAdapter) => Promise<GMOAuthorizationFactory.IAuthorization>;
export declare function acceptIndivisualScreeningEventOffers(actionId: string, indivisualScreeningEvent: IndivisualScreeningEventFactory.IEvent, offers: {
    seatSection: string;
    seatNumber: string;
    ticket: COA.services.reserve.IUpdReserveTicket;
}[]): (actionAdapter: ActionAdapter) => Promise<COASeatReservationAuthorizationFactory.IAuthorization>;
/**
 * ムビチケ着券承認追加
 *
 * @param {string} actionId
 * @param {MvtkAuthorization.IMvtkAuthorization} authorization
 * @returns {PersonAndActionOperation<void>}
 *
 * @memberof service/orderById
 */
export declare function addMvtkAuthorization(actionId: string, authorization: MvtkAuthorizationFactory.IAuthorization): (actionAdapter: ActionAdapter) => Promise<void>;
export declare function deleteAuthorization(actionId: string, authorizationId: string): (actionAdapter: ActionAdapter) => Promise<void>;
/**
 * メール追加
 *
 * @param {string} actionId
 * @param {EmailNotification} notification
 * @returns {ActionOperation<void>}
 *
 * @memberof service/orderById
 */
export declare function addEmail(actionId: string, notification: EmailNotificationFactory.INotification): (actionAdapter: ActionAdapter) => Promise<void>;
/**
 * メール削除
 *
 * @param {string} actionId
 * @param {string} notificationId
 * @returns {ActionOperation<void>}
 *
 * @memberof service/orderById
 */
export declare function removeEmail(actionId: string, notificationId: string): (actionAdapter: ActionAdapter) => Promise<void>;
/**
 * 取引中の所有者プロフィールを変更する
 * 匿名所有者として開始した場合のみ想定(匿名か会員に変更可能)
 */
export declare function setAgentProfile(actionId: string, profile: PersonFactory.IProfile): PersonAndActionOperation<void>;
/**
 * 会員情報をGMO会員として保管する
 *
 * @param {MemberOwnerFactory.IMemberOwner} memberOwner 会員所有者
 */
/**
 * 取引中の所有者に対してカード情報を保管する
 *
 * @export
 * @param {string} actionId 取引ID
 * @param {string} ownerId 所有者ID
 * @param {(GMOCardFactory.IGMOCardRaw | GMOCardFactory.IGMOCardTokenized)} gmoCard GMOカード情報
 * @returns {ActionOperation<void>} 取引に対する操作
 */
/**
 * 照合を可能にする
 *
 * @param {string} actionId
 * @param {ActionInquiryKey} key
 * @returns {ActionOperation<monapt.Option<Action>>}
 *
 * @memberof service/orderById
 */
export declare function enableInquiry(actionId: string, orderInquiryKey: OrderInquiryKeyFactory.IOrderInquiryKey): (actionAdapter: ActionAdapter) => Promise<void>;
/**
 * 取引成立
 *
 * @param {string} actionId
 * @returns {ActionOperation<void>}
 *
 * @memberof service/orderById
 */
export declare function close(actionId: string): (actionAdapter: ActionAdapter) => Promise<void>;
