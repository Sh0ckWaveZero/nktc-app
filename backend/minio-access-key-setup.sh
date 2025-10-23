#!/bin/bash

# MinIO Access Key Setup Script for NKTC Backend
# อัปเดตเมื่อ: $(date)
# ตำแหน่ง: backend/minio-access-key-setup.sh

echo "🚀 กำลังตั้งค่า MinIO Access Key สำหรับ NKTC Backend..."

# โหลด environment variables จากไฟล์ .env ถ้ามี
if [ -f ".env" ]; then
    echo "📄 กำลังอ่านค่าการตั้งค่าจากไฟล์ .env..."
    source .env
else
    echo "⚠️ ไม่พบไฟล์ .env กำลังใช้ค่าดีฟอลต์..."
    echo "💡 คัดลอกจากไฟล์ .env.example เพื่อสร้างไฟล์ .env"
fi

# กำหนดค่าการเชื่อมต่อ MinIO จาก environment variables หรือค่าเริ่มต้น
MINIO_HOST="${MINIO_ENDPOINT:-localhost}"
MINIO_PORT="${MINIO_PORT:-9000}"
MINIO_ROOT_USER="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_ROOT_PASSWORD="${MINIO_SECRET_KEY:-minioadmin}"

echo "📍 MinIO Server: http://${MINIO_HOST}:${MINIO_PORT}"
echo "👤 Username: ${MINIO_ROOT_USER}"
echo "🏷️ Bucket: ${MINIO_BUCKET_NAME:-nktc-uploads}"
echo "🔒 SSL: ${MINIO_USE_SSL:-false}"

# ตรวจสอบว่า minio client (mc) ติดตั้งหรือไม่
if ! command -v mc &> /dev/null; then
    echo "❌ ไม่พบคำสั่ง mc (MinIO Client)"
    echo "📦 กรุณาติดตั้ง MinIO Client ก่อน:"
    echo "   curl -O https://dl.min.io/client/mc/release/linux-amd64/mc"
    echo "   chmod +x mc"
    echo "   sudo mv mc /usr/local/bin/"
    exit 1
fi

echo "✅ พบ MinIO Client แล้ว"

# ตรวจสอบว่า MinIO server กำลังรันอยู่หรือไม่
echo "🔍 กำลังตรวจสอบสถานะ MinIO server..."
if curl -f "http://${MINIO_HOST}:${MINIO_PORT}/minio/health/live" &>/dev/null; then
    echo "✅ MinIO server กำลังรันอยู่ที่ ${MINIO_HOST}:${MINIO_PORT}"
else
    echo "⚠️ ไม่สามารถเชื่อมต่อ MinIO server ได้"
    echo "💡 กรุณาเริ่ม MinIO server ก่อน:"
    echo "   docker-compose -f docker-compose-local.yml up minio -d"
    echo "   หรือ"
    echo "   docker-compose -f docker-compose.yml up minio -d"
    exit 1
fi

# ตั้งค่า alias สำหรับ MinIO server
echo "🔗 กำลังตั้งค่า alias 'test' สำหรับ MinIO server..."
mc alias set test http://${MINIO_HOST}:${MINIO_PORT} ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}

if [ $? -eq 0 ]; then
    echo "✅ ตั้งค่า alias สำเร็จแล้ว"

    # สร้าง access key ใหม่
    echo "🔑 กำลังสร้าง Access Key ใหม่..."
    mc admin accesskey create test/

    if [ $? -eq 0 ]; then
        echo "✅ สร้าง Access Key สำเร็จแล้ว!"
        echo ""
        echo "📋 คำสั่งที่ใช้:"
        echo "   mc alias set test http://${MINIO_HOST}:${MINIO_PORT} ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}"
        echo "   mc admin accesskey create test/"
        echo ""
        echo "🔍 ตรวจสอบ Access Keys ที่มีอยู่:"
        echo "   mc admin accesskey list test/"
        echo ""
        echo "🎯 สรุปข้อมูลการเชื่อมต่อ MinIO:"
        echo "   - Endpoint: ${MINIO_HOST}:${MINIO_PORT}"
        echo "   - Root User: ${MINIO_ROOT_USER}"
        echo "   - Bucket: ${MINIO_BUCKET_NAME:-nktc-uploads}"
        echo "   - SSL: ${MINIO_USE_SSL:-false}"
        echo ""
        echo "📁 ตำแหน่งสคริปต์: backend/minio-access-key-setup.sh"
    else
        echo "❌ ไม่สามารถสร้าง Access Key ได้"
        exit 1
    fi
else
    echo "❌ ไม่สามารถตั้งค่า alias ได้"
    echo "💡 กรุณาตรวจสอบข้อมูลการเชื่อมต่อ MinIO:"
    echo "   - Host: ${MINIO_HOST}:${MINIO_PORT}"
    echo "   - Username: ${MINIO_ROOT_USER}"
    echo "   - Password: [HIDDEN]"
    echo ""
    echo "🔧 วิธีแก้ไข:"
    echo "   1. ตรวจสอบว่า MinIO server กำลังรันอยู่ที่ ${MINIO_HOST}:${MINIO_PORT}"
    echo "   2. ตรวจสอบ username/password ในไฟล์ .env"
    echo "   3. ตรวจสอบว่าไฟร์วอลล์เปิดพอร์ต ${MINIO_PORT}"
    exit 1
fi
