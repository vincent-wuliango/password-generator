// 1. Select all the HTML elements we need to talk to
const resultEl = document.getElementById('result');
const lengthEl = document.getElementById('length');
const uppercaseEl = document.getElementById('uppercase');
const lowercaseEl = document.getElementById('lowercase');
const numbersEl = document.getElementById('numbers');
const symbolsEl = document.getElementById('symbols');
const ambiguousEl = document.getElementById('ambiguous');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');

// 2. Define our "Ingredients"
const chars = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    number: '0123456789',
    symbol: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

// 3. Listen for clicks
generateBtn.addEventListener('click', () => {
    const length = +lengthEl.value; // The '+' turns the text into a number
    const hasUpper = uppercaseEl.checked;
    const hasLower = lowercaseEl.checked;
    const hasNumber = numbersEl.checked;
    const hasSymbol = symbolsEl.checked;
    const isAmbiguous = ambiguousEl.checked;

    resultEl.innerText = generatePassword(
        length,
        hasUpper,
        hasLower,
        hasNumber,
        hasSymbol,
        isAmbiguous
    );

    updateStrengthMeter(resultEl.innerText);
});

// 4. The Core Logic Function
function generatePassword(length, upper, lower, number, symbol, ambiguous) {
    let generatedPassword = '';
    let validChars = '';

    // Build the list of allowed characters
    if (upper) validChars += chars.upper;
    if (lower) validChars += chars.lower;
    if (number) validChars += chars.number;
    if (symbol) validChars += chars.symbol;

    // Filter out ambiguous characters if requested
    if (ambiguous) {
        // Exclude: I, l, 1, O, 0
        validChars = validChars.replace(/[Il1O0]/g, '');
    }

    // Safety check: Did user uncheck everything?
    if (validChars === '') {
        return 'Select at least one option!';
    }

    // Secure Random Generation
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        // Pick a random index based on the secure random number
        const randomIndex = array[i] % validChars.length;
        generatedPassword += validChars[randomIndex];
    }

    return generatedPassword;
}

// 5. Copy to Clipboard
copyBtn.addEventListener('click', () => {
    const textarea = document.createElement('textarea');
    const password = resultEl.innerText;

    if (!password || password === 'CLICK GENERATE') return;

    textarea.value = password;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();

    alert('Password copied to clipboard!');
});

// 6. Visual Strength Meter
function updateStrengthMeter(password) {
    // Simple logic: Length + Variety = Strength
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    // Update the UI
    if (strength <= 2) {
        strengthBar.style.backgroundColor = 'red';
        strengthText.innerText = 'Strength: Weak';
    } else if (strength <= 4) {
        strengthBar.style.backgroundColor = 'orange';
        strengthText.innerText = 'Strength: Medium';
    } else {
        strengthBar.style.backgroundColor = 'green';
        strengthText.innerText = 'Strength: Strong';
    }
}