<img src="https://motionpicture.jp/images/common/logo_01.svg" alt="motionpicture" title="motionpicture" align="right" height="56" width="98"/>

# SSKTS Domain Library for Node.js

[![CircleCI](https://circleci.com/gh/motionpicture/sskts-domain.svg?style=svg&circle-token=26025d5a2df8ffd61173c72bbc1257fc6a2ad66d)](https://circleci.com/gh/motionpicture/sskts-domain)

SSKTSのバックエンドサービスをnode.jsで簡単に使用するためのパッケージを提供します。


## Table of contents

* [Usage](#usage)
* [Code Samples](#code-samples)
* [Jsdoc](#jsdoc)
* [License](#license)


## Usage

```shell
npm install @motionpicture/sskts-domain
```

### Environment variables

| Name                                       | Required | Value          | Purpose                  |
| ------------------------------------------ | -------- | -------------- | ------------------------ |
| `DEBUG`                                    | false    | sskts-domain:* | Debug                    |
| `NPM_TOKEN`                                | true     |                | NPM auth token           |
| `NODE_ENV`                                 | true     |                | environment name         |
| `MONGOLAB_URI`                             | true     |                | MongoDB connection URI   |
| `SENDGRID_API_KEY`                         | true     |                | SendGrid API Key         |
| `GMO_ENDPOINT`                             | true     |                | GMO API endpoint         |
| `GMO_SITE_ID`                              | true     |                | GMO SiteID               |
| `GMO_SITE_PASS`                            | true     |                | GMO SitePass             |
| `COA_ENDPOINT`                             | true     |                | COA API endpoint         |
| `COA_REFRESH_TOKEN`                        | true     |                | COA API refresh token    |
| `SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN` | true     |                | 開発者通知用LINEアクセストークン |
| `WAITER_SECRET`                            | true     |                | WAITER許可証トークン秘密鍵   |

### 上映イベント検索サンプル

```js
const sskts = require('@motionpicture/sskts-domain');

sskts.mongoose.connect('MONGOLAB_URI');
const redisClient = sskts.redis.createClient({
    host: '*****',
    port: 6380,
    password: '*****',
    tls: { servername: 6380 }
});

const eventRepo = new sskts.repository.Event(sskts.mongoose.connection);
const itemAvailabilityRepo = new sskts.repository.itemAvailability.IndividualScreeningEvent(redisClient);

sskts.service.event.searchIndividualScreeningEvents({
    superEventLocationIdentifiers:['MovieTheater-118'],
    startFrom: new Date(),
    startThrough: new Date(),
})(eventRepo, itemAvailabilityRepo)
    .then((events) => {
        console.log('events:', events);
    });
```

## Code Samples

コードサンプルは [example](https://github.com/motionpicture/sskts-domain/tree/master/example) にあります。

## Jsdoc

`npm run doc`でjsdocを作成できます。./docに出力されます。

## License

UNLICENSED
