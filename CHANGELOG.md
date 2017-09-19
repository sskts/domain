# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## Unreleased
### Added
- 創作物、イベント、組織、人物、所有権、場所、注文、予約スキーマを新たに追加。
- 取引タイプを追加。
- イベントサービスを追加。
- 場所サービスを追加。
- 組織サービスを追加。
- 注文サービスを追加。

### Changed
- 注文作成取引に対するタスクに渡すデータを取引オブジェクトに変更。
- indexモジュールを再構成。
- update package [@motionpicture/gmo-service](https://www.npmjs.com/package/@motionpicture/gmo-service)
- Amazon Cognitoでの会員管理に対応
- migrate factories as @motionpicture/sskts-factory.

### Deprecated

### Removed
- 劇場、スクリーン、作品、パフォーマンススキーマを削除。
- 所有者、資産、取引スキーマを削除。
- マスターサービスを削除。

### Fixed

### Security

## v22.0.0 - 2017-07-06
### Changed
- タスクの最大試行回数フィールドを、残り試行可能回数に変更。これによって、リトライor中止を判断する際に、MongoDBへの操作に$whereオペレーターを使う必要がなくなった(indexが効くようになる)
- update package [tslint@5.5.0](https://www.npmjs.com/package/tslint)
- update package [@motionpicture/coa-service@3.3.1](https://www.npmjs.com/package/@motionpicture/coa-service)

### Security
- npmのテストコマンドに[nyc](https://www.npmjs.com/package/nyc)を導入。

## v21.0.0 - 2017-07-06
### Added
- indexモジュールから以下をエクスポート。
  - タスクファクトリー
  - タスク実行結果ファクトリー
  - タスク名ファクトリー
  - タスクステータスファクトリー

### Changed
- 取引からキューをエクスポートするサービスを、タスクをエクスポートするサービスへ変更。

### Removed
- キュー仕様からタスク仕様への移行につき、以下不要なモジュールを削除。
  - キューアダプター
  - キューファクトリー、キューグループファクトリー、キューステータスファクトリー
  - 取引キューステータスファクトリー
  - キューサービス

## v20.1.0 - 2017-07-04
### Added
- 依存パッケージである、mongoose,redis,coa-service,gmo-serviceをindexモジュールからエクスポート。

### Security
- update package [mongoose@^4.11.1](https://www.npmjs.com/package/mongoose)
- update package [sendgrid@^5.1.2](https://www.npmjs.com/package/sendgrid)
- update package [validator@^7.2.0](https://www.npmjs.com/package/validator)
- update package [snyk@^1.36.2](https://www.npmjs.com/package/snyk)
- update package [tslint-microsoft-contrib@^5.0.1](https://www.npmjs.com/package/tslint-microsoft-contrib)
- update package [typescript@^2.4.1](https://www.npmjs.com/package/typescript)

## v20.0.2 - 2017-07-04
### Changed
- MongoDBのslow queriesレポートに対応してindexを追加。

### Fixed
- タスク実行時のソート条件が間違っていたので修正。

## v20.0.1 - 2017-07-03
### Changed
- レポートサービスをタスクスキーマに合わせて調整。

## v20.0.0 - 2017-07-03
### Added
- GMOカードファクトリーに作成メソッドを追加。
- GMOカードIDファクトリーを追加。
- 開店サービスを追加。
- 劇場ウェブサイトグループをindexモジュールからエクスポート。
- GMOにて会員カードでの決済実行を可能にするために、gmo-serviceをアップデート。
- クライアントユーザーファクトリーを追加。
- タスクファクトリー、タスクネーム、タスクステータス、タスク実行結果ファクトリーを追加。
- タスクサービスを追加。
- 取引にタスク関連の属性を追加。

### Changed
- カードインターフェースに属性を追加(IDと所有者)
- 会員カード追加サービスの返却値を、有効性確認済みカードに変更。
- 取引にクライアントユーザー属性を追加し、所有者から状態属性を削除。
- 文字列固定値に全てstring enumsを使用するようにコードを変更。
- 子ファクトリーのインターフェース名をシンプル化。
- 取引からのキューエクスポートを削除し、タスクをエクスポートするように変更。また、その際にタスクリストを取引にも保管するように対応。

### Removed
- 取引ステータスからREADYを削除。
- 取引サービスから、開始準備メソッド(service.transaction.prepare)を削除。
- 取引サービスから、開始準備メソッド(service.transaction.clean)を削除。

## v19.6.1 - 2017-06-30
### Fixed
- GMO売上健康診断にて、マルチショップ対応していないために不健康と診断されるバグを修正。

## v19.6.0 - 2017-06-27
### Added
- エラーコードモジュールを追加し、indexからエクスポート。
- AlreadyInUseErrorをカスタムエラークラスとして追加。
- 会員新規登録サービスを追加。

### Changed
- 内部でハンドリングされたエラーを全てSSKTSErrorとして投げるように変更。

## v19.5.0 - 2017-06-27
### Added
- 取引サービスに、所有者を指定できる開始メソッドを追加。
- 会員サービスを追加。

### Changed
- 会員所有者インターフェースを細分化。
- interfaceをエクスポートするように、indexモジュールでのエクスポート方法を変更。
- 匿名所有者インターフェースを、会員所有者インターフェースに近づけるように拡張。

### Deprecated
- 取引サービスから、匿名所有者として取引開始するメソッドを非推奨に変更。

## v19.4.0 - 2017-06-26
### Changed
- パフォーマンス在庫状況表現を空席率(%)に変更。
- package-lock.json再作成。

## v19.3.0 - 2017-06-25
### Added
- 会員インターフェースを追加。
- 口座インターフェースを追加。
- カードインターフェースを追加。

### Changed
- ID指定取引サービスに所有者プロフィール変更メソッドを追加して、匿名所有者プロフィール更新メソッドを拡張。
- ID指定取引サービスに、カード情報保管メソッドを追加。

### Deprecated
- ID指定取引サービスの匿名所有者プロフィール更新メソッドを非推奨指定。

### Fixed
- COAのアクセストークンの有効期限切れエラーが出る問題に対して、coa-service側での対応を反映。 ([@motionpicture/coa-service@3.1.2](https://www.npmjs.com/package/@motionpicture/coa-service))
- npm@5.0.0の仕様に合わせて、スクリプトprepublishをprepublishOnlyへ変更。

### Security
- [mongoose@^4.10.7](https://github.com/Automattic/mongoose)
- [typescript@^2.4.0](https://github.com/Microsoft/TypeScript)

## v19.2.1 - 2017-06-18
### Fixed
- キューに関するフロー計測で、実行済みと中止ステータスが逆になっているバグを修正。

## v19.2.0 - 2017-06-17
### Changed
- 計測データにキューに関するフローデータを追加。

## v19.1.0 - 2017-06-16
### Changed
- 計測データに取引所要時間と金額のデータを追加。

## v19.0.0 - 2017-06-16
### Changed
- 取引スコープを拡張。開始fromと開始untilフィールドを追加。
- 取引開始の際に、取引数カウント単位を指定する代わりに、取引スコープに期間を指定するように変更。
- 計測データのインターフェースを変更。ストックデータとフローデータの2種類に分割。

### Security
- テストコードを補強。

## v18.1.0 - 2017-06-13
### Added
- 取引IDから座席予約資産移動を実行するサービスを追加。
- ファクトリーのテストコードを強化。

### Changed
- 匿名所有者として取引を開始する際の所有者作成方法をcreateコマンドに変更。万が一の所有者上書きをユニークインデックスで未然に防ぐため。

## v18.0.0 - 2017-06-11
### Changed
- レポートサービスにおいて、取引在庫数の算出にredisを使用するように変更。

## v17.0.0 - 2017-06-09
### Added
- 匿名所有者として取引を開始するサービスを追加。
- 取引スコープの概念を導入。

### Removed
- 取引開始サービス第一世代(startIfPossible)を削除。

## v16.0.1 - 2017-06-08
### Fixed
- 取引にキューエクスポートステータスフィールドが入らないバグ対応。

## v16.0.0 - 2017-06-07
### Added
- 取引数をカウントアダプターをRedisCacheで実装。
- RedisCacheを使用して取引が利用可能かどうかを確認するサービスを追加。

### Changed
- 取引開始サービスを、redisで取引数制限をチェックする仕様に変更。

### Removed
- 強制取引開始サービスは不要なので削除。

## v15.3.1 - 2017-06-07
### Security
- npm@^5.0.0の導入に伴い、package-lock.jsonを追加。

## v15.3.0 - 2017-06-06
### Added
- 劇場検索サービスを追加(検索条件は未実装)。

### Fixed
- 劇場mongooseモデルにwebsitesフィールドが不足していたので追加。

## v15.2.0 - 2017-06-06
### Added
- パフォーマンス検索サービスの結果に作品上映時間フィールドを追加。

## v15.1.1 - 2017-06-05
### Changed
- パッケージを最新にアップデート
- [tslint@^5.4.2](https://github.com/palantir/tslint)に対応

## v15.1.0 - 2017-06-05
### Added
- パフォーマンス空席状況の概念を導入。
- 在庫状況サービスを追加。
- マスターサービスのパフォーマンス検索結果に、空席状況フィールドを追加。

## v15.0.0 - 2017-05-20
### Added
- 資産に所有権認証記録が残るように、資産所有権認証記録スキーマを追加。

## v14.0.1 - 2017-05-19
### Fixed
- テストコードをtslint対応

## v14.0.0 - 2017-05-19
### Changed
- 座席予約資産に、パフォーマンス詳細情報&取引情報&認証情報のフィールドを追加。フィールド追加に伴い、影響のあるファクトリーを修正。

## v13.0.2 - 2017-05-18
### Added
- apiの認証機構や、フロントエンドアプリケーションでのイベント受信等のために、クライアントスキーマを追加。
- クライアントサイドでの事象を分析してアプリケーション改善に役立てるため、クライアントイベントスキーマを追加。

## v13.0.1 - 2017-05-17
### Added
- 言語がさらに増えた場合にも備えて、mongooseの多言語文字列スキーマを追加。

## v13.0.0 - 2017-05-17
### Added
- COA本予約にムビチケ情報を連携。
- 座席資産にムビチケ連携情報フィールドを追加。

### Changed
- [tslint](https://github.com/palantir/tslint)を^5.2.0にアップデート

## v12.3.0 - 2017-04-20
### Added
- ファーストリリース
