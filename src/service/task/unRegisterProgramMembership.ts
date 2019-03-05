
import { repository } from '@cinerino/domain';

import { IConnectionSettings, IOperation } from '../task';

import * as factory from '../../factory';

import * as ProgramMembershipService from '../programMembership';

/**
 * タスク実行関数
 */
export function call(data: factory.task.IData<factory.taskName.UnRegisterProgramMembership>): IOperation<void> {
    return async (settings: IConnectionSettings) => {
        // tslint:disable-next-line:no-single-line-block-comment
        /* istanbul ignore if */
        if (settings.cognitoIdentityServiceProvider === undefined) {
            throw new Error('settings.cognitoIdentityServiceProvider undefined.');
        }

        await ProgramMembershipService.unRegister(data)({
            action: new repository.Action(settings.connection),
            ownershipInfo: new repository.OwnershipInfo(settings.connection),
            task: new repository.Task(settings.connection)
        });

        // tslint:disable-next-line:no-suspicious-comment
        // TODO 会員退会は、本来会員プログラム解除とは別タスクにするべきなので、どこかで分離
        const personRepo = new repository.Person(settings.cognitoIdentityServiceProvider);
        const customer = (<factory.person.IPerson>data.agent);
        if (customer.memberOf === undefined) {
            throw new factory.errors.NotFound('params.agent.memberOf');
        }
        if (customer.memberOf.membershipNumber === undefined) {
            throw new factory.errors.NotFound('params.agent.memberOf.membershipNumber');
        }

        // Cognitoユーザを無効にする
        await personRepo.unregister({
            userPooId: <string>process.env.COGNITO_USER_POOL_ID,
            username: customer.memberOf.membershipNumber
        });
    };
}
