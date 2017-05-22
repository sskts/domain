# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## Unreleased
### Added

### Changed

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
