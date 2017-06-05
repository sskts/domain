# 佐々木興行ドメインライブラリ for Node.js

佐々木興行のサービスをnode.jsで簡単に使用するためのパッケージを提供します。

# Features

# Getting Started

## Install

```shell
npm install @motionpicture/sskts-domain
```

## Required environment variables
```shell
set NODE_ENV=**********環境名**********
set SENDGRID_API_KEY=**********sendgrid api key**********
set GMO_ENDPOINT=**********gmo apiのエンドポイント**********
set COA_ENDPOINT=**********coa apiのエンドポイント**********
set COA_REFRESH_TOKEN=**********coa apiのリフレッシュトークン**********
set SSKTS_DEVELOPER_EMAIL=**********本apiで使用される開発者メールアドレス**********
set SSKTS_DEVELOPER_LINE_NOTIFY_ACCESS_TOKEN=**********開発者へのLINE通知に必要なアクセストークン**********
```

only for test  
```shell
set TEST_REDIS_HOST=**********テスト時に使用するredis情報**********
set TEST_REDIS_PORT=**********テスト時に使用するredis情報**********
set TEST_REDIS_KEY=**********テスト時に使用するredis情報**********
```

## Usage

```Javascript
var sskts = require('@motionpicture/sskts-domain');
```


## Code Samples

コードサンプルは./examplesにあります。

## JsDoc

`npm run jsdoc`でjsdocを作成できます。./docsに出力されます。

## Test

`npm test`

[mocha](https://mochajs.org/)
[istanbul](https://istanbul.js.org/)


# License
UNLICENSED
