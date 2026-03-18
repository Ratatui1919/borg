// ========== FIREBASE CONFIG ==========
const firebaseConfig = {
    apiKey: "AIzaSyD6hldl2mZS1xZe1Z8ZERWM19kpCjAqfwQ",
    authDomain: "borgi-60d8d.firebaseapp.com",
    databaseURL: "https://borgi-60d8d-default-rtdb.firebaseio.com",
    projectId: "borgi-60d8d",
    storageBucket: "borgi-60d8d.firebasestorage.app",
    messagingSenderId: "361694792367",
    appId: "1:361694792367:web:ccbfc861668a568e1e225a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// ========== GLOBAL STATE ==========
const AppState = {
    user: null,
    data: {
        goals: [],
        debts: { owed: [], owe: [] },
        transactions: { EUR: [], UAH: [] },
        bankAccounts: [],
        budgets: {},
        recurringPayments: []
    },
    ui: {
        currentMonth: new Date(),
        currentCurrency: 'EUR',
        selectedCategory: null
    },
    
    async save() {
        if (!this.user) return;
        if (typeof window.showRefresh === 'function') window.showRefresh();
        try {
            await database.ref('users/' + this.user.uid).set(this.data);
        } catch (error) {
            console.error('Save error:', error);
        }
    },
    
    load(uid) {
        database.ref('users/' + uid).on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                this.data = this.migrateData(data);
            }
            if (typeof window.updateAllPages === 'function') {
                window.updateAllPages();
            }
        });
    },
    
    migrateData(data) {
        if (data.goals) {
            data.goals = data.goals.map(goal => ({
                ...goal,
                completed: goal.completed || (goal.saved >= goal.target),
                completedDate: goal.completedDate || (goal.saved >= goal.target ? Date.now() : null),
                history: goal.history || []
            }));
        }
        
        return {
            goals: data.goals || [],
            debts: data.debts || { owed: [], owe: [] },
            transactions: data.transactions || { EUR: [], UAH: [] },
            bankAccounts: data.bankAccounts || [],
            budgets: data.budgets || {},
            recurringPayments: data.recurringPayments || []
        };
    }
};

// ========== CATEGORIES ==========
const Categories = {
    translations: {
        'salary': 'Зарплата',
        'gift': 'Подарунок',
        'freelance': 'Підробіток',
        'investment': 'Інвестиції',
        'food': 'Їжа',
        'transport': 'Транспорт',
        'health': 'Здоров\'я',
        'clothes': 'Одяг',
        'entertainment': 'Розваги',
        'cigarettes': 'Цигарки',
        'alcohol': 'Алкоголь',
        'other': 'Інше'
    },
    
    icons: {
        'salary': 'fa-briefcase',
        'gift': 'fa-gift',
        'freelance': 'fa-laptop',
        'investment': 'fa-chart-line',
        'food': 'fa-utensils',
        'transport': 'fa-bus',
        'health': 'fa-heartbeat',
        'clothes': 'fa-tshirt',
        'entertainment': 'fa-film',
        'cigarettes': 'fa-smoking',
        'alcohol': 'fa-wine-bottle',
        'other': 'fa-ellipsis'
    },
    
    getByType(type) {
        return type === 'income' 
            ? ['salary', 'gift', 'freelance', 'investment', 'other']
            : ['food', 'transport', 'health', 'clothes', 'entertainment', 'cigarettes', 'alcohol', 'other'];
    }
};

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
    },
    
    formatMoney(amount, currency = 'EUR') {
        return amount.toFixed(2) + ' ' + this.getSymbol(currency);
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
        const container = document.getElementById('featuresGrid');
        if (!container) return;
        
        const html = this.items.map(item => `
            <div class="landing-feature">
                <i class="fas ${item.icon}"></i>
                <span>${item.title}</span>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }
};

// ========== RGB ЗМІННІ ДЛЯ ТЕМ ==========
const updateAccentRGB = () => {
    const accent = document.body.getAttribute('data-accent') || 'blue';
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
};

// Викликаємо при завантаженні
document.addEventListener('DOMContentLoaded', updateAccentRGB);
