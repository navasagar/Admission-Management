import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { generateId } from '../utils/admissionNumberGenerator';
import type { Institution, ApiResponse } from '../types';

const router = Router();

// Get all institutions
router.get('/', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();

    try {
      const [institutions]: any = await connection.execute(
        'SELECT * FROM institutions ORDER BY createdAt DESC'
      );

      res.json({
        success: true,
        data: institutions,
      });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch institutions' });
  }
});

// Get single institution
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();

    try {
      const [institutions]: any = await connection.execute(
        'SELECT * FROM institutions WHERE id = ?',
        [req.params.id]
      );

      if (!institutions.length) {
        return res.status(404).json({ success: false, message: 'Institution not found' });
      }

      res.json({
        success: true,
        data: institutions[0],
      });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch institution' });
  }
});

// Create institution
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, code, address, phone, email } = req.body;

      if (!name || !code) {
        return res.status(400).json({
          success: false,
          message: 'Name and code are required',
        });
      }

      const id = generateId();
      const connection = await pool.getConnection();

      try {
        await connection.execute(
          `INSERT INTO institutions (id, name, code, address, phone, email) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, name, code, address, phone, email]
        );

        res.status(201).json({
          success: true,
          message: 'Institution created successfully',
          data: { id, name, code, address, phone, email },
        });
      } finally {
        await connection.release();
      }
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Institution code already exists',
        });
      }
      res.status(500).json({ success: false, message: 'Failed to create institution' });
    }
  }
);

// Update institution
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, code, address, phone, email } = req.body;
      const connection = await pool.getConnection();

      try {
        const [result]: any = await connection.execute(
          `UPDATE institutions SET name=?, code=?, address=?, phone=?, email=? 
           WHERE id=?`,
          [name, code, address, phone, email, req.params.id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Institution not found' });
        }

        res.json({
          success: true,
          message: 'Institution updated successfully',
        });
      } finally {
        await connection.release();
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update institution' });
    }
  }
);

// Delete institution
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const connection = await pool.getConnection();

      try {
        const [result]: any = await connection.execute(
          'DELETE FROM institutions WHERE id = ?',
          [req.params.id]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Institution not found' });
        }

        res.json({
          success: true,
          message: 'Institution deleted successfully',
        });
      } finally {
        await connection.release();
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete institution' });
    }
  }
);

export default router;
