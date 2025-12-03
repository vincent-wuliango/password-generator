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
generateBtn.addEventListener('click', async () => {
    // 1. Get the length from the slider
    const length = +lengthEl.value;

    // 2. Capture the checkbox states
    const hasUpper = uppercaseEl.checked;
    const hasLower = lowercaseEl.checked;
    const hasNumber = numbersEl.checked;
    const hasSymbol = symbolsEl.checked;

    // Check if everything is unchecked
    if (!hasUpper && !hasLower && !hasNumber && !hasSymbol) {
        resultEl.innerText = "Select at least one option!";
        resultEl.style.color = "#ff9800"; // Orange warning color
        return;
    }
    // ---------------------------

    // Visual Feedback
    resultEl.innerText = "Connecting to Server...";
    resultEl.style.color = "#a29bfe";
    generateBtn.disabled = true;
    generateBtn.innerText = "Generating...";

    try {
        // 3. THE API CALL
        // Build the URL with all parameters
        const apiUrl = `https://password-generator-api-dun.vercel.app/api/generate?length=${length}&upper=${hasUpper}&lower=${hasLower}&number=${hasNumber}&symbol=${hasSymbol}`;

        const response = await fetch(apiUrl);

        // 4. Check if server responded correctly
        if (!response.ok) throw new Error('Server Error');

        const data = await response.json();

        // 5. Update the UI with the Server's Password
        resultEl.innerText = data.password;
        resultEl.style.color = "#4caf50"; // Green text for success

        // Update the strength meter based on the new password
        updateStrengthMeter(data.password);

    } catch (error) {
        console.error(error);
        resultEl.innerText = "Error fetching data!";
        resultEl.style.color = "red";
    } finally {
        // 6. Reset button state (always runs)
        generateBtn.disabled = false;
        generateBtn.innerText = "Generate Password";
    }
});

// Helper Function for the Toast
function showToast() {
    const toast = document.getElementById("toast");

    // Add the "show" class to make it visible
    toast.className = "show";

    // After 3 seconds, remove the class to hide it again
    setTimeout(function(){
        toast.className = toast.className.replace("show", "");
    }, 3000);
}

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
    const password = resultEl.innerText;

    // Safety check: Don't copy if empty or placeholder text
    if (!password || password === 'CLICK GENERATE' || password === 'Connecting to Server...') return;

    navigator.clipboard.writeText(password)
        .then(() => {
            // Success! Show the toast
            showToast();
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
            // Fallback for very old browsers (optional, usually not needed nowadays)
            alert("Failed to copy password.");
        });
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

// --- Page Transition Logic ---

// 1. On Page Load: Fade out the curtain
window.addEventListener('load', () => {
    const overlay = document.querySelector('.transition-overlay');
    overlay.classList.add('hidden');
});

// 2. Handle links to ensure animation plays BEFORE leaving
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        const targetUrl = link.href;

        // Only animate if it's an internal link (not a # anchor)
        if (targetUrl && !targetUrl.includes('#')) {
            e.preventDefault(); // Stop immediate jump

            const overlay = document.querySelector('.transition-overlay');
            overlay.classList.remove('hidden'); // Fade to black

            // Wait 500ms (matching the CSS transition) then go
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 500);
        }
    });
});