import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { generateId } from '../utils/admissionNumberGenerator';

const router = Router();

// Get all academic years
router.get('/', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [years]: any = await connection.execute(
        'SELECT * FROM academic_years ORDER BY year DESC'
      );
      res.json({ success: true, data: years });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch academic years' });
  }
});

// Get active academic year
router.get('/active', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [years]: any = await connection.execute(
        'SELECT * FROM academic_years WHERE isActive = true LIMIT 1'
      );
      if (!years.length) {
        return res.status(404).json({ success: false, message: 'No active academic year' });
      }
      res.json({ success: true, data: years[0] });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch academic year' });
  }
});

// Create academic year
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { year, startDate, endDate, isActive } = req.body;
      if (!year || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Year, startDate, and endDate are required',
        });
      }

      const id = generateId();
      const connection = await pool.getConnection();
      try {
        // If this is active, deactivate others
        if (isActive) {
          await connection.execute(
            'UPDATE academic_years SET isActive = false'
          );
        }

        await connection.execute(
          'INSERT INTO academic_years (id, year, startDate, endDate, isActive) VALUES (?, ?, ?, ?, ?)',
          [id, year, startDate, endDate, isActive || false]
        );
        res.status(201).json({
          success: true,
          message: 'Academic year created successfully',
          data: { id, year, startDate, endDate, isActive },
        });
      } finally {
        await connection.release();
      }
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Academic year already exists',
        });
      }
      res.status(500).json({ success: false, message: 'Failed to create academic year' });
    }
  }
);

// Update academic year
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { year, startDate, endDate, isActive } = req.body;
      const connection = await pool.getConnection();
      try {
        // If this is active, deactivate others
        if (isActive) {
          await connection.execute(
            'UPDATE academic_years SET isActive = false WHERE id != ?',
            [req.params.id]
          );
        }

        const [result]: any = await connection.execute(
          'UPDATE academic_years SET year=?, startDate=?, endDate=?, isActive=? WHERE id=?',
          [year, startDate, endDate, isActive, req.params.id]
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Academic year not found' });
        }
        res.json({ success: true, message: 'Academic year updated successfully' });
      } finally {
        await connection.release();
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update academic year' });
    }
  }
);

export default router;
