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
        const modal = document.getElementById('transactionModal');
        modal.innerHTML = `
            <div class="modal-content">
                <h2><i class="fas fa-exchange-alt"></i> ${transaction ? 'Редагувати' : 'Нова'} операція</h2>
                <input type="hidden" id="transactionCurrency" value="${currency}">
                <select class="modal-select" id="transactionType">
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
    
    openBudgetModal() {
        const modal = document.getElementById('budgetModal');
        modal.innerHTML = `
            <div class="modal-content">
                <h2><i class="fas fa-chart-pie"></i> Налаштувати бюджет</h2>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">
                    Функція налаштування бюджету буде доступна найближчим часом!
                </p>
                <div class="modal-buttons">
                    <button class="modal-btn cancel" onclick="Modals.closeModal('budgetModal')">Закрити</button>
                </div>
            </div>
        `;
        modal.classList.add('active');
    },
    
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    },
    
    updateCategoryButtons(selectedCategory = null) {
        const type = document.getElementById('transactionType').value;
        const categories = Categories.getByType(type);
        const container = document.getElementById('categoryButtons');
        
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
        const name = document.getElementById('goalName').value.trim();
        const currency = document.getElementById('goalCurrency').value;
        const target = parseFloat(document.getElementById('goalTarget').value);
        
        if (!name || isNaN(target) || target <= 0) {
            return alert('Введіть назву та суму');
        }
        
        if (id) {
            // Редагування існуючої цілі
            const goal = AppState.data.goals.find(g => g.id === id);
            if (goal) {
                goal.name = name;
                goal.currency = currency;
                goal.target = target;
            }
        } else {
            // Створення нової цілі
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
        Navigation.renderPage('goals');
    },
    
    saveTransaction(id) {
        const currency = document.getElementById('transactionCurrency').value;
        const type = document.getElementById('transactionType').value;
        const desc = document.getElementById('transactionDesc').value.trim();
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        const category = AppState.ui.selectedCategory;
        
        if (!category) return alert('Виберіть категорію');
        if (isNaN(amount) || amount <= 0) return alert('Введіть коректну суму');
        
        if (!AppState.data.transactions[currency]) {
            AppState.data.transactions[currency] = [];
        }
        
        if (id) {
            // Редагування
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
            // Нова транзакція
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
        Navigation.renderPage('journal');
    },
    
    saveBank(id) {
        const name = document.getElementById('bankName').value.trim();
        const currency = document.getElementById('bankCurrency').value;
        const balance = parseFloat(document.getElementById('bankBalance').value);
        
        if (!name || isNaN(balance)) return alert('Заповніть всі поля');
        
        if (id) {
            const account = AppState.data.bankAccounts.find(a => a.id === id);
            if (account) {
                account.name = name;
                account.currency = currency;
                account.balance = balance;
            }
        } else {
            BankPage.addAccount({ name, currency, balance });
        }
        
        AppState.save();
        this.closeModal('bankModal');
        Navigation.renderPage('bank');
    },
    
    saveRecurring(id) {
        const name = document.getElementById('recurringName').value.trim();
        const amount = parseFloat(document.getElementById('recurringAmount').value);
        const currency = document.getElementById('recurringCurrency').value;
        const frequency = document.getElementById('recurringFrequency').value;
        const day = document.getElementById('recurringDay').value;
        const category = document.getElementById('recurringCategory').value;
        
        if (!name || isNaN(amount) || !day || !category) {
            return alert('Заповніть всі поля');
        }
        
        const data = { name, amount, currency, frequency, day, category };
        
        if (id) {
            RecurringPage.updatePayment(id, data);
        } else {
            RecurringPage.addPayment(data);
        }
        
        this.closeModal('recurringModal');
    }
};

// ========== FEATURES GRID ==========
const FeaturesGrid = {
    items: [
        { icon: 'fa-hand-holding-heart', title: 'Борги', desc: 'Відстежуйте, хто вам винен і кому винні ви' },
        { icon: 'fa-bullseye', title: 'Цілі', desc: 'Ставте фінансові цілі та досягайте їх' },
        { icon: 'fa-book-open', title: 'Щоденник', desc: 'Записуйте доходи та витрати' },
        { icon: 'fa-wallet', title: 'Мій банк', desc: 'Всі рахунки в одному місці' },
        { icon: 'fa-chart-pie', title: 'Бюджет', desc: 'Плануйте витрати та контролюйте їх' },
        { icon: 'fa-clock', title: 'Регулярні', desc: 'Автоматичні платежі та підписки' }
    ],
    
    render() {
        const html = this.items.map(item => `
            <div class="feature-card">
                <div class="feature-icon"><i class="fas ${item.icon}"></i></div>
                <div class="feature-title">${item.title}</div>
                <div class="feature-desc">${item.desc}</div>
            </div>
        `).join('');
        
        document.getElementById('featuresGrid').innerHTML = html;
    }
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    FeaturesGrid.render();
    Navigation.render();
    
    // Завантажуємо збережену тему
    const savedTheme = localStorage.getItem('balancio-theme');
    const savedAccent = localStorage.getItem('balancio-accent');
    if (savedTheme) document.body.setAttribute('data-theme', savedTheme);
    if (savedAccent) document.body.setAttribute('data-accent', savedAccent);
    
    // Auth listeners
    landingLoginBtn.addEventListener('click', () => {
        auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
            .catch(e => alert('Помилка входу: ' + e.message));
    });
    
    logoutBtn.addEventListener('click', () => auth.signOut());
    
    auth.onAuthStateChanged(user => {
        if (user) {
            AppState.user = user;
            userEmailSpan.textContent = user.email;
            landingPage.style.display = 'none';
            mainApp.style.display = 'block';
            AppState.load(user.uid);
        } else {
            AppState.user = null;
            landingPage.style.display = 'block';
            mainApp.style.display = 'none';
        }
    });
});

// ========== GLOBAL HELPERS ==========
const showRefresh = () => {
    refreshIndicator.classList.add('active');
    setTimeout(() => refreshIndicator.classList.remove('active'), 1000);
};

// Експортуємо все в глобальний об'єкт window
window.Helpers = Helpers;
window.AppState = AppState;
window.Modals = Modals;
window.DebtsPage = DebtsPage;
window.GoalsPage = GoalsPage;
window.JournalPage = JournalPage;
window.BankPage = BankPage;
window.RecurringPage = RecurringPage;
window.BudgetPage = BudgetPage;
window.TipsPage = TipsPage;
window.ArchivePage = ArchivePage;
window.ThemesPage = ThemesPage;
