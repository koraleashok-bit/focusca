/* --- Initial State & Data Management --- */
const defaultState = {
    user: { 
        name: "Future CA", 
        level: "Intermediate", 
        targetHours: 6, 
        theme: "default",          // Original basic theme property
        activeTheme: "default",    // New Advanced Theme engine
        unlockedThemes: ["default", "dark"] 
    },
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

// Backward Compatibility & Data Safety Upgrades
if (!appData.tasks) {
    appData.tasks = [];
}
if (!appData.user.unlockedThemes) {
    appData.user.unlockedThemes = ["default", "dark"];
}
if (!appData.user.activeTheme) {
    appData.user.activeTheme = appData.user.theme === 'dark' ? 'dark' : 'default';
}

let activeTab = localStorage.getItem('caActiveTab') || 'dashboard';

// Save Data Utility
const saveData = () => localStorage.setItem('caCompanionData', JSON.stringify(appData));

/* --- Premium Themes Database (New Addition) --- */
const premiumThemes = [
    { id: 'default', name: 'Classic Light', price: 0, thumbClass: 'thumb-default', desc: 'The original clean and bright study experience.' },
    { id: 'dark', name: 'Classic Dark', price: 0, thumbClass: 'thumb-dark', desc: 'A soft, easy-on-the-eyes dark mode.' },
    { id: 'midnight-focus', name: 'Midnight Focus 🌙', price: 300, thumbClass: 'thumb-midnight', desc: 'Deep navy with subtle purple accents. Perfect for late-night sessions.' },
    { id: 'sakura-dreams', name: 'Sakura Dreams 🌸', price: 400, thumbClass: 'thumb-sakura', desc: 'Pastel pink and lavender. A gentle and peaceful aesthetic.' },
    { id: 'ocean-breeze', name: 'Ocean Breeze 🌊', price: 350, thumbClass: 'thumb-ocean', desc: 'Ocean blue and aqua. Creates a fresh and relaxing environment.' },
    { id: 'emerald-sanctuary', name: 'Emerald Sanctuary 🌿', price: 500, thumbClass: 'thumb-emerald', desc: 'Forest-green and cream. A premium, luxurious, nature-inspired space.' }
];

let previewOriginalTheme = null;
let currentPreviewThemeObj = null;

/* --- Initialization --- */
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(appData.user.activeTheme);
    checkStreakAndDate();
    switchTab(activeTab);
    
    // Bind Sidebar Navigation
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            switchTab(target);
        });
    });

    // Theme Toggles
    const toggleThemeFn = () => {
        const newTheme = appData.user.activeTheme === 'dark' ? 'default' : 'dark';
        appData.user.activeTheme = newTheme;
        applyTheme(newTheme);
        saveData();
        if(activeTab === 'rewards') renderRewards();
    };
    document.getElementById('themeToggle').addEventListener('click', toggleThemeFn);
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    if(mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleThemeFn);
    }

    // Setup Intentions input
    const dailyIntentionInput = document.getElementById('dailyIntention');
    dailyIntentionInput.value = appData.dailyIntention || "";
    dailyIntentionInput.addEventListener('change', (e) => {
        appData.dailyIntention = e.target.value;
        saveData();
    });

    // Load Settings Inputs
    document.getElementById('setUserName').value = appData.user.name || "Future CA";
    document.getElementById('setCaLevel').value = appData.user.level || "Intermediate";
    document.getElementById('setTargetHours').value = appData.user.targetHours || 6;
    
    // Breathing Text Animation
    setInterval(() => {
        const b = document.getElementById('breatheText');
        if(b) {
            b.innerText = b.innerText === "Breathe In" ? "Breathe Out" : "Breathe In";
        }
    }, 4000);

    // Start Focus Quote Rotator
    initQuoteRotator();
});

/* --- Global Visual Theme Application (Modified for Advanced Themes) --- */
function applyTheme(themeId) {
    document.body.setAttribute('data-theme', themeId);
    
    if (themeId === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Update Toggle Button Text logically
    const toggleBtn = document.getElementById('themeToggle');
    if(themeId === 'dark') {
        toggleBtn.innerHTML = '☀️ Default Light';
    } else if(themeId === 'default') {
        toggleBtn.innerHTML = '🌙 Default Dark';
    } else {
        const foundTheme = premiumThemes.find(t=>t.id===themeId);
        toggleBtn.innerHTML = '🎨 Active: ' + (foundTheme ? foundTheme.name.split(' ')[0] : 'Custom');
    }

    // Meta browser color update
    const metaThemeColor = document.getElementById('metaThemeColor');
    if(metaThemeColor) {
        const bgColors = {
            'default': '#f4f6fa', 
            'dark': '#1a202c', 
            'midnight-focus': '#0b1121',
            'sakura-dreams': '#fdf2f8', 
            'ocean-breeze': '#f0fdfa', 
            'emerald-sanctuary': '#f0fdf4'
        };
        metaThemeColor.setAttribute("content", bgColors[themeId] || '#f4f6fa');
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    
    const targetPage = document.getElementById(tabId);
    const targetNav = document.querySelector(`[data-target="${tabId}"]`);
    
    if(targetPage) targetPage.classList.add('active');
    if(targetNav) {
        targetNav.classList.add('active');
        targetNav.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); 
    }
    
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
            // Consecutive day logic triggers upon task completion
        } else if (appData.stats.lastActiveDate !== "") {
            appData.stats.streak = 0; // Missed a day
        }
        appData.stats.lastActiveDate = today;
        saveData();
    }
}

/* --- Dashboard Rendering --- */
const dashboardQuotes = [
    "Success is the sum of small efforts, repeated day in and day out.",
    "Do something today that your future self will thank you for.",
    "It always seems impossible until it's done.",
    "Discipline is choosing between what you want now and what you want most."
];

function renderDashboard() {
    document.getElementById('greeting').innerText = `Welcome back, ${appData.user.name}!`;
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString(undefined, options);
    
    const dayOfYear = new Date().getDay();
    document.getElementById('dailyQuote').innerText = dashboardQuotes[dayOfYear % dashboardQuotes.length];
    
    document.getElementById('dashStreak').innerText = appData.stats.streak;
    document.getElementById('dashPoints').innerText = appData.stats.points;
    document.getElementById('dashTargetHours').innerText = appData.user.targetHours;

    const targetMins = appData.user.targetHours * 60;
    const hours = Math.floor(appData.stats.totalMinutes / 60);
    const mins = appData.stats.totalMinutes % 60;
    document.getElementById('studyTimeText').innerText = `${hours}h ${mins}m`;
    
    let percentage = Math.min((appData.stats.totalMinutes / targetMins) * 100, 100) || 0;
    document.getElementById('studyProgressCircle').style.background = `conic-gradient(var(--primary) ${percentage}%, var(--border-color) ${percentage}%)`;

    const completedTasks = appData.tasks.filter(t => t.completed).length;
    document.getElementById('dashTasksCompleted').innerText = `${completedTasks} / ${appData.tasks.length}`;
}

/* --- Focus Room: Intelligent Motivational Rotator --- */
const focusThoughts = [
    "You don't have to be perfect. You just have to keep showing up.",
    "Every page you study today brings you closer to your goal.",
    "Small progress is still progress. Never underestimate it.",
    "Your future is being built by what you do today.",
    "Stay patient. Your hard work is adding up.",
    "One focused hour is more powerful than five distracted hours.",
    "You started this journey for a reason. Remember it.",
    "Consistency will take you where motivation cannot.",
    "Don't count the days. Make the days count.",
    "The CA journey is challenging, but so are you."
];
let currentQuoteIndex = -1;
let quoteRotatorInterval = null;

function initQuoteRotator() {
    rotateQuote();
    if(quoteRotatorInterval) clearInterval(quoteRotatorInterval);
    quoteRotatorInterval = setInterval(rotateQuote, 300000);
}

function rotateQuote() {
    const quoteEl = document.getElementById('focusMotivationalQuote');
    if (!quoteEl) return;
    
    let nextIndex;
    do {
        nextIndex = Math.floor(Math.random() * focusThoughts.length);
    } while (nextIndex === currentQuoteIndex && focusThoughts.length > 1);
    
    currentQuoteIndex = nextIndex;

    quoteEl.classList.add('fade-out');
    setTimeout(() => {
        quoteEl.innerText = focusThoughts[currentQuoteIndex];
        quoteEl.classList.remove('fade-out');
    }, 500);
}

/* --- Focus Room Timer --- */
let timerInterval = null;
let timeLeft = 25 * 60; 
let currentDuration = 25; 
let isRunning = false;
let expectedEndTime = 0;
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
    if (timeLeft <= 0) resetTimer(); 

    isRunning = true;
    expectedEndTime = Date.now() + (timeLeft * 1000);
    
    if(timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        const now = Date.now();
        timeLeft = Math.round((expectedEndTime - now) / 1000);
        
        if (timeLeft <= 0) {
            timeLeft = 0;
            updateTimerDisplay();
            completeSession();
        } else {
            updateTimerDisplay();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
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
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.connect(ctx.destination);
            osc.frequency.value = 800;
            osc.start();
            setTimeout(() => osc.stop(), 500);
        } catch (e) {
            console.log("Audio not supported or blocked");
        }
    }
    
    if(currentDuration >= 25) {
        appData.stats.sessionsCompleted++;
        appData.stats.points += 10;
        if(appData.stats.streak === 0) appData.stats.streak = 1; 
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
    const isFS = document.body.classList.contains('fullscreen-mode');
    if (isFS && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(()=>{});
    } else if (!isFS && document.exitFullscreen) {
        document.exitFullscreen().catch(()=>{});
    }
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
        const isMitTask = task.isMIT === true; 
        
        const liHTML = `
            <li class="${task.completed ? 'completed-task' : ''}">
                <label class="task-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
                    <span class="task-name">${task.name}</span>
                </label>
                <button class="btn-danger" style="padding: 0.4rem 0.7rem; font-size:0.8rem;" onclick="deleteTask(${index})" aria-label="Delete Task">✕</button>
            </li>
        `;

        if (task.completed) {
            completedList.insertAdjacentHTML('beforeend', liHTML);
        } else {
            pendingList.insertAdjacentHTML('beforeend', liHTML);
            if (isMitTask) {
                hasMIT = true;
                mitContent.innerHTML = liHTML;
            }
        }
    });

    mitContainer.style.display = hasMIT ? 'block' : 'none';
    if(appData.tasks.filter(t=>!t.completed).length === 0) {
        pendingList.innerHTML = "<p class='subtitle' style='padding: 1rem 0;'>All caught up for today!</p>";
    }
}

window.toggleTask = function(index) {
    appData.tasks[index].completed = !appData.tasks[index].completed;
    if (appData.tasks[index].completed) {
        appData.stats.points += 5; 
        if(appData.stats.streak === 0) appData.stats.streak = 1;
    }
    saveData();
    renderTasks();
    renderDashboard();
};

window.addTask = function() {
    const name = document.getElementById('newTaskName').value.trim();
    const isMIT = document.getElementById('newTaskMIT').checked;
    if (!name) return;

    appData.tasks.push({ name, isMIT, completed: false });
    saveData();
    closeModal('taskModal');
    document.getElementById('newTaskName').value = '';
    document.getElementById('newTaskMIT').checked = false;
    renderTasks();
};

window.deleteTask = function(index) {
    appData.tasks.splice(index, 1);
    saveData();
    renderTasks();
};

/* --- Planner --- */
function renderPlanner() {
    const container = document.getElementById('subjectsContainer');
    container.innerHTML = '';
    
    if (appData.subjects.length === 0) {
        container.innerHTML = `<p class="subtitle text-center">No subjects added yet. Click "+ Add Subject" to start.</p>`;
        return;
    }

    appData.subjects.forEach(sub => {
        const subCard = document.createElement('div');
        subCard.className = 'card subject-card';
        
        let chaptersHTML = sub.chapters.map((ch, idx) => `
            <div class="chapter-item">
                <div class="chapter-info">
                    <strong>${ch.name}</strong> 
                    <span class="subtitle" style="font-size: 0.8rem;">${ch.priority} Priority</span>
                </div>
                <div class="chapter-actions">
                    <span class="status-badge status-${ch.status.split(' ')[0]}">${ch.status}</span>
                    <button class="btn-danger" style="padding: 0.3rem 0.6rem; font-size:0.8rem;" onclick="deleteChapter(${sub.id}, ${idx})">✕</button>
                </div>
            </div>
        `).join('');

        subCard.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 10px;">
                <h3 style="word-break: break-word; flex: 1;">${sub.name}</h3>
                <button class="btn-secondary" style="font-size:0.8rem; flex-shrink: 0;" onclick="openChapterModal(${sub.id})">+ Topic</button>
            </div>
            <div style="margin-top: 1rem;">
                ${chaptersHTML || '<p class="subtitle" style="font-size:0.9rem;">No topics added yet.</p>'}
            </div>
        `;
        container.appendChild(subCard);
    });
}

window.addSubject = function() {
    const name = document.getElementById('newSubjectName').value.trim();
    if(!name) return;
    appData.subjects.push({ id: Date.now(), name, chapters: [] });
    saveData();
    closeModal('subjectModal');
    document.getElementById('newSubjectName').value = '';
    renderPlanner();
};

window.openChapterModal = function(subId) {
    document.getElementById('chapterSubjectId').value = subId;
    openModal('chapterModal');
};

window.addChapter = function() {
    const subId = parseInt(document.getElementById('chapterSubjectId').value);
    const name = document.getElementById('newChapterName').value.trim();
    const status = document.getElementById('newChapterStatus').value;
    const priority = document.getElementById('newChapterPriority').value;
    
    if(!name) return;

    const subject = appData.subjects.find(s => s.id === subId);
    if(subject) {
        subject.chapters.push({ name, status, priority });
        if(status === 'Completed') appData.stats.points += 20; 
        saveData();
    }
    
    closeModal('chapterModal');
    document.getElementById('newChapterName').value = '';
    renderPlanner();
};

window.deleteChapter = function(subId, chapterIndex) {
    if(confirm("Delete this topic?")) {
        const subject = appData.subjects.find(s => s.id === subId);
        subject.chapters.splice(chapterIndex, 1);
        saveData();
        renderPlanner();
    }
};

/* --- Rewards & Design Studio Integration --- */
function renderRewards() {
    document.getElementById('rewardPointsDisplay').innerText = appData.stats.points;
    
    /* 1. Render My Collection (New Code) */
    const myCollectionContainer = document.getElementById('myCollectionContainer');
    myCollectionContainer.innerHTML = '';
    
    appData.user.unlockedThemes.forEach(themeId => {
        const theme = premiumThemes.find(t => t.id === themeId);
        if(!theme) return;
        const isActive = appData.user.activeTheme === themeId;
        
        myCollectionContainer.insertAdjacentHTML('beforeend', `
            <div class="card theme-card" style="${isActive ? 'border-color: var(--primary); transform: scale(1.02);' : ''}">
                ${isActive ? '<div class="theme-active-indicator">Active</div>' : ''}
                <div class="theme-thumbnail ${theme.thumbClass}"></div>
                <h3 style="font-size:1.1rem; margin-bottom: 0.5rem;">${theme.name}</h3>
                <button class="btn-${isActive ? 'secondary' : 'primary'} w-100" 
                        onclick="previewTheme('${theme.id}')"
                        ${isActive ? 'disabled' : ''}>
                    ${isActive ? 'Currently Active' : 'Preview & Apply'}
                </button>
            </div>
        `);
    });

    /* 2. Render Theme Shop (New Code) */
    const shopContainer = document.getElementById('themeShopContainer');
    shopContainer.innerHTML = '';
    let availableToBuy = 0;

    premiumThemes.forEach(theme => {
        if (!appData.user.unlockedThemes.includes(theme.id)) {
            availableToBuy++;
            shopContainer.insertAdjacentHTML('beforeend', `
                <div class="card theme-card">
                    <div class="theme-thumbnail ${theme.thumbClass}"></div>
                    <h3 style="font-size:1.1rem; margin-bottom: 0.5rem;">${theme.name}</h3>
                    <div class="points-badge" style="margin-bottom: 1rem; align-self: flex-start;">⭐ ${theme.price} Points</div>
                    <button class="btn-primary w-100" onclick="previewTheme('${theme.id}')">Preview Design</button>
                </div>
            `);
        }
    });

    if (availableToBuy === 0) {
        shopContainer.innerHTML = `<p class="subtitle w-100 text-center" style="grid-column: 1/-1; padding: 2rem 0;">You have unlocked every premium theme! Amazing dedication.</p>`;
    }

    /* 3. Render Badges (Original Code Maintained) */
    const badgesData = [
        { id: 'first_session', icon: '🎯', name: 'First Session' },
        { id: 'streak_3', icon: '🔥', name: '3-Day Streak' },
        { id: 'streak_7', icon: '⚡', name: '7-Day Streak' },
        { id: 'ca_pro', icon: '🎓', name: 'Pro Scholar' }
    ];

    const bContainer = document.getElementById('badgesContainer');
    bContainer.innerHTML = '';
    badgesData.forEach(b => {
        let unlocked = false;
        if(b.id === 'first_session' && appData.stats.sessionsCompleted >= 1) unlocked = true;
        if(b.id === 'streak_3' && appData.stats.streak >= 3) unlocked = true;
        if(b.id === 'streak_7' && appData.stats.streak >= 7) unlocked = true;
        if(b.id === 'ca_pro' && appData.stats.points >= 500) unlocked = true;

        bContainer.insertAdjacentHTML('beforeend', `
            <div class="badge ${unlocked ? 'unlocked' : ''}">
                <div class="badge-icon">${b.icon}</div>
                <div class="badge-name">${b.name}</div>
            </div>
        `);
    });

    /* 4. Render Custom Rewards Shop (Original Code Maintained) */
    const shopItemsContainer = document.getElementById('rewardsShopContainer');
    shopItemsContainer.innerHTML = '';
    appData.rewards.forEach((r, idx) => {
        shopItemsContainer.insertAdjacentHTML('beforeend', `
            <div class="card reward-card" tabindex="0" onclick="claimReward(${idx})" onkeypress="if(event.key === 'Enter') claimReward(${idx})">
                <h3 style="font-size: 1.1rem; margin-bottom: auto;">${r.name}</h3>
                <div class="points-badge" style="margin-top:10px;">⭐ ${r.cost}</div>
            </div>
        `);
    });
}

/* --- Theme Preview & Purchase Logic (New Addition) --- */
window.previewTheme = function(themeId) {
    currentPreviewThemeObj = premiumThemes.find(t => t.id === themeId);
    previewOriginalTheme = appData.user.activeTheme; 
    
    // Live apply to preview visually
    applyTheme(themeId);

    // Setup Modal Info
    document.getElementById('previewThemeTitle').innerText = currentPreviewThemeObj.name;
    document.getElementById('previewThemeDesc').innerText = currentPreviewThemeObj.desc;
    document.getElementById('previewThemeThumb').className = `theme-thumbnail ${currentPreviewThemeObj.thumbClass}`;
    
    const isUnlocked = appData.user.unlockedThemes.includes(themeId);
    
    if (isUnlocked) {
        document.getElementById('previewPriceContainer').style.display = 'none';
        document.getElementById('purchaseThemeBtn').style.display = 'none';
        document.getElementById('applyThemeBtn').style.display = 'inline-flex';
    } else {
        document.getElementById('previewPriceContainer').style.display = 'block';
        document.getElementById('previewThemePrice').innerText = `Price: ${currentPreviewThemeObj.price} ⭐`;
        document.getElementById('purchaseThemeBtn').style.display = 'inline-flex';
        document.getElementById('applyThemeBtn').style.display = 'none';
    }

    openModal('themePreviewModal');
};

window.cancelThemePreview = function() {
    applyTheme(previewOriginalTheme); 
    closeModal('themePreviewModal');
    currentPreviewThemeObj = null;
};

window.applyThemeFromPreview = function() {
    appData.user.activeTheme = currentPreviewThemeObj.id;
    saveData();
    closeModal('themePreviewModal');
    renderRewards();
};

window.purchaseTheme = function() {
    if (appData.stats.points >= currentPreviewThemeObj.price) {
        if(confirm(`Are you sure you want to spend ${currentPreviewThemeObj.price} points on ${currentPreviewThemeObj.name}?`)) {
            // Deduct exactly
            appData.stats.points -= currentPreviewThemeObj.price;
            // Unlock and Activate
            appData.user.unlockedThemes.push(currentPreviewThemeObj.id);
            appData.user.activeTheme = currentPreviewThemeObj.id;
            saveData();
            
            closeModal('themePreviewModal');
            renderRewards();
            
            // Celebration Animation Trigger
            const overlay = document.getElementById('celebrationOverlay');
            overlay.classList.add('show-celebration');
            setTimeout(() => {
                overlay.classList.remove('show-celebration');
            }, 2500);
        }
    } else {
        alert("Not enough points! Keep completing focus sessions to earn more.");
    }
};

/* --- Original Rewards Modals Maintained --- */
window.addReward = function() {
    const name = document.getElementById('newRewardName').value.trim();
    const cost = parseInt(document.getElementById('newRewardCost').value);
    if(!name || isNaN(cost)) return;
    
    appData.rewards.push({ id: Date.now(), name, cost });
    saveData();
    closeModal('rewardModal');
    document.getElementById('newRewardName').value = '';
    document.getElementById('newRewardCost').value = '';
    renderRewards();
};

window.claimReward = function(idx) {
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
};

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
    
    let level = Math.floor(appData.stats.sessionsCompleted / 5);
    if (level >= phases.length) level = phases.length - 1;

    document.getElementById('gardenDisplay').innerText = phases[level];
    document.getElementById('gardenStatus').innerText = statusTexts[level];
}

/* --- Settings --- */
window.saveSettings = function() {
    appData.user.name = document.getElementById('setUserName').value.trim() || "Future CA";
    appData.user.level = document.getElementById('setCaLevel').value;
    appData.user.targetHours = parseInt(document.getElementById('setTargetHours').value) || 6;
    saveData();
    renderDashboard();
    alert("Settings saved successfully!");
};

window.resetData = function() {
    if(confirm("Are you sure? This will delete ALL tasks, subjects, stats, and points. This cannot be undone.")) {
        localStorage.removeItem('caCompanionData');
        location.reload();
    }
};

/* --- Modal Utils --- */
window.openModal = function(id) { document.getElementById(id).classList.add('show'); };
window.closeModal = function(id) { document.getElementById(id).classList.remove('show'); };

// Accessible Modal Close via Outside Click or Escape
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) event.target.classList.remove('show');
});
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if(currentPreviewThemeObj) {
            cancelThemePreview();
        } else {
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
        }
    }
});