import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { initDb, getDb } from './database.js';
import { getLineLoginUrl, exchangeCodeForToken, getUserProfile, sendLineNotification, formatNotificationMessage } from './lineAuth.js';
import { initializeScheduledTasks, sendUserReminder } from './scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize database
let db;
(async () => {
  db = await initDb();
  console.log('Database initialized');
  
  // Initialize scheduled tasks for notifications
  initializeScheduledTasks();
})();

// Utility functions
function calculateDaysLeft(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function calculatePriorityScore(dueDate, difficulty, importance) {
  const daysLeft = calculateDaysLeft(dueDate);
  const diffValue = difficulty === 'high' ? 3 : difficulty === 'medium' ? 2 : 1;
  const impValue = importance === 'high' ? 3 : importance === 'medium' ? 2 : 1;
  return (10 - Math.max(0, daysLeft)) + diffValue + impValue;
}

// API Routes

// LINE Login endpoints
app.get('/api/auth/line/login-url', (req, res) => {
  try {
    const loginUrl = getLineLoginUrl();
    res.json({ loginUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/line/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Get user profile
    const profile = await getUserProfile(tokenData.access_token);

    // Get or create user in database
    let user = await db.get('SELECT * FROM users WHERE line_user_id = ?', [profile.userId]);

    if (!user) {
      const userId = `user_${Date.now()}`;
      await db.run(
        'INSERT INTO users (id, line_user_id, name) VALUES (?, ?, ?)',
        [userId, profile.userId, profile.displayName]
      );
      user = { id: userId, line_user_id: profile.userId, name: profile.displayName };
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('LINE callback error:', error);
    res.status(500).json({ error: error.message });
  }
});
app.post('/api/user', async (req, res) => {
  try {
    const { lineUserId, name } = req.body;
    let user = await db.get('SELECT * FROM users WHERE line_user_id = ?', [lineUserId]);
    
    if (!user) {
      const userId = `user_${Date.now()}`;
      await db.run(
        'INSERT INTO users (id, line_user_id, name) VALUES (?, ?, ?)',
        [userId, lineUserId, name || 'User']
      );
      user = { id: userId, line_user_id: lineUserId, name: name || 'User' };
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
app.get('/api/user/:userId', async (req, res) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add homework
app.post('/api/homework', async (req, res) => {
  try {
    const { userId, subject, taskName, receivedDate, dueDate, difficulty, importance, status } = req.body;
    
    if (!userId || !subject || !taskName || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.run(
      `INSERT INTO homework (user_id, subject, task_name, received_date, due_date, difficulty, importance, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, subject, taskName, receivedDate, dueDate, difficulty || 'medium', importance || 'medium', status || 'incomplete']
    );

    res.json({ id: result.lastID, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get homework for user
app.get('/api/homework/:userId', async (req, res) => {
  try {
    const homework = await db.all('SELECT * FROM homework WHERE user_id = ?', [req.params.userId]);
    
    const enriched = homework.map(hw => ({
      ...hw,
      daysLeft: calculateDaysLeft(hw.due_date),
      priorityScore: calculatePriorityScore(hw.due_date, hw.difficulty, hw.importance),
      urgency: (() => {
        const days = calculateDaysLeft(hw.due_date);
        return days <= 2 ? 'critical' : days <= 5 ? 'warning' : 'normal';
      })()
    }));

    // Sort by priority score (highest first)
    enriched.sort((a, b) => b.priorityScore - a.priorityScore);

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update homework status
app.put('/api/homework/:homeworkId', async (req, res) => {
  try {
    const { status } = req.body;
    
    await db.run(
      'UPDATE homework SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, req.params.homeworkId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete homework
app.delete('/api/homework/:homeworkId', async (req, res) => {
  try {
    await db.run('DELETE FROM homework WHERE id = ?', [req.params.homeworkId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats
app.get('/api/dashboard/:userId', async (req, res) => {
  try {
    const homework = await db.all('SELECT * FROM homework WHERE user_id = ?', [req.params.userId]);
    
    const total = homework.length;
    const completed = homework.filter(hw => hw.status === 'complete').length;
    const incomplete = total - completed;
    const dueToday = homework.filter(hw => {
      const daysLeft = calculateDaysLeft(hw.due_date);
      return daysLeft <= 0 && daysLeft > -1;
    }).length;

    res.json({
      total,
      completed,
      incomplete,
      dueToday,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// On-demand notification endpoint
app.post('/api/send-reminder/:userId', async (req, res) => {
  try {
    const result = await sendUserReminder(req.params.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// On-demand notification endpoint
app.post('/api/send-reminder/:userId', async (req, res) => {
  try {
    const result = await sendUserReminder(req.params.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
