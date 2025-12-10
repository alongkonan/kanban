// Global State
let currentUser = null;
let currentHomework = [];
let currentMonth = new Date();
let editingHomeworkId = null;

// API Base URL
const API_URL = 'http://localhost:3000/api';

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    initializeEventListeners();
    checkUserSession();
});

// Check user session
async function checkUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showAppContent();
        loadDashboard();
    } else {
        showLoginScreen();
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Login
    document.getElementById('loginBtn').addEventListener('click', handleLineLogin);
    document.getElementById('mainLoginBtn').addEventListener('click', handleLineLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            switchView(e.currentTarget.dataset.view);
        });
    });

    // Form submission
    document.getElementById('addHomeworkForm').addEventListener('submit', handleAddHomework);

    // Filters
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('difficultyFilter').addEventListener('change', applyFilters);

    // Calendar navigation
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        renderCalendar();
    });

    // Modal close
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.querySelector('[data-action="cancel"]').addEventListener('click', closeModal);

    document.getElementById('editForm').addEventListener('submit', handleEditHomework);

    // Send reminder button
    document.getElementById('sendReminderBtn').addEventListener('click', sendReminder);
}

// LINE Login Handler
async function handleLineLogin() {
    try {
        // Get LINE login URL
        const response = await fetch(`${API_URL}/auth/line/login-url`);
        const data = await response.json();
        
        if (data.loginUrl) {
            // Redirect to LINE Login
            window.location.href = data.loginUrl;
        }
    } catch (error) {
        console.error('Error getting LINE login URL:', error);
        // Fallback: Simple demo login
        const userId = prompt('Enter your LINE User ID (or leave blank for demo):');
        
        if (userId !== null) {
            const demoUserId = userId || 'demo_user_' + Date.now();
            const userName = prompt('Enter your name:') || 'Student';
            
            loginUser(demoUserId, userName);
        }
    }
}

// Login user
async function loginUser(lineUserId, name) {
    try {
        const response = await fetch(`${API_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lineUserId, name })
        });

        const user = await response.json();
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        document.getElementById('userName').textContent = user.name;
        showAppContent();
        loadDashboard();
    } catch (error) {
        console.error('Login error:', error);
        alert('เข้าสู่ระบบไม่สำเร็จ');
    }
}

// Logout
function handleLogout() {
    if (confirm('ออกจากระบบหรือไม่?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showLoginScreen();
    }
}

// Show/Hide UI elements
function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appContent').classList.add('hidden');
    document.getElementById('loginBtn').parentElement.classList.add('hidden');
}

function showAppContent() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appContent').classList.remove('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('loginBtn').parentElement.classList.add('hidden');
}

// Switch view
function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Remove active from nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected view
    const viewElement = document.getElementById(viewName + 'View');
    if (viewElement) {
        viewElement.classList.add('active');
    }

    // Mark nav item as active
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    // Load view-specific data
    if (viewName === 'dashboard') {
        loadDashboard();
    } else if (viewName === 'homework') {
        loadHomework();
    } else if (viewName === 'calendar') {
        renderCalendar();
    }
}

// Load dashboard
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/homework/${currentUser.id}`);
        currentHomework = await response.json();

        const statsResponse = await fetch(`${API_URL}/dashboard/${currentUser.id}`);
        const stats = await statsResponse.json();

        // Update stats
        document.getElementById('totalHw').textContent = stats.total;
        document.getElementById('completedHw').textContent = stats.completed;
        document.getElementById('incompleteHw').textContent = stats.incomplete;
        document.getElementById('completionRate').textContent = stats.completionRate + '%';
        document.getElementById('progressFill').style.width = stats.completionRate + '%';

        // Show upcoming homework
        renderUpcomingHomework();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Render upcoming homework
function renderUpcomingHomework() {
    const container = document.getElementById('upcomingList');
    const upcoming = currentHomework
        .filter(hw => hw.status === 'incomplete')
        .sort((a, b) => a.priorityScore - b.priorityScore)
        .slice(0, 5);

    if (upcoming.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray-color); padding: 20px;">ไม่มีงานที่เหลือ 🎉</p>';
        return;
    }

    container.innerHTML = upcoming.map(hw => `
        <div class="upcoming-item ${hw.urgency}">
            <div class="upcoming-info">
                <div class="upcoming-subject">${hw.subject}</div>
                <div class="upcoming-task">${hw.task_name}</div>
            </div>
            <div class="upcoming-days">${hw.daysLeft} วัน</div>
        </div>
    `).join('');
}

// Load homework table
async function loadHomework() {
    try {
        const response = await fetch(`${API_URL}/homework/${currentUser.id}`);
        currentHomework = await response.json();
        renderHomeworkTable(currentHomework);
    } catch (error) {
        console.error('Error loading homework:', error);
    }
}

// Render homework table
function renderHomeworkTable(homework) {
    const tbody = document.getElementById('homeworkTbody');
    
    if (homework.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px;">ยังไม่มีงาน เพิ่มงานใหม่ได้ที่ "เพิ่มงาน"</td></tr>';
        return;
    }

    tbody.innerHTML = homework.map(hw => {
        const urgencyClass = hw.urgency;
        const statusBadge = hw.status === 'complete' ? 'complete' : 'incomplete';
        const difficultyClass = `difficulty-${hw.difficulty}`;
        const importanceClass = `importance-${hw.importance}`;
        const urgencyLabel = hw.urgency === 'critical' ? '⚠️' : hw.urgency === 'warning' ? '⏰' : '✓';
        
        return `
            <tr class="row-${urgencyClass}">
                <td><strong>${hw.subject}</strong></td>
                <td>${hw.task_name}</td>
                <td>${hw.due_date}</td>
                <td><span class="urgency-${urgencyClass}">${urgencyLabel} ${hw.daysLeft} วัน</span></td>
                <td><span class="${difficultyClass}">${formatDifficulty(hw.difficulty)}</span></td>
                <td><span class="${importanceClass}">${formatImportance(hw.importance)}</span></td>
                <td><div class="priority-score">${hw.priorityScore}</div></td>
                <td><span class="status-badge ${statusBadge}">${formatStatus(hw.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="toggleStatus(${hw.id}, '${hw.status}')">
                            ${hw.status === 'complete' ? '↺' : '✓'}
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteHomework(${hw.id})">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Apply filters
function applyFilters() {
    const status = document.getElementById('statusFilter').value;
    const difficulty = document.getElementById('difficultyFilter').value;

    let filtered = currentHomework;

    if (status) {
        filtered = filtered.filter(hw => hw.status === status);
    }

    if (difficulty) {
        filtered = filtered.filter(hw => hw.difficulty === difficulty);
    }

    renderHomeworkTable(filtered);
}

// Handle add homework
async function handleAddHomework(e) {
    e.preventDefault();

    const formData = {
        userId: currentUser.id,
        subject: document.getElementById('subject').value,
        taskName: document.getElementById('taskName').value,
        receivedDate: document.getElementById('receivedDate').value,
        dueDate: document.getElementById('dueDate').value,
        difficulty: document.getElementById('difficulty').value,
        importance: document.getElementById('importance').value,
        status: 'incomplete'
    };

    try {
        const response = await fetch(`${API_URL}/homework`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            alert('เพิ่มงานสำเร็จ!');
            e.target.reset();
            loadDashboard();
            loadHomework();
        }
    } catch (error) {
        console.error('Error adding homework:', error);
        alert('เพิ่มงานไม่สำเร็จ');
    }
}

// Toggle homework status
async function toggleStatus(homeworkId, currentStatus) {
    const newStatus = currentStatus === 'complete' ? 'incomplete' : 'complete';

    try {
        const response = await fetch(`${API_URL}/homework/${homeworkId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            loadDashboard();
            loadHomework();
        }
    } catch (error) {
        console.error('Error updating homework:', error);
    }
}

// Delete homework
async function deleteHomework(homeworkId) {
    if (!confirm('ลบงานนี้หรือไม่?')) return;

    try {
        const response = await fetch(`${API_URL}/homework/${homeworkId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadDashboard();
            loadHomework();
        }
    } catch (error) {
        console.error('Error deleting homework:', error);
    }
}

// Format helper functions
function formatDifficulty(level) {
    const levels = {
        'low': 'ต่ำ',
        'medium': 'กลาง',
        'high': 'สูง'
    };
    return levels[level] || level;
}

function formatImportance(level) {
    const levels = {
        'low': 'ต่ำ',
        'medium': 'กลาง',
        'high': 'สูง'
    };
    return levels[level] || level;
}

function formatStatus(status) {
    return status === 'complete' ? '✅ ทำแล้ว' : '❌ ยังไม่ทำ';
}

// Calendar functions
function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Update month display
    const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                       'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year + 543}`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = daysInPrevMonth - i;
        calendarDays.appendChild(dayElement);
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        // Check if today
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayElement.classList.add('today');
        }

        // Check for homework on this day
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayHomework = currentHomework.filter(hw => hw.due_date === dateStr && hw.status === 'incomplete');
        
        if (dayHomework.length > 0) {
            const maxUrgency = dayHomework.reduce((max, hw) => {
                if (hw.urgency === 'critical') return 'critical';
                if (hw.urgency === 'warning' && max !== 'critical') return 'warning';
                return max || 'normal';
            }, '');
            dayElement.classList.add('has-homework', maxUrgency);
            dayElement.title = `${dayHomework.length} งาน`;
        }

        dayElement.addEventListener('click', () => {
            showDayDetails(dateStr);
        });

        calendarDays.appendChild(dayElement);
    }

    // Next month days
    const totalCells = firstDay + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = day;
        calendarDays.appendChild(dayElement);
    }

    // Reload homework for calendar
    loadHomework();
}

function showDayDetails(dateStr) {
    const dayHomework = currentHomework.filter(hw => hw.due_date === dateStr);
    
    if (dayHomework.length === 0) {
        alert(`วันที่ ${dateStr} ไม่มีงาน`);
        return;
    }

    let details = `📅 วันที่ ${dateStr}\n\n`;
    dayHomework.forEach(hw => {
        details += `📚 ${hw.subject}\n${hw.task_name}\n`;
    });

    alert(details);
}

// Modal functions
function closeModal() {
    document.getElementById('editModal').classList.add('hidden');
    editingHomeworkId = null;
}

function handleEditHomework(e) {
    e.preventDefault();
    closeModal();
}

// Send reminder via LINE
async function sendReminder() {
    if (!currentUser) return;
    
    const btn = document.getElementById('sendReminderBtn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'กำลังส่ง...';

    try {
        const response = await fetch(`${API_URL}/send-reminder/${currentUser.id}`, {
            method: 'POST'
        });

        const result = await response.json();

        if (result.success) {
            alert('✅ ' + (result.message || 'ส่งเตือนสำเร็จ'));
        } else {
            alert('❌ ' + (result.message || 'ส่งเตือนไม่สำเร็จ'));
        }
    } catch (error) {
        console.error('Error sending reminder:', error);
        alert('❌ เกิดข้อผิดพลาดในการส่งเตือน');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}
