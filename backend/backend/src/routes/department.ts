import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { generateId } from '../utils/admissionNumberGenerator';

const router = Router();

// Get all departments
router.get('/', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [departments]: any = await connection.execute(
        'SELECT * FROM departments ORDER BY createdAt DESC'
      );
      res.json({ success: true, data: departments });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch departments' });
  }
});

// Get departments by campus
router.get('/campus/:campusId', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [departments]: any = await connection.execute(
        'SELECT * FROM departments WHERE campusId = ? ORDER BY createdAt DESC',
        [req.params.campusId]
      );
      res.json({ success: true, data: departments });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch departments' });
  }
});

// Create department
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { campusId, name, code } = req.body;
      if (!campusId || !name || !code) {
        return res.status(400).json({
          success: false,
          message: 'Campus ID, name, and code are required',
        });
      }

      const id = generateId();
      const connection = await pool.getConnection();
      try {
        await connection.execute(
          'INSERT INTO departments (id, campusId, name, code) VALUES (?, ?, ?, ?)',
          [id, campusId, name, code]
        );
        res.status(201).json({
          success: true,
          message: 'Department created successfully',
          data: { id, campusId, name, code },
        });
      } finally {
        await connection.release();
      }
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Department code already exists for this campus',
        });
      }
      res.status(500).json({ success: false, message: 'Failed to create department' });
    }
  }
);

// Update department
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, code } = req.body;
      const connection = await pool.getConnection();
      try {
        const [result]: any = await connection.execute(
          'UPDATE departments SET name=?, code=? WHERE id=?',
          [name, code, req.params.id]
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.json({ success: true, message: 'Department updated successfully' });
      } finally {
        await connection.release();
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update department' });
    }
  }
);

// Delete department
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const connection = await pool.getConnection();
      try {
        const [result]: any = await connection.execute(
          'DELETE FROM departments WHERE id = ?',
          [req.params.id]
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.json({ success: true, message: 'Department deleted successfully' });
      } finally {
        await connection.release();
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete department' });
    }
  }
);

export default router;
