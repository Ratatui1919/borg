// ========== NAVIGATION ==========
const Navigation = {
    items: [
        { id: 'debts', icon: 'fa-hand-holding-heart', label: 'Борги' },
        { id: 'goals', icon: 'fa-bullseye', label: 'Цілі' },
        { id: 'journal', icon: 'fa-book-open', label: 'Щоденник' },
        { id: 'bank', icon: 'fa-wallet', label: 'Мій банк' },
        { id: 'budget', icon: 'fa-chart-pie', label: 'Бюджет' },
        { id: 'recurring', icon: 'fa-clock', label: 'Регулярні' },
        { id: 'analytics', icon: 'fa-chart-line', label: 'Аналітика' },
        { id: 'tips', icon: 'fa-lightbulb', label: 'Поради' },
        { id: 'archive', icon: 'fa-archive', label: 'Архів' },
        { id: 'themes', icon: 'fa-palette', label: 'Теми' }
    ],
    
    render() {
        const navHtml = this.items.map(item => `
            <button class="nav-tab" data-page="${item.id}">
                <i class="fas ${item.icon}"></i>
                <span>${item.label}</span>
            </button>
        `).join('');
        
        document.getElementById('navTabs').innerHTML = navHtml;
        this.attachEvents();
    },
    
    attachEvents() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const pageId = tab.dataset.page;
                this.switchPage(pageId);
            });
        });
    },
    
    switchPage(pageId) {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.nav-tab[data-page="${pageId}"]`).classList.add('active');
        
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`${pageId}Page`).classList.add('active');
        
        this.renderPage(pageId);
    },
    
    renderPage(pageId) {
        switch(pageId) {
            case 'debts': DebtsPage.render(); break;
            case 'goals': GoalsPage.render(); break;
            case 'journal': JournalPage.render(); break;
            case 'bank': BankPage.render(); break;
            case 'budget': BudgetPage.render(); break;
            case 'recurring': RecurringPage.render(); break;
            case 'analytics': AnalyticsPage.render(); break;
            case 'tips': TipsPage.render(); break;
            case 'archive': ArchivePage.render(); break;
            case 'themes': ThemesPage.render(); break;
        }
    }
};

// ========== DEBTS PAGE ==========
const DebtsPage = {
    render() {
        const data = AppState.data.debts;
        const html = `
            <div class="page-header">
                <h2 class="page-title">
                    <i class="fas fa-hand-holding-heart"></i> Борги
                </h2>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title"><i class="fas fa-arrow-down"></i> Мені винені</div>
                    <div class="stat-value">${this.calcTotal(data.owed)} ₴</div>
                    <div class="stat-details">
                        ${this.renderCurrencyStats(data.owed, 'owed')}
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-title"><i class="fas fa-arrow-up"></i> Я винен</div>
                    <div class="stat-value">${this.calcTotal(data.owe)} ₴</div>
                    <div class="stat-details">
                        ${this.renderCurrencyStats(data.owe, 'owe')}
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-title"><i class="fas fa-scale-balanced"></i> Чистий результат</div>
                    <div class="stat-value">${this.calcNet(data)} ₴</div>
                    <div class="stat-details">
                        ${this.renderNetStats(data)}
                    </div>
                </div>
            </div>

            <div class="debts-grid">
                <div class="debt-column">
                    <h3><i class="fas fa-inbox"></i> Мені винені</h3>
                    <ul class="debt-list" id="owedList">
                        ${this.renderDebtList(data.owed, 'owed')}
                    </ul>
                    ${this.renderDebtForm('owed')}
                </div>

                <div class="debt-column">
                    <h3><i class="fas fa-paper-plane"></i> Я винен</h3>
                    <ul class="debt-list" id="oweList">
                        ${this.renderDebtList(data.owe, 'owe')}
                    </ul>
                    ${this.renderDebtForm('owe')}
                </div>
            </div>
        `;
        
        document.getElementById('debtsPage').innerHTML = html;
        this.attachEvents();
    },
    
    calcTotal(items) {
        return items.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2);
    },
    
    calcNet(data) {
        const owed = this.calcTotal(data.owed);
        const owe = this.calcTotal(data.owe);
        return (owed - owe).toFixed(2);
    },
    
    renderCurrencyStats(items, prefix) {
        const byCurrency = { UAH: 0, EUR: 0, USD: 0 };
        items.forEach(item => byCurrency[item.currency] += item.amount || 0);
        
        return ['UAH', 'EUR', 'USD'].map(curr => `
            <div class="stat-detail">
                <span>${curr}:</span>
                <span id="${prefix}${curr}">${byCurrency[curr].toFixed(2)} ${Helpers.getSymbol(curr)}</span>
            </div>
        `).join('');
    },
    
    renderNetStats(data) {
        const owed = { UAH: 0, EUR: 0, USD: 0 };
        const owe = { UAH: 0, EUR: 0, USD: 0 };
        
        data.owed.forEach(item => owed[item.currency] += item.amount || 0);
        data.owe.forEach(item => owe[item.currency] += item.amount || 0);
        
        return ['UAH', 'EUR', 'USD'].map(curr => {
            const net = owed[curr] - owe[curr];
            return `
                <div class="stat-detail">
                    <span>${curr}:</span>
                    <span id="net${curr}">${net >= 0 ? '+' : ''}${net.toFixed(2)} ${Helpers.getSymbol(curr)}</span>
                </div>
            `;
        }).join('');
    },
    
    renderDebtList(items, type) {
        if (!items.length) {
            return '<div class="empty-state"><i class="fas fa-inbox"></i><p>Поки нікого немає</p></div>';
        }
        
        return items.map(item => `
            <li class="debt-item" data-id="${item.id}">
                <div class="debt-info">
                    <h4>${Helpers.escape(item.name)}</h4>
                    ${item.description ? `<p>${Helpers.escape(item.description)}</p>` : ''}
                </div>
                <div class="debt-amount ${type === 'owe' ? 'owe' : ''}">
                    ${item.amount.toFixed(2)} ${Helpers.getSymbol(item.currency)}
                </div>
            </li>
        `).join('');
    },
    
    renderDebtForm(type) {
        return `
            <div class="debt-form">
                <input type="text" class="debt-input" id="${type}Name" placeholder="${type === 'owed' ? 'Ім\'я' : 'Кому'}">
                <input type="number" class="debt-input" id="${type}Amount" placeholder="Сума">
                <select class="debt-select" id="${type}Currency">
                    <option value="UAH">🇺🇦 Гривня</option>
                    <option value="EUR">🇪🇺 Євро</option>
                    <option value="USD">🇺🇸 Долар</option>
                </select>
                <input type="text" class="debt-input" id="${type}Desc" placeholder="Опис">
                <button class="debt-btn" id="add${type.charAt(0).toUpperCase() + type.slice(1)}Btn">
                    <i class="fas fa-plus-circle"></i> Додати
                </button>
            </div>
        `;
    },
    
    attachEvents() {
        document.getElementById('addOwedBtn')?.addEventListener('click', () => this.addDebt('owed'));
        document.getElementById('addOweBtn')?.addEventListener('click', () => this.addDebt('owe'));
        
        document.querySelectorAll('#owedList .debt-item').forEach(el => {
            el.addEventListener('click', () => this.deleteDebt('owed', el.dataset.id));
        });
        
        document.querySelectorAll('#oweList .debt-item').forEach(el => {
            el.addEventListener('click', () => this.deleteDebt('owe', el.dataset.id));
        });
    },
    
    addDebt(type) {
        const name = document.getElementById(`${type}Name`).value.trim();
        const amount = parseFloat(document.getElementById(`${type}Amount`).value);
        const currency = document.getElementById(`${type}Currency`).value;
        const desc = document.getElementById(`${type}Desc`).value.trim();
        
        if (!name || isNaN(amount) || amount <= 0) {
            return alert('Заповніть обов\'язкові поля');
        }
        
        AppState.data.debts[type].push({
            id: Helpers.generateId(),
            name,
            amount,
            currency,
            description: desc
        });
        
        AppState.save();
        this.render();
    },
    
    deleteDebt(type, id) {
        if (confirm('Видалити цей борг?')) {
            AppState.data.debts[type] = AppState.data.debts[type].filter(d => d.id !== id);
            AppState.save();
            this.render();
        }
    }
};

// ========== GOALS PAGE ==========
const GoalsPage = {
    render() {
        const activeGoals = AppState.data.goals.filter(g => !g.completed);
        const completedGoals = AppState.data.goals.filter(g => g.completed);
        
        const html = `
            <div class="page-header">
                <h2 class="page-title">
                    <i class="fas fa-bullseye"></i> Цілі
                </h2>
            </div>

            <div class="goals-stats">
                <div class="goal-stat-card">
                    <div class="goal-stat-title"><i class="fas fa-bullseye"></i> Активні цілі</div>
                    <div class="goal-stat-value">${activeGoals.length}</div>
                </div>
                <div class="goal-stat-card">
                    <div class="goal-stat-title"><i class="fas fa-check-circle"></i> Виконані</div>
                    <div class="goal-stat-value">${completedGoals.length}</div>
                </div>
                <div class="goal-stat-card">
                    <div class="goal-stat-title"><i class="fas fa-chart-line"></i> Загальний прогрес</div>
                    <div class="goal-stat-value">${this.calcTotalProgress()}%</div>
                </div>
            </div>

            <div class="section-header">
                <h3 class="page-title" style="font-size: 1.3rem;">
                    <i class="fas fa-rocket"></i> Активні цілі
                    <span class="section-badge">${activeGoals.length}</span>
                </h3>
                <button class="btn btn-primary" onclick="Modals.openGoalModal()">
                    <i class="fas fa-plus"></i> Нова ціль
                </button>
            </div>

            <div class="goals-grid">
                ${this.renderGoalsList(activeGoals)}
            </div>

            <h3 class="page-title" style="font-size: 1.3rem; margin-top: 30px;">
                <i class="fas fa-trophy"></i> Досягнуті цілі
                <span class="section-badge">${completedGoals.length}</span>
            </h3>

            <div class="goals-grid">
                ${this.renderGoalsList(completedGoals, true)}
            </div>
        `;
        
        document.getElementById('goalsPage').innerHTML = html;
    },
    
    calcTotalProgress() {
        const totalTarget = AppState.data.goals.reduce((sum, g) => sum + (g.target || 0), 0);
        const totalSaved = AppState.data.goals.reduce((sum, g) => sum + (g.saved || 0), 0);
        return totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
    },
    
    renderGoalsList(goals, isCompleted = false) {
        if (!goals.length) {
            return `
                <div class="empty-state">
                    <i class="fas ${isCompleted ? 'fa-trophy' : 'fa-bullseye'}"></i>
                    <p>${isCompleted ? 'Немає виконаних цілей' : 'У вас ще немає цілей'}</p>
                    ${!isCompleted ? '<button class="btn btn-primary" onclick="Modals.openGoalModal()"><i class="fas fa-plus"></i> Створити ціль</button>' : ''}
                </div>
            `;
        }
        
        return goals.map(goal => this.renderGoalCard(goal, isCompleted)).join('');
    },
    
    renderGoalCard(goal, isCompleted) {
        const symbol = Helpers.getSymbol(goal.currency);
        const progress = goal.target > 0 ? ((goal.saved || 0) / goal.target) * 100 : 0;
        
        return `
            <div class="goal-card ${isCompleted ? 'completed' : ''}">
                <div class="goal-header">
                    <div class="goal-name">${Helpers.escape(goal.name)}</div>
                    <div class="goal-actions">
                        ${!isCompleted ? `
                            <button class="btn-icon" onclick="GoalsPage.completeGoal('${goal.id}')" title="Виконано">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : `
                            <button class="btn-icon" onclick="GoalsPage.reactivateGoal('${goal.id}')" title="Реактивувати">
                                <i class="fas fa-undo"></i>
                            </button>
                        `}
                        <button class="btn-icon" onclick="GoalsPage.deleteGoal('${goal.id}')" title="Видалити">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="goal-progress-info">
                    <span>Накопичено: ${(goal.saved || 0).toFixed(2)} ${symbol}</span>
                    <span>Ціль: ${(goal.target || 0).toFixed(2)} ${symbol}</span>
                </div>

                <div class="progress-bar">
                    <div class="progress-fill ${isCompleted ? 'completed' : ''}" style="width: ${Math.min(progress, 100)}%"></div>
                </div>

                ${this.renderGoalHistory(goal, isCompleted, symbol)}

                ${!isCompleted ? this.renderGoalInputs(goal) : ''}
            </div>
        `;
    },
    
    renderGoalHistory(goal, isCompleted, symbol) {
        if (isCompleted || !goal.history?.length) return '';
        
        return `
            <div class="goal-history">
                <div class="history-list">
                    ${goal.history.map((h, i) => `
                        <div class="history-item">
                            <span class="history-date">${Helpers.formatDate(h.date)}</span>
                            <span class="history-amount ${h.type === 'add' ? 'plus' : 'minus'}">
                                ${h.type === 'add' ? '+' : '-'}${h.amount} ${symbol}
                            </span>
                            <i class="fas fa-times delete-btn" onclick="GoalsPage.deleteHistory('${goal.id}', ${i})"></i>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    renderGoalInputs(goal) {
        return `
            <div class="goal-input-group">
                <input type="number" id="add-${goal.id}" placeholder="Сума">
                <button class="btn-small" onclick="GoalsPage.addToGoal('${goal.id}')">
                    <i class="fas fa-plus"></i> Додати
                </button>
                <button class="btn-small" onclick="GoalsPage.withdrawFromGoal('${goal.id}')">
                    <i class="fas fa-minus"></i> Зняти
                </button>
            </div>
        `;
    },
    
    addToGoal(id) {
        const input = document.getElementById(`add-${id}`);
        const amount = parseFloat(input.value);
        if (isNaN(amount) || amount <= 0) return alert('Введіть суму');
        
        const goal = AppState.data.goals.find(g => g.id === id);
        if (goal) {
            goal.history = goal.history || [];
            goal.history.push({ type: 'add', amount, date: Date.now() });
            goal.saved = (goal.saved || 0) + amount;
            AppState.save();
            this.render();
        }
    },
    
    withdrawFromGoal(id) {
        const amount = parseFloat(prompt('Скільки зняти?'));
        if (isNaN(amount) || amount <= 0) return;
        
        const goal = AppState.data.goals.find(g => g.id === id);
        if (goal) {
            if (amount > (goal.saved || 0)) return alert('Недостатньо коштів');
            goal.history = goal.history || [];
            goal.history.push({ type: 'withdraw', amount, date: Date.now() });
            goal.saved = (goal.saved || 0) - amount;
            AppState.save();
            this.render();
        }
    },
    
    completeGoal(id) {
        const goal = AppState.data.goals.find(g => g.id === id);
        if (goal) {
            goal.completed = true;
            goal.completedDate = Date.now();
            AppState.save();
            this.render();
        }
    },
    
    reactivateGoal(id) {
        const goal = AppState.data.goals.find(g => g.id === id);
        if (goal) {
            goal.completed = false;
            delete goal.completedDate;
            AppState.save();
            this.render();
        }
    },
    
    deleteGoal(id) {
        if (confirm('Видалити цю ціль?')) {
            AppState.data.goals = AppState.data.goals.filter(g => g.id !== id);
            AppState.save();
            this.render();
        }
    },
    
    deleteHistory(goalId, index) {
        const goal = AppState.data.goals.find(g => g.id === goalId);
        if (goal?.history) {
            const op = goal.history[index];
            goal.saved = (goal.saved || 0) + (op.type === 'add' ? -op.amount : op.amount);
            goal.history.splice(index, 1);
            AppState.save();
            this.render();
        }
    }
};

// ========== JOURNAL PAGE ==========
const JournalPage = {
    charts: {
        eurExpenses: null,
        eurDynamics: null,
        uahExpenses: null,
        uahDynamics: null
    },
    
    render() {
        const monthKey = Helpers.getMonthKey(AppState.ui.currentMonth);
        const monthName = AppState.ui.currentMonth.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
        
        const html = `
            <div class="page-header">
                <h2 class="page-title">
                    <i class="fas fa-book-open"></i> Фінансовий щоденник
                </h2>
                <div class="month-selector">
                    <button class="btn-icon" onclick="JournalPage.changeMonth(-1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span class="current-month">${monthName}</span>
                    <button class="btn-icon" onclick="JournalPage.changeMonth(1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <div class="currency-tabs">
                <button class="currency-tab ${AppState.ui.currentCurrency === 'EUR' ? 'active' : ''}" onclick="JournalPage.switchCurrency('EUR')">
                    <i class="fas fa-euro-sign"></i> Євро
                </button>
                <button class="currency-tab ${AppState.ui.currentCurrency === 'UAH' ? 'active' : ''}" onclick="JournalPage.switchCurrency('UAH')">
                    <i class="fas fa-hryvnia"></i> Гривня
                </button>
            </div>

            <div id="eurContent" style="${AppState.ui.currentCurrency !== 'EUR' ? 'display: none;' : ''}">
                ${this.renderCurrencyContent('EUR', monthKey)}
            </div>

            <div id="uahContent" style="${AppState.ui.currentCurrency !== 'UAH' ? 'display: none;' : ''}">
                ${this.renderCurrencyContent('UAH', monthKey)}
            </div>
        `;
        
        document.getElementById('journalPage').innerHTML = html;
        setTimeout(() => this.updateCharts(), 100);
    },
    
    renderCurrencyContent(currency, monthKey) {
        const transactions = (AppState.data.transactions[currency] || [])
            .filter(t => t.month === monthKey);
        
        const income = transactions.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        const expense = transactions.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const symbol = currency === 'EUR' ? '€' : '₴';
        
        return `
            <div class="journal-stats">
                <div class="journal-stat-card">
                    <div class="journal-stat-label">💰 Зароблено</div>
                    <div class="journal-stat-value income">${income.toFixed(2)} ${symbol}</div>
                </div>
                <div class="journal-stat-card">
                    <div class="journal-stat-label">💸 Витрачено</div>
                    <div class="journal-stat-value expense">${expense.toFixed(2)} ${symbol}</div>
                </div>
                <div class="journal-stat-card">
                    <div class="journal-stat-label">⚖️ Залишок</div>
                    <div class="journal-stat-value">${(income - expense).toFixed(2)} ${symbol}</div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-header">
                        <div class="chart-title">
                            <i class="fas fa-chart-pie"></i> Розподіл витрат
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="${currency.toLowerCase()}ExpensesChart"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <div class="chart-header">
                        <div class="chart-title">
                            <i class="fas fa-chart-line"></i> Динаміка
                        </div>
                        <div class="chart-legend">
                            <div class="legend-item">
                                <span class="legend-color income"></span>
                                <span>Дохід</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color expense"></span>
                                <span>Витрати</span>
                            </div>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="${currency.toLowerCase()}DynamicsChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="transactions-section">
                <div class="page-header">
                    <h3 class="page-title" style="font-size: 1.2rem;">
                        <i class="fas fa-list"></i> Операції в ${currency === 'EUR' ? 'євро' : 'гривні'}
                    </h3>
                    <button class="btn btn-primary" onclick="Modals.openTransactionModal('${currency}')">
                        <i class="fas fa-plus"></i> Додати
                    </button>
                </div>
                <table class="transactions-table">
                    <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Категорія</th>
                            <th>Опис</th>
                            <th>Сума</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="${currency.toLowerCase()}TransactionsList">
                        ${this.renderTransactionsList(transactions, symbol)}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    renderTransactionsList(transactions, symbol) {
        if (!transactions.length) {
            return '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-tertiary)">Немає операцій за цей місяць</td></tr>';
        }
        
        return transactions.sort((a, b) => (b.date || 0) - (a.date || 0))
            .map(t => `
                <tr>
                    <td data-label="Дата">${t.date ? Helpers.formatDate(t.date) : '-'}</td>
                    <td data-label="Категорія"><span class="category-badge">${Categories.translations[t.category] || t.category}</span></td>
                    <td data-label="Опис">${Helpers.escape(t.description) || '-'}</td>
                    <td data-label="Сума">
                        <span class="amount-badge ${t.type}">
                            ${t.type === 'income' ? '+' : '-'}${(t.amount || 0).toFixed(2)} ${symbol}
                        </span>
                    </td>
                    <td data-label=""><i class="fas fa-trash-alt delete-btn" onclick="JournalPage.deleteTransaction('${t.id}', '${symbol === '€' ? 'EUR' : 'UAH'}')"></i></td>
                </tr>
            `).join('');
    },
    
    changeMonth(delta) {
        AppState.ui.currentMonth.setMonth(AppState.ui.currentMonth.getMonth() + delta);
        this.render();
    },
    
    switchCurrency(currency) {
        AppState.ui.currentCurrency = currency;
        this.render();
    },
    
    deleteTransaction(id, currency) {
        if (confirm('Видалити цю операцію?')) {
            AppState.data.transactions[currency] = AppState.data.transactions[currency]
                .filter(t => t.id !== id);
            AppState.save();
            this.render();
        }
    },
    
    updateCharts() {
        const monthKey = Helpers.getMonthKey(AppState.ui.currentMonth);
        
        ['EUR', 'UAH'].forEach(currency => {
            const transactions = (AppState.data.transactions[currency] || [])
                .filter(t => t.month === monthKey);
            this.createCharts(currency.toLowerCase(), transactions);
        });
    },
    
    createCharts(currency, transactions) {
        const expensesByCategory = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            const cat = Categories.translations[t.category] || t.category;
            expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (t.amount || 0);
        });
        
        const ctx1 = document.getElementById(currency + 'ExpensesChart')?.getContext('2d');
        if (ctx1) {
            if (this.charts[currency + 'Expenses']) this.charts[currency + 'Expenses'].destroy();
            
            this.charts[currency + 'Expenses'] = new Chart(ctx1, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(expensesByCategory).length ? Object.keys(expensesByCategory) : ['Немає даних'],
                    datasets: [{
                        data: Object.keys(expensesByCategory).length ? Object.values(expensesByCategory) : [1],
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            display: Object.keys(expensesByCategory).length > 0, 
                            position: 'bottom',
                            labels: { color: '#9aa4b8' }
                        }
                    }
                }
            });
        }
        
        const dailyData = {};
        transactions.forEach(t => {
            if (!t.date) return;
            const date = new Date(t.date).getDate();
            if (!dailyData[date]) dailyData[date] = { income: 0, expense: 0 };
            dailyData[date][t.type] += t.amount || 0;
        });
        
        const sortedDays = Object.keys(dailyData).sort((a, b) => parseInt(a) - parseInt(b));
        
        const ctx2 = document.getElementById(currency + 'DynamicsChart')?.getContext('2d');
        if (ctx2) {
            if (this.charts[currency + 'Dynamics']) this.charts[currency + 'Dynamics'].destroy();
            
            this.charts[currency + 'Dynamics'] = new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: sortedDays.map(d => d + ' число'),
                    datasets: [
                        { 
                            label: 'Дохід', 
                            data: sortedDays.map(d => dailyData[d]?.income || 0), 
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        { 
                            label: 'Витрати', 
                            data: sortedDays.map(d => dailyData[d]?.expense || 0), 
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { 
                            beginAtZero: true,
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#9aa4b8' }
                        },
                        x: { 
                            grid: { display: false },
                            ticks: { color: '#9aa4b8' }
                        }
                    }
                }
            });
        }
    }
};

// ========== BANK PAGE ==========
const BankPage = {
    render() {
        const accounts = AppState.data.bankAccounts || [];
        const total = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        
        const html = `
            <div class="page-header">
                <h2 class="page-title">
                    <i class="fas fa-wallet"></i> Мій банк
                </h2>
            </div>

            <div class="total-balance">
                <div class="total-balance-label">Загальний капітал</div>
                <div class="total-balance-value">${total.toFixed(2)} €</div>
            </div>

            <div class="page-header" style="margin-top: 20px;">
                <h3 class="page-title" style="font-size: 1.2rem;">
                    <i class="fas fa-wallet"></i> Мої рахунки
                </h3>
                <button class="btn btn-primary" onclick="Modals.openBankModal()">
                    <i class="fas fa-plus"></i> Додати рахунок
                </button>
            </div>

            <div class="bank-grid">
                ${this.renderAccounts(accounts)}
            </div>
        `;
        
        document.getElementById('bankPage').innerHTML = html;
    },
    
    renderAccounts(accounts) {
        if (!accounts.length) {
            return `
                <div class="empty-state">
                    <i class="fas fa-wallet"></i>
                    <p>У вас ще немає рахунків</p>
                    <button class="btn btn-primary" onclick="Modals.openBankModal()">
                        <i class="fas fa-plus"></i> Додати рахунок
                    </button>
                </div>
            `;
        }
        
        return accounts.map(acc => `
            <div class="bank-card">
                <div class="bank-header">
                    <div class="bank-name">
                        <i class="fas ${acc.icon || 'fa-building'}"></i> ${Helpers.escape(acc.name)}
                    </div>
                    <button class="btn-icon" onclick="BankPage.deleteAccount('${acc.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="bank-balance">${(acc.balance || 0).toFixed(2)} ${Helpers.getSymbol(acc.currency)}</div>
                <div class="bank-details">
                    <span><i class="fas fa-credit-card"></i> ${acc.currency}</span>
                </div>
            </div>
        `).join('');
    },
    
    deleteAccount(id) {
        if (confirm('Видалити цей рахунок?')) {
            AppState.data.bankAccounts = AppState.data.bankAccounts.filter(acc => acc.id !== id);
            AppState.save();
            this.render();
        }
    },
    
    getRandomIcon() {
        const icons = ['fa-building', 'fa-credit-card', 'fa-wallet', 'fa-piggy-bank', 'fa-coins'];
        return icons[Math.floor(Math.random() * icons.length)];
    }
};

// ========== BUDGET PAGE ==========
const BudgetPage = {
    render() {
        const monthKey = Helpers.getMonthKey(AppState.ui.currentMonth);
        const monthName = AppState.ui.currentMonth.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
        const budgetData = AppState.data.budgets[monthKey] || this.getDefaultBudget();
        
        this.updateSpent(monthKey);
        
        const html = `
            <div class="page-header">
                <h2 class="page-title">
                    <i class="fas fa-chart-pie"></i> Бюджет
                </h2>
                <button class="btn btn-primary" onclick="BudgetPage.editBudget()">
                    <i class="fas fa-edit"></i> Редагувати
                </button>
            </div>

            <div class="budget-summary">
                <div class="stat-card">
                    <div class="stat-title">💰 Загальний бюджет</div>
                    <div class="stat-value">${this.calcTotalBudget(budgetData)} €</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">💸 Витрачено</div>
                    <div class="stat-value expense">${this.calcTotalSpent(budgetData)} €</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">💎 Залишилось</div>
                    <div class="stat-value ${this.calcRemaining(budgetData) >= 0 ? 'income' : 'expense'}">
                        ${this.calcRemaining(budgetData)} €
                    </div>
                </div>
            </div>

            <h3 class="page-title" style="font-size: 1.2rem; margin: 20px 0;">
                <i class="fas fa-chart-line"></i> Бюджет на ${monthName}
            </h3>

            <div class="budget-grid">
                ${this.renderBudgetItems(budgetData)}
            </div>
        `;
        
        document.getElementById('budgetPage').innerHTML = html;
    },
    
    getDefaultBudget() {
        return {
            food: { name: 'Їжа', planned: 400, spent: 0, icon: 'fa-utensils' },
            transport: { name: 'Транспорт', planned: 100, spent: 0, icon: 'fa-bus' },
            entertainment: { name: 'Розваги', planned: 150, spent: 0, icon: 'fa-film' },
            health: { name: 'Здоров\'я', planned: 100, spent: 0, icon: 'fa-heartbeat' },
            shopping: { name: 'Покупки', planned: 200, spent: 0, icon: 'fa-bag-shopping' },
            other: { name: 'Інше', planned: 150, spent: 0, icon: 'fa-ellipsis' }
        };
    },
    
    calcTotalBudget(budget) {
        return Object.values(budget).reduce((sum, cat) => sum + (cat.planned || 0), 0).toFixed(2);
    },
    
    calcTotalSpent(budget) {
        return Object.values(budget).reduce((sum, cat) => sum + (cat.spent || 0), 0).toFixed(2);
    },
    
    calcRemaining(budget) {
        const total = parseFloat(this.calcTotalBudget(budget));
        const spent = parseFloat(this.calcTotalSpent(budget));
        return (total - spent).toFixed(2);
    },
    
    renderBudgetItems(budget) {
        return Object.entries(budget).map(([key, cat]) => {
            const percent = cat.planned > 0 ? ((cat.spent || 0) / cat.planned) * 100 : 0;
            const status = percent > 100 ? 'budget-danger' : percent > 80 ? 'budget-warning' : '';
            
            return `
                <div class="budget-card">
                    <div class="budget-header">
                        <div class="budget-category">
                            <i class="fas ${cat.icon}"></i> ${cat.name}
                        </div>
                        <span class="${status}">${percent.toFixed(0)}%</span>
                    </div>
                    <div class="budget-numbers">
                        <span>Витрачено: ${(cat.spent || 0).toFixed(2)} €</span>
                        <span>План: ${(cat.planned || 0).toFixed(2)} €</span>
                    </div>
                    <div class="budget-progress-bar">
                        <div class="budget-progress-fill ${status}" style="width: ${Math.min(percent, 100)}%"></div>
                    </div>
                    ${percent > 100 ? 
                        `<div class="budget-warning">Перевищення на ${(percent - 100).toFixed(0)}%</div>` : 
                        `<div class="budget-remaining">Залишилось ${((cat.planned || 0) - (cat.spent || 0)).toFixed(2)} €</div>`
                    }
                </div>
            `;
        }).join('');
    },
    
    editBudget() {
        const monthKey = Helpers.getMonthKey(AppState.ui.currentMonth);
        const budgetData = AppState.data.budgets[monthKey] || this.getDefaultBudget();
        
        let formHtml = '<div class="budget-edit-form">';
        Object.entries(budgetData).forEach(([key, cat]) => {
            formHtml += `
                <div class="budget-edit-item">
                    <label><i class="fas ${cat.icon}"></i> ${cat.name}</label>
                    <input type="number" class="budget-edit-input" id="budget-${key}" 
                           value="${cat.planned || 0}" step="10" min="0">
                </div>
            `;
        });
        formHtml += '</div>';
        
        const modal = document.getElementById('budgetModal');
        modal.innerHTML = `
            <div class="modal-content">
                <h2><i class="fas fa-chart-pie"></i> Редагувати бюджет</h2>
                ${formHtml}
                <div class="modal-buttons">
                    <button class="modal-btn create" onclick="BudgetPage.saveBudget()">Зберегти</button>
                    <button class="modal-btn cancel" onclick="Modals.closeModal('budgetModal')">Скасувати</button>
                </div>
            </div>
        `;
        modal.classList.add('active');
    },
    
    saveBudget() {
        const monthKey = Helpers.getMonthKey(AppState.ui.currentMonth);
        const defaultBudget = this.getDefaultBudget();
        const newBudget = {};
        
        Object.keys(defaultBudget).forEach(key => {
            const input = document.getElementById(`budget-${key}`);
            if (input) {
                newBudget[key] = {
                    ...defaultBudget[key],
                    planned: parseFloat(input.value) || 0,
                    spent: AppState.data.budgets[monthKey]?.[key]?.spent || 0
                };
            }
        });
        
        if (!AppState.data.budgets) AppState.data.budgets = {};
        AppState.data.budgets[monthKey] = newBudget;
        AppState.save();
        
        Modals.closeModal('budgetModal');
        this.render();
    },
    
    updateSpent(monthKey) {
        const transactions = [
            ...(AppState.data.transactions.EUR || []),
            ...(AppState.data.transactions.UAH || [])
        ].filter(t => t.month === monthKey && t.type === 'expense');
        
        if (!AppState.data.budgets[monthKey]) {
            AppState.data.budgets[monthKey] = this.getDefaultBudget();
        }
        
        Object.keys(AppState.data.budgets[monthKey]).forEach(key => {
            AppState.data.budgets[monthKey][key].spent = 0;
        });
        
        transactions.forEach(t => {
            const cat = t.category;
            if (AppState.data.budgets[monthKey][cat]) {
                AppState.data.budgets[monthKey][cat].spent += t.amount || 0;
            }
        });
    }
};

// ========== RECURRING PAGE ==========
const RecurringPage = {
    render() {
        const payments = AppState.data.recurringPayments || [];
        
        const html = `
            <div class="page-header">
                <h2 class="page-title">
                    <i class="fas fa-clock"></i> Регулярні платежі
                </h2>
                <button class="btn btn-primary" onclick="Modals.openRecurringModal()">
                    <i class="fas fa-plus"></i> Додати платіж
                </button>
            </div>

            <div class="recurring-grid">
                ${this.renderPayments(payments)}
            </div>

            <h3 class="page-title" style="font-size: 1.2rem; margin-top: 30px;">
                <i class="fas fa-calendar-alt"></i> Майбутні платежі
            </h3>

            <div class="recurring-grid" id="upcomingPayments">
                ${this.renderUpcoming(payments)}
            </div>
        `;
        
        document.getElementById('recurringPage').innerHTML = html;
    },
    
    renderPayments(payments) {
        if (!payments.length) {
            return `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <p>У вас ще немає регулярних платежів</p>
                    <button class="btn btn-primary" onclick="Modals.openRecurringModal()">
                        <i class="fas fa-plus"></i> Додати платіж
                    </button>
                </div>
            `;
        }
        
        return payments.map(p => `
            <div class="recurring-card">
                <div class="recurring-info">
                    <h4>${Helpers.escape(p.name)}</h4>
                    <p>${p.frequency}, ${p.day} число • ${p.category}</p>
                </div>
                <div class="recurring-amount">${p.amount} ${Helpers.getSymbol(p.currency)}</div>
                <div class="recurring-actions">
                    <button class="btn-small" onclick="RecurringPage.editPayment('${p.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-small btn-danger" onclick="RecurringPage.deletePayment('${p.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    renderUpcoming(payments) {
        if (!payments.length) {
            return '<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>Немає майбутніх платежів</p></div>';
        }
        
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const monthlyPayments = payments.filter(p => p.frequency === 'Щомісяця');
        
        if (!monthlyPayments.length) {
            return '<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>Немає щомісячних платежів</p></div>';
        }
        
        const upcoming = monthlyPayments
            .map(p => {
                const paymentDay = parseInt(p.day);
                let daysLeft;
                
                if (paymentDay > currentDay) {
                    daysLeft = paymentDay - currentDay;
                } else {
                    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                    daysLeft = (daysInMonth - currentDay) + paymentDay;
                }
                
                return { ...p, daysLeft };
            })
            .sort((a, b) => a.daysLeft - b.daysLeft)
            .slice(0, 5);
        
        return upcoming.map(p => {
            let daysText;
            if (p.daysLeft === 0) {
                daysText = 'Сьогодні';
            } else if (p.daysLeft === 1) {
                daysText = 'Завтра';
            } else {
                daysText = `Через ${p.daysLeft} днів`;
            }
            
            return `
                <div class="recurring-card">
                    <div class="recurring-info">
                        <h4>${Helpers.escape(p.name)}</h4>
                        <p>${daysText} (${p.day} число)</p>
                    </div>
                    <div class="recurring-amount">${p.amount} ${Helpers.getSymbol(p.currency)}</div>
                </div>
            `;
        }).join('');
    },
    
    editPayment(id) {
        const payment = AppState.data.recurringPayments.find(p => p.id === id);
        if (payment) {
            Modals.openRecurringModal(payment);
        }
    },
    
    deletePayment(id) {
        if (confirm('Видалити цей платіж?')) {
            AppState.data.recurringPayments = AppState.data.recurringPayments.filter(p => p.id !== id);
            AppState.save();
            this.render();
        }
    }
};

// ========== ANALYTICS PAGE ==========
const AnalyticsPage = {
    charts: {
        pie: null,
        line: null
    },
    
    render() {
        const monthName = AppState.ui.currentMonth.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
        
        const html = `
            <div class="page-header">
                <h2 class="page-title">
                    <i class="fas fa-chart-line"></i> Аналітика
                </h2>
                <div class="month-selector">
                    <button class="btn-icon" onclick="AnalyticsPage.changeMonth(-1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span class="current-month" id="analyticsMonth">${monthName}</span>
                    <button class="btn-icon" onclick="AnalyticsPage.changeMonth(1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <div class="analytics-summary">
                <div class="stat-card">
                    <div class="stat-title">💰 Дохід</div>
                    <div class="stat-value income" id="analyticsIncome">0 €</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">💸 Витрати</div>
                    <div class="stat-value expense" id="analyticsExpense">0 €</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">💎 Накопичено</div>
                    <div class="stat-value" id="analyticsSaved">0 €</div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-header">
                        <div class="chart-title">
                            <i class="fas fa-chart-pie"></i> Розподіл витрат
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="analyticsPieChart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card">
                    <div class="chart-header">
                        <div class="chart-title">
                            <i class="fas fa-chart-line"></i> Динаміка за місяць
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="analyticsLineChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="analytics-insights">
                <h3 class="page-title" style="font-size: 1.2rem; margin: 24px 0 16px;">
                    <i class="fas fa-lightbulb"></i> Інсайти
                </h3>
                <div class="insights-grid" id="analyticsInsights"></div>
            </div>
        `;
        
        document.getElementById('analyticsPage').innerHTML = html;
        this.updateData();
    },
    
    changeMonth(delta) {
        AppState.ui.currentMonth.setMonth(AppState.ui.currentMonth.getMonth() + delta);
        this.updateData();
    },
    
    updateData() {
        const monthKey = Helpers.getMonthKey(AppState.ui.currentMonth);
        const monthName = AppState.ui.currentMonth.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
        document.getElementById('analyticsMonth').textContent = monthName;
        
        const transactions = [
            ...(AppState.data.transactions.EUR || []).filter(t => t.month === monthKey),
            ...(AppState.data.transactions.UAH || []).filter(t => t.month === monthKey)
        ];
        
        const income = transactions.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        const expense = transactions.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        document.getElementById('analyticsIncome').innerHTML = income.toFixed(2) + ' €';
        document.getElementById('analyticsExpense').innerHTML = expense.toFixed(2) + ' €';
        document.getElementById('analyticsSaved').innerHTML = (income - expense).toFixed(2) + ' €';
        
        this.updateCharts(transactions);
        this.updateInsights(transactions, income, expense);
    },
    
    updateCharts(transactions) {
        const expensesByCategory = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            const cat = Categories.translations[t.category] || t.category;
            expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (t.amount || 0);
        });
        
        const pieCtx = document.getElementById('analyticsPieChart')?.getContext('2d');
        if (pieCtx) {
            if (this.charts.pie) this.charts.pie.destroy();
            
            this.charts.pie = new Chart(pieCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(expensesByCategory).length ? Object.keys(expensesByCategory) : ['Немає даних'],
                    datasets: [{
                        data: Object.keys(expensesByCategory).length ? Object.values(expensesByCategory) : [1],
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            display: Object.keys(expensesByCategory).length > 0, 
                            position: 'bottom',
                            labels: { color: '#9aa4b8' }
                        }
                    }
                }
            });
        }
        
        const dailyData = {};
        transactions.forEach(t => {
            if (!t.date) return;
            const date = new Date(t.date).getDate();
            if (!dailyData[date]) dailyData[date] = { income: 0, expense: 0 };
            dailyData[date][t.type] += t.amount || 0;
        });
        
        const sortedDays = Object.keys(dailyData).sort((a, b) => parseInt(a) - parseInt(b));
        
        const lineCtx = document.getElementById('analyticsLineChart')?.getContext('2d');
        if (lineCtx) {
            if (this.charts.line) this.charts.line.destroy();
            
            this.charts.line = new Chart(lineCtx, {
                type: 'line',
                data: {
                    labels: sortedDays.map(d => d + ' число'),
                    datasets: [
                        { 
                            label: 'Дохід', 
                            data: sortedDays.map(d => dailyData[d]?.income || 0), 
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        { 
                            label: 'Витрати', 
                            data: sortedDays.map(d => dailyData[d]?.expense || 0), 
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { 
                            beginAtZero: true,
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#9aa4b8' }
                        },
                        x: { 
                            grid: { display: false },
                            ticks: { color: '#9aa4b8' }
                        }
                    }
                }
            });
        }
    },
    
    updateInsights(transactions, income, expense) {
        const container = document.getElementById('analyticsInsights');
        if (!container) return;
        
        const insights = [];
        
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        if (expenseTransactions.length > 0) {
            const avgExpense = expense / expenseTransactions.length;
            insights.push(`
                <div class="insight-card">
                    <i class="fas fa-receipt"></i>
                    <div>
                        <div class="insight-title">Середній чек</div>
                        <div class="insight-value">${avgExpense.toFixed(2)} €</div>
                    </div>
                </div>
            `);
        }
        
        const maxExpense = expenseTransactions
            .sort((a, b) => (b.amount || 0) - (a.amount || 0))[0];
        
        if (maxExpense) {
            insights.push(`
                <div class="insight-card">
                    <i class="fas fa-crown"></i>
                    <div>
                        <div class="insight-title">Найбільша витрата</div>
                        <div class="insight-value">${maxExpense.amount.toFixed(2)} €</div>
                        <div style="font-size:0.8rem; color:var(--text-tertiary)">${Categories.translations[maxExpense.category] || maxExpense.category}</div>
                    </div>
                </div>
            `);
        }
        
        if (income > 0) {
            const savingsRate = ((income - expense) / income * 100).toFixed(0);
            insights.push(`
                <div class="insight-card">
                    <i class="fas fa-piggy-bank"></i>
                    <div>
                        <div class="insight-title">Норма заощаджень</div>
                        <div class="insight-value">${savingsRate}%</div>
                    </div>
                </div>
            `);
        }
        
        insights.push(`
            <div class="insight-card">
                <i class="fas fa-exchange-alt"></i>
                <div>
                    <div class="insight-title">Всього операцій</div>
                    <div class="insight-value">${transactions.length}</div>
                </div>
            </div>
        `);
        
        container.innerHTML = insights.length ? insights.join('') : 
            '<div class="empty-state"><i class="fas fa-chart-line"></i><p>Немає даних за цей місяць</p></div>';
    }
};

// ========== TIPS PAGE ==========
const TipsPage = {
    tips: [
        {
            title: 'Правило 50/30/20',
            text: '50% доходу на потреби, 30% на бажання, 20% на заощадження.'
        },
        {
            title: 'Економія на підписках',
            text: 'Перевірте регулярні платежі - можливо, ви платите за сервіси, якими не користуєтесь.'
        },
        {
            title: 'Фінансова подушка',
            text: 'Рекомендується мати запас 3-6 місячних витрат.'
        },
        {
            title: 'Інвестиції для початківців',
            text: 'Почніть з малого - регулярно інвестуйте невеликі суми.'
        },
        {
            title: 'Кешбек та бонуси',
            text: 'Використовуйте картки з кешбеком для повсякденних витрат.'
        },
        {
            title: 'Автоматизація заощаджень',
            text: 'Налаштуйте автоматичне перерахування % від доходу на заощадження.'
        }
    ],
    
    render() {
        const html = `
            <div class="page-header">
                <h2 class="page-title">
                    <i class="fas fa-lightbulb"></i> Розумні поради
                </h2>
                <button class="btn btn-secondary" onclick="TipsPage.refresh()">
                    <i class="fas fa-sync-alt"></i> Оновити
                </button>
            </div>

            <div class="tips-grid">
                ${this.renderTips()}
            </div>
        `;
        
        document.getElementById('tipsPage').innerHTML = html;
    },
    
    renderTips() {
        return this.tips.map(tip => `
            <div class="tip-card">
                <div class="tip-title">${tip.title}</div>
                <div class="tip-text">${tip.text}</div>
            </div>
        `).join('');
    },
    
    refresh() {
        this.tips = [...this.tips].sort(() => Math.random() - 0.5);
        this.render();
    }
};

// ========== ARCHIVE PAGE ==========
const ArchivePage = {
    currentFilter: 'all',
    
    render() {
        const html = `
            <div class="page-header">
                <h2 class="page-title">
                    <i class="fas fa-archive"></i> Архів
                </h2>
            </div>

            <div class="archive-filters">
                <button class="archive-filter ${this.currentFilter === 'all' ? 'active' : ''}" onclick="ArchivePage.setFilter('all')">Всі</button>
                <button class="archive-filter ${this.currentFilter === '2026' ? 'active' : ''}" onclick="ArchivePage.setFilter('2026')">2026</button>
                <button class="archive-filter ${this.currentFilter === '2025' ? 'active' : ''}" onclick="ArchivePage.setFilter('2025')">2025</button>
                <button class="archive-filter ${this.currentFilter === '2024' ? 'active' : ''}" onclick="ArchivePage.setFilter('2024')">2024</button>
            </div>

            <div id="archiveContainer">
                ${this.renderArchiveItems()}
            </div>
        `;
        
        document.getElementById('archivePage').innerHTML = html;
    },
    
    setFilter(filter) {
        this.currentFilter = filter;
        this.render();
    },
    
    renderArchiveItems() {
        const allTransactions = [
            ...(AppState.data.transactions.EUR || []),
            ...(AppState.data.transactions.UAH || [])
        ];
        
        const filtered = this.currentFilter === 'all' 
            ? allTransactions 
            : allTransactions.filter(t => {
                const year = t.date ? new Date(t.date).getFullYear() : null;
                return year === parseInt(this.currentFilter);
            });
        
        if (!filtered.length) {
            return `
                <div class="empty-state">
                    <i class="fas fa-archive"></i>
                    <p>Немає транзакцій за цей період</p>
                </div>
            `;
        }
        
        const grouped = {};
        filtered.forEach(t => {
            if (!t.date) return;
            const date = new Date(t.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!grouped[monthKey]) grouped[monthKey] = [];
            grouped[monthKey].push(t);
        });
        
        return Object.keys(grouped).sort().reverse().map(monthKey => {
            const [year, month] = monthKey.split('-');
            const monthName = new Date(year, month - 1).toLocaleDateString('uk-UA', { month: 'long' });
            const transactions = grouped[monthKey];
            
            const totalIncome = transactions.filter(t => t.type === 'income')
                .reduce((sum, t) => sum + (t.amount || 0), 0);
            const totalExpense = transactions.filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + (t.amount || 0), 0);
            
            return `
                <div class="archive-item">
                    <div class="archive-item-info">
                        <h4>${monthName} ${year}</h4>
                        <p>Транзакцій: ${transactions.length}</p>
                    </div>
                    <div class="archive-item-amount">
                        <span class="income">+${totalIncome.toFixed(2)} €</span>
                        <span class="expense">-${totalExpense.toFixed(2)} €</span>
                    </div>
                </div>
            `;
        }).join('');
    }
};

// ========== THEMES PAGE ==========
const ThemesPage = {
    render() {
        const currentTheme = document.body.getAttribute('data-theme') || 'dark';
        const currentAccent = document.body.getAttribute('data-accent') || 'blue';
        
        const html = `
            <div class="page-header">
                <h2 class="page-title">
                    <i class="fas fa-palette"></i> Теми оформлення
                </h2>
            </div>

            <div class="themes-container">
                <div class="theme-section">
                    <h3 class="theme-section-title">
                        <i class="fas fa-moon"></i> Темний режим
                    </h3>
                    <div class="theme-grid">
                        ${this.renderThemeOptions('dark', currentTheme, currentAccent)}
                    </div>
                </div>

                <div class="theme-section">
                    <h3 class="theme-section-title">
                        <i class="fas fa-sun"></i> Світлий режим
                    </h3>
                    <div class="theme-grid">
                        ${this.renderThemeOptions('light', currentTheme, currentAccent)}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('themesPage').innerHTML = html;
    },
    
    renderThemeOptions(mode, currentTheme, currentAccent) {
        const accents = [
            { id: 'blue', name: 'Синій', color: '#3b82f6' },
            { id: 'green', name: 'Зелений', color: '#10b981' },
            { id: 'purple', name: 'Фіолетовий', color: '#8b5cf6' },
            { id: 'pink', name: 'Рожевий', color: '#ec4899' },
            { id: 'orange', name: 'Помаранчевий', color: '#f97316' },
            { id: 'teal', name: 'Бірюзовий', color: '#14b8a6' },
            { id: 'red', name: 'Червоний', color: '#ef4444' },
            { id: 'gray', name: 'Сірий', color: '#6b7280' },
            { id: 'sky', name: 'Блакитний', color: '#0ea5e9' }
        ];
        
        return accents.map(accent => {
            const isActive = currentTheme === mode && currentAccent === accent.id;
            const previewClass = `theme-preview theme-preview-${mode} theme-preview-${accent.id}`;
            
            return `
                <div class="theme-card ${isActive ? 'active' : ''}" 
                     onclick="ThemesPage.setTheme('${mode}', '${accent.id}')">
                    <div class="${previewClass}">
                        <div class="theme-preview-header" style="background: ${accent.color}"></div>
                        <div class="theme-preview-content">
                            <div class="theme-preview-line" style="background: ${accent.color}20"></div>
                            <div class="theme-preview-line" style="background: ${accent.color}40"></div>
                            <div class="theme-preview-line" style="background: ${accent.color}60"></div>
                        </div>
                    </div>
                    <div class="theme-info">
                        <span class="theme-name">${accent.name}</span>
                        ${isActive ? '<i class="fas fa-check-circle theme-check"></i>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    setTheme(mode, accent) {
        document.body.setAttribute('data-theme', mode);
        document.body.setAttribute('data-accent', accent);
        localStorage.setItem('balancio-theme', mode);
        localStorage.setItem('balancio-accent', accent);
        
        // Оновлюємо RGB змінні
        const rgbValues = {
            blue: '59, 130, 246',
            green: '16, 185, 129',
            purple: '139, 92, 246',
            pink: '236, 72, 153',
            orange: '249, 115, 22',
            teal: '20, 184, 166',
            red: '239, 68, 68',
            gray: '107, 114, 128',
            sky: '14, 165, 233'
        };
        document.documentElement.style.setProperty('--accent-primary-rgb', rgbValues[accent] || rgbValues.blue);
        
        this.render();
    }
};

// ========== MODALS ==========
const Modals = {
    openGoalModal(goal = null) {
        const modal = document.getElementById('goalModal');
        modal.innerHTML = `
            <div class="modal-content">
                <h2><i class="fas fa-bullseye"></i> ${goal ? 'Редагувати' : 'Нова'} ціль</h2>
                <input type="text" class="modal-input" id="goalName" placeholder="Назва цілі" value="${goal?.name || ''}">
                <select class="modal-select" id="goalCurrency">
                    <option value="UAH" ${goal?.currency === 'UAH' ? 'selected' : ''}>🇺🇦 Гривня</option>
                    <option value="EUR" ${goal?.currency === 'EUR' ? 'selected' : ''}>🇪🇺 Євро</option>
                    <option value="USD" ${goal?.currency === 'USD' ? 'selected' : ''}>🇺🇸 Долар</option>
                </select>
                <input type="number" class="modal-input" id="goalTarget" placeholder="Цільова сума" value="${goal?.target || ''}">
                <div class="modal-buttons">
                    <button class="modal-btn create" onclick="Modals.saveGoal('${goal?.id || ''}')">${goal ? 'Зберегти' : 'Створити'}</button>
                    <button class="modal-btn cancel" onclick="Modals.closeModal('goalModal')">Скасувати</button>
                </div>
            </div>
        `;
        modal.classList.add('active');
    },
    
    openTransactionModal(currency, transaction = null) {
        AppState.ui.selectedCategory = transaction?.category || null;
        
        const modal = document.getElementById('transactionModal');
        modal.innerHTML = `
            <div class="modal-content">
                <h2><i class="fas fa-exchange-alt"></i> ${transaction ? 'Редагувати' : 'Нова'} операція</h2>
                <input type="hidden" id="transactionCurrency" value="${currency}">
                <select class="modal-select" id="transactionType" onchange="Modals.updateCategoryButtons()">
                    <option value="income" ${transaction?.type === 'income' ? 'selected' : ''}>💰 Дохід</option>
                    <option value="expense" ${transaction?.type === 'expense' ? 'selected' : ''}>💸 Витрата</option>
                </select>
                
                <div class="category-buttons" id="categoryButtons"></div>

                <input type="text" class="modal-input" id="transactionDesc" placeholder="Опис" value="${transaction?.description || ''}">
                <input type="number" class="modal-input" id="transactionAmount" placeholder="Сума" value="${transaction?.amount || ''}">
                
                <div class="modal-buttons">
                    <button class="modal-btn create" onclick="Modals.saveTransaction('${transaction?.id || ''}')">${transaction ? 'Зберегти' : 'Додати'}</button>
                    <button class="modal-btn cancel" onclick="Modals.closeModal('transactionModal')">Скасувати</button>
                </div>
            </div>
        `;
        
        this.updateCategoryButtons(transaction?.category);
        modal.classList.add('active');
    },
    
    openBankModal(account = null) {
        const modal = document.getElementById('bankModal');
        modal.innerHTML = `
            <div class="modal-content">
                <h2><i class="fas fa-wallet"></i> ${account ? 'Редагувати' : 'Новий'} рахунок</h2>
                <input type="text" class="modal-input" id="bankName" placeholder="Назва рахунку" value="${account?.name || ''}">
                <select class="modal-select" id="bankCurrency">
                    <option value="UAH" ${account?.currency === 'UAH' ? 'selected' : ''}>🇺🇦 Гривня</option>
                    <option value="EUR" ${account?.currency === 'EUR' ? 'selected' : ''}>🇪🇺 Євро</option>
                    <option value="USD" ${account?.currency === 'USD' ? 'selected' : ''}>🇺🇸 Долар</option>
                </select>
                <input type="number" class="modal-input" id="bankBalance" placeholder="Поточний баланс" value="${account?.balance || ''}">
                <div class="modal-buttons">
                    <button class="modal-btn create" onclick="Modals.saveBank('${account?.id || ''}')">${account ? 'Зберегти' : 'Додати'}</button>
                    <button class="modal-btn cancel" onclick="Modals.closeModal('bankModal')">Скасувати</button>
                </div>
            </div>
        `;
        modal.classList.add('active');
    },
    
    openRecurringModal(payment = null) {
        const modal = document.getElementById('recurringModal');
        modal.innerHTML = `
            <div class="modal-content">
                <h2><i class="fas fa-clock"></i> ${payment ? 'Редагувати' : 'Новий'} платіж</h2>
                <input type="text" class="modal-input" id="recurringName" placeholder="Назва" value="${payment?.name || ''}">
                <input type="number" class="modal-input" id="recurringAmount" placeholder="Сума" value="${payment?.amount || ''}">
                <select class="modal-select" id="recurringCurrency">
                    <option value="UAH" ${payment?.currency === 'UAH' ? 'selected' : ''}>🇺🇦 Гривня</option>
                    <option value="EUR" ${payment?.currency === 'EUR' ? 'selected' : ''}>🇪🇺 Євро</option>
                    <option value="USD" ${payment?.currency === 'USD' ? 'selected' : ''}>🇺🇸 Долар</option>
                </select>
                <select class="modal-select" id="recurringFrequency">
                    <option value="Щомісяця" ${payment?.frequency === 'Щомісяця' ? 'selected' : ''}>Щомісяця</option>
                    <option value="Щокварталу" ${payment?.frequency === 'Щокварталу' ? 'selected' : ''}>Щокварталу</option>
                    <option value="Щороку" ${payment?.frequency === 'Щороку' ? 'selected' : ''}>Щороку</option>
                </select>
                <input type="text" class="modal-input" id="recurringDay" placeholder="День платежу" value="${payment?.day || ''}">
                <input type="text" class="modal-input" id="recurringCategory" placeholder="Категорія" value="${payment?.category || ''}">
                <div class="modal-buttons">
                    <button class="modal-btn create" onclick="Modals.saveRecurring('${payment?.id || ''}')">${payment ? 'Зберегти' : 'Додати'}</button>
                    <button class="modal-btn cancel" onclick="Modals.closeModal('recurringModal')">Скасувати</button>
                </div>
            </div>
        `;
        modal.classList.add('active');
    },
    
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },
    
    updateCategoryButtons(selectedCategory = null) {
        const typeSelect = document.getElementById('transactionType');
        if (!typeSelect) return;
        
        const type = typeSelect.value;
        const categories = Categories.getByType(type);
        const container = document.getElementById('categoryButtons');
        
        if (!container) return;
        
        container.innerHTML = categories.map(cat => `
            <button class="category-btn ${selectedCategory === cat ? 'selected' : ''}" data-category="${cat}">
                <i class="fas ${Categories.icons[cat]}"></i> ${Categories.translations[cat]}
            </button>
        `).join('');
        
        container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                AppState.ui.selectedCategory = btn.dataset.category;
            });
        });
    },
    
    saveGoal(id) {
        const nameInput = document.getElementById('goalName');
        const currencySelect = document.getElementById('goalCurrency');
        const targetInput = document.getElementById('goalTarget');
        
        if (!nameInput || !currencySelect || !targetInput) return;
        
        const name = nameInput.value.trim();
        const currency = currencySelect.value;
        const target = parseFloat(targetInput.value);
        
        if (!name || isNaN(target) || target <= 0) {
            return alert('Введіть назву та суму');
        }
        
        if (id) {
            const goal = AppState.data.goals.find(g => g.id === id);
            if (goal) {
                goal.name = name;
                goal.currency = currency;
                goal.target = target;
            }
        } else {
            AppState.data.goals.push({
                id: Helpers.generateId(),
                name,
                currency,
                target,
                saved: 0,
                completed: false,
                history: []
            });
        }
        
        AppState.save();
        this.closeModal('goalModal');
        GoalsPage.render();
    },
    
    saveTransaction(id) {
        const currencyInput = document.getElementById('transactionCurrency');
        const typeSelect = document.getElementById('transactionType');
        const descInput = document.getElementById('transactionDesc');
        const amountInput = document.getElementById('transactionAmount');
        
        if (!currencyInput || !typeSelect || !descInput || !amountInput) return;
        
        const currency = currencyInput.value;
        const type = typeSelect.value;
        const desc = descInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const category = AppState.ui.selectedCategory;
        
        if (!category) return alert('Виберіть категорію');
        if (isNaN(amount) || amount <= 0) return alert('Введіть коректну суму');
        
        if (!AppState.data.transactions[currency]) {
            AppState.data.transactions[currency] = [];
        }
        
        if (id) {
            const index = AppState.data.transactions[currency].findIndex(t => t.id === id);
            if (index !== -1) {
                AppState.data.transactions[currency][index] = {
                    ...AppState.data.transactions[currency][index],
                    type,
                    description: desc || '-',
                    category,
                    amount
                };
            }
        } else {
            AppState.data.transactions[currency].push({
                id: Helpers.generateId(),
                type,
                description: desc || '-',
                category,
                amount,
                date: Date.now(),
                month: Helpers.getMonthKey(AppState.ui.currentMonth)
            });
        }
        
        AppState.save();
        this.closeModal('transactionModal');
        JournalPage.render();
    },
    
    saveBank(id) {
        const nameInput = document.getElementById('bankName');
        const currencySelect = document.getElementById('bankCurrency');
        const balanceInput = document.getElementById('bankBalance');
        
        if (!nameInput || !currencySelect || !balanceInput) return;
        
        const name = nameInput.value.trim();
        const currency = currencySelect.value;
        const balance = parseFloat(balanceInput.value);
        
        if (!name || isNaN(balance)) return alert('Заповніть всі поля');
        
        if (id) {
            const account = AppState.data.bankAccounts.find(a => a.id === id);
            if (account) {
                account.name = name;
                account.currency = currency;
                account.balance = balance;
            }
        } else {
            AppState.data.bankAccounts.push({
                id: Helpers.generateId(),
                name,
                currency,
                balance,
                icon: BankPage.getRandomIcon()
            });
        }
        
        AppState.save();
        this.closeModal('bankModal');
        BankPage.render();
    },
    
    saveRecurring(id) {
        const nameInput = document.getElementById('recurringName');
        const amountInput = document.getElementById('recurringAmount');
        const currencySelect = document.getElementById('recurringCurrency');
        const frequencySelect = document.getElementById('recurringFrequency');
        const dayInput = document.getElementById('recurringDay');
        const categoryInput = document.getElementById('recurringCategory');
        
        if (!nameInput || !amountInput || !currencySelect || !frequencySelect || !dayInput || !categoryInput) return;
        
        const name = nameInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const currency = currencySelect.value;
        const frequency = frequencySelect.value;
        const day = dayInput.value;
        const category = categoryInput.value;
        
        if (!name || isNaN(amount) || !day || !category) {
            return alert('Заповніть всі поля');
        }
        
        const data = { name, amount, currency, frequency, day, category };
        
        if (id) {
            const index = AppState.data.recurringPayments.findIndex(p => p.id === id);
            if (index !== -1) {
                AppState.data.recurringPayments[index] = { ...AppState.data.recurringPayments[index], ...data };
            }
        } else {
            AppState.data.recurringPayments.push({
                id: Helpers.generateId(),
                ...data
            });
        }
        
        AppState.save();
        this.closeModal('recurringModal');
        RecurringPage.render();
    }
};

// ========== Глобальна функція оновлення ==========
window.updateAllPages = function() {
    const activeTab = document.querySelector('.nav-tab.active');
    if (activeTab) {
        Navigation.renderPage(activeTab.dataset.page);
    }
};
