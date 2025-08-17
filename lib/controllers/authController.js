const db = require('../models/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../configure/config');
const authSchema = require('../validators/authValidator');

exports.signup = async (req, res) => {
    try {
        const { userName, email, password } = req.body;

        // Check if user exists
        const [existingUser] = await db.query(
            'SELECT * FROM users WHERE email = ? OR userName = ?', 
            [email, userName]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ 
                error: 'User with this email or username already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [result] = await db.query(
            'INSERT INTO users (userName, email, password) VALUES (?, ?, ?)',
            [userName, email, hashedPassword]
        );

        // Generate token
        const token = jwt.sign(
            { id: result.insertId }, 
           config.jwt.secret,
            { expiresIn:config.jwt.expiresIn }
        );

        res.status(201).json({ 
            success: true, 
            token,
            user: { id: result.insertId, userName, email }
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Find user by email or username
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ? OR userName = ?',
            [identifier, identifier]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        if (!user.password) {  // Changed from password_hash to password
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.userId }, 
            config.jwt.secret, 
            { expiresIn: config.jwt.expiresIn }
        );

        res.json({ 
            success: true,
            token,
            user: { 
                id: user.userId, 
                userName: user.userName, 
                email: user.email 
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.checkExistingUser = async (req, res) => {
    try {
        const { email, userName } = req.query;

        // Validate at least one parameter is provided
        if (!email && !userName) {
            return res.status(400).json({ 
                error: 'Please provide either email or username to check' 
            });
        }

        let query = 'SELECT * FROM users WHERE ';
        const params = [];
        
        if (email && userName) {
            query += 'email = ? OR userName = ?';
            params.push(email, userName);
        } else if (email) {
            query += 'email = ?';
            params.push(email);
        } else {
            query += 'userName = ?';
            params.push(userName);
        }

        const [users] = await db.query(query, params);

        const response = {
            exists: users.length > 0,
            details: {
                emailExists: email ? users.some(u => u.email === email) : false,
                userNameExists: userName ? users.some(u => u.userName === userName) : false
            },
            conflicts: {
                email: email ? (users.find(u => u.email === email))?.email : null,
                userName: userName ? (users.find(u => u.userName === userName))?.userName : null
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

        const { userName, password } = req.body;
        const userId = req.user.id; 

        const [users] = await db.query('SELECT password FROM users WHERE userId = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, users[0].password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const [existing] = await db.query('SELECT userId FROM users WHERE userName = ? AND userId != ?', [userName, userId]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const [result] = await db.query(
            'UPDATE users SET userName = ? WHERE userId = ?',
            [userName, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to update username' });
        }

        res.status(200).json({ 
            success: true,
            message: 'Username updated successfully',
            userName 
        });
    } catch (err) {
        console.error('Edit username error:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            details: err.message 
        });
    }
}