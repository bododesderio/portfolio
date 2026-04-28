#!/usr/bin/env bash
#
# Database backup script for portfolio PostgreSQL.
# Usage: ./scripts/backup.sh
#   or:  pnpm db:backup
#
# Uses DATABASE_URL from environment, or defaults to Docker container.
# Keeps the last 7 backups and prunes older ones.

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP_LAST="${KEEP_LAST:-7}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
FILENAME="portfolio_backup_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# Extract connection details from DATABASE_URL if set
if [ -n "${DATABASE_URL:-}" ]; then
  echo "Using DATABASE_URL for backup..."
  pg_dump "$DATABASE_URL" | gzip > "${BACKUP_DIR}/${FILENAME}"
else
  # Default: use Docker container
  CONTAINER="${DB_CONTAINER:-bodo_db_prod}"
  DB_NAME="${POSTGRES_DB:-portfolio}"
  DB_USER="${POSTGRES_USER:-portfolio}"

  echo "Using Docker container '${CONTAINER}' for backup..."
  docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "${BACKUP_DIR}/${FILENAME}"
fi

echo "Backup created: ${BACKUP_DIR}/${FILENAME}"

# Prune old backups beyond KEEP_LAST
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/portfolio_backup_*.sql.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt "$KEEP_LAST" ]; then
  DELETE_COUNT=$((BACKUP_COUNT - KEEP_LAST))
  ls -1t "${BACKUP_DIR}"/portfolio_backup_*.sql.gz | tail -n "$DELETE_COUNT" | xargs rm -f
  echo "Pruned ${DELETE_COUNT} old backup(s). Keeping last ${KEEP_LAST}."
fi

echo "Done. Total backups: $(ls -1 "${BACKUP_DIR}"/portfolio_backup_*.sql.gz 2>/dev/null | wc -l)"
