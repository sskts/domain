import { repository } from '@cinerino/domain';

import { IConnectionSettings, IOperation } from '../task';

import * as factory from '../../factory';

import * as ProgramMembershipService from '../programMembership';

/**
 * タスク実行関数
 */
export function call(data: factory.task.IData<factory.taskName.RegisterProgramMembership>): IOperation<void> {
    return async (settings: IConnectionSettings) => {
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (settings.redisClient === undefined) {
            throw new Error('settings.redisClient undefined.');
        }
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (settings.cognitoIdentityServiceProvider === undefined) {
            throw new Error('settings.cognitoIdentityServiceProvider undefined.');
        }

        await ProgramMembershipService.register(data)({
            action: new repository.Action(settings.connection),
            orderNumber: new repository.OrderNumber(settings.redisClient),
            seller: new repository.Seller(settings.connection),
            ownershipInfo: new repository.OwnershipInfo(settings.connection),
            person: new repository.Person(settings.cognitoIdentityServiceProvider),
            programMembership: new repository.ProgramMembership(settings.connection),
            registerActionInProgressRepo: new repository.action.RegisterProgramMembershipInProgress(settings.redisClient),
            transaction: new repository.Transaction(settings.connection),
            depositService: settings.depositService
        });
    };
}
