// Get references to form elements
const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');
const errorMessage = document.getElementById('errorMessage');

// Add event listener to handle form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent form from submitting the default way

    // Get the values from the form
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Clear any previous error messages
    errorMessage.textContent = '';

    // Validate the input (you can add more validation if needed)
    if (!email || !password) {
        errorMessage.textContent = 'Please fill out both fields.';
        return;
    }

    // Prepare data to send in the POST request
    const loginData = {
        email,
        password
    };

    // Make the POST request to the server
    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        // Handle response from server
        if (response.ok) {
            const data = await response.json();
            console.log('Login successful:', data);
            // Redirect to a protected page or dashboard after successful login
            window.location.href = 'index.html';
        } else {
            const data = await response.json();
            errorMessage.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        errorMessage.textContent = 'An error occurred during login. Please try again.';
        console.error('Login error:', error);
    }
});
