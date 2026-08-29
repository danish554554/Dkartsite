import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, execute } from '../database/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dkart-production-secret-key-2026';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const insertRes = await execute(`
      INSERT INTO users (name, email, password_hash, phone, role)
      VALUES (?, ?, ?, ?, 'customer')
      RETURNING id
    `, [name.trim(), normalizedEmail, passwordHash, phone ? phone.trim() : null]);

    const newId = insertRes.rows[0]?.id;

    const user = {
      id: newId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone || '',
      role: 'customer'
    };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await queryOne('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userPayload
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await queryOne('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const countRow = await queryOne('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', [req.user.id]);
    const ordersCount = parseInt(countRow?.count || 0, 10);

    res.json({
      success: true,
      user: {
        ...user,
        ordersCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const user = await queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);

    let passwordHash = user.password_hash;
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password.' });
      }
      if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
        return res.status(400).json({ success: false, message: 'Current password does not match.' });
      }
      passwordHash = bcrypt.hashSync(newPassword, 10);
    }

    await execute(`
      UPDATE users
      SET name = ?, phone = ?, password_hash = ?
      WHERE id = ?
    `, [name || user.name, phone !== undefined ? phone : user.phone, passwordHash, req.user.id]);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user.id,
        name: name || user.name,
        email: user.email,
        phone: phone !== undefined ? phone : user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};
