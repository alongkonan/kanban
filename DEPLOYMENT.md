# Deployment Guide - Homework Kanban

## Local Development

### Prerequisites
- Node.js 16+
- npm or yarn
- SQLite3

### Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd kanban

# 2. Run setup script
./setup.sh

# 3. Start the server
npm start

# 4. Open in browser
# http://localhost:3000
```

---

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Using Docker CLI

```bash
# Build image
docker build -t homework-kanban .

# Run container
docker run -d \
  -p 3000:3000 \
  -e LINE_CHANNEL_ID=2008662915 \
  -e LINE_CHANNEL_SECRET=a8df26fd83df4281e65d681a677d71b4 \
  -e LINE_ACCESS_TOKEN=pzPrYdCDy7nDK0dk1SxLzJA7V4RI/zButv1zlyvPSF/c+ox2bdMiT+SySRu0+UPFG9sKj0NHql7IDGydW6csBNHZJsVZjnyKfvulK8vHP3gRX1oT1ArmW7vyNGCTKFsjgbLUR3APLvtmXYRzeU40tQdB04t89/1O/w1cDnyilFU= \
  --name homework-kanban \
  homework-kanban
```

---

## Heroku Deployment

### Setup

```bash
# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Set environment variables
heroku config:set LINE_CHANNEL_ID=2008662915
heroku config:set LINE_CHANNEL_SECRET=a8df26fd83df4281e65d681a677d71b4
heroku config:set LINE_ACCESS_TOKEN=pzPrYdCDy7nDK0dk1SxLzJA7V4RI/zButv1zlyvPSF/c+ox2bdMiT+SySRu0+UPFG9sKj0NHql7IDGydW6csBNHZJsVZjnyKfvulK8vHP3gRX1oT1ArmW7vyNGCTKFsjgbLUR3APLvtmXYRzeU40tQdB04t89/1O/w1cDnyilFU=
heroku config:set REDIRECT_URI=https://your-app-name.herokuapp.com/line-callback.html

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

---

## DigitalOcean App Platform

### Setup

1. Connect your GitHub repository
2. Create new app from repository
3. Set environment variables:
   - `LINE_CHANNEL_ID`: 2008662915
   - `LINE_CHANNEL_SECRET`: a8df26fd83df4281e65d681a677d71b4
   - `LINE_ACCESS_TOKEN`: pzPrYdCDy7nDK0dk1SxLzJA7V4RI/zButv1zlyvPSF/c+ox2bdMiT+SySRu0+UPFG9sKj0NHql7IDGydW6csBNHZJsVZjnyKfvulK8vHP3gRX1oT1ArmW7vyNGCTKFsjgbLUR3APLvtmXYRzeU40tQdB04t89/1O/w1cDnyilFU=
   - `REDIRECT_URI`: https://your-app.ondigitalocean.app/line-callback.html
4. Deploy

---

## AWS (Elastic Beanstalk)

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js-16 homework-kanban

# Create environment
eb create homework-kanban-env

# Set environment variables
eb setenv \
  LINE_CHANNEL_ID=2008662915 \
  LINE_CHANNEL_SECRET=a8df26fd83df4281e65d681a677d71b4 \
  LINE_ACCESS_TOKEN=pzPrYdCDy7nDK0dk1SxLzJA7V4RI/zButv1zlyvPSF/c+ox2bdMiT+SySRu0+UPFG9sKj0NHql7IDGydW6csBNHZJsVZjnyKfvulK8vHP3gRX1oT1ArmW7vyNGCTKFsjgbLUR3APLvtmXYRzeU40tQdB04t89/1O/w1cDnyilFU=

# Deploy
eb deploy
```

---

## LINE OA Configuration

### Line Messaging API Setup

1. Go to [LINE Developer Console](https://developers.line.biz/console/)
2. Create new provider and channel (Messaging API)
3. Get your credentials:
   - **Channel ID**: 2008662915
   - **Channel Secret**: a8df26fd83df4281e65d681a677d71b4
   - **Channel Access Token**: pzPrYdCDy7nDK0dk1SxLzJA7V4RI/zButv1zlyvPSF/c+ox2bdMiT+SySRu0+UPFG9sKj0NHql7IDGydW6csBNHZJsVZjnyKfvulK8vHP3gRX1oT1ArmW7vyNGCTKFsjgbLUR3APLvtmXYRzeU40tQdB04t89/1O/w1cDnyilFU=

### Webhook Setup

1. Set Webhook URL:
   - Development: `http://localhost:3000/api/webhook` (for testing with ngrok)
   - Production: `https://your-domain.com/api/webhook`

2. Enable webhook in LINE console

---

## Database Backup & Restore

### Backup SQLite Database

```bash
# Create backup
cp homework.db homework.db.backup

# Or use SQLite dump
sqlite3 homework.db .dump > homework.sql
```

### Restore

```bash
# Restore from backup
cp homework.db.backup homework.db

# Or from dump file
sqlite3 homework.db < homework.sql
```

---

## Monitoring & Maintenance

### Check Server Health

```bash
curl http://localhost:3000/health
```

### View Logs (Docker)

```bash
docker-compose logs -f homework-kanban
```

### Clean Up Database

```bash
# Remove old notifications
sqlite3 homework.db "DELETE FROM notifications WHERE sent_at < datetime('now', '-30 days');"
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Locked

```bash
# Restart server
npm start
```

### LINE Notifications Not Working

1. Check Channel Access Token is correct
2. Verify user has LINE OA added to friends
3. Check LINE webhook is enabled
4. Review server logs for errors

---

## Performance Optimization

### Database Indexing

Indexes are already created for:
- `user_id` (homework table)
- `due_date` (homework table)
- `status` (homework table)

### Caching (Future Implementation)

Consider adding Redis for:
- Dashboard statistics cache
- User session cache
- Homework list cache

### Load Testing

```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:3000/

# Using wrk
wrk -t4 -c100 -d30s http://localhost:3000/
```

---

## Security Recommendations

1. ✅ Use HTTPS in production
2. ✅ Validate all user inputs
3. ✅ Use environment variables for secrets
4. ✅ Implement rate limiting
5. ✅ Add CORS restrictions
6. ✅ Use Content Security Policy headers
7. ✅ Keep dependencies updated: `npm audit fix`

---

## Support

For issues or questions, please check:
- Server logs: `npm start`
- Database: `sqlite3 homework.db`
- API responses: Browser DevTools Console

---

Last Updated: December 10, 2024
