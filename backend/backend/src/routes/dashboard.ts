import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get dashboard statistics
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      // Get total intake
      const [intakeResult]: any = await connection.execute(
        'SELECT SUM(totalIntake) as total FROM programs'
      );
      const totalIntake = intakeResult[0].total || 0;

      // Get total admitted (confirmed)
      const [admittedResult]: any = await connection.execute(
        'SELECT COUNT(*) as count FROM applicants WHERE applicationStatus = "Confirmed"'
      );
      const totalAdmitted = admittedResult[0].count || 0;

      // Get total allocated
      const [allocatedResult]: any = await connection.execute(
        'SELECT COUNT(*) as count FROM seat_allocations WHERE isConfirmed = false'
      );
      const totalAllocated = allocatedResult[0].count || 0;

      // Get total pending
      const [pendingResult]: any = await connection.execute(
        'SELECT COUNT(*) as count FROM applicants WHERE applicationStatus = "Submitted"'
      );
      const totalPending = pendingResult[0].count || 0;

      // Get quota-wise statistics
      const [quotaStats]: any = await connection.execute(
        `SELECT q.quotaType, q.seats as total, q.filledSeats as filled, (q.seats - q.filledSeats) as remaining
         FROM quotas q
         GROUP BY q.quotaType`
      );

      // Get pending documents
      const [pendingDocsResult]: any = await connection.execute(
        'SELECT COUNT(*) as count FROM applicants WHERE documentStatus != "Verified"'
      );
      const pendingDocuments = pendingDocsResult[0].count || 0;

      // Get pending fees
      const [pendingFeesResult]: any = await connection.execute(
        'SELECT COUNT(*) as count FROM applicants WHERE feeStatus = "Pending"'
      );
      const pendingFees = pendingFeesResult[0].count || 0;

      // Get applicants by status
      const [statusResult]: any = await connection.execute(
        `SELECT applicationStatus as status, COUNT(*) as count 
         FROM applicants 
         GROUP BY applicationStatus`
      );

      res.json({
        success: true,
        data: {
          totalIntake,
          totalAdmitted,
          totalAllocated,
          totalPending,
          quotaWiseStats: quotaStats,
          pendingDocuments,
          pendingFees,
          applicantsByStatus: statusResult,
        },
      });
    } finally {
      await connection.release();
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics' });
  }
});

// Get program-specific dashboard
router.get('/program/:programId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      // Get program intake
      const [programResult]: any = await connection.execute(
        'SELECT totalIntake FROM programs WHERE id = ?',
        [req.params.programId]
      );

      if (!programResult.length) {
        return res.status(404).json({ success: false, message: 'Program not found' });
      }

      const totalIntake = programResult[0].totalIntake;

      // Get quota-wise stats for this program
      const [quotaStats]: any = await connection.execute(
        `SELECT quotaType, seats as total, filledSeats as filled, (seats - filledSeats) as remaining
         FROM quotas 
         WHERE programId = ?`,
        [req.params.programId]
      );

      // Get applicants for this program
      const [applicantsResult]: any = await connection.execute(
        'SELECT COUNT(*) as count FROM applicants WHERE programId = ? AND applicationStatus = "Confirmed"',
        [req.params.programId]
      );
      const totalAdmitted = applicantsResult[0].count || 0;

      // Get allocated
      const [allocatedResult]: any = await connection.execute(
        `SELECT COUNT(*) as count FROM seat_allocations 
         WHERE programId = ? AND isConfirmed = false`,
        [req.params.programId]
      );
      const totalAllocated = allocatedResult[0].count || 0;

      res.json({
        success: true,
        data: {
          totalIntake,
          totalAdmitted,
          totalAllocated,
          quotaWiseStats: quotaStats,
        },
      });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch program dashboard' });
  }
});

export default router;
