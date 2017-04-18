/**
 * LINE通知の例
 *
 * @see https://notify-bot.line.me/my/
 */

import * as request from 'request-promise-native';

request.post(
    {
        url: 'https://notify-api.line.me/api/notify',
        auth: { bearer: process.env.SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN },
        form: {
            message: 'test',
            stickerPackageId: '1',
            stickerId: '4'
        },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    }
).then((response) => {
    console.log(response);
});
