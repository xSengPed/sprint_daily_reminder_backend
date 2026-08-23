# CLAUDE.md

คำแนะนำสำหรับ Claude Code เวลาทำงานกับ repo นี้

## repo นี้คืออะไร

API สำหรับเก็บ daily standup ของ 2 squad — Express 5 + Mongoose + zod (TypeScript)

**หน้าเว็บอยู่คนละ repo** ชื่อ `daily_reminder` (Next.js) ที่เรียก API ตัวนี้
ปกติจะ clone ไว้ข้างกันแบบนี้ เพราะ `docker-compose.yml` ของฝั่ง frontend อ้าง `../sprint_reminder_backend`

```
<โฟลเดอร์โปรเจกต์>/
  daily_reminder/            <- frontend
  sprint_reminder_backend/   <- repo นี้
```

**ถ้างานที่ได้รับต้องแก้ทั้งสองฝั่ง** (เช่นเพิ่มฟิลด์ใหม่ใน daily หรือเพิ่ม squad)
ต้องไปแก้ที่ repo frontend ด้วย อย่าแก้แค่ฝั่งนี้แล้วคิดว่าจบ

## บริบทการใช้งาน

| Squad   | เวลา daily    |
| ------- | ------------- |
| Zeny    | 10:00 - 10:15 |
| LedgerX | 10:45 - 11:00 |

daily 1 รายการ = 1 squad ใน 1 วัน มี 3 ช่อง: เมื่อวานทำอะไร / วันนี้จะทำอะไร / ติดปัญหาอะไรบ้าง

## คำสั่ง

ต้องใช้ Node 20 ขึ้นไป (พัฒนาบน Node 22, image ใช้ `node:22-alpine`)

```bash
npm install
npm run dev          # http://localhost:4000/api — tsx watch คอมไพล์สดให้
npm run typecheck    # tsc --noEmit — เกณฑ์ตรวจงาน ต้องผ่าน
npm run build        # คอมไพล์ลง dist/
npm start            # build ใหม่ให้ก่อนเสมอผ่าน prestart กัน dist ค้างเวอร์ชันเก่า
```

ยังไม่มี test runner และไม่มี linter/formatter — เกณฑ์ตรวจงานคือ `npm run typecheck` ต้องผ่าน
และถ้าแก้ endpoint ให้ยิงจริงด้วย `curl` ดูสักครั้ง

## .env (ถูก gitignore — ต้องสร้างเองหลัง clone)

```env
MONGODB_URI=mongodb://admin:<รหัสผ่าน>@10.0.0.141:27017/?authSource=admin
MONGODB_DB=sprint_reminder
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

MongoDB อยู่ในวง LAN (`10.0.0.141`) ถ้าเครื่องที่ทำงานอยู่ไม่ได้อยู่วงเดียวกันหรือไม่ได้ต่อ VPN
จะเชื่อมต่อไม่ได้ ให้รัน Mongo ในเครื่องแล้วชี้ `MONGODB_URI` ไปที่ `mongodb://localhost:27017` แทน

ไม่มี `.env` เซิร์ฟเวอร์จะไม่ start และบอกให้ไปสร้างก่อน (ไม่ได้พังแบบงง ๆ)

## โครงสร้าง

```
src/
  server.ts                  จุดเริ่ม: ต่อ DB → seed วันหยุด → listen
  app.ts                     ประกอบ express app
  config/env.ts              อ่าน/ตรวจ environment variable
  config/squads.ts           ตั้งค่า squad (ต้องตรงกับฝั่ง frontend)
  db/mongo.ts                เชื่อมต่อ mongoose + graceful shutdown
  db/seed.ts                 นำเข้าวันหยุดจาก data/*.ics ตอนเริ่มระบบ
  lib/ics.ts                 ตัวอ่านไฟล์ .ics
  models/                    mongoose schema
  schemas/                   zod validation
  controllers/               logic ของแต่ละ endpoint
  routes/                    ผูก path เข้ากับ controller
  middleware/error.ts        not found + error handler กลาง
data/holidays.ics            วันหยุดตั้งต้น (ดู data/README.md)
```

## กติกาของโค้ดในนี้

- ตอบกลับรูปแบบเดียวกันหมด: สำเร็จ `{ "data": ... }` ผิดพลาด `{ "error": { "message": ... } }`
- validate ทุก input ด้วย zod ที่ `src/schemas/` แล้วปล่อย error ให้ error handler กลางจัดการ
  Express 5 ส่ง async error ให้เอง **ไม่ต้องมี asyncHandler**
- ข้อความ error และคอมเมนต์เป็นภาษาไทย ชื่อตัวแปร/ฟังก์ชันเป็นอังกฤษ
- คอมเมนต์เขียนเฉพาะตอนอธิบาย **"ทำไม"** ไม่ใช่เล่าซ้ำว่าโค้ดทำอะไร
- TypeScript `strict` เลี่ยง `any`

## เรื่องที่ต้องรู้ก่อนแก้

**วันที่เป็น string `yyyy-mm-dd` ทั้งระบบ**
ทั้ง path parameter และฟิลด์ใน MongoDB — เทียบมาก/น้อยด้วย string ได้เลย (`$gte` / `$lte`)
อย่าเปลี่ยนไปใช้ `Date` เพราะฝั่ง frontend ก็ใช้ string เป็น key เหมือนกัน

**daily 1 squad มีได้วันละ 1 รายการ**
บังคับด้วย unique index `(squadId, date)` — การบันทึกทุกทางเป็น upsert ไม่ใช่ insert

**วันหยุดมี 3 ประเภทและปนกันอยู่ใน collection เดียว**
`public` / `observance` มาจากไฟล์ `.ics` ส่วน `leave` คือวันลาที่ผู้ใช้เพิ่มเอง (`source: "manual"`)
`POST /holidays/import` แบบ `replaceAll` **ต้องลบเฉพาะรายการที่ `source != "manual"`**
ไม่งั้นวันลาที่ผู้ใช้กรอกไว้จะหายตอนอัปเดตปฏิทินวันหยุด

**seed วันหยุดทำงานเฉพาะตอน collection ว่าง**
ถ้าจะโหลดไฟล์ใหม่ทับให้ใช้ `POST /holidays/import` ไม่ใช่รีสตาร์ตเซิร์ฟเวอร์

**วันหยุดไม่ได้ดึงสดจาก bot.or.th**
หน้าเว็บ ธปท. โหลดข้อมูลผ่าน endpoint ภายในที่ตอบ "under maintenance" จากภายนอก
และ API ทางการต้องสมัครเอา `X-IBM-Client-Id` ก่อน — รายละเอียดใน [data/README.md](data/README.md)

**ตั้งค่า squad อยู่ 2 repo ต้องตรงกัน**
[src/config/squads.ts](src/config/squads.ts) ที่นี่ใช้ validate `squadId` ส่วนชื่อ/เวลา/สีอยู่ที่
`src/lib/squads.ts` ของ repo frontend เพิ่ม squad ใหม่ต้องแก้ทั้งสองที่

## สิ่งที่ยังไม่มี (ตั้งใจ)

- **auth** — ใครยิงถึงพอร์ตนี้ก็แก้ข้อมูลได้ เหมาะกับใช้ในวง LAN เท่านั้น
- **test** — ยังไม่มี test suite
- **multi-user** — ข้อมูลไม่ได้แยกตามผู้ใช้
