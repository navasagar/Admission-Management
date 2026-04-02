import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest, authMiddleware, roleMiddleware } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { generateId } from '../utils/admissionNumberGenerator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User, ApiResponse } from '../types';

const router = Router();

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const connection = await pool.getConnection();

    try {
      const [rows]: any = await connection.execute(
        'SELECT id, name, email, password, role FROM users WHERE email = ?',
        [email]
      );

      if (!rows.length) {
        // For demo purposes, create user on first login
        const userId = generateId();
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Determine role based on email
        let role = 'admission_officer';
        if (email === 'admin@edumerge.com') role = 'admin';
        if (email === 'management@edumerge.com') role = 'management';

        await connection.execute(
          'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
          [userId, email.split('@')[0], email, hashedPassword, role]
        );

        const token = jwt.sign(
          { id: userId, email, role },
          process.env.JWT_SECRET || 'your_jwt_secret_key',
          { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        return res.json({
          success: true,
          message: 'Login successful',
          data: {
            user: { id: userId, name: email.split('@')[0], email, role },
            token,
          },
        });
      }

      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
          token,
        },
      });
    } finally {
      await connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const connection = await pool.getConnection();

    try {
      const [rows]: any = await connection.execute(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [req.user?.id]
      );

      if (!rows.length) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({
        success: true,
        data: rows[0],
      });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

export default router;
