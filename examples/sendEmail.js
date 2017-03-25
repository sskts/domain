"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * メールを送信する
 *
 * @ignore
 */
const sskts = require("../lib/index");
const notification = sskts.factory.notification.email.create({
    from: 'noreply@example.net',
    to: 'ilovegadd@gmail.com',
    subject: 'test subject',
    // tslint:disable-next-line:no-multiline-string
    content: `
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
`
});
sskts.service.notification.sendEmail(notification)()
    .then(() => {
    // tslint:disable-next-line:no-console
    console.log('sent');
})
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
