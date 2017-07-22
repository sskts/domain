/**
 * アクションイベントファクトリー
 *
 * @namespace factory/actionEvent
 */

import ActionEventType from './actionEventType';

export interface IActionEvent {
    id: string;
    actionEventType: ActionEventType;
    occurredAt: Date;
}
