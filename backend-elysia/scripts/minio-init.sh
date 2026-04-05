#!/bin/sh
set -e

MINIO_HOST="${MINIO_HOST:-minio:9000}"
BUCKET="${MINIO_BUCKET_NAME:-nktc-app}"
ACCESS_KEY="${MINIO_ACCESS_KEY}"
SECRET_KEY="${MINIO_SECRET_KEY}"

echo "Waiting for MinIO to be ready..."
until mc alias set local http://${MINIO_HOST} "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" 2>/dev/null; do
  sleep 2
done

echo "Creating bucket: ${BUCKET}"
mc mb --ignore-existing "local/${BUCKET}"

echo "Setting bucket policy to public download..."
mc anonymous set download "local/${BUCKET}"

if [ -n "${ACCESS_KEY}" ] && [ -n "${SECRET_KEY}" ]; then
  echo "Creating user: ${ACCESS_KEY}"
  mc admin user add local "${ACCESS_KEY}" "${SECRET_KEY}"

  echo "Attaching readwrite policy to user: ${ACCESS_KEY}"
  mc admin policy attach local readwrite --user "${ACCESS_KEY}"
fi

echo "MinIO init complete."
