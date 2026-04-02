import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { generateId } from '../utils/admissionNumberGenerator';

const router = Router();

// Get all campuses
router.get('/', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [campuses]: any = await connection.execute(
        'SELECT * FROM campuses ORDER BY createdAt DESC'
      );
      res.json({ success: true, data: campuses });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch campuses' });
  }
});

// Get campuses by institution
router.get('/institution/:institutionId', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [campuses]: any = await connection.execute(
        'SELECT * FROM campuses WHERE institutionId = ? ORDER BY createdAt DESC',
        [req.params.institutionId]
      );
      res.json({ success: true, data: campuses });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch campuses' });
  }
});

// Get single campus
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [campuses]: any = await connection.execute(
        'SELECT * FROM campuses WHERE id = ?',
        [req.params.id]
      );
      if (!campuses.length) {
        return res.status(404).json({ success: false, message: 'Campus not found' });
      }
      res.json({ success: true, data: campuses[0] });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch campus' });
  }
});

// Create campus
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { institutionId, name, code, location } = req.body;
      if (!institutionId || !name || !code) {
        return res.status(400).json({
          success: false,
          message: 'Institution ID, name, and code are required',
        });
      }

      const id = generateId();
      const connection = await pool.getConnection();
      try {
        await connection.execute(
          'INSERT INTO campuses (id, institutionId, name, code, location) VALUES (?, ?, ?, ?, ?)',
          [id, institutionId, name, code, location]
        );
        res.status(201).json({
          success: true,
          message: 'Campus created successfully',
          data: { id, institutionId, name, code, location },
        });
      } finally {
        await connection.release();
      }
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Campus code already exists for this institution',
        });
      }
      res.status(500).json({ success: false, message: 'Failed to create campus' });
    }
  }
);

// Update campus
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, code, location } = req.body;
      const connection = await pool.getConnection();
      try {
        const [result]: any = await connection.execute(
          'UPDATE campuses SET name=?, code=?, location=? WHERE id=?',
          [name, code, location, req.params.id]
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Campus not found' });
        }
        res.json({ success: true, message: 'Campus updated successfully' });
      } finally {
        await connection.release();
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update campus' });
    }
  }
);

// Delete campus
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const connection = await pool.getConnection();
      try {
        const [result]: any = await connection.execute(
          'DELETE FROM campuses WHERE id = ?',
          [req.params.id]
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Campus not found' });
        }
        res.json({ success: true, message: 'Campus deleted successfully' });
      } finally {
        await connection.release();
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete campus' });
    }
  }
);

export default router;
