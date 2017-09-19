/**
 * メールを送信する
 * @ignore
 */

const sskts = require('../');

const emailMessage = sskts.factory.creativeWork.message.email.create({
    identifier: 'identifier',
    sender: {
        name: 'sskts-domain sample',
        email: 'noreply@example.com',
    },
    toRecipient: {
        name: 'test resipient name',
        email: 'hello@motionpicture.jp',
    },
    about: 'test subject',
    text: `test text
test text
test text
`
});

sskts.service.notification.sendEmail(emailMessage)()
    .then(() => {
        console.log('sent');
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
