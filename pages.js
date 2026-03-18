// ========== HELPER FUNCTIONS ==========
const Helpers = {
    getSymbol(currency) {
        const symbols = { UAH: '₴', EUR: '€', USD: '$' };
        return symbols[currency] || '?';
    },
    
    escape(str) {
        if (!str) return '';
        return String(str).replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));
    },
    
    generateId() {
        return Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    },
    
    getMonthKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    },
    
    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('uk-UA');
    }
};

// ========== DEBTS PAGE ==========
const DebtsPage = {
    render() {
        const data = AppState.data.debts;
        const html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title"><i class="fas fa-arrow-down"></i> Мені винені</div>
                    <div class="stat-value" id="totalOwed">${this.calcTotal(data.owed)} ₴</div>
                    <div class="stat-details">
                        ${this.renderCurrencyStats(data.owed, 'owed')}
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-title"><i class="fas fa-arrow-up"></i> Я винен</div>
                    <div class="stat-value" id="totalOwe">${this.calcTotal(data.owe)} ₴</div>
                    <div class="stat-details">
                        ${this.renderCurrencyStats(data.owe, 'owe')}
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-title"><i class="fas fa-scale-balanced"></i> Чистий результат</div>
                    <div class="stat-value" id="totalNet">${this.calcNet(data)} ₴</div>
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
        // Додавання боргів
        document.getElementById('addOwedBtn')?.addEventListener('click', () => this.addDebt('owed'));
        document.getElementById('addOweBtn')?.addEventListener('click', () => this.addDebt('owe'));
        
        // Видалення боргів
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
                <h2 class="page-title">
                    <i class="fas fa-rocket"></i> Активні цілі
                    <span class="section-badge">${activeGoals.length}</span>
                </h2>
                <button class="btn btn-primary" onclick="Modals.openGoalModal()">
                    <i class="fas fa-plus"></i> Нова ціль
                </button>
            </div>

            <div class="goals-grid">
                ${this.renderGoalsList(activeGoals)}
            </div>

            <h2 class="page-title">
                <i class="fas fa-trophy"></i> Досягнуті цілі
                <span class="section-badge">${completedGoals.length}</span>
            </h2>

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
                <button class="btn-small btn-danger" onclick="GoalsPage.withdrawFromGoal('${goal.id}')">
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
        this.updateCharts();
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
            return '<tr><td colspan="5" style="text-align:center; padding:30px;">Немає операцій за цей місяць</td></tr>';
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
        // Оновлення графіків буде тут
        // Поки що заглушка
    }
};

// ========== BANK PAGE ==========
const BankPage = {
    render() {
        const accounts = AppState.data.bankAccounts || [];
        const total = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        
        const html = `
            <div class="total-balance">
                <div class="total-balance-label">Загальний капітал</div>
                <div class="total-balance-value">${total.toFixed(2)} €</div>
            </div>

            <div class="page-header">
                <h2 class="page-title">
                    <i class="fas fa-wallet"></i> Мої рахунки
                </h2>
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
    
    addAccount(data) {
        AppState.data.bankAccounts.push({
            id: Helpers.generateId(),
            ...data,
            icon: this.getRandomIcon()
        });
        AppState.save();
        this.render();
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

            <h3 class="page-title" style="margin-top: 32px;">
                <i class="fas fa-calendar-alt"></i> Майбутні платежі
            </h3>

            <div class="recurring-grid">
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
        
        // Простий розрахунок майбутніх платежів
        return payments.slice(0, 3).map(p => {
            const daysLeft = Math.floor(Math.random() * 10) + 1;
            return `
                <div class="recurring-card">
                    <div class="recurring-info">
                        <h4>${Helpers.escape(p.name)}</h4>
                        <p>Через ${daysLeft} днів</p>
                    </div>
                    <div class="recurring-amount">${p.amount} ${Helpers.getSymbol(p.currency)}</div>
                </div>
            `;
        }).join('');
    },
    
    addPayment(data) {
        AppState.data.recurringPayments.push({
            id: Helpers.generateId(),
            ...data
        });
        AppState.save();
        this.render();
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
    },
    
    updatePayment(id, data) {
        const index = AppState.data.recurringPayments.findIndex(p => p.id === id);
        if (index !== -1) {
            AppState.data.recurringPayments[index] = { ...AppState.data.recurringPayments[index], ...data };
            AppState.save();
            this.render();
        }
    }
};

// ========== BUDGET PAGE ==========
const BudgetPage = {
    render() {
        const monthName = AppState.ui.currentMonth.toLocaleDateString('uk-UA', { month: 'long' });
        
        const html = `
            <div class="page-header">
                <h2 class="page-title">
                    <i class="fas fa-chart-pie"></i> Бюджет на ${monthName}
                </h2>
                <button class="btn btn-primary" onclick="Modals.openBudgetModal()">
                    <i class="fas fa-plus"></i> Налаштувати бюджет
                </button>
            </div>

            <div class="budget-grid" id="budgetContainer">
                ${this.renderBudgetItems()}
            </div>
        `;
        
        document.getElementById('budgetPage').innerHTML = html;
    },
    
    renderBudgetItems() {
        // Приклад бюджету (потім замінити на реальні дані)
        const sampleBudget = [
            { category: 'food', name: 'Їжа', planned: 400, spent: 320, icon: 'fa-utensils' },
            { category: 'transport', name: 'Транспорт', planned: 80, spent: 45, icon: 'fa-bus' },
            { category: 'entertainment', name: 'Розваги', planned: 150, spent: 180, icon: 'fa-film' },
            { category: 'health', name: 'Здоров\'я', planned: 100, spent: 35, icon: 'fa-heartbeat' }
        ];
        
        return sampleBudget.map(item => {
            const percent = (item.spent / item.planned) * 100;
            const status = percent > 100 ? 'budget-danger' : percent > 80 ? 'budget-warning' : '';
            
            return `
                <div class="budget-card">
                    <div class="budget-header">
                        <div class="budget-category">
                            <i class="fas ${item.icon}"></i> ${item.name}
                        </div>
                        <span class="${status}">${percent.toFixed(0)}%</span>
                    </div>
                    <div class="budget-numbers">
                        <span>Витрачено: ${item.spent} €</span>
                        <span>План: ${item.planned} €</span>
                    </div>
                    <div class="budget-progress-bar">
                        <div class="budget-progress-fill" style="width: ${Math.min(percent, 100)}%"></div>
                    </div>
                    ${percent > 100 ? 
                        `<div class="budget-warning">Перевищення на ${(percent - 100).toFixed(0)}%</div>` : 
                        percent > 80 ? 
                        `<div class="budget-warning">Залишилось ${(item.planned - item.spent).toFixed(2)} €</div>` : ''
                    }
                </div>
            `;
        }).join('');
    },
    
    updateBudget(category, planned) {
        // Логіка оновлення бюджету
        const monthKey = Helpers.getMonthKey(AppState.ui.currentMonth);
        if (!AppState.data.budgets[monthKey]) {
            AppState.data.budgets[monthKey] = {};
        }
        AppState.data.budgets[monthKey][category] = planned;
        AppState.save();
        this.render();
    }
};

// ========== TIPS PAGE ==========
const TipsPage = {
    tips: [
        {
            title: 'Правило 50/30/20',
            text: '50% доходу на потреби, 30% на бажання, 20% на заощадження. Це допоможе збалансувати бюджет.'
        },
        {
            title: 'Економія на підписках',
            text: 'Перевірте регулярні платежі - можливо, ви платите за сервіси, якими не користуєтесь.'
        },
        {
            title: 'Фінансова подушка',
            text: 'Рекомендується мати запас у розмірі 3-6 місячних витрат на непередбачені ситуації.'
        },
        {
            title: 'Інвестиції для початківців',
            text: 'Почніть з малого - регулярно інвестуйте навіть невеликі суми, використовуючи DCA стратегію.'
        },
        {
            title: 'Кешбек та бонуси',
            text: 'Використовуйте картки з кешбеком для повсякденних витрат - це дозволить повертати частину грошей.'
        },
        {
            title: 'Автоматизація заощаджень',
            text: 'Налаштуйте автоматичне перерахування відсотка від доходу на заощадження - так ви не будете витрачати ці гроші.'
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
        // Перемішуємо поради
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
        // Збираємо всі транзакції
        const allTransactions = [
            ...(AppState.data.transactions.EUR || []),
            ...(AppState.data.transactions.UAH || [])
        ];
        
        // Фільтруємо за роком
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
        
        // Групуємо за місяцями
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
                    <i class="fas fa-palette"></i> Тема оформлення
                </h2>
            </div>

            <h3 class="page-title" style="font-size: 1.2rem; margin-bottom: 16px;">
                <i class="fas fa-moon"></i> Режим
            </h3>

            <div class="theme-settings">
                <div class="theme-option ${currentTheme === 'dark' ? 'active' : ''}" onclick="ThemesPage.setTheme('dark')">
                    <i class="fas fa-moon"></i>
                    <h3>Темна</h3>
                </div>
                <div class="theme-option ${currentTheme === 'light' ? 'active' : ''}" onclick="ThemesPage.setTheme('light')">
                    <i class="fas fa-sun"></i>
                    <h3>Світла</h3>
                </div>
            </div>

            <h3 class="page-title" style="font-size: 1.2rem; margin: 32px 0 16px;">
                <i class="fas fa-paint-brush"></i> Колір акценту
            </h3>

            <div class="theme-settings">
                <div class="theme-option ${currentAccent === 'blue' ? 'active' : ''}" onclick="ThemesPage.setAccent('blue')">
                    <div class="theme-color color-blue"></div>
                    <h3>Синій</h3>
                </div>
                <div class="theme-option ${currentAccent === 'green' ? 'active' : ''}" onclick="ThemesPage.setAccent('green')">
                    <div class="theme-color color-green"></div>
                    <h3>Зелений</h3>
                </div>
                <div class="theme-option ${currentAccent === 'purple' ? 'active' : ''}" onclick="ThemesPage.setAccent('purple')">
                    <div class="theme-color color-purple"></div>
                    <h3>Фіолетовий</h3>
                </div>
                <div class="theme-option ${currentAccent === 'pink' ? 'active' : ''}" onclick="ThemesPage.setAccent('pink')">
                    <div class="theme-color color-pink"></div>
                    <h3>Рожевий</h3>
                </div>
            </div>
        `;
        
        document.getElementById('themesPage').innerHTML = html;
    },
    
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('balancio-theme', theme);
        this.render();
    },
    
    setAccent(color) {
        document.body.setAttribute('data-accent', color);
        localStorage.setItem('balancio-accent', color);
        this.render();
    }
};

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
        // Оновлюємо активний таб
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.nav-tab[data-page="${pageId}"]`).classList.add('active');
        
        // Ховаємо всі сторінки
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Показуємо вибрану сторінку
        const page = document.getElementById(`${pageId}Page`);
        page.classList.add('active');
        
        // Рендеримо сторінку
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
            case 'tips': TipsPage.render(); break;
            case 'archive': ArchivePage.render(); break;
            case 'themes': ThemesPage.render(); break;
        }
    }
};

// Функція для оновлення всіх сторінок
window.updateAllPages = function() {
    const activeTab = document.querySelector('.nav-tab.active');
    if (activeTab) {
        Navigation.renderPage(activeTab.dataset.page);
    }
};
