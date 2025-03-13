const API_BASE_URL = 'https://api.frankfurter.app';
let currencies = [];

// Load currencies and detect user currency on startup
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await fetchCurrencies();
        detectUserCurrency();
        loadDarkModePreference();
    } catch (error) {
        showAlert(`Failed to initialize app: ${error.message}`, 'danger');
    }
});

// Fetch available currencies
async function fetchCurrencies() {
    try {
        const response = await fetch(`${API_BASE_URL}/currencies`);
        const data = await response.json();
        
        currencies = Object.entries(data).map(([code, name]) => ({ code, name }));
        
        populateCurrencyDropdowns();
    } catch (error) {
        showAlert(`Failed to fetch currencies: ${error.message}`, 'danger');
    }
}

// Populate currency dropdowns
function populateCurrencyDropdowns() {
    const dropdowns = ['fromCurrency', 'toCurrency'];

    dropdowns.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        
        select.innerHTML = '';
        
        currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.code;
            option.textContent = `${currency.code} - ${currency.name}`;
            select.appendChild(option);
        });
    });

    document.getElementById('fromCurrency').value = 'EUR';
    document.getElementById('toCurrency').value = 'USD';
}

// Handle currency conversion
document.getElementById('converterForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    if (isNaN(amount) || amount <= 0) {
        showAlert('Please enter a valid amount greater than 0', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
        const data = await response.json();
        
        const result = data.rates[toCurrency];

        document.getElementById('conversionResult').innerHTML = `
            <div class="alert alert-success">
                ${amount.toFixed(2)} ${fromCurrency} = <strong>${result.toFixed(2)} ${toCurrency}</strong>
            </div>
        `;
    } catch (error) {
        showAlert(`Conversion failed: ${error.message}`, 'danger');
    }
});

// Swap currencies
document.getElementById('swapCurrencies').addEventListener('click', function() {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');

    [fromCurrency.value, toCurrency.value] = [toCurrency.value, fromCurrency.value];
});

// Dark Mode Toggle
document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}
function loadDarkModePreference() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').checked = true;
    }
}

// Show alert messages
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.getElementById('alerts-container').appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
}
