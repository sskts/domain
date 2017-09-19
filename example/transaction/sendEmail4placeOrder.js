/**
 * send an email for a placeOrder transaction example
 * @ignore
 */

const moment = require('moment');
const sskts = require('../../');

sskts.mongoose.connect(process.env.MONGOLAB_URI);

sskts.service.transaction.placeOrder.sendEmail(
    '59b73ec4e6b2f31f5c58097f',
    {
        sender: {
            name: 'sender name',
            email: 'noreply@example.com'
        },
        toRecipient: {
            name: 'recipient name',
            email: 'hello@motionpicture.jp'
        },
        about: 'abount',
        text: 'text'
    }
)(new sskts.repository.Task(sskts.mongoose.connection), new sskts.repository.Transaction(sskts.mongoose.connection))
    .then(async (task) => {
        console.log('task:', task);
    });