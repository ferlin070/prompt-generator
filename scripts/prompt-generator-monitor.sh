#!/bin/bash
# prompt-generator-monitor.sh
# Monitoring: uptime + disk + DB + tunnel + backup freshness
# Cron: setiap 15 minit. Alert Telegram hanya bila status berubah.

set -uo pipefail

BOT_TOKEN="8882812694:AAF6jTT1FQCuFPzHSLm7VANSe5YIoVQXXCc"
CHAT_ID="8275355102"
STATE_FILE="/var/run/pg-monitor-state"
APP_URL="https://prompt.nakhodacloud.top"
LOG_TAG="[pg-monitor]"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $LOG_TAG $1"; }

send_telegram() {
  curl -s --max-time 10 "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    -d chat_id="${CHAT_ID}" -d text="$1" >/dev/null 2>&1 || true
}

get_state() { cat "$STATE_FILE" 2>/dev/null || echo "unknown"; }
set_state() { echo "$1" > "$STATE_FILE"; }

check_http() {
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$APP_URL" 2>/dev/null || echo "000")
  [ "$code" = "200" ]
}

check_pm2() {
  pm2 jlist 2>/dev/null | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
  try{const j=JSON.parse(d);const pg=j.find(p=>p.name==='prompt-generator');
  const pt=j.find(p=>p.name==='prompt-tunnel');
  process.exit(pg&&pg.pm2_env.status==='online'&&pt&&pt.pm2_env.status==='online'?0:1)}
  catch{process.exit(1)}})" 2>/dev/null
}

check_db() {
  cd /opt/prompt-generator && node -e "
import('pg').then(({default:pg})=>{
  const c=new pg.Client({connectionString:process.env.POSTGRES_URL||'postgres://prompt_gen_app:PgApp2026Secure!@192.168.1.218:5433/prompt_generator',ssl:false});
  c.connect().then(()=>c.query('SELECT 1')).then(()=>{process.exit(0)}).catch(()=>{process.exit(1)});
}).catch(()=>process.exit(1))" 2>/dev/null
}

check_disk() {
  usage=$(df / | awk 'NR==2{gsub(/%/,"");print $5}')
  [ "$usage" -lt 85 ]
}

check_backup() {
  latest=$(find /var/backups/prompt-generator-db -name "pgdb-*.sql.gz" -mtime -1 2>/dev/null | head -1)
  [ -n "$latest" ]
}

PREV=$(get_state)

if check_http && check_pm2 && check_db && check_disk; then
  NOW="ok"
  ISSUES=""
else
  ISSUES=""
  check_http || ISSUES="${ISSUES}❌ Website DOWN (HTTP fail)
"
  check_pm2 || ISSUES="${ISSUES}❌ PM2 process bermasalah
"
  check_db || ISSUES="${ISSUES}❌ Database tidak boleh connect
"
  check_disk || ISSUES="${ISSUES}❌ Disk >85% penuh
"
  NOW="down"
fi

if [ "$NOW" != "$PREV" ]; then
  if [ "$NOW" = "ok" ]; then
    send_telegram "✅ PromptBiz Pro PULIH — semua sistem berjalan normal. $(date '+%H:%M:%S')"
  else
    send_telegram "🚨 PromptBiz Pro BERMASALAH:
${ISSUES}$(date '+%H:%M:%S')"
  fi
  set_state "$NOW"
  log "Status berubah: $PREV → $NOW"
fi

# Backup freshness check — alert harian jika backup >24 jam
if ! check_backup; then
  if [ "$(cat /var/run/pg-backup-alert 2>/dev/null)" != "$(date +%Y-%m-%d)" ]; then
    send_telegram "⚠️ Backup DB prompt-generator >24 jam tiada! Semak cron 3:30AM. $(date '+%Y-%m-%d')"
    date +%Y-%m-%d > /var/run/pg-backup-alert
  fi
fi

log "Status: $NOW"
