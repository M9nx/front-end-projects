// Focus To-Do Application JavaScript
// All core functionality with detailed comments for manual completion

class FocusToDoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('focusTasks')) || [];
        this.currentCategory = 'today';
        this.isTimerRunning = false;
        this.timerInterval = null;
        this.timerMinutes = 25;
        this.timerSeconds = 0;
        this.theme = localStorage.getItem('focusTheme') || 'dark';

        // Enhanced Pomodoro Settings
        this.pomodoroSettings = {
            focusLength: 25,
            shortBreakLength: 5,
            longBreakLength: 15,
            sessionsUntilLongBreak: 4,
            autoStartBreaks: false,
            autoStartFocus: false,
            sound: {
                enabled: true,
                volume: 0.5,
                focusEnd: 'bell',
                breakEnd: 'chime'
            },
            notifications: true,
            currentMode: 'focus',
            completedSessions: 0,
            totalFocusTime: 0,
            sessionHistory: []
        };

        // Load saved Pomodoro settings
        this.loadPomodoroSettings();

        this.init();
    }

    init() {
        console.log('Initializing FocusToDoApp...');
        this.setupEventListeners();
        this.applyTheme();
        this.updateThemeIcon();
        this.renderTasks();
        this.updateStats();
        this.updateCategoryCounts();
        console.log('FocusToDoApp initialized successfully');
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Theme selector
        document.addEventListener('DOMContentLoaded', () => {
            const themeSelector = document.getElementById('themeSelector');
            if (themeSelector) {
                themeSelector.value = this.theme;
                themeSelector.addEventListener('change', (e) => {
                    this.changeTheme(e.target.value);
                });
            }
        });

        // Navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => this.switchCategory(e.currentTarget.dataset.category));
        });

        // Enhanced Task input
        this.setupTaskInput();

        // Timer controls
        const timerBtn = document.getElementById('timerBtn');
        if (timerBtn) {
            timerBtn.addEventListener('click', () => this.toggleTimer());
        }

        // Double click on timer to open fullscreen modal
        const pomodoroTimer = document.getElementById('pomodoroTimer');
        if (pomodoroTimer) {
            pomodoroTimer.addEventListener('dblclick', () => this.openTimerModal());
        }

        // Completed tasks toggle
        const toggleCompleted = document.getElementById('toggleCompleted');
        if (toggleCompleted) {
            toggleCompleted.addEventListener('click', () => this.toggleCompletedTasks());
        }

        // Add project button
        const addProjectBtn = document.querySelector('.add-project-btn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => this.addProject());
        }

        // Settings and other buttons (with null checks)
        const settingsBtn = document.querySelector('.settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }

        const notificationsBtn = document.querySelector('.notifications');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => this.showNotifications());
        }

        const statsBtn = document.querySelector('.stats');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => this.showDetailedStats());
        }

        const starBtn = document.querySelector('.star');
        if (starBtn) {
            starBtn.addEventListener('click', () => this.showFavorites());
        }

        // Timer modal controls
        const timerCloseBtn = document.getElementById('timerCloseBtn');
        const modalContinueBtn = document.getElementById('modalContinueBtn');
        const modalStopBtn = document.getElementById('modalStopBtn');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const timerModeBtn = document.getElementById('timerModeBtn');
        const whiteNoiseBtn = document.getElementById('whiteNoiseBtn');
        const homeBtn = document.getElementById('homeBtn');

        // Check if elements exist and add event listeners with error handling
        if (timerCloseBtn) {
            timerCloseBtn.addEventListener('click', () => {
                console.log('Close button clicked');
                this.closeTimerModal();
            });
        }

        if (modalContinueBtn) {
            modalContinueBtn.addEventListener('click', () => {
                console.log('Continue button clicked');
                this.toggleTimer();
            });
        }

        if (modalStopBtn) {
            modalStopBtn.addEventListener('click', () => {
                console.log('Stop button clicked');
                this.stopTimer();
            });
        }

        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                console.log('Fullscreen button clicked');
                this.toggleFullscreen();
            });
        }

        if (timerModeBtn) {
            timerModeBtn.addEventListener('click', () => {
                console.log('Timer mode button clicked');
                this.changeTimerMode();
                this.closeTimerModal();
            });
        }

        if (whiteNoiseBtn) {
            whiteNoiseBtn.addEventListener('click', () => {
                console.log('White noise button clicked');
                this.toggleWhiteNoise();
            });
        }

        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                console.log('Home button clicked');
                this.closeTimerModal();
            });
        }

        // Add keyboard support for closing timer modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('timerModal');
                if (modal && modal.classList.contains('active')) {
                    this.closeTimerModal();
                }
            }
        });
    }

    // Theme Management
    toggleTheme() {
        const themes = ['dark', 'light', 'ocean', 'matrix', 'yellow'];
        const currentIndex = themes.indexOf(this.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.theme = themes[nextIndex];
        this.applyTheme();
        localStorage.setItem('focusTheme', this.theme);
        this.updateThemeIcon();
        this.updateThemeSelector();
    }

    applyTheme() {
        document.body.className = `${this.theme}-theme`;
    }

    updateThemeIcon() {
        const themeToggle = document.querySelector('.theme-toggle');
        const icons = {
            'dark': '🌙',
            'light': '☀️',
            'ocean': '🌊',
            'matrix': '💚',
            'yellow': '⚡'
        };
        themeToggle.textContent = icons[this.theme];
    }

    updateThemeSelector() {
        const themeSelector = document.getElementById('themeSelector');
        if (themeSelector) {
            themeSelector.value = this.theme;
        }
    }

    changeTheme(newTheme) {
        this.theme = newTheme;
        this.applyTheme();
        localStorage.setItem('focusTheme', this.theme);
        this.updateThemeIcon();
    }

    // Enhanced Task Input Setup
    setupTaskInput() {
        const taskInput = document.getElementById('taskInput');
        const quickAddBtn = document.getElementById('quickAddBtn');
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskOptions = document.getElementById('taskOptions');
        const saveTaskBtn = document.getElementById('saveTaskBtn');
        const cancelTaskBtn = document.getElementById('cancelTaskBtn');

        let isExpanded = false;

        // Quick add mode toggle
        quickAddBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            if (isExpanded) {
                taskOptions.classList.add('expanded');
                quickAddBtn.textContent = '⚡';
                quickAddBtn.title = 'Simple Mode';
            } else {
                taskOptions.classList.remove('expanded');
                quickAddBtn.textContent = '⚡';
                quickAddBtn.title = 'Advanced Mode';
                this.resetTaskForm();
            }
        });

        // Simple task input (Enter key)
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                if (!isExpanded) {
                    this.addTask(e.target.value.trim());
                    e.target.value = '';
                } else {
                    this.saveAdvancedTask();
                }
            }
        });

        // Simple add button
        addTaskBtn.addEventListener('click', () => {
            if (taskInput.value.trim()) {
                if (!isExpanded) {
                    this.addTask(taskInput.value.trim());
                    taskInput.value = '';
                } else {
                    this.saveAdvancedTask();
                }
            }
        });

        // Advanced mode save
        saveTaskBtn.addEventListener('click', () => {
            this.saveAdvancedTask();
        });

        // Cancel advanced mode
        cancelTaskBtn.addEventListener('click', () => {
            this.resetTaskForm();
            isExpanded = false;
            taskOptions.classList.remove('expanded');
        });

        // Auto-expand on input focus (optional)
        taskInput.addEventListener('focus', () => {
            if (taskInput.value.length > 20) {
                isExpanded = true;
                taskOptions.classList.add('expanded');
            }
        });
    }

    resetTaskForm() {
        document.getElementById('taskInput').value = '';
        document.getElementById('taskPriority').value = 'medium';
        document.getElementById('taskCategory').value = 'today';
        document.getElementById('taskDueDate').value = '';
        document.getElementById('taskEstimate').value = '30';
        document.getElementById('taskDescription').value = '';
    }

    saveAdvancedTask() {
        const title = document.getElementById('taskInput').value.trim();
        if (!title) return;

        const priority = document.getElementById('taskPriority').value;
        const category = document.getElementById('taskCategory').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const estimate = parseInt(document.getElementById('taskEstimate').value);
        const description = document.getElementById('taskDescription').value.trim();

        this.addAdvancedTask({
            title,
            priority,
            category,
            dueDate: dueDate || null,
            estimatedTime: estimate,
            description
        });

        this.resetTaskForm();
        document.getElementById('taskOptions').classList.remove('expanded');
    }

    addAdvancedTask(taskData) {
        const task = {
            id: Date.now().toString(),
            title: taskData.title,
            completed: false,
            priority: taskData.priority,
            category: taskData.category,
            createdAt: new Date().toISOString(),
            dueDate: taskData.dueDate,
            estimatedTime: taskData.estimatedTime,
            actualTime: 0,
            description: taskData.description || '',
            tags: []
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.updateCategoryCounts();

        // Show success notification
        this.showNotification(`Task "${task.title}" added successfully!`, 'success');
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Task Management
    addTask(title) {
        const task = {
            id: Date.now().toString(),
            title: title,
            completed: false,
            priority: 'medium', // default priority
            category: this.currentCategory,
            createdAt: new Date().toISOString(),
            dueDate: null,
            estimatedTime: 0, // in minutes
            actualTime: 0, // in minutes
            tags: []
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.updateCategoryCounts();
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.updateCategoryCounts();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.updateCategoryCounts();
    }

    editTask(taskId, updates) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            Object.assign(task, updates);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.updateCategoryCounts();
        }
    }

    // Category Management
    switchCategory(category) {
        this.currentCategory = category;

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Update section title
        const titles = {
            'today': 'Today',
            'overdue': 'Overdue',
            'tomorrow': 'Tomorrow',
            'thisweek': 'This Week',
            'next7days': 'Next 7 Days',
            'high': 'High Priority',
            'medium': 'Medium Priority',
            'low': 'Low Priority',
            'planned': 'Planned',
            'all': 'All Tasks',
            'someday': 'Someday',
            'completed': 'Completed',
            'tasks': 'Tasks'
        };

        document.querySelector('.section-title').textContent = titles[category] || 'Tasks';

        this.renderTasks();
        this.updateStats();
    }

    getFilteredTasks() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        switch (this.currentCategory) {
            case 'today':
                // TODO: Implement logic to filter tasks due today
                return this.tasks.filter(task => !task.completed);

            case 'overdue':
                // TODO: Implement logic to filter overdue tasks
                return this.tasks.filter(task => !task.completed && task.dueDate && new Date(task.dueDate) < today);

            case 'tomorrow':
                // TODO: Implement logic to filter tasks due tomorrow
                return this.tasks.filter(task => !task.completed && task.dueDate &&
                    new Date(task.dueDate).toDateString() === tomorrow.toDateString());

            case 'thisweek':
                // TODO: Implement logic to filter tasks due this week
                return this.tasks.filter(task => !task.completed);

            case 'next7days':
                // TODO: Implement logic to filter tasks due in next 7 days
                return this.tasks.filter(task => !task.completed);

            case 'high':
                return this.tasks.filter(task => !task.completed && task.priority === 'high');

            case 'medium':
                return this.tasks.filter(task => !task.completed && task.priority === 'medium');

            case 'low':
                return this.tasks.filter(task => !task.completed && task.priority === 'low');

            case 'planned':
                // TODO: Implement logic for planned tasks (tasks with due dates)
                return this.tasks.filter(task => !task.completed && task.dueDate);

            case 'someday':
                // TODO: Implement logic for someday tasks (no due date)
                return this.tasks.filter(task => !task.completed && !task.dueDate);

            case 'completed':
                return this.tasks.filter(task => task.completed);

            case 'all':
            case 'tasks':
            default:
                return this.tasks;
        }
    }

    // Rendering
    renderTasks() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();
        const incompleteTasks = filteredTasks.filter(task => !task.completed);

        if (incompleteTasks.length === 0) {
            taskList.innerHTML = '';
            taskList.appendChild(emptyState);
        } else {
            emptyState.style.display = 'none';
            taskList.innerHTML = incompleteTasks.map(task => this.createTaskHTML(task)).join('');

            // Add event listeners to new task elements
            this.attachTaskEventListeners();
        }
    }

    createTaskHTML(task) {
        const priorityColors = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
        };

        return `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'completed' : ''}" data-task-id="${task.id}"></div>
                <div class="task-content">
                    <div class="task-title ${task.completed ? 'completed' : ''}">${task.title}</div>
                    <div class="task-meta">
                        <div class="task-priority">
                            ${priorityColors[task.priority]} ${task.priority}
                        </div>
                        ${task.estimatedTime ? `<span>⏱️ ${task.estimatedTime}min</span>` : ''}
                        ${task.dueDate ? `<span>📅 ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit-task" data-task-id="${task.id}">✏️</button>
                    <button class="task-action-btn delete-task" data-task-id="${task.id}">🗑️</button>
                </div>
            </div>
        `;
    }

    attachTaskEventListeners() {
        // Checkbox toggles
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                this.toggleTask(e.target.dataset.taskId);
            });
        });

        // Edit buttons
        document.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // TODO: Implement task editing modal/interface
                const taskId = e.target.dataset.taskId;
                this.openEditTaskModal(taskId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.dataset.taskId;
                if (confirm('Are you sure you want to delete this task?')) {
                    this.deleteTask(taskId);
                }
            });
        });
    }

    // Statistics
    updateStats() {
        const filteredTasks = this.getFilteredTasks();
        const incompleteTasks = filteredTasks.filter(task => !task.completed);
        const completedTasks = filteredTasks.filter(task => task.completed);

        const estimatedTime = incompleteTasks.reduce((total, task) => total + (task.estimatedTime || 0), 0);
        const elapsedTime = completedTasks.reduce((total, task) => total + (task.actualTime || 0), 0);

        // Update stat cards
        const statCards = document.querySelectorAll('.stat-card');
        const statNumbers = document.querySelectorAll('.stat-number');

        if (statNumbers.length >= 4) {
            statNumbers[0].textContent = estimatedTime;
            statNumbers[1].textContent = incompleteTasks.length;
            statNumbers[2].innerHTML = `${Math.floor(elapsedTime / 60)}<span class="unit">h</span>`;
            statNumbers[3].textContent = completedTasks.length;
        }
    }

    updateCategoryCounts() {
        // TODO: Implement real-time count updates for each category
        const categories = {
            'today': this.tasks.filter(task => !task.completed).length, // TODO: Filter by today's date
            'overdue': 0, // TODO: Calculate overdue tasks
            'tomorrow': 0, // TODO: Calculate tomorrow's tasks
            'thisweek': 0, // TODO: Calculate this week's tasks
            'next7days': 0, // TODO: Calculate next 7 days tasks
            'high': this.tasks.filter(task => !task.completed && task.priority === 'high').length,
            'medium': this.tasks.filter(task => !task.completed && task.priority === 'medium').length,
            'low': this.tasks.filter(task => !task.completed && task.priority === 'low').length,
            'planned': this.tasks.filter(task => !task.completed && task.dueDate).length,
            'all': this.tasks.length,
            'someday': this.tasks.filter(task => !task.completed && !task.dueDate).length,
            'completed': this.tasks.filter(task => task.completed).length,
            'tasks': this.tasks.length
        };

        Object.keys(categories).forEach(category => {
            const countElement = document.querySelector(`[data-category="${category}"] .nav-count`);
            if (countElement) {
                countElement.textContent = categories[category];
            }
        });
    }

    // Enhanced Pomodoro Timer
    toggleTimer() {
        if (this.isTimerRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.isTimerRunning = true;
        const timerBtn = document.getElementById('timerBtn');
        timerBtn.innerHTML = '<span class="play-icon">⏸️</span>';

        this.timerInterval = setInterval(() => {
            if (this.timerSeconds === 0) {
                if (this.timerMinutes === 0) {
                    this.timerFinished();
                    return;
                }
                this.timerMinutes--;
                this.timerSeconds = 59;
            } else {
                this.timerSeconds--;
            }
            this.updateTimerDisplay();
        }, 1000);
    }

    pauseTimer() {
        this.isTimerRunning = false;
        clearInterval(this.timerInterval);
        const timerBtn = document.getElementById('timerBtn');
        timerBtn.innerHTML = '<span class="play-icon">▶</span>';
    }

    resetTimer() {
        this.pauseTimer();
        this.setTimerMode(this.pomodoroSettings.currentMode);
        this.updateTimerDisplay();
    }

    setTimerMode(mode) {
        this.pomodoroSettings.currentMode = mode;

        switch (mode) {
            case 'focus':
                this.timerMinutes = this.pomodoroSettings.focusLength;
                break;
            case 'shortBreak':
                this.timerMinutes = this.pomodoroSettings.shortBreakLength;
                break;
            case 'longBreak':
                this.timerMinutes = this.pomodoroSettings.longBreakLength;
                break;
        }

        this.timerSeconds = 0;
        this.savePomodoroSettings();
        this.updateTimerDisplay();
        this.updateTimerModeUI();
    }

    timerFinished() {
        this.pauseTimer();

        // Play notification sound if enabled
        if (this.pomodoroSettings.soundEnabled) {
            this.playNotificationSound();
        }

        const currentMode = this.pomodoroSettings.currentMode;

        if (currentMode === 'focus') {
            // Completed a focus session
            this.pomodoroSettings.completedPomodoros++;
            this.pomodoroSettings.totalFocusTime += this.pomodoroSettings.focusLength;

            // Determine next mode
            const isLongBreakTime = this.pomodoroSettings.completedPomodoros % this.pomodoroSettings.longBreakAfter === 0;
            const nextMode = this.pomodoroSettings.disableBreak ? 'focus' :
                (isLongBreakTime ? 'longBreak' : 'shortBreak');

            this.showPomodoroNotification('Focus session completed!',
                `Great job! ${this.pomodoroSettings.disableBreak ? 'Ready for next session?' : 'Time for a break.'}`);

            this.setTimerMode(nextMode);

            if (this.pomodoroSettings.autoStartBreak && !this.pomodoroSettings.disableBreak) {
                setTimeout(() => this.startTimer(), 2000);
            }

        } else {
            // Completed a break session
            this.showPomodoroNotification('Break completed!', 'Ready to focus again?');
            this.setTimerMode('focus');

            if (this.pomodoroSettings.autoStartNext) {
                setTimeout(() => this.startTimer(), 2000);
            }
        }

        this.savePomodoroSettings();
        this.updatePomodoroStats();
    }

    playNotificationSound() {
        // Create audio notification
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEFKXTB8OeLOAcZZ73w5J9KDAxWq+DuvmchBTqP1fLNeSsFJHfI8N2QQAoUXrTp66hVFApGn+DyvmwhBTiS2++7dCEF=');
        audio.play().catch(e => console.log('Audio notification failed:', e));
    }

    showPomodoroNotification(title, message) {
        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: 'img/logo.png'
            });
        } else {
            // Fallback to alert
            alert(`${title}\n${message}`);
        }
    }

    updateTimerModeUI() {
        const modeLabels = {
            'focus': 'Focus Time',
            'shortBreak': 'Short Break',
            'longBreak': 'Long Break'
        };

        const sessionLabel = document.querySelector('.session-label');
        if (sessionLabel) {
            sessionLabel.textContent = modeLabels[this.pomodoroSettings.currentMode];
        }

        // Update timer background color based on mode
        const timerContainer = document.getElementById('pomodoroTimer');
        if (timerContainer) {
            timerContainer.className = `pomodoro-timer mode-${this.pomodoroSettings.currentMode}`;
        }
    }

    updatePomodoroStats() {
        const sessionTime = document.querySelector('.session-time');
        if (sessionTime) {
            sessionTime.innerHTML = `${this.pomodoroSettings.totalFocusTime}<sub>m</sub>`;
        }

        // Update completed pomodoros count somewhere in UI
        const completedCount = document.querySelector('.completed-pomodoros');
        if (completedCount) {
            completedCount.textContent = this.pomodoroSettings.completedPomodoros;
        }
    }

    updateTimerDisplay() {
        const timerTime = document.getElementById('timerTime');
        const modalTimerTime = document.getElementById('modalTimerTime');
        const displayMinutes = this.timerMinutes;
        const displaySeconds = this.timerSeconds;

        let timeText;
        if (displaySeconds === 0) {
            timeText = displayMinutes;
        } else {
            timeText = `${displayMinutes}:${displaySeconds.toString().padStart(2, '0')}`;
        }

        timerTime.textContent = timeText;
        if (modalTimerTime) {
            modalTimerTime.textContent = timeText;
        }

        // Update circular progress
        this.updateCircularProgress();
    }

    updateCircularProgress() {
        const progressCircle = document.getElementById('timerProgress');
        if (progressCircle) {
            const totalSeconds = 25 * 60; // 25 minutes in seconds
            const currentSeconds = this.timerMinutes * 60 + this.timerSeconds;
            const progress = (totalSeconds - currentSeconds) / totalSeconds;
            const circumference = 2 * Math.PI * 140; // radius = 140
            const offset = circumference - (progress * circumference);
            progressCircle.style.strokeDashoffset = offset;
        }
    }

    // Timer Modal Functions
    openTimerModal() {
        const modal = document.getElementById('timerModal');
        modal.classList.add('active');
        this.updateCircularProgress();
        this.updatePomodoroDisplay();
    }

    updatePomodoroDisplay() {
        // Update mode indicator
        const modeIndicator = document.getElementById('timerModeIndicator');
        if (modeIndicator) {
            modeIndicator.className = `timer-mode-indicator ${this.pomodoroSettings.currentMode}`;
            switch (this.pomodoroSettings.currentMode) {
                case 'focus':
                    modeIndicator.textContent = 'Focus Session';
                    break;
                case 'shortBreak':
                    modeIndicator.textContent = 'Short Break';
                    break;
                case 'longBreak':
                    modeIndicator.textContent = 'Long Break';
                    break;
            }
        }

        // Update stats
        const completedSessionsEl = document.getElementById('completedSessions');
        const totalFocusTimeEl = document.getElementById('totalFocusTime');
        const currentStreakEl = document.getElementById('currentStreak');

        if (completedSessionsEl) {
            completedSessionsEl.textContent = this.pomodoroSettings.completedSessions || 0;
        }
        if (totalFocusTimeEl) {
            totalFocusTimeEl.textContent = `${this.pomodoroSettings.totalFocusTime || 0}m`;
        }
        if (currentStreakEl) {
            currentStreakEl.textContent = this.pomodoroSettings.completedSessions % this.pomodoroSettings.sessionsUntilLongBreak || 0;
        }
    }

    closeTimerModal() {
        console.log('closeTimerModal called');
        const modal = document.getElementById('timerModal');
        if (!modal) {
            console.error('Timer modal element not found');
            return;
        }

        console.log('Removing active class from modal');
        modal.classList.remove('active');

        // Pause timer if it's running when modal is closed
        if (this.isTimerRunning) {
            console.log('Pausing timer');
            this.pauseTimer();
        }

        // Reset any fullscreen mode
        if (document.fullscreenElement) {
            console.log('Exiting fullscreen');
            document.exitFullscreen().catch(err => {
                console.log('Error exiting fullscreen:', err);
            });
        }

        console.log('Timer modal closed successfully');
    }

    stopTimer() {
        this.pauseTimer();
        this.resetTimer();
        this.closeTimerModal();
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error entering fullscreen:', err);
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.log('Error exiting fullscreen:', err);
            });
            // Optionally close modal when exiting fullscreen
            // this.closeTimerModal();
        }
    }

    changeTimerMode() {
        // Cycle through timer modes: focus -> short break -> long break -> focus
        const modes = ['focus', 'shortBreak', 'longBreak'];
        const currentIndex = modes.indexOf(this.pomodoroSettings.currentMode);
        const nextIndex = (currentIndex + 1) % modes.length;

        this.setTimerMode(modes[nextIndex]);
        this.updateTimerDisplay();
        this.updatePomodoroDisplay();

        console.log(`Timer mode changed to: ${this.pomodoroSettings.currentMode}`);
    }

    toggleWhiteNoise() {
        // Simple white noise toggle (placeholder - could be expanded later)
        console.log('White noise toggled');
        // TODO: Implement actual white noise functionality
    }

    // Completed Tasks Toggle
    toggleCompletedTasks() {
        const toggleBtn = document.getElementById('toggleCompleted');
        const isActive = toggleBtn.classList.contains('active');

        if (isActive) {
            toggleBtn.classList.remove('active');
            toggleBtn.querySelector('span').textContent = 'Show Completed Tasks';
        } else {
            toggleBtn.classList.add('active');
            toggleBtn.querySelector('span').textContent = 'Hide Completed Tasks';
        }

        // TODO: Implement showing/hiding completed tasks in the current view
        this.renderTasks();
    }

    // Modal and Interface Methods (To be implemented)
    openEditTaskModal(taskId) {
        // TODO: Create and show task editing modal
        // Should allow editing: title, priority, due date, estimated time, tags
        console.log('Opening edit modal for task:', taskId);
    }

    addProject() {
        // TODO: Implement add project functionality
        // Should open a modal to create new project/category
        console.log('Adding new project');
    }

    openSettings() {
        // Show settings modal
        document.getElementById('settingsModal').style.display = 'flex';
        // Default to General section
        this.showSettingsSection('General');

        // Setup theme selector
        const themeSelector = document.getElementById('themeSelector');
        if (themeSelector) {
            themeSelector.value = this.theme;
            themeSelector.addEventListener('change', (e) => {
                this.changeTheme(e.target.value);
            });
        }

        // Sidebar menu click
        document.querySelectorAll('.settings-menu-item').forEach(item => {
            item.onclick = (e) => {
                document.querySelectorAll('.settings-menu-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.showSettingsSection(item.textContent.trim());
            };
        });
        // Close button
        document.getElementById('settingsCloseBtn').onclick = () => {
            document.getElementById('settingsModal').style.display = 'none';
        };
    }

    showSettingsSection(section) {
        document.getElementById('settingsGeneral').style.display = section === 'General' ? 'block' : 'none';
        document.getElementById('settingsPomodoro').style.display = section === 'Pomodoro Timer' ? 'block' : 'none';
        document.getElementById('settingsAlarm').style.display = section === 'Alarm Sound' ? 'block' : 'none';
        document.getElementById('settingsAbout').style.display = section === 'About' ? 'block' : 'none';

        // Populate Pomodoro settings when section is shown
        if (section === 'Pomodoro Timer') {
            this.populatePomodoroSettings();
        }
    }

    populatePomodoroSettings() {
        const content = document.getElementById('pomodoroSettingsContent');
        content.innerHTML = this.generatePomodoroSettingsHTML();

        // Update volume display when range changes
        const volumeRange = document.getElementById('soundVolume');
        const volumeDisplay = volumeRange.nextElementSibling;
        volumeRange.addEventListener('input', (e) => {
            volumeDisplay.textContent = `${e.target.value}%`;
        });
    }

    showNotifications() {
        // TODO: Implement notifications panel
        // Should show recent activities, reminders, etc.
        console.log('Showing notifications');
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showDetailedStats() {
        // TODO: Implement detailed statistics view
        // Should show charts, productivity trends, time tracking, etc.
        console.log('Showing detailed stats');
    }

    showFavorites() {
        // TODO: Implement favorites/starred tasks view
        console.log('Showing favorites');
    }

    // Data Persistence
    saveTasks() {
        localStorage.setItem('focusTasks', JSON.stringify(this.tasks));
    }

    // Pomodoro Settings Management
    savePomodoroSettings() {
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.pomodoroSettings));
    }

    loadPomodoroSettings() {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        if (savedSettings) {
            this.pomodoroSettings = { ...this.pomodoroSettings, ...JSON.parse(savedSettings) };
        }
    }

    generatePomodoroSettingsHTML() {
        return `
            <div class="pomodoro-settings">
                <h3>Pomodoro Settings</h3>
                
                <div class="setting-group">
                    <label>Focus Time (minutes):</label>
                    <input type="number" id="focusLength" min="1" max="60" value="${this.pomodoroSettings.focusLength}">
                </div>
                
                <div class="setting-group">
                    <label>Short Break (minutes):</label>
                    <input type="number" id="shortBreakLength" min="1" max="30" value="${this.pomodoroSettings.shortBreakLength}">
                </div>
                
                <div class="setting-group">
                    <label>Long Break (minutes):</label>
                    <input type="number" id="longBreakLength" min="1" max="60" value="${this.pomodoroSettings.longBreakLength}">
                </div>
                
                <div class="setting-group">
                    <label>Sessions until Long Break:</label>
                    <input type="number" id="sessionsUntilLongBreak" min="2" max="8" value="${this.pomodoroSettings.sessionsUntilLongBreak}">
                </div>
                
                <div class="setting-group">
                    <label>
                        <input type="checkbox" id="autoStartBreaks" ${this.pomodoroSettings.autoStartBreaks ? 'checked' : ''}>
                        Auto-start breaks
                    </label>
                </div>
                
                <div class="setting-group">
                    <label>
                        <input type="checkbox" id="autoStartFocus" ${this.pomodoroSettings.autoStartFocus ? 'checked' : ''}>
                        Auto-start focus sessions
                    </label>
                </div>
                
                <div class="setting-group">
                    <label>
                        <input type="checkbox" id="soundEnabled" ${this.pomodoroSettings.sound.enabled ? 'checked' : ''}>
                        Enable sound notifications
                    </label>
                </div>
                
                <div class="setting-group">
                    <label>Sound Volume:</label>
                    <input type="range" id="soundVolume" min="0" max="100" value="${this.pomodoroSettings.sound.volume * 100}">
                    <span>${Math.round(this.pomodoroSettings.sound.volume * 100)}%</span>
                </div>
                
                <div class="setting-group">
                    <label>
                        <input type="checkbox" id="notificationsEnabled" ${this.pomodoroSettings.notifications ? 'checked' : ''}>
                        Enable browser notifications
                    </label>
                </div>
                
                <div class="setting-actions">
                    <button onclick="app.savePomodoroSettingsFromForm()">Save Settings</button>
                    <button onclick="app.resetPomodoroSettings()">Reset to Default</button>
                    <button onclick="app.exportPomodoroSettings()">Export Settings</button>
                    <input type="file" id="importSettings" accept=".json" style="display: none;" onchange="app.importPomodoroSettings(event)">
                    <button onclick="document.getElementById('importSettings').click()">Import Settings</button>
                </div>
            </div>
        `;
    }

    savePomodoroSettingsFromForm() {
        this.pomodoroSettings.focusLength = parseInt(document.getElementById('focusLength').value);
        this.pomodoroSettings.shortBreakLength = parseInt(document.getElementById('shortBreakLength').value);
        this.pomodoroSettings.longBreakLength = parseInt(document.getElementById('longBreakLength').value);
        this.pomodoroSettings.sessionsUntilLongBreak = parseInt(document.getElementById('sessionsUntilLongBreak').value);
        this.pomodoroSettings.autoStartBreaks = document.getElementById('autoStartBreaks').checked;
        this.pomodoroSettings.autoStartFocus = document.getElementById('autoStartFocus').checked;
        this.pomodoroSettings.sound.enabled = document.getElementById('soundEnabled').checked;
        this.pomodoroSettings.sound.volume = parseFloat(document.getElementById('soundVolume').value) / 100;
        this.pomodoroSettings.notifications = document.getElementById('notificationsEnabled').checked;

        this.savePomodoroSettings();
        this.showNotification('Pomodoro settings saved successfully!');
    }

    resetPomodoroSettings() {
        this.pomodoroSettings = {
            focusLength: 25,
            shortBreakLength: 5,
            longBreakLength: 15,
            sessionsUntilLongBreak: 4,
            autoStartBreaks: false,
            autoStartFocus: false,
            sound: {
                enabled: true,
                volume: 0.5,
                focusEnd: 'bell',
                breakEnd: 'chime'
            },
            notifications: true
        };
        this.savePomodoroSettings();
        this.showNotification('Pomodoro settings reset to default!');
        // Refresh the settings display if it's open
        const settingsContainer = document.querySelector('.pomodoro-settings');
        if (settingsContainer) {
            settingsContainer.outerHTML = this.generatePomodoroSettingsHTML();
        }
    }

    exportPomodoroSettings() {
        const dataStr = JSON.stringify(this.pomodoroSettings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pomodoro-settings.json';
        link.click();
        URL.revokeObjectURL(url);
        this.showNotification('Pomodoro settings exported successfully!');
    }

    importPomodoroSettings(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedSettings = JSON.parse(e.target.result);
                    this.pomodoroSettings = { ...this.pomodoroSettings, ...importedSettings };
                    this.savePomodoroSettings();
                    this.showNotification('Pomodoro settings imported successfully!');
                    // Refresh the settings display if it's open
                    const settingsContainer = document.querySelector('.pomodoro-settings');
                    if (settingsContainer) {
                        settingsContainer.outerHTML = this.generatePomodoroSettingsHTML();
                    }
                } catch (error) {
                    this.showNotification('Error importing settings. Please check the file format.', 'error');
                }
            };
            reader.readAsText(file);
        }
    }

    // Export/Import functionality (bonus features to implement)
    exportData() {
        // TODO: Export tasks to JSON file
        const dataStr = JSON.stringify({ tasks: this.tasks, theme: this.theme }, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'focus-todo-backup.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    importData(file) {
        // TODO: Import tasks from JSON file
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.tasks && Array.isArray(data.tasks)) {
                    this.tasks = data.tasks;
                    this.saveTasks();
                    this.renderTasks();
                    this.updateStats();
                    this.updateCategoryCounts();
                }
            } catch (error) {
                alert('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}


// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing app...');
    window.focusToDoApp = new FocusToDoApp();
});

// Keyboard shortcuts (bonus feature)
document.addEventListener('keydown', (e) => {
    // TODO: Implement keyboard shortcuts
    // Examples:
    // Ctrl+N: New task
    // Ctrl+/: Focus search
    // Space: Start/pause timer
    // Esc: Close modals

    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'n':
                e.preventDefault();
                document.getElementById('taskInput').focus();
                break;
            case 'e':
                e.preventDefault();
                window.focusToDoApp.exportData();
                break;
            // Add more shortcuts as needed
        }
    }

    if (e.key === ' ' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        window.focusToDoApp.toggleTimer();
    }
});

// Service Worker registration for offline functionality (advanced feature)
if ('serviceWorker' in navigator) {
    // TODO: Create and register service worker for offline functionality
    // window.addEventListener('load', () => {
    //     navigator.serviceWorker.register('/sw.js')
    //         .then((registration) => {
    //             console.log('SW registered: ', registration);
    //         })
    //         .catch((registrationError) => {
    //             console.log('SW registration failed: ', registrationError);
    //         });
    // });
}