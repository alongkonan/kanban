import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;

export async function sendLineNotification(userId, message) {
  try {
    if (!userId) {
      console.log('No LINE user ID provided for notification');
      return false;
    }

    const response = await axios.post(
      'https://api.line.me/v2/bot/message/push',
      {
        to: userId,
        messages: [
          {
            type: 'text',
            text: message
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
        }
      }
    );

    console.log('LINE notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending LINE notification:', error.response?.data || error.message);
    return false;
  }
}

export function formatNotificationMessage(homework, daysLeft) {
  const urgency = daysLeft <= 2 ? '⚠️ เรื่องด่วน!' : daysLeft <= 5 ? '📌 ใกล้ครบกำหนด' : '📝 แจ้งเตือน';
  
  return `${urgency}

📚 วิชา: ${homework.subject}
📖 งาน: ${homework.task_name}
📅 ครบกำหนด: ${homework.due_date}
⏰ เหลือเวลา: ${daysLeft} วัน
🎯 สำคัญ: ${homework.importance}
💪 ยาก: ${homework.difficulty}

${homework.status === 'incomplete' ? '❌ ยังไม่ทำ' : '✅ ทำแล้ว'}`;
}
