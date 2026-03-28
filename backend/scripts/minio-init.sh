#!/bin/sh
set -e

POLICY_NAME="nktc-app-policy"

echo "[1/5] Connecting to MinIO..."
until mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" > /dev/null 2>&1; do
  echo "  Waiting for MinIO..." && sleep 2
done

echo "[2/5] Creating bucket: $MINIO_BUCKET_NAME"
mc mb --ignore-existing "local/$MINIO_BUCKET_NAME"

echo "[3/5] Creating bucket policy: $POLICY_NAME"
printf '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:*"],"Resource":["arn:aws:s3:::%s","arn:aws:s3:::%s/*"]}]}' \
  "$MINIO_BUCKET_NAME" "$MINIO_BUCKET_NAME" > /tmp/policy.json
mc admin policy create local "$POLICY_NAME" /tmp/policy.json 2>/dev/null && \
  echo "  Policy created" || echo "  Policy already exists, skipping"

echo "[4/5] Creating app user: $MINIO_ACCESS_KEY"
mc admin user add local "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" 2>/dev/null && \
  echo "  User created" || echo "  User already exists, skipping"

echo "[5/5] Attaching policy to user"
mc admin policy attach local "$POLICY_NAME" --user "$MINIO_ACCESS_KEY" 2>/dev/null && \
  echo "  Policy attached" || echo "  Policy already attached, skipping"

echo ""
echo "MinIO setup complete"
echo "  Bucket : $MINIO_BUCKET_NAME"
echo "  User   : $MINIO_ACCESS_KEY"
