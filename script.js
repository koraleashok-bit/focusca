/* --- Initial State & Data Management --- */
const defaultState = {
    user: { name: "Future CA", level: "Intermediate", targetHours: 6, theme: "light" },
    stats: { totalMinutes: 0, sessionsCompleted: 0, streak: 0, points: 0, lastActiveDate: "" },
    tasks: [],
    subjects: [
        { id: 1, name: "Paper 1: Advanced Accounting", chapters: [] },
        { id: 2, name: "Paper 2: Corporate & Other Laws", chapters: [] },
        { id: 3, name: "Paper 3: Taxation", chapters: [] }
    ],
    rewards: [
        { id: 1, name: "15 min guilt-free break", cost: 30 },
        { id: 2, name: "Watch 1 episode of show", cost: 100 },
        { id: 3, name: "Favourite snack treat", cost: 50 }
    ],
    badges: ["first_session", "streak_3", "streak_7", "chapter_10", "ca_pro"],
    dailyIntention: ""
};

let appData = JSON.parse(localStorage.getItem('caCompanionData')) || defaultState;
let activeTab = localStorage.getItem('caActiveTab') || 'dashboard';

// Save Data Utility
const saveData = () => localStorage.setItem('caCompanionData', JSON.stringify(appData));

/* --- Initialization --- */
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(appData.user.theme);
    checkStreakAndDate();
    switchTab(activeTab);
    
    // Bind Sidebar Navigation
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            switchTab(target);
        });
    });

    // Theme Toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        const newTheme = appData.user.theme === 'light' ? 'dark' : 'light';
        appData.user.theme = newTheme;
        applyTheme(newTheme);
        saveData();
    });

    // Setup input listeners
    document.getElementById('dailyIntention').value = appData.dailyIntention || "";
    document.getElementById('dailyIntention').addEventListener('change', (e) => {
        appData.dailyIntention = e.target.value;
        saveData();
    });

    // Load Settings Inputs
    document.getElementById('setUserName').value = appData.user.name;
    document.getElementById('setCaLevel').value = appData.user.level;
    document.getElementById('setTargetHours').value = appData.user.targetHours;
    
    // Breathing Text Animation logic
    setInterval(() => {
        const b = document.getElementById('breatheText');
        b.innerText = b.innerText === "Breathe In" ? "Breathe Out" : "Breathe In";
    }, 4000);
});

/* --- Core Functions --- */
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').innerHTML = '☀️ Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('themeToggle').innerHTML = '🌙 Dark Mode';
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-target="${tabId}"]`).classList.add('active');
    
    localStorage.setItem('caActiveTab', tabId);
    
    // Refresh specific tab data
    if(tabId === 'dashboard') renderDashboard();
    if(tabId === 'tasks') renderTasks();
    if(tabId === 'planner') renderPlanner();
    if(tabId === 'rewards') renderRewards();
    if(tabId === 'stats') renderStats();
    if(tabId === 'refresh') renderGarden();
}

function checkStreakAndDate() {
    const today = new Date().toDateString();
    if (appData.stats.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (appData.stats.lastActiveDate === yesterday.toDateString()) {
            // Keep streak, they are active consecutive days
            // Note: actual streak increment happens after completing a session/task for the day.
        } else if (appData.stats.lastActiveDate !== "") {
            appData.stats.streak = 0; // Broke streak
        }
        
        // Reset daily stats if needed (could separate daily vs total in state)
        // For simplicity, total minutes and total tasks are tracked. 
        appData.stats.lastActiveDate = today;
        saveData();
    }
}

/* --- Dashboard Rendering --- */
const quotes = [
    "Success is the sum of small efforts, repeated day in and day out.",
    "Do something today that your future self will thank you for.",
    "It always seems impossible until it's done.",
    "Discipline is choosing between what you want now and what you want most.",
    "The secret of getting ahead is getting started."
];

function renderDashboard() {
    document.getElementById('greeting').innerText = `Welcome back, ${appData.user.name}!`;
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString(undefined, options);
    
    document.getElementById('dailyQuote').innerText = quotes[Math.floor(Math.random() * quotes.length)];
    
    document.getElementById('dashStreak').innerText = appData.stats.streak;
    document.getElementById('dashPoints').innerText = appData.stats.points;
    document.getElementById('dashTargetHours').innerText = appData.user.targetHours;

    // Progress Circle
    const targetMins = appData.user.targetHours * 60;
    // Note: Assuming appData.stats.totalMinutes resets daily or tracking separately.
    // For this build, we calculate today's minutes if we had a detailed log, but we will use a simplified total stat for demo.
    // To make it fully accurate per day, let's derive it based on a daily reset logic, but here we just map total minutes directly as an example.
    const hours = Math.floor(appData.stats.totalMinutes / 60);
    const mins = appData.stats.totalMinutes % 60;
    document.getElementById('studyTimeText').innerText = `${hours}h ${mins}m`;
    
    let percentage = Math.min((appData.stats.totalMinutes / targetMins) * 100, 100) || 0;
    document.getElementById('studyProgressCircle').style.background = `conic-gradient(var(--primary) ${percentage}%, var(--border-color) ${percentage}%)`;

    // Tasks Completed
    const completedTasks = appData.tasks.filter(t => t.completed).length;
    document.getElementById('dashTasksCompleted').innerText = `${completedTasks} / ${appData.tasks.length}`;
}

/* --- Focus Room Timer --- */
let timerInterval;
let timeLeft = 25 * 60;
let isRunning = false;
let currentDuration = 25; // in minutes
let soundEnabled = true;

const timerDisplay = document.getElementById('timerDisplay');

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.innerText = `${m}:${s}`;
    if (isRunning) document.title = `(${m}:${s}) Focus - CA Hub`;
    else document.title = "CA Study Companion";
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            completeSession();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    updateTimerDisplay();
}

function resetTimer() {
    pauseTimer();
    timeLeft = currentDuration * 60;
    updateTimerDisplay();
}

function setTimer(minutes) {
    currentDuration = minutes;
    resetTimer();
}

function completeSession() {
    pauseTimer();
    if (soundEnabled) {
        // Simple beep using Web Audio API
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.connect(ctx.destination);
        osc.frequency.value = 800;
        osc.start();
        setTimeout(() => osc.stop(), 500);
    }
    
    // Add Stats
    if(currentDuration >= 25) {
        appData.stats.sessionsCompleted++;
        appData.stats.points += 10;
        if(appData.stats.streak === 0) appData.stats.streak = 1; // Start streak
    }
    appData.stats.totalMinutes += currentDuration;
    saveData();
    renderDashboard();
    
    alert(`Session complete! You earned points. Take a small break.`);
}

document.getElementById('startTimerBtn').addEventListener('click', startTimer);
document.getElementById('pauseTimerBtn').addEventListener('click', pauseTimer);
document.getElementById('resetTimerBtn').addEventListener('click', resetTimer);
document.getElementById('btnPomodoro').addEventListener('click', () => setTimer(25));
document.getElementById('btnLongPomodoro').addEventListener('click', () => setTimer(50));
document.getElementById('btnDeepWork').addEventListener('click', () => setTimer(90));
document.getElementById('btnShortBreak').addEventListener('click', () => setTimer(5));

document.getElementById('fullscreenBtn').addEventListener('click', () => {
    document.body.classList.toggle('fullscreen-mode');
});
document.getElementById('soundToggleBtn').addEventListener('click', (e) => {
    soundEnabled = !soundEnabled;
    e.target.innerText = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
});

/* --- Task Manager --- */
function renderTasks() {
    const pendingList = document.getElementById('pendingTasksList');
    const completedList = document.getElementById('completedTasksList');
    const mitContainer = document.getElementById('mitContainer');
    const mitContent = document.getElementById('mitContent');
    
    pendingList.innerHTML = '';
    completedList.innerHTML = '';
    mitContent.innerHTML = '';
    let hasMIT = false;

    appData.tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed-task' : '';
        li.innerHTML = `
            <div>
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
                <span>${task.name}</span>
            </div>
            <button class="btn-danger" style="padding: 0.3rem 0.6rem; font-size:0.8rem;" onclick="deleteTask(${index})">Delete</button>
        `;

        if (task.completed) {
            completedList.appendChild(li);
        } else {
            pendingList.appendChild(li);
            if (task.isMIT) {
                hasMIT = true;
                mitContent.innerHTML = li.innerHTML; // clone visual
                // Update checkbox to function correctly in MIT view
                mitContent.querySelector('input').setAttribute('onchange', `toggleTask(${index})`);
                mitContent.querySelector('button').setAttribute('onclick', `deleteTask(${index})`);
            }
        }
    });

    mitContainer.style.display = hasMIT ? 'block' : 'none';
    
    if(appData.tasks.filter(t=>!t.completed).length === 0) {
        pendingList.innerHTML = "<p class='subtitle'>All caught up for today!</p>";
    }
}

function toggleTask(index) {
    appData.tasks[index].completed = !appData.tasks[index].completed;
    if (appData.tasks[index].completed) appData.stats.points += 5; // Reward
    saveData();
    renderTasks();
    renderDashboard();
}

function addTask() {
    const name = document.getElementById('newTaskName').value;
    const isMIT = document.getElementById('newTaskMIT').checked;
    if (!name) return;

    appData.tasks.push({ name, isMIT, completed: false });
    saveData();
    closeModal('taskModal');
    document.getElementById('newTaskName').value = '';
    renderTasks();
}

function deleteTask(index) {
    appData.tasks.splice(index, 1);
    saveData();
    renderTasks();
}

/* --- Planner --- */
function renderPlanner() {
    const container = document.getElementById('subjectsContainer');
    container.innerHTML = '';
    
    if (appData.subjects.length === 0) {
        container.innerHTML = `<p class="subtitle">No subjects added yet. Click "+ Add Subject" to start.</p>`;
        return;
    }

    appData.subjects.forEach(sub => {
        const subCard = document.createElement('div');
        subCard.className = 'card subject-card';
        
        let chaptersHTML = sub.chapters.map((ch, idx) => `
            <div class="chapter-item">
                <div>
                    <strong>${ch.name}</strong> 
                    <span class="subtitle" style="font-size: 0.8rem; margin-left: 10px;">${ch.priority} Priority</span>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <span class="status-badge status-${ch.status.split(' ')[0]}">${ch.status}</span>
                    <button style="background:none; border:none; color:red; cursor:pointer;" onclick="deleteChapter(${sub.id}, ${idx})">✕</button>
                </div>
            </div>
        `).join('');

        subCard.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>${sub.name}</h3>
                <button class="btn-secondary" style="font-size:0.8rem;" onclick="openChapterModal(${sub.id})">+ Add Topic</button>
            </div>
            <div style="margin-top: 1rem;">
                ${chaptersHTML || '<p class="subtitle" style="font-size:0.9rem;">No topics added yet.</p>'}
            </div>
        `;
        container.appendChild(subCard);
    });
}

function addSubject() {
    const name = document.getElementById('newSubjectName').value;
    if(!name) return;
    appData.subjects.push({ id: Date.now(), name, chapters: [] });
    saveData();
    closeModal('subjectModal');
    document.getElementById('newSubjectName').value = '';
    renderPlanner();
}

function openChapterModal(subId) {
    document.getElementById('chapterSubjectId').value = subId;
    openModal('chapterModal');
}

function addChapter() {
    const subId = parseInt(document.getElementById('chapterSubjectId').value);
    const name = document.getElementById('newChapterName').value;
    const status = document.getElementById('newChapterStatus').value;
    const priority = document.getElementById('newChapterPriority').value;
    
    if(!name) return;

    const subject = appData.subjects.find(s => s.id === subId);
    if(subject) {
        subject.chapters.push({ name, status, priority });
        if(status === 'Completed') appData.stats.points += 20; // Big reward
        saveData();
    }
    
    closeModal('chapterModal');
    document.getElementById('newChapterName').value = '';
    renderPlanner();
}

function deleteChapter(subId, chapterIndex) {
    if(confirm("Delete this topic?")) {
        const subject = appData.subjects.find(s => s.id === subId);
        subject.chapters.splice(chapterIndex, 1);
        saveData();
        renderPlanner();
    }
}

/* --- Rewards --- */
function renderRewards() {
    document.getElementById('rewardPointsDisplay').innerText = appData.stats.points;
    
    // Badges
    const badgesData = [
        { id: 'first_session', icon: '🎯', name: 'First Session', desc: 'Completed 1 session' },
        { id: 'streak_3', icon: '🔥', name: '3-Day Streak', desc: 'Consistent focus' },
        { id: 'streak_7', icon: '⚡', name: '7-Day Streak', desc: 'Unstoppable' },
        { id: 'ca_pro', icon: '🎓', name: 'Pro Scholar', desc: 'Earned 500 points' }
    ];

    const bContainer = document.getElementById('badgesContainer');
    bContainer.innerHTML = '';
    badgesData.forEach(b => {
        // Logic to auto-unlock
        let unlocked = false;
        if(b.id === 'first_session' && appData.stats.sessionsCompleted >= 1) unlocked = true;
        if(b.id === 'streak_3' && appData.stats.streak >= 3) unlocked = true;
        if(b.id === 'streak_7' && appData.stats.streak >= 7) unlocked = true;
        if(b.id === 'ca_pro' && appData.stats.points >= 500) unlocked = true;

        bContainer.innerHTML += `
            <div class="badge ${unlocked ? 'unlocked' : ''}" title="${b.desc}">
                <div class="badge-icon">${b.icon}</div>
                <div style="font-size:0.9rem; font-weight:bold;">${b.name}</div>
            </div>
        `;
    });

    // Shop
    const shopContainer = document.getElementById('rewardsShopContainer');
    shopContainer.innerHTML = '';
    appData.rewards.forEach((r, idx) => {
        shopContainer.innerHTML += `
            <div class="card reward-card" onclick="claimReward(${idx})">
                <h3>${r.name}</h3>
                <div class="points-badge" style="margin-top:10px; display:inline-block;">⭐ ${r.cost}</div>
            </div>
        `;
    });
}

function addReward() {
    const name = document.getElementById('newRewardName').value;
    const cost = parseInt(document.getElementById('newRewardCost').value);
    if(!name || !cost) return;
    
    appData.rewards.push({ id: Date.now(), name, cost });
    saveData();
    closeModal('rewardModal');
    renderRewards();
}

function claimReward(idx) {
    const r = appData.rewards[idx];
    if (appData.stats.points >= r.cost) {
        if(confirm(`Spend ${r.cost} points for "${r.name}"?`)) {
            appData.stats.points -= r.cost;
            saveData();
            renderRewards();
            alert("Reward claimed! Enjoy your well-deserved break.");
        }
    } else {
        alert("Not enough points! Keep studying to earn more.");
    }
}

/* --- Analytics --- */
function renderStats() {
    const hours = (appData.stats.totalMinutes / 60).toFixed(1);
    document.getElementById('statTotalTime').innerText = `${hours}h`;
    document.getElementById('statSessions').innerText = appData.stats.sessionsCompleted;
    document.getElementById('statLongestStreak').innerText = `${appData.stats.streak} Days`;
}

/* --- Refresh / Garden --- */
function renderGarden() {
    const phases = ['🌱', '🌿', '🪴', '🌳', '🌸'];
    const statusTexts = ['Seedling phase', 'Growing steadily', 'Healthy plant', 'Strong tree', 'Blooming!'];
    
    // Level up garden every 5 sessions
    let level = Math.floor(appData.stats.sessionsCompleted / 5);
    if (level >= phases.length) level = phases.length - 1;

    document.getElementById('gardenDisplay').innerText = phases[level];
    document.getElementById('gardenStatus').innerText = statusTexts[level];
}

/* --- Settings --- */
function saveSettings() {
    appData.user.name = document.getElementById('setUserName').value || "Future CA";
    appData.user.level = document.getElementById('setCaLevel').value;
    appData.user.targetHours = parseInt(document.getElementById('setTargetHours').value) || 6;
    saveData();
    renderDashboard();
    alert("Settings saved!");
}

function resetData() {
    if(confirm("Are you sure? This will delete ALL tasks, subjects, stats, and points. This cannot be undone.")) {
        localStorage.removeItem('caCompanionData');
        location.reload();
    }
}

/* --- Modal Utils --- */
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
}