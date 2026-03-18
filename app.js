// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');
    
    // Отримуємо DOM елементи
    const landingPage = document.getElementById('landingPage');
    const mainApp = document.getElementById('mainApp');
    const landingLoginBtn = document.getElementById('landingLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userEmailSpan = document.querySelector('#userEmail span');
    const refreshIndicator = document.getElementById('refreshIndicator');
    
    FeaturesGrid.render();
    Navigation.render();
    
    // Завантажуємо збережену тему
    const savedTheme = localStorage.getItem('balancio-theme');
    const savedAccent = localStorage.getItem('balancio-accent');
    if (savedTheme) document.body.setAttribute('data-theme', savedTheme);
    if (savedAccent) document.body.setAttribute('data-accent', savedAccent);
    
    // Оновлюємо RGB змінні
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
    updateAccentRGB();
    
    // Спостерігач за зміною теми
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-accent') {
                updateAccentRGB();
            }
        });
    });
    observer.observe(document.body, { attributes: true });
    
    // Функція для показу індикатора оновлення
    window.showRefresh = () => {
        if (refreshIndicator) {
            refreshIndicator.classList.add('active');
            setTimeout(() => refreshIndicator.classList.remove('active'), 1000);
        }
    };
    
    // Auth listeners
    if (landingLoginBtn) {
        landingLoginBtn.addEventListener('click', () => {
            console.log('Login button clicked');
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider)
                .then(result => {
                    console.log('Login successful:', result.user.email);
                })
                .catch(error => {
                    console.error('Login error:', error);
                    alert('Помилка входу: ' + error.message);
                });
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                console.log('Logged out');
            });
        });
    }
    
    auth.onAuthStateChanged(user => {
        console.log('Auth state changed:', user ? 'Logged in as ' + user.email : 'Logged out');
        
        if (user) {
            AppState.user = user;
            if (userEmailSpan) userEmailSpan.textContent = user.email;
            if (landingPage) landingPage.style.display = 'none';
            if (mainApp) mainApp.style.display = 'block';
            AppState.load(user.uid);
        } else {
            AppState.user = null;
            if (landingPage) landingPage.style.display = 'block';
            if (mainApp) mainApp.style.display = 'none';
        }
    });
});
