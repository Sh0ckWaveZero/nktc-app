#!/bin/sh
set -e

MINIO_HOST="nktc-minio:9000"
BUCKET="${MINIO_BUCKET_NAME:-nktc-app}"

echo "Waiting for MinIO to be ready..."
until mc alias set local http://${MINIO_HOST} "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" 2>/dev/null; do
  sleep 2
done

echo "Creating bucket: ${BUCKET}"
mc mb --ignore-existing "local/${BUCKET}"

echo "Setting bucket policy to public download..."
mc anonymous set download "local/${BUCKET}"

echo "MinIO init complete."
