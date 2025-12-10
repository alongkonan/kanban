import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;

// LINE Login Configuration
export const LINE_LOGIN_CONFIG = {
    channelId: LINE_CHANNEL_ID,
    redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/line-callback.html',
    scope: 'profile openid',
    response_type: 'code',
    state: 'homework_app_state'
};

export function getLineLoginUrl() {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: LINE_CHANNEL_ID,
        redirect_uri: LINE_LOGIN_CONFIG.redirectUri,
        state: LINE_LOGIN_CONFIG.state,
        scope: LINE_LOGIN_CONFIG.scope
    });
    
    return `https://web.line.me/web/login?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
    try {
        const response = await axios.post(
            'https://api.line.me/oauth2/v2.1/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: LINE_LOGIN_CONFIG.redirectUri,
                client_id: LINE_CHANNEL_ID,
                client_secret: LINE_CHANNEL_SECRET
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error exchanging code for token:', error.response?.data || error.message);
        throw error;
    }
}

export async function getUserProfile(accessToken) {
    try {
        const response = await axios.get(
            'https://api.line.me/v2/profile',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error getting user profile:', error.response?.data || error.message);
        throw error;
    }
}

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
