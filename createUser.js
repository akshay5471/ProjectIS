document.getElementById('createUserForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Clear previous error and success messages
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';

    // Basic validation
    if (!username || !email || !password || !role) {
        document.getElementById('errorMessage').textContent = 'All fields are required.';
        document.getElementById('errorMessage').style.display = 'block';
        return;
    }

    // Send user data to the backend API
    try {
        console.log("starting");
        const response = await fetch('http://localhost:3001/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, role })
        });
      
        console.log(response);
        if (!response.ok) {
            throw new Error('Failed to create user');
        }

        // Show success message
        document.getElementById('successMessage').style.display = 'block';
        document.getElementById('createUserForm').reset();
    } catch (error) {
        document.getElementById('errorMessage').textContent = error.message;
        document.getElementById('errorMessage').style.display = 'block';
    }
});
