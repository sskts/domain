/**
 * テストリソース
 *
 * @ignore
 */

import * as EmailNotificationFactory from '../lib/factory/notification/email';

export namespace notification {
    export function createEmail() {
        return EmailNotificationFactory.create({
            from: 'noreply@example.net',
            to: process.env.SSKTS_DEVELOPER_EMAIL,
            subject: 'sskts-domain:test:resources:notification:email',
            content: 'sskts-domain:test:resources:notification:email'
        });
    }
}
