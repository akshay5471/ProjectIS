const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'inventory_db'
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to database');
});

// CRUD Endpoints
app.get('/api/inventory', (req, res) => {
    const query = 'SELECT * FROM inventory';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

app.post('/api/inventory', (req, res) => {
    const { name, quantity, price } = req.body;
    const query = 'INSERT INTO inventory (name, quantity, price) VALUES (?, ?, ?)';
    db.query(query, [name, quantity, price], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).json({ id: result.insertId, name, quantity, price });
        }
    });
});

app.delete('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM inventory WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(`Item with ID ${id} deleted.`);
        }
    });
});

app.put('/api/inventory/:id', async (req, res) => {
    const { id } = req.params;
    const { name, quantity, price } = req.body;

    try {
        // Update the item in the database
        const result = await db.query(
            'UPDATE inventory SET name = ?, quantity = ?, price = ? WHERE id = ?',
            [name, quantity, price, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating item', error });
    }
});

//registration endpoints
app.post('/api/users', async (req, res) => {
    const { username, email, password, role } = req.body;
    console.log("success");
    // Validate input
    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Hash the password
     const hashedPassword = await bcrypt.hash(password, 10);

    // SQL query to insert a new user into the database
    const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';

    db.query(query, [username, email, hashedPassword, role], (error, results) => {
        if (error) {
            console.error('Error inserting user into database:', error);
            return res.status(500).json({ message: 'Failed to create user', error: error.message });
        }
        res.status(201).json({ message: 'User created successfully', userId: results.insertId });
    });
});

// Login endpoints
// Middleware
app.use(express.json());
app.use(
    session({
        secret: 'test123',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 60 * 60 * 1000 } 
    })
);

// Helper function to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized. Please log in.' });
};

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email,password], async (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = results[0];
        /*const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }*/

        // Save user data in session
        req.session.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        res.status(200).json({ message: 'Login successful', user: req.session.user });
    });
});
// Endpoint to get the current session (check if user is logged in)
app.get('/api/session', (req, res) => {
    // Check if user is logged in by looking at the session
    if (req.session.user) {
        // Return session data (user info)
        res.status(200).json({ user: req.session.user });
    } else {
        // If not logged in, respond with an empty user object or a message
        res.status(200).json({ user: null });
    }
});
// Protected route example
app.get('/api/protected', isAuthenticated, (req, res) => {
    res.status(200).json({ message: 'Welcome to the protected route!', user: req.session.user });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});


const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});