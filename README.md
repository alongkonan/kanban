# 📚 Homework Kanban - บันทึกการบ้าน

Web application สำหรับติดตามและจัดการการบ้าน พร้อมการแจ้งเตือนผ่าน LINE OA API

## ✨ ฟีเจอร์หลัก

✅ **เพิ่มการบ้าน** - บันทึกข้อมูลการบ้าน ได้แก่:
- วิชา
- ชื่องาน
- วันที่ได้รับ/วันครบกำหนด
- ความยาก (ต่ำ/กลาง/สูง)
- ความสำคัญ (ต่ำ/กลาง/สูง)
- สถานะ (ทำแล้ว/ยังไม่ทำ)

✅ **คำนวณความสำคัญอัตโนมัติ** - Priority Score = (10 - จำนวนวันที่เหลือ) + ความยาก + ความสำคัญ

✅ **จัดเรียงตามลำดับความสำคัญ** - งานที่สำคัญที่สุดอยู่บนสุด

✅ **มุมมองปฏิทิน** - แสดงวันครบกำหนดแบบสายนำ

✅ **ระบบสี** - แสดงความเร่งด่วน:
- 🔴 แดง (≤2 วัน)
- 🟡 เหลือง (3-5 วัน)
- 🟢 เขียว (>5 วัน)

✅ **เปลี่ยนสถานะ** - ปุ่มทำให้/ยังไม่ทำได้สะดวก

✅ **Dashboard** - แสดงสถิติ:
- งานทั้งหมด
- งานที่ทำแล้ว
- งานที่ยังไม่ทำ
- อัตราสำเร็จ

✅ **แจ้งเตือน LINE OA** - ส่งข้อความแจ้งเตือนทุก 17:00 สำหรับงานที่ใกล้ครบกำหนด

✅ **Responsive Design** - ใช้งานได้บนทุกอุปกรณ์

## 🚀 การติดตั้ง

```bash
# 1. Clone repository
git clone <repository-url>
cd kanban

# 2. ติดตั้ง dependencies
npm install

# 3. ตั้งค่า .env
cp .env.example .env

# 4. รัน server
npm start
```

## 📝 ตั้งค่า LINE OA

ตั้งค่า `.env` ดังต่อไปนี้:

```
LINE_CHANNEL_ID=2008662915
LINE_CHANNEL_SECRET=a8df26fd83df4281e65d681a677d71b4
LINE_ACCESS_TOKEN=pzPrYdCDy7nDK0dk1SxLzJA7V4RI/zButv1zlyvPSF/c+ox2bdMiT+SySRu0+UPFG9sKj0NHql7IDGydW6csBNHZJsVZjnyKfvulK8vHP3gRX1oT1ArmW7vyNGCTKFsjgbLUR3APLvtmXYRzeU40tQdB04t89/1O/w1cDnyilFU=
PORT=3000
```

## 🏗️ โครงสร้างโปรเจค

```
kanban/
├── public/
│   ├── index.html      # HTML หลัก
│   ├── styles.css      # Styling
│   └── app.js          # Frontend logic
├── server.js           # Express server
├── database.js         # SQLite setup
├── lineNotification.js # LINE OA integration
├── package.json        # Dependencies
└── .env               # Environment variables
```

## 📚 API Endpoints

### User Management
- `POST /api/user` - สร้าง/ดึงข้อมูลผู้ใช้
- `GET /api/user/:userId` - ดึงข้อมูลผู้ใช้

### Homework CRUD
- `POST /api/homework` - เพิ่มการบ้าน
- `GET /api/homework/:userId` - ดึงรายการการบ้าน
- `PUT /api/homework/:homeworkId` - อัพเดตสถานะ
- `DELETE /api/homework/:homeworkId` - ลบการบ้าน

### Dashboard
- `GET /api/dashboard/:userId` - ดึงสถิติ

## 🔔 ระบบแจ้งเตือน

แจ้งเตือนจะส่งโดยอัตโนมัติทุก 17:00 (5 PM) สำหรับ:
- งานที่ยังไม่ทำ
- ครบกำหนดภายใน 7 วัน

รูปแบบข้อความ:
```
⚠️ เรื่องด่วน! (≤2 วัน)
📚 วิชา: [Subject]
📖 งาน: [Task Name]
📅 ครบกำหนด: [Date]
⏰ เหลือเวลา: [Days] วัน
🎯 สำคัญ: [Importance]
💪 ยาก: [Difficulty]
❌ ยังไม่ทำ
```

## 💻 เทคโนโลยี

**Frontend:**
- HTML5
- CSS3 (Responsive Design)
- Vanilla JavaScript

**Backend:**
- Node.js
- Express.js
- SQLite3
- Node-cron (Scheduled tasks)

**Integration:**
- LINE Messaging API

## 📱 Responsive Design

✅ Desktop (1024px+)
✅ Tablet (768px - 1024px)
✅ Mobile (< 768px)

## 🎨 UI/UX Features

- Modern gradient design
- Smooth animations
- Intuitive navigation
- Color-coded urgency indicators
- Real-time statistics
- Mobile-friendly interface

## 📋 License

MIT License

## 📞 Support

สำหรับคำถามหรือปัญหา กรุณาติดต่อ

---

Made with ❤️ for students
