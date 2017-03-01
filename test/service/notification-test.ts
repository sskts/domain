// tslint:disable-next-line:missing-jsdoc
import * as sskts from '../../lib/index';

describe('notification service', () => {
    it('send an email', async () => {
        // tslint:disable-next-line:no-multiline-string
        const content = `
テスト 購入 様\n
\n
-------------------------------------------------------------------\n
この度はご購入いただき誠にありがとうございます。\n
\n
※チケット発券時は、自動発券機に下記チケットQRコードをかざしていただくか、購入番号と電話番号を入力していただく必要があります。\n
-------------------------------------------------------------------\n
\n
◆購入番号 ：12345\n
◆電話番号 ：09012345678\n
◆合計金額 ：1300円\n
\n
※このアドレスは送信専用です。返信はできませんのであらかじめご了承下さい。\n
-------------------------------------------------------------------\n
シネマサンシャイン\n
http://www.cinemasunshine.co.jp/\n
-------------------------------------------------------------------\n
`;
        const notification = sskts.model.Notification.createEmail({
            from: 'noreply@localhost',
            to: 'hello@motionpicture.jp',
            subject: 'test subject',
            content: content
        });

        await sskts.service.notification.sendEmail(notification)();
    });
});
