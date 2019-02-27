/**
 * ポイントインセンティブ承認アクションサービス
 */
import { pecorinoapi } from '@cinerino/domain';
import * as createDebug from 'debug';
import * as moment from 'moment';

import { handlePecorinoError } from '../../../../../../errorHandler';
import { MongoRepository as ActionRepo } from '../../../../../../repo/action';
import { MongoRepository as OwnershipInfoRepo } from '../../../../../../repo/ownershipInfo';
import { MongoRepository as TransactionRepo } from '../../../../../../repo/transaction';

import * as factory from '../../../../../../factory';

const debug = createDebug('sskts-domain:service:transaction:placeOrderInProgress:action:authorize:award:pecorino');

export type ICreateOperation<T> = (repos: {
    action: ActionRepo;
    transaction: TransactionRepo;
    ownershipInfo: OwnershipInfoRepo;
    depositTransactionService: pecorinoapi.service.transaction.Deposit;
}) => Promise<T>;

/**
 * ポイントインセンティブ承認を作成する
 * Pecorino入金取引を開始する
 */
export function create(params: {
    agentId: string;
    /**
     * 取引ID
     */
    transactionId: string;
    /**
     * 金額
     */
    amount: number;
    /**
     * Pecorino口座番号
     */
    toAccountNumber: string;
    /**
     * 取引メモ
     */
    notes?: string;
}): ICreateOperation<factory.action.authorize.award.point.IAction> {
    // tslint:disable-next-line:max-func-body-length
    return async (repos: {
        action: ActionRepo;
        transaction: TransactionRepo;
        ownershipInfo: OwnershipInfoRepo;
        /**
         * 入金取引サービス
         */
        depositTransactionService: pecorinoapi.service.transaction.Deposit;
    }) => {
        const now = new Date();

        const transaction = await repos.transaction.findInProgressById({
            typeOf: factory.transactionType.PlaceOrder,
            id: params.transactionId
        });

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if: please write tests */
        if (transaction.agent.id !== params.agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // インセンティブ付与可能条件は、会員プログラム特典に加入しているかどうか
        if (transaction.agent.memberOf === undefined) {
            throw new factory.errors.Forbidden('Membership required');
        }
        const programMemberships = await repos.ownershipInfo.search<factory.programMembership.ProgramMembershipType>({
            typeOfGood: {
                typeOf: 'ProgramMembership'
            },
            ownedBy: {
                id: transaction.agent.id
            },
            ownedFrom: now,
            ownedThrough: now
        });
        const pecorinoPaymentAward = programMemberships.reduce((a, b) => [...a, ...b.typeOfGood.award], [])
            .find((a) => a === factory.programMembership.Award.PecorinoPayment);
        if (pecorinoPaymentAward === undefined) {
            throw new factory.errors.Forbidden('Membership program requirements not satisfied');
        }

        // 承認アクションを開始する
        const actionAttributes: factory.action.authorize.award.point.IAttributes = {
            typeOf: factory.actionType.AuthorizeAction,
            object: {
                typeOf: factory.action.authorize.award.point.ObjectType.PointAward,
                transactionId: params.transactionId,
                amount: params.amount
            },
            agent: transaction.seller,
            recipient: transaction.agent,
            purpose: {
                typeOf: transaction.typeOf,
                id: transaction.id
            }
        };
        const action = await repos.action.start(actionAttributes);

        let pointAPIEndpoint: string;

        // Pecorinoオーソリ取得
        let pointTransaction: factory.action.authorize.award.point.IPointTransaction;

        try {
            pointAPIEndpoint = repos.depositTransactionService.options.endpoint;

            debug('starting pecorino pay transaction...', params.amount);
            pointTransaction = await repos.depositTransactionService.start({
                // 最大1ヵ月のオーソリ
                expires: moment().add(1, 'month').toDate(),
                agent: {
                    typeOf: transaction.seller.typeOf,
                    id: transaction.seller.id,
                    name: transaction.seller.name.ja,
                    url: transaction.seller.url
                },
                recipient: {
                    typeOf: transaction.agent.typeOf,
                    id: transaction.agent.id,
                    name: `sskts-transaction-${transaction.id}`,
                    url: transaction.agent.url
                },
                amount: params.amount,
                // tslint:disable-next-line:no-single-line-block-comment
                notes: (params.notes !== undefined) ? /* istanbul ignore next */ params.notes : 'シネマサンシャイン 注文取引インセンティブ',
                accountType: factory.accountType.Point,
                toAccountNumber: params.toAccountNumber
            });
            debug('pointTransaction started.', pointTransaction.id);
        } catch (error) {
            // actionにエラー結果を追加
            try {
                // tslint:disable-next-line:max-line-length no-single-line-block-comment
                const actionError = { ...error, ...{ name: error.name, message: error.message } };
                await repos.action.giveUp({ typeOf: action.typeOf, id: action.id, error: actionError });
            } catch (__) {
                // 失敗したら仕方ない
            }

            error = handlePecorinoError(error);
            throw error;
        }

        // アクションを完了
        debug('ending authorize action...');
        const actionResult: factory.action.authorize.award.point.IResult = {
            price: 0, // JPYとして0円
            amount: params.amount,
            pointTransaction: pointTransaction,
            pointAPIEndpoint: pointAPIEndpoint
        };

        return repos.action.complete({ typeOf: action.typeOf, id: action.id, result: actionResult });
    };
}

/**
 * Pecorino賞金承認を取り消す
 */
export function cancel(params: {
    /**
     * 取引進行者ID
     */
    agentId: string;
    /**
     * 取引ID
     */
    transactionId: string;
    /**
     * 承認アクションID
     */
    actionId: string;
}) {
    return async (repos: {
        action: ActionRepo;
        transaction: TransactionRepo;
        depositTransactionService: pecorinoapi.service.transaction.Deposit;
    }) => {
        debug('canceling pecorino authorize action...');
        const transaction = await repos.transaction.findInProgressById({
            typeOf: factory.transactionType.PlaceOrder,
            id: params.transactionId
        });

        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (transaction.agent.id !== params.agentId) {
            throw new factory.errors.Forbidden('A specified transaction is not yours.');
        }

        // まずアクションをキャンセル
        const action = await repos.action.cancel({ typeOf: factory.actionType.AuthorizeAction, id: params.actionId });
        const actionResult = <factory.action.authorize.award.point.IResult>action.result;

        // Pecorinoで取消中止実行
        await repos.depositTransactionService.cancel({
            transactionId: actionResult.pointTransaction.id
        });
    };
}
