#!/usr/bin/env bash
#
# saturday-audit.sh
# サタデー・レビュー（週次データ駆動 PDCA）の生データ JSON 雛形を冪等に生成する。
#
# 観測指標は OPERATION_MANUAL.md §4b.4「効果検証（サタデー・レビュー上の確認指標）」
# に定義された 3 指標を Source of Truth とする：
#   1) early_cookie_burn 発火率 / ai_session_start            （期待値 50%+ / 異常閾値 30%-）
#   2) early_cookie_burn -> ai_affiliate_click 同一セッション率（期待値 30%+）
#   3) ai_affiliate_click 全体の同一セッション完結率           （期待値 70%+）
#
# 本スクリプトは雛形配置フェーズ：実値は GA4 (G-GG7JV9MJRW / G-5HYV772ER9) からの
# 取得を別途実装する。本ファイルはその受け皿となる JSON 構造のみを担保する。
#
# Usage:
#   bash management/scripts/saturday-audit.sh                # 今日の ISO 週で生成
#   bash management/scripts/saturday-audit.sh 2026-w21       # 週を明示
#   bash management/scripts/saturday-audit.sh 2026-w21 --force # 既存ファイルを上書き

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

WEEK_ARG="${1:-}"
FORCE="${2:-}"

if [[ -z "${WEEK_ARG}" ]]; then
  WEEK_ARG="$(date +%Y-w%V)"
fi

if [[ ! "${WEEK_ARG}" =~ ^[0-9]{4}-w[0-9]{2}$ ]]; then
  echo "ERROR: week argument must match YYYY-wWW (e.g. 2026-w21); got '${WEEK_ARG}'" >&2
  exit 2
fi

OUT_DIR="${REPO_ROOT}/management/_metrics/${WEEK_ARG}"
OUT_FILE="${OUT_DIR}/saturday-raw-data.json"
GENERATED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

mkdir -p "${OUT_DIR}"

if [[ -f "${OUT_FILE}" && "${FORCE}" != "--force" ]]; then
  echo "SKIP: ${OUT_FILE} already exists (pass --force to overwrite)"
  exit 0
fi

cat > "${OUT_FILE}" <<JSON
{
  "schema_version": "1.0.0",
  "week": "${WEEK_ARG}",
  "generated_at": "${GENERATED_AT}",
  "source_of_truth": "management/OPERATION_MANUAL.md §4b.4",
  "ga4_properties": [
    "G-GG7JV9MJRW",
    "G-5HYV772ER9"
  ],
  "indicators": {
    "early_cookie_burn_rate": {
      "definition": "early_cookie_burn / ai_session_start",
      "expected_min": 0.50,
      "anomaly_threshold": 0.30,
      "observed": null,
      "samples": {
        "ai_session_start": null,
        "early_cookie_burn": null
      }
    },
    "early_cookie_to_affiliate_same_session": {
      "definition": "same-session( early_cookie_burn -> ai_affiliate_click )",
      "expected_min": 0.30,
      "observed": null,
      "samples": {
        "early_cookie_burn": null,
        "ai_affiliate_click_same_session": null
      }
    },
    "affiliate_click_same_session_completion": {
      "definition": "same-session completion rate of ai_affiliate_click",
      "expected_min": 0.70,
      "observed": null,
      "samples": {
        "ai_affiliate_click_total": null,
        "ai_affiliate_click_same_session": null
      }
    }
  },
  "search_console": {
    "properties": [],
    "snapshot": null
  },
  "notes": [
    "本ファイルは saturday-audit.sh による雛形。GA4 / Search Console からの実値投入は別フェーズ。",
    "observed フィールドが null のまま土曜レビューに突入した場合は §4b.4 のフォールバック判断（CSO 手動）に従う。"
  ]
}
JSON

echo "OK: wrote ${OUT_FILE}"
