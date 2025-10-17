const db = require('../models/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../configure/config');
const authSchema = require('../validators/authValidator');

exports.signup = async (req, res) => {
    try {
        const { error } = authSchema.signupSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { username, email, password_hash, role } = req.body;

        // Check if user exists
        const [existingUser] = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ?', 
            [email, username]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ 
                error: 'User with this email or username already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password_hash, 10);

        // Create user
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            [username, email, hashedPassword, role || 'user', 1]
        );

        // Generate token
        const token = jwt.sign(
            { id: result.insertId }, 
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        res.status(201).json({ 
            success: true, 
            token,
            user: { id: result.insertId, username, email, role: role || 'user' }
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { error } = authSchema.loginSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { identifier, password } = req.body;

        // Find user by email or username
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [identifier, identifier]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        if (!user.password_hash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id }, 
            config.jwt.secret, 
            { expiresIn: config.jwt.expiresIn }
        );

        res.json({ 
            success: true,
            token,
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.checkExistingUser = async (req, res) => {
    try {
        const { email, username } = req.query;

        // Validate at least one parameter is provided
        if (!email && !username) {
            return res.status(400).json({ 
                error: 'Please provide either email or username to check' 
            });
        }

        let query = 'SELECT * FROM users WHERE ';
        const params = [];
        
        if (email && username) {
            query += 'email = ? OR username = ?';
            params.push(email, username);
        } else if (email) {
            query += 'email = ?';
            params.push(email);
        } else {
            query += 'username = ?';
            params.push(username);
        }

        const [users] = await db.query(query, params);

        const response = {
            exists: users.length > 0,
            details: {
                emailExists: email ? users.some(u => u.email === email) : false,
                userNameExists: username ? users.some(u => u.username === username) : false
            },
            conflicts: {
                email: email ? (users.find(u => u.email === email))?.email : null,
                username: username ? (users.find(u => u.username === username))?.username : null
            }
        };

        res.status(200).json(response);

    } catch (err) {
        console.error('Check existing user error:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            details: err.message 
        });
    }
};

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error('Authentication required');

        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = { id: decoded.id };
        next();
    } catch (err) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

exports.editUserName = async (req, res) => {
    try {
        const { error } = authSchema.editUserNameSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { username, password } = req.body;
        const userId = req.user.id; 

        const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, users[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const [existing] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const [result] = await db.query(
            'UPDATE users SET username = ?, updated_at = NOW() WHERE id = ?',
            [username, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to update username' });
        }

        res.status(200).json({ 
            success: true,
            message: 'Username updated successfully',
            username 
        });
    } catch (err) {
        console.error('Edit username error:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            details: err.message 
        });
    }
}