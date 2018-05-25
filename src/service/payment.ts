/**
 * 決済サービス
 */
import * as CreditCardPaymentService from './payment/creditCard';
import * as PecorinoPaymentService from './payment/pecorino';

export import creditCard = CreditCardPaymentService;
export import pecorino = PecorinoPaymentService;
