# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-XX

### Added
- **タイプ別画面**：新しい「タイプ別」メニュー項目を追加
  - きのみタブ：きのみごとにポケモンを表形式で表示
  - 食材タブ：きのみ×食材のマトリックス表でポケモンを表示、A/B/Cフィルター対応
  - スキルタブ：きのみ×スキル種別(minorclass)のマトリックス表でポケモンを表示
  - 進化フィルター（全て/最終進化のみ/たねのみ）対応
  - スクリーンショット・共有機能（出現フィールドと同様）

### Changed
- ポケモンカードの表示制御を改善（名前表示/非表示、アイコン位置調整）
- マトリックス表のレイアウトを最適化（2列グリッド、コンパクト表示）

### Fixed
- 厳選管理画面でのアイコン位置表示問題を修正
- 各タブ間でのUI一貫性を改善

## [1.0.0] - 2024-XX-XX

### Added
- 初期リリース
- 厳選管理機能
- 出現フィールド表示
- アメ計算機能