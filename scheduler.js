import cron from 'node-cron';
import { getDb } from './database.js';
import { sendLineNotification, formatNotificationMessage } from './lineAuth.js';

/**
 * Initialize scheduled tasks for homework notifications
 */
export function initializeScheduledTasks() {
  // Send notifications every day at 5 PM (17:00)
  // Schedule: minute hour day month dayOfWeek
  cron.schedule('0 17 * * *', async () => {
    console.log('Running daily homework notifications at 5 PM...');
    await sendHomeworkNotifications();
  });

  // Optional: Also run in the morning (8 AM) for reminders
  cron.schedule('0 8 * * *', async () => {
    console.log('Running morning homework reminders at 8 AM...');
    await sendHomeworkNotifications(true); // Flag for morning message
  });

  // Optional: Run every hour for testing (comment out in production)
  // cron.schedule('0 * * * *', async () => {
  //   console.log('Testing notification system...');
  //   await sendHomeworkNotifications();
  // });

  console.log('Scheduled tasks initialized');
}

/**
 * Send notifications for homework due soon
 */
async function sendHomeworkNotifications(isMorning = false) {
  const db = getDb();
  
  if (!db) {
    console.error('Database not initialized for notifications');
    return;
  }

  try {
    // Get all incomplete homework
    const homework = await db.all(
      'SELECT * FROM homework WHERE status = ? ORDER BY due_date ASC',
      ['incomplete']
    );

    if (homework.length === 0) {
      console.log('No incomplete homework to notify about');
      return;
    }

    // Process each homework item
    for (const hw of homework) {
      const daysLeft = calculateDaysLeft(hw.due_date);

      // Notify if due within next 7 days
      if (daysLeft >= 0 && daysLeft <= 7) {
        const user = await db.get('SELECT * FROM users WHERE id = ?', [hw.user_id]);

        if (user && user.line_user_id) {
          // Check if already notified today
          const today = new Date().toISOString().split('T')[0];
          const lastNotification = await db.get(
            'SELECT * FROM notifications WHERE homework_id = ? AND date(sent_at) = ?',
            [hw.id, today]
          );

          // Send notification if not already sent today
          if (!lastNotification) {
            const message = isMorning 
              ? formatMorningMessage(hw, daysLeft)
              : formatNotificationMessage(hw, daysLeft);

            const success = await sendLineNotification(user.line_user_id, message);

            if (success) {
              // Record the notification
              await db.run(
                'INSERT INTO notifications (user_id, homework_id) VALUES (?, ?)',
                [hw.user_id, hw.id]
              );
              console.log(`Notification sent to ${user.name} for ${hw.subject}`);
            }
          }
        }
      }
    }

    console.log('Notification batch completed');
  } catch (error) {
    console.error('Error in sendHomeworkNotifications:', error);
  }
}

/**
 * Calculate days remaining until due date
 */
function calculateDaysLeft(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format morning message (lighter tone)
 */
function formatMorningMessage(homework, daysLeft) {
  const greeting = daysLeft === 0 ? '⚠️ วันครบกำหนดวันนี้!' : 
                   daysLeft === 1 ? '🚨 เหลือ 1 วัน!' :
                   daysLeft <= 2 ? '⚠️ เรื่องด่วน!' : 
                   daysLeft <= 5 ? '📌 เตือนการบ้าน' : 
                   '📝 เตือนการบ้าน';

  return `สวัสดีตอนเช้า! ☀️

${greeting}

📚 วิชา: ${homework.subject}
📖 งาน: ${homework.task_name}
📅 ครบกำหนด: ${homework.due_date}
⏰ เหลือเวลา: ${daysLeft} วัน
🎯 สำคัญ: ${homework.importance}
💪 ยาก: ${homework.difficulty}

โปรดจำไว้ว่าต้องทำให้เสร็จแล้วนะจ้ะ ✨`;
}

/**
 * Send reminder to specific user (on-demand)
 */
export async function sendUserReminder(userId) {
  const db = getDb();
  
  try {
    const homework = await db.all(
      'SELECT * FROM homework WHERE user_id = ? AND status = ? ORDER BY due_date ASC LIMIT 3',
      [userId, 'incomplete']
    );

    if (homework.length === 0) {
      return { success: false, message: 'ไม่มีการบ้านที่เหลือ' };
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!user || !user.line_user_id) {
      return { success: false, message: 'ไม่สามารถหา LINE user ID' };
    }

    let message = `📚 แจ้งเตือนการบ้าน\n\n`;
    
    homework.forEach((hw, index) => {
      const daysLeft = calculateDaysLeft(hw.due_date);
      const urgency = daysLeft <= 2 ? '⚠️' : daysLeft <= 5 ? '⏰' : '✓';
      message += `${index + 1}. ${urgency} ${hw.subject} - ${hw.task_name}\n`;
      message += `   ครบกำหนด: ${hw.due_date} (เหลือ ${daysLeft} วัน)\n\n`;
    });

    const success = await sendLineNotification(user.line_user_id, message);
    
    return { success, message: success ? 'ส่งเตือนสำเร็จ' : 'ส่งเตือนไม่สำเร็จ' };
  } catch (error) {
    console.error('Error sending user reminder:', error);
    return { success: false, message: error.message };
  }
}
