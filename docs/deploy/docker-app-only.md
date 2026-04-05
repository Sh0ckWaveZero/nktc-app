# Docker App-Only Deployment

คู่มือนี้ใช้สำหรับ deploy เฉพาะ `frontend` และ `backend-elysia` โดยไม่เปิด `backend` ออก public และไม่ bundle `Postgres`, `MinIO`, `Cloudflare Tunnel` เข้า Compose stack นี้

## Overview

- Public ingress มีแค่ `frontend` ผ่าน Cloudflare Tunnel
- `backend` อยู่ใน internal Docker network เท่านั้น
- `Postgres`, `MinIO`, `Cloudflare Tunnel` แยกติดตั้งคนละส่วน
- Production database ใช้ `prisma migrate deploy`

## Topology

- Production หลัก: Intel x86 RAM 8GB
- Secondary / standby / test: Raspberry Pi 4 RAM 4GB (64-bit)
- Public ingress: Cloudflare Tunnel -> `http://localhost:3000`
- Backend: internal Docker network only
- Shared Docker network name: `app-net`

## โครงสร้างไฟล์ที่ใช้

- `deploy/compose.app.yml`
- `deploy/compose.x86.override.yml`
- `deploy/compose.pi4.override.yml`
- `deploy/deploy.sh`
- `deploy/frontend.Dockerfile`
- `deploy/backend-elysia.Dockerfile`
- `deploy/env/frontend.env.example`
- `deploy/env/backend.env.example`

## 1. เตรียม env files

สร้าง network กลางก่อนหนึ่งครั้ง:

```bash
docker network create app-net
```

ถ้ามีอยู่แล้ว Docker จะตอบว่า network ซ้ำ ซึ่งข้ามได้

```bash
cp deploy/env/frontend.env.example deploy/env/frontend.env
cp deploy/env/backend.env.example deploy/env/backend.env
```

ปรับค่าจริงให้ครบ โดยเฉพาะ:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_BASE_PATH`
- `BACKEND_INTERNAL_URL`
- `DATABASE_URL`
- `MINIO_*`
- `JWT_*`

ตัวอย่างค่าที่สำคัญ:

```env
# deploy/env/frontend.env
NEXT_PUBLIC_APP_URL=https://app.example.com
NEXT_PUBLIC_API_BASE_PATH=/api/backend
BACKEND_INTERNAL_URL=http://backend:3001/api
NEXT_PUBLIC_EDUCATION_YEARS=2567
```

```env
# deploy/env/backend.env
PORT=3001
DATABASE_URL=postgresql://db_user:db_password@db.example.com:5432/edu?schema=public&connection_limit=20&pool_timeout=0
MINIO_ENDPOINT=minio.example.com
MINIO_PORT=9000
MINIO_USE_SSL=true
MINIO_BUCKET_NAME=nktc-app
MINIO_ACCESS_KEY=replace-me
MINIO_SECRET_KEY=replace-me
JWT_SECRET=replace-me
JWT_REFRESH_SECRET=replace-me
JWT_REFRESH_EXPIRES_IN=6000s
```

## 2. Build image บน Intel x86

```bash
docker compose -f deploy/compose.app.yml -f deploy/compose.x86.override.yml build
```

หรือใช้ script ที่รวม flow ให้แล้ว:

```bash
bash ./deploy/deploy.sh x86 build
```

## 3. Apply Prisma migrations บน Production DB

รัน migration หลัง image build สำเร็จ และก่อน `up -d` เสมอ

```bash
docker compose -f deploy/compose.app.yml -f deploy/compose.x86.override.yml run --rm backend bun run prisma:migrate:deploy
```

หรือ:

```bash
bash ./deploy/deploy.sh x86 migrate
```

ถ้าต้อง generate Prisma client เพิ่มใน job แยก:

```bash
docker compose -f deploy/compose.app.yml -f deploy/compose.x86.override.yml run --rm backend bun run prisma:generate
```

หมายเหตุ:

- Production ต้องใช้ `prisma migrate deploy`
- ห้ามใช้ `prisma migrate dev` บน Production
- ห้ามใช้ `prisma db push` บน Production

## 4. Start services บน Intel x86

```bash
docker compose -f deploy/compose.app.yml -f deploy/compose.x86.override.yml up -d
```

หรือ:

```bash
bash ./deploy/deploy.sh x86 up
```

## 5. คำสั่งเดียวสำหรับ deploy บน Intel x86

```bash
bash ./deploy/deploy.sh x86 deploy
```

หรือจาก root package script:

```bash
bun run deploy:x86
```

คำสั่งนี้จะทำตามลำดับ:

1. สร้าง network `app-net` ถ้ายังไม่มี
2. build image
3. run `prisma migrate deploy`
4. `up -d --no-build`
5. แสดงสถานะ container

## 6. Deploy บน Raspberry Pi 4

```bash
docker compose -f deploy/compose.app.yml -f deploy/compose.pi4.override.yml build
docker compose -f deploy/compose.app.yml -f deploy/compose.pi4.override.yml run --rm backend bun run prisma:migrate:deploy
docker compose -f deploy/compose.app.yml -f deploy/compose.pi4.override.yml up -d
```

หรือใช้ script:

```bash
bash ./deploy/deploy.sh pi4 deploy
```

หรือ:

```bash
bun run deploy:pi4
```

สำหรับ Pi4 แนะนำให้ build ตอน maintenance window เพื่อลด memory pressure

## 7. คำสั่งช่วยเหลือ

```bash
bash ./deploy/deploy.sh x86 ps
bash ./deploy/deploy.sh x86 logs
bash ./deploy/deploy.sh x86 down
```

มีเทียบเท่ากันสำหรับ `pi4`

## 8. ตรวจสถานะ

```bash
docker compose -f deploy/compose.app.yml ps
curl -I http://127.0.0.1:3000
```

Backend ไม่ได้ publish ออก host ดังนั้นจะทดสอบได้จากใน network ภายใน compose เท่านั้น

```bash
docker compose -f deploy/compose.app.yml exec backend bun -e "fetch('http://127.0.0.1:3001/api/health').then(async (response) => { console.log(response.status); console.log(await response.text()); })"
```

ตรวจ log:

```bash
docker compose -f deploy/compose.app.yml logs -f frontend
docker compose -f deploy/compose.app.yml logs -f backend
```

## 9. Cloudflare Tunnel

ตั้ง `cloudflared` แยกจาก compose นี้ แล้วชี้ service มาที่ frontend เท่านั้น

```yaml
ingress:
  - hostname: app.example.com
    service: http://localhost:3000
  - service: http_status:404
```

สิ่งที่ต้องยืนยัน:

- มี public hostname แค่ frontend
- ไม่มี route ใดชี้ไป `backend:3001`
- backend ไม่ถูก publish ออก host

## 10. Update flow

เมื่อมี release ใหม่:

```bash
git pull
bash ./deploy/deploy.sh x86 deploy
```

ถ้าไม่มี migration ใหม่ `prisma migrate deploy` จะไม่ทำอะไรเพิ่ม

## 11. Rollback

Rollback application:

```bash
git checkout <release-tag>
bash ./deploy/deploy.sh x86 build
bash ./deploy/deploy.sh x86 up
```

ข้อควรระวัง:

- ถ้ามี migration ที่เปลี่ยน schema ไปแล้ว rollback app อาจไม่พอ
- ต้องประเมิน backward compatibility ของ release ก่อน rollback
- ถ้าจะ rollback schema ให้ทำผ่าน migration strategy ที่ออกแบบไว้ ไม่ใช้ `db push`

## 12. Troubleshooting

Frontend ขึ้นได้ แต่ login ไม่ผ่าน:

- ตรวจ `BACKEND_INTERNAL_URL`
- ตรวจว่า backend healthy
- ตรวจ `JWT_*` และ `DATABASE_URL`

Backend start ไม่ขึ้น:

- ตรวจ `DATABASE_URL`
- ตรวจว่า external Postgres เข้าถึงได้จาก host
- ตรวจ `MINIO_*`

Cloudflare เข้าไม่ได้:

- ตรวจ `cloudflared` service
- ตรวจ hostname binding
- ตรวจว่า origin ชี้ `http://localhost:3000`

## Notes

- `backend` ใช้ `expose: 3001` และไม่ใส่ `ports:`
- frontend ใช้ Next.js proxy route `/api/backend/*` เพื่อคุยกับ backend ภายใน
- ถ้ารัน local infra แยก compose ให้ attach เข้า network `app-net` เดียวกัน
- ถ้าต้อง debug backend จาก host ในอนาคต ให้ทำ override compose แยก ไม่แก้ baseline production file นี้
- backend production migration ใช้ `bun run prisma:migrate:deploy`
