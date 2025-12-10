# Homework Kanban - Getting Started Guide

## 🚀 Quick Start

### Option 1: Using the Setup Script (Recommended)

```bash
cd kanban
./setup.sh
npm start
```

Then open http://localhost:3000 in your browser.

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Start server
npm start
```

---

## ✨ Features Overview

### ✅ Core Features
- ✓ Add/manage homework assignments
- ✓ Track assignment status (done/incomplete)
- ✓ Automatic priority scoring system
- ✓ Color-coded urgency indicators
- ✓ Calendar view of deadlines
- ✓ Dashboard with statistics
- ✓ LINE OA notifications

### 📊 Priority Scoring
```
Priority = (10 - days remaining) + difficulty + importance

Example:
- Math assignment due in 2 days, medium difficulty, high importance
  = (10 - 2) + 2 + 3 = 13 points (high priority!)
```

### 📱 Responsive Design
- Works on desktop, tablet, and mobile
- Smooth animations and modern UI
- Dark/light mode ready (future update)

### 🔔 Notification System
- **Automatic**: 5 PM daily notifications via LINE
- **On-demand**: Manual reminder button
- **Smart filtering**: Only notifies about upcoming deadlines (≤7 days)

---

## 🎯 Usage Instructions

### 1. Login
- Click "เข้าสู่ระบบ LINE" (LINE Login)
- Complete LINE authentication
- For testing: use the demo login option

### 2. Add Homework
Navigate to "เพิ่มงาน" (Add Task) and fill in:
- **Subject** (required): e.g., "คณิตศาสตร์"
- **Task Name** (required): e.g., "ทำแบบฝึกหัด"
- **Received Date**: When assigned (optional)
- **Due Date** (required): Deadline
- **Difficulty**: Low / Medium / High
- **Importance**: Low / Medium / High

### 3. View & Manage Assignments
- **Dashboard**: Overview and quick stats
- **งานทั้งหมด**: Complete list with filters
- **ปฏิทิน**: Calendar view of deadlines
- Status buttons: Toggle between done/incomplete
- Delete: Remove assignments

### 4. Get Notifications
- Automatic: Receives LINE message daily at 5 PM
- Manual: Click "📢 ส่งเตือน" (Send Reminder) button

---

## 🏗️ Project Structure

```
kanban/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML page
│   ├── app.js            # Frontend JavaScript
│   ├── styles.css        # Styling
│   └── line-callback.html # LINE OAuth callback
├── server.js             # Express server
├── database.js           # SQLite database setup
├── lineAuth.js           # LINE authentication & notifications
├── scheduler.js          # Scheduled notification tasks
├── package.json          # Dependencies
├── .env                  # Environment variables
├── .env.example          # Example config
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose config
├── setup.sh              # Setup script
├── README.md             # Project README
├── USER_GUIDE_TH.md      # Thai user guide
├── DEPLOYMENT.md         # Deployment instructions
└── .gitignore            # Git ignore rules
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
PORT=3000                              # Server port

# LINE OA Configuration
LINE_CHANNEL_ID=2008662915            # Channel ID
LINE_CHANNEL_SECRET=...               # Channel Secret
LINE_ACCESS_TOKEN=...                 # Access Token
REDIRECT_URI=http://localhost:3000... # OAuth callback URL
```

### Database

- **Type**: SQLite3
- **File**: `homework.db`
- **Auto-created** on first run
- **Tables**:
  - `users`: User information with LINE ID
  - `homework`: Assignment details
  - `notifications`: Notification log

---

## 📚 API Endpoints

### Authentication
- `GET /api/auth/line/login-url` - Get LINE login URL
- `POST /api/auth/line/callback` - Handle LINE OAuth callback

### Users
- `POST /api/user` - Create/get user
- `GET /api/user/:userId` - Get user info

### Homework
- `POST /api/homework` - Add homework
- `GET /api/homework/:userId` - Get homework list
- `PUT /api/homework/:homeworkId` - Update status
- `DELETE /api/homework/:homeworkId` - Delete homework

### Dashboard & Notifications
- `GET /api/dashboard/:userId` - Get statistics
- `POST /api/send-reminder/:userId` - Send manual reminder
- `GET /health` - Health check

---

## 🐳 Docker Deployment

### Start with Docker Compose
```bash
docker-compose up -d
```

### Build & Run Manually
```bash
docker build -t homework-kanban .
docker run -p 3000:3000 homework-kanban
```

---

## 🚀 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to:
- Heroku
- DigitalOcean
- AWS Elastic Beanstalk
- Any Docker-compatible platform

---

## 🔐 Security Notes

- Keep `.env` file private (never commit to git)
- HTTPS should be used in production
- Validate all user inputs (already done)
- Regularly update dependencies: `npm audit fix`
- Rate limiting recommended for production

---

## 📖 Full Documentation

- **User Guide (Thai)**: [USER_GUIDE_TH.md](./USER_GUIDE_TH.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Project README**: [README.md](./README.md)

---

## 🆘 Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill existing process
kill -9 <PID>

# Restart
npm start
```

### Database issues
```bash
# Remove old database
rm homework.db

# Restart server (will recreate)
npm start
```

### LINE notifications not working
1. Verify Channel Access Token is correct
2. Ensure webhook is enabled in LINE console
3. Check server logs: `npm start`
4. Test manually with "📢 ส่งเตือน" button

---

## 📞 Support & Contact

- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check USER_GUIDE_TH.md for common questions
- **LINE OA Setup**: See DEPLOYMENT.md for detailed LINE configuration

---

## 📄 License

MIT License - Feel free to use, modify, and distribute

---

**Happy studying! 📚✨**

Last Updated: December 10, 2024
