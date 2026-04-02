import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { generateId } from '../utils/admissionNumberGenerator';

const router = Router();

// Get all quotas
router.get('/', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [quotas]: any = await connection.execute(
        'SELECT * FROM quotas ORDER BY createdAt DESC'
      );
      res.json({ success: true, data: quotas });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch quotas' });
  }
});

// Get quotas by program
router.get('/program/:programId', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [quotas]: any = await connection.execute(
        'SELECT * FROM quotas WHERE programId = ? ORDER BY quotaType',
        [req.params.programId]
      );
      res.json({ success: true, data: quotas });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch quotas' });
  }
});

// Create quota
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { programId, quotaType, seats, isSupernumerary } = req.body;
      if (!programId || !quotaType || !seats) {
        return res.status(400).json({
          success: false,
          message: 'Program ID, quota type, and seats are required',
        });
      }

      const connection = await pool.getConnection();
      try {
        // Get program details
        const [programs]: any = await connection.execute(
          'SELECT totalIntake FROM programs WHERE id = ?',
          [programId]
        );

        if (!programs.length) {
          return res.status(404).json({ success: false, message: 'Program not found' });
        }

        const program = programs[0];

        // Check if total seats (including new quota) don't exceed intake
        if (!isSupernumerary) {
          const [quotas]: any = await connection.execute(
            'SELECT SUM(seats) as totalSeats FROM quotas WHERE programId = ? AND isSupernumerary = false',
            [programId]
          );

          const existingSeats = quotas[0].totalSeats || 0;
          if (existingSeats + seats > program.totalIntake) {
            return res.status(400).json({
              success: false,
              message: `Total quota seats cannot exceed program intake (${program.totalIntake})`,
            });
          }
        }

        const id = generateId();
        await connection.execute(
          'INSERT INTO quotas (id, programId, quotaType, seats, filledSeats, isSupernumerary) VALUES (?, ?, ?, ?, ?, ?)',
          [id, programId, quotaType, seats, 0, isSupernumerary || false]
        );

        res.status(201).json({
          success: true,
          message: 'Quota created successfully',
          data: { id, programId, quotaType, seats, filledSeats: 0, isSupernumerary },
        });
      } finally {
        await connection.release();
      }
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Quota already exists for this program',
        });
      }
      res.status(500).json({ success: false, message: 'Failed to create quota' });
    }
  }
);

// Update quota
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { seats } = req.body;
      const connection = await pool.getConnection();
      try {
        const [result]: any = await connection.execute(
          'UPDATE quotas SET seats=? WHERE id=?',
          [seats, req.params.id]
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Quota not found' });
        }
        res.json({ success: true, message: 'Quota updated successfully' });
      } finally {
        await connection.release();
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update quota' });
    }
  }
);

export default router;
