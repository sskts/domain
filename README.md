# Cinema Sunshine Domain Library for Node.js

[![npm (scoped)](https://img.shields.io/npm/v/@motionpicture/sskts-domain.svg)](https://www.npmjs.com/package/@motionpicture/sskts-domain)
[![CircleCI](https://circleci.com/gh/cinemasunshine/domain.svg?style=svg)](https://circleci.com/gh/cinemasunshine/domain)
[![Coverage Status](https://coveralls.io/repos/github/cinemasunshine/domain/badge.svg?branch=master)](https://coveralls.io/github/cinemasunshine/domain?branch=master)
[![Dependency Status](https://img.shields.io/david/motionpicture/sskts-domain.svg)](https://david-dm.org/motionpicture/sskts-domain)
[![Known Vulnerabilities](https://snyk.io/test/github/cinemasunshine/domain/badge.svg)](https://snyk.io/test/github/cinemasunshine/domain)
[![npm](https://img.shields.io/npm/dm/@motionpicture/sskts-domain.svg)](https://nodei.co/npm/@motionpicture/sskts-domain/)

CinemaSunshineのバックエンドサービスをNode.jsで簡単に使用するためのパッケージを提供します。

## Table of contents

* [Usage](#usage)
* [Code Samples](#code-samples)
* [License](#license)

## Usage

```shell
npm install @motionpicture/sskts-domain
```

### Environment variables

| Name                                 | Required | Value          | Purpose                      |
| ------------------------------------ | -------- | -------------- | ---------------------------- |
| `DEBUG`                              | false    | sskts-domain:* | Debug                        |
| `NODE_ENV`                           | true     |                | environment name             |
| `MONGOLAB_URI`                       | true     |                | MongoDB connection URI       |
| `SENDGRID_API_KEY`                   | true     |                | SendGrid API Key             |
| `GMO_ENDPOINT`                       | true     |                | GMO API endpoint             |
| `GMO_SITE_ID`                        | true     |                | GMO SiteID                   |
| `GMO_SITE_PASS`                      | true     |                | GMO SitePass                 |
| `COA_ENDPOINT`                       | true     |                | COA API endpoint             |
| `COA_REFRESH_TOKEN`                  | true     |                | COA API refresh token        |
| `LINE_NOTIFY_URL`                    | true     |                | LINE Notify URL              |
| `DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN` | true     |                | LINE Notify アクセストークン |
| `WAITER_SECRET`                      | true     |                | WAITER許可証トークン秘密鍵   |
| `WAITER_PASSPORT_ISSUER`             | true     |                | WAITER許可証発行者           |
| `ORDER_INQUIRY_ENDPOINT`             | true     |                | 注文照会エンドポイント       |

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

Code sample are [here](https://github.com/cinemasunshine/domain/tree/master/example).

## License

ISC
