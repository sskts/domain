<img src="https://motionpicture.jp/images/common/logo_01.svg" alt="motionpicture" title="motionpicture" align="right" height="56" width="98"/>

# SSKTS Domain Library for Node.js

[![npm (scoped)](https://img.shields.io/npm/v/@motionpicture/sskts-domain.svg)](https://www.npmjs.com/package/@motionpicture/sskts-domain)
[![CircleCI](https://circleci.com/gh/motionpicture/sskts-domain.svg?style=svg)](https://circleci.com/gh/motionpicture/sskts-domain)
[![Coverage Status](https://coveralls.io/repos/github/motionpicture/sskts-domain/badge.svg?branch=master)](https://coveralls.io/github/motionpicture/sskts-domain?branch=master)
[![Dependency Status](https://img.shields.io/david/motionpicture/sskts-domain.svg)](https://david-dm.org/motionpicture/sskts-domain)
[![Known Vulnerabilities](https://snyk.io/test/github/motionpicture/sskts-domain/badge.svg)](https://snyk.io/test/github/motionpicture/sskts-domain)
[![npm](https://img.shields.io/npm/dm/@motionpicture/sskts-domain.svg)](https://nodei.co/npm/@motionpicture/sskts-domain/)

SSKTSのバックエンドサービスをnode.jsで簡単に使用するためのパッケージを提供します。

## Table of contents

* [Usage](#usage)
* [Code Samples](#code-samples)
* [License](#license)

## Usage

```shell
npm install @motionpicture/sskts-domain
```

### Environment variables

| Name                                       | Required | Value          | Purpose                |
|--------------------------------------------|----------|----------------|------------------------|
| `DEBUG`                                    | false    | sskts-domain:* | Debug                  |
| `NODE_ENV`                                 | true     |                | environment name       |
| `MONGOLAB_URI`                             | true     |                | MongoDB connection URI |
| `SENDGRID_API_KEY`                         | true     |                | SendGrid API Key       |
| `GMO_ENDPOINT`                             | true     |                | GMO API endpoint       |
| `GMO_SITE_ID`                              | true     |                | GMO SiteID             |
| `GMO_SITE_PASS`                            | true     |                | GMO SitePass           |
| `COA_ENDPOINT`                             | true     |                | COA API endpoint       |
| `COA_REFRESH_TOKEN`                        | true     |                | COA API refresh token  |
| `SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN` | true     |                | 開発者通知用LINEアクセストークン     |
| `WAITER_SECRET`                            | true     |                | WAITER許可証トークン秘密鍵       |
| `WAITER_PASSPORT_ISSUER`                   | true     |                | WAITER許可証発行者           |
| `ORDER_INQUIRY_ENDPOINT`                   | true     |                | 注文照会エンドポイント            |

### Search individual screening events sample

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

sskts.service.offer.searchIndividualScreeningEvents({
    superEventLocationIdentifiers:['MovieTheater-118'],
    startFrom: new Date(),
    startThrough: new Date(),
})({
    event: eventRepo,
    itemAvailability: itemAvailabilityRepo
})
    .then((events) => {
        console.log('events:', events);
    });
```

## Code Samples

Code sample are [here](https://github.com/motionpicture/sskts-domain/tree/master/example).

## License

ISC
