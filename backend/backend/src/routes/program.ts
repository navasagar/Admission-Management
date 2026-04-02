import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { generateId } from '../utils/admissionNumberGenerator';

const router = Router();

// Get all programs
router.get('/', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [programs]: any = await connection.execute(
        'SELECT * FROM programs ORDER BY createdAt DESC'
      );
      res.json({ success: true, data: programs });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch programs' });
  }
});

// Get programs by department
router.get('/department/:departmentId', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [programs]: any = await connection.execute(
        'SELECT * FROM programs WHERE departmentId = ? ORDER BY createdAt DESC',
        [req.params.departmentId]
      );
      res.json({ success: true, data: programs });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch programs' });
  }
});

// Get program with quotas
router.get('/:id/quotas', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [programs]: any = await connection.execute(
        'SELECT * FROM programs WHERE id = ?',
        [req.params.id]
      );
      if (!programs.length) {
        return res.status(404).json({ success: false, message: 'Program not found' });
      }

      const [quotas]: any = await connection.execute(
        'SELECT * FROM quotas WHERE programId = ?',
        [req.params.id]
      );

      res.json({
        success: true,
        data: { ...programs[0], quotas },
      });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch program' });
  }
});

// Create program
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { departmentId, academicYearId, name, code, courseType, duration, totalIntake } =
        req.body;
      if (!departmentId || !academicYearId || !name || !code || !courseType || !totalIntake) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      const id = generateId();
      const connection = await pool.getConnection();
      try {
        await connection.execute(
          `INSERT INTO programs (id, departmentId, academicYearId, name, code, courseType, duration, totalIntake) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, departmentId, academicYearId, name, code, courseType, duration || 4, totalIntake]
        );
        res.status(201).json({
          success: true,
          message: 'Program created successfully',
          data: {
            id,
            departmentId,
            academicYearId,
            name,
            code,
            courseType,
            duration,
            totalIntake,
          },
        });
      } finally {
        await connection.release();
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to create program' });
    }
  }
);

// Update program
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, code, courseType, duration, totalIntake } = req.body;
      const connection = await pool.getConnection();
      try {
        const [result]: any = await connection.execute(
          `UPDATE programs SET name=?, code=?, courseType=?, duration=?, totalIntake=? WHERE id=?`,
          [name, code, courseType, duration, totalIntake, req.params.id]
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Program not found' });
        }
        res.json({ success: true, message: 'Program updated successfully' });
      } finally {
        await connection.release();
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update program' });
    }
  }
);

export default router;
