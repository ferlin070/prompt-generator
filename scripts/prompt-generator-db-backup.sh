#!/bin/bash
# prompt-generator-db-backup.sh
# Backup database prompt_generator (CT110 Supabase) ke CT101 (storage01)
# Pattern sama seperti vault sync.sh
#
# Usage: ./prompt-generator-db-backup.sh [--verify]

set -euo pipefail

DB_CT="110"
DB_CONTAINER="supabase-db"
DB_USER="supabase_admin"
DB_NAME="prompt_generator"
TARGET_CT="101"
TARGET_DIR="/backups/prompt-generator-db"
LOCAL_DIR="/var/backups/prompt-generator-db"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)
FILENAME="pgdb-${TIMESTAMP}.sql.gz"
LOG_TAG="[pgdb-backup]"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $LOG_TAG $1"; }

send_telegram() {
  local message="$1"
  local chat_id="8275355102"
  local bot_token
  bot_token=$(grep -oP 'TELEGRAM_BOT_TOKEN=\K.*' /root/.env 2>/dev/null || echo "")
  if [ -n "$bot_token" ]; then
    curl -s -X POST "https://api.telegram.org/bot${bot_token}/sendMessage" \
      -d chat_id="${chat_id}" -d text="${message}" >/dev/null 2>&1 || true
  fi
}

mkdir -p "${LOCAL_DIR}"

log "Mula backup database ${DB_NAME}..."

# Step 1: pg_dump dari CT110 + compress
log "Step 1: pg_dump dari CT${DB_CT}..."
pct exec "${DB_CT}" -- docker exec "${DB_CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --no-owner --no-privileges 2>/dev/null | gzip > "${LOCAL_DIR}/${FILENAME}"

DUMP_SIZE=$(stat -c%s "${LOCAL_DIR}/${FILENAME}" 2>/dev/null || echo 0)

if [ "${DUMP_SIZE}" -lt 1000 ]; then
  log "RALAT: Dump terlalu kecil (${DUMP_SIZE} bytes) - kemungkinan gagal!"
  send_telegram "RALAT: Backup DB prompt-generator gagal! Dump size: ${DUMP_SIZE} bytes pada $(date)"
  rm -f "${LOCAL_DIR}/${FILENAME}"
  exit 1
fi

log "Step 1 selesai: ${FILENAME} ($((DUMP_SIZE / 1024)) KB)"

# Step 2: Verify dump mengandungi struktur penting
log "Step 2: Verify kandungan dump..."
TABLE_COUNT=$(zcat "${LOCAL_DIR}/${FILENAME}" | grep -c "CREATE TABLE" || true)

if [ "${TABLE_COUNT}" -lt 8 ]; then
  log "RALAT: Dump tidak sah - hanya ${TABLE_COUNT} tables (jangkaan: 9)!"
  send_telegram "RALAT: Backup DB prompt-generator gagal! Hanya ${TABLE_COUNT} tables pada $(date)"
  rm -f "${LOCAL_DIR}/${FILENAME}"
  exit 1
fi

log "Step 2 selesai: ${TABLE_COUNT} tables ditemui"

# Step 3: Push ke CT101
log "Step 3: Push ke CT${TARGET_CT}..."
if ! pct status "${TARGET_CT}" 2>/dev/null | grep -q running; then
  log "AMARAN: CT${TARGET_CT} tidak berjalan - backup local sahaja"
else
  pct exec "${TARGET_CT}" -- mkdir -p "${TARGET_DIR}" 2>/dev/null || true
  pct push "${TARGET_CT}" "${LOCAL_DIR}/${FILENAME}" "${TARGET_DIR}/${FILENAME}"
  log "Step 3 selesai: pushed ke CT${TARGET_CT}:${TARGET_DIR}/${FILENAME}"
fi

# Step 4: Retention - padam backup lama (> RETENTION_DAYS)
log "Step 4: Cleanup backup lama (> ${RETENTION_DAYS} hari)..."
find "${LOCAL_DIR}" -name "pgdb-*.sql.gz" -mtime +"${RETENTION_DAYS}" -delete 2>/dev/null || true
pct exec "${TARGET_CT}" -- find "${TARGET_DIR}" -name "pgdb-*.sql.gz" -mtime +"${RETENTION_DAYS}" -delete 2>/dev/null || true

LOCAL_COUNT=$(ls -1 "${LOCAL_DIR}"/pgdb-*.sql.gz 2>/dev/null | wc -l || echo "0")
REMOTE_COUNT=$(pct exec "${TARGET_CT}" -- sh -c "ls -1 ${TARGET_DIR}/pgdb-*.sql.gz 2>/dev/null | wc -l" 2>/dev/null || echo "0")

log "Backup selesai!"
log "  Local: ${LOCAL_DIR} (${LOCAL_COUNT} backup)"
log "  CT${TARGET_CT}: ${TARGET_DIR} (${REMOTE_COUNT} backup)"
log "  Saiz terkini: $((DUMP_SIZE / 1024)) KB, ${TABLE_COUNT} tables"

exit 0
