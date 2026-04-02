import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { generateId, generateAdmissionNumber } from '../utils/admissionNumberGenerator';

const router = Router();

// Get all seat allocations
router.get('/', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [allocations]: any = await connection.execute(
        'SELECT * FROM seat_allocations ORDER BY allocationDate DESC'
      );
      res.json({ success: true, data: allocations });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch seat allocations' });
  }
});

// Get allocations by program
router.get('/program/:programId', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [allocations]: any = await connection.execute(
        `SELECT sa.*, a.firstName, a.lastName, a.applicationNumber, q.quotaType 
         FROM seat_allocations sa
         JOIN applicants a ON sa.applicantId = a.id
         JOIN quotas q ON sa.quotaId = q.id
         WHERE sa.programId = ? ORDER BY sa.allocationDate DESC`,
        [req.params.programId]
      );
      res.json({ success: true, data: allocations });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch allocations' });
  }
});

// Allocate seat
router.post(
  '/allocate',
  authMiddleware,
  roleMiddleware(['admin', 'admission_officer']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { applicantId, programId, quotaType } = req.body;

      if (!applicantId || !programId || !quotaType) {
        return res.status(400).json({
          success: false,
          message: 'Applicant ID, program ID, and quota type are required',
        });
      }

      const connection = await pool.getConnection();
      try {
        // Get applicant
        const [applicants]: any = await connection.execute(
          'SELECT * FROM applicants WHERE id = ?',
          [applicantId]
        );

        if (!applicants.length) {
          return res.status(404).json({ success: false, message: 'Applicant not found' });
        }

        const applicant = applicants[0];

        // Check if already allocated
        const [existing]: any = await connection.execute(
          'SELECT id FROM seat_allocations WHERE applicantId = ?',
          [applicantId]
        );

        if (existing.length) {
          return res.status(400).json({
            success: false,
            message: 'Applicant already has a seat allocation',
          });
        }

        // Get quota
        const [quotas]: any = await connection.execute(
          'SELECT * FROM quotas WHERE programId = ? AND quotaType = ?',
          [programId, quotaType]
        );

        if (!quotas.length) {
          return res.status(404).json({ success: false, message: 'Quota not found' });
        }

        const quota = quotas[0];

        // Check if seats available
        if (quota.filledSeats >= quota.seats) {
          return res.status(400).json({
            success: false,
            message: 'No seats available in this quota',
          });
        }

        // Allocate seat
        const allocationId = generateId();
        const now = new Date();

        await connection.execute(
          `INSERT INTO seat_allocations (id, applicantId, programId, quotaId, allocationDate, isConfirmed) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [allocationId, applicantId, programId, quota.id, now, false]
        );

        // Update quota filled seats
        await connection.execute(
          'UPDATE quotas SET filledSeats = filledSeats + 1 WHERE id = ?',
          [quota.id]
        );

        // Update applicant status
        await connection.execute(
          `UPDATE applicants SET applicationStatus = 'Allocated', updatedAt = ? WHERE id = ?`,
          [now, applicantId]
        );

        res.status(201).json({
          success: true,
          message: 'Seat allocated successfully',
          data: {
            id: allocationId,
            applicantId,
            programId,
            quotaId: quota.id,
            quotaType,
            allocationDate: now,
          },
        });
      } finally {
        await connection.release();
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Failed to allocate seat' });
    }
  }
);

// Confirm admission
router.post(
  '/:allocationId/confirm',
  authMiddleware,
  roleMiddleware(['admin', 'admission_officer']),
  async (req: AuthRequest, res: Response) => {
    try {
      const connection = await pool.getConnection();

      try {
        // Get allocation
        const [allocations]: any = await connection.execute(
          'SELECT * FROM seat_allocations WHERE id = ?',
          [req.params.allocationId]
        );

        if (!allocations.length) {
          return res.status(404).json({ success: false, message: 'Allocation not found' });
        }

        const allocation = allocations[0];

        // Get applicant
        const [applicants]: any = await connection.execute(
          'SELECT * FROM applicants WHERE id = ?',
          [allocation.applicantId]
        );

        const applicant = applicants[0];

        // Check conditions
        if (applicant.documentStatus !== 'Verified') {
          return res.status(400).json({
            success: false,
            message: 'All documents must be verified before admission confirmation',
          });
        }

        if (applicant.feeStatus !== 'Paid') {
          return res.status(400).json({
            success: false,
            message: 'Fee must be paid before admission confirmation',
          });
        }

        // Get institution code and academic year for admission number
        const [programs]: any = await connection.execute(
          'SELECT courseType FROM programs WHERE id = ?',
          [allocation.programId]
        );

        const [departments]: any = await connection.execute(
          'SELECT code FROM departments WHERE id = (SELECT departmentId FROM programs WHERE id = ?)',
          [allocation.programId]
        );

        const [institutions]: any = await connection.execute(
          'SELECT code FROM institutions WHERE id = (SELECT institutionId FROM campuses WHERE id = (SELECT campusId FROM departments WHERE id = (SELECT departmentId FROM programs WHERE id = ?)))',
          [allocation.programId]
        );

        const [years]: any = await connection.execute(
          'SELECT year FROM academic_years WHERE id = ?',
          [applicant.academicYearId]
        );

        const instCode = institutions[0].code;
        const courseType = programs[0].courseType;
        const deptCode = departments[0].code;
        const year = years[0].year;

        // Get next sequence
        const [seqResult]: any = await connection.execute(
          `SELECT COUNT(*) as count FROM applicants 
           WHERE admissionNumber IS NOT NULL AND applicationStatus = 'Confirmed'`
        );
        const sequence = (seqResult[0].count || 0) + 1;

        const admissionNumber = generateAdmissionNumber(
          instCode,
          year,
          courseType,
          deptCode,
          applicant.quotaType,
          sequence
        );

        // Update applicant
        const now = new Date();
        await connection.execute(
          `UPDATE applicants 
           SET applicationStatus = 'Confirmed', admissionNumber = ?, admissionDate = ?, updatedAt = ? 
           WHERE id = ?`,
          [admissionNumber, now, now, allocation.applicantId]
        );

        // Update allocation
        await connection.execute(
          'UPDATE seat_allocations SET isConfirmed = true, updatedAt = ? WHERE id = ?',
          [now, req.params.allocationId]
        );

        res.json({
          success: true,
          message: 'Admission confirmed successfully',
          data: {
            applicantId: allocation.applicantId,
            admissionNumber,
            admissionDate: now,
          },
        });
      } finally {
        await connection.release();
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Failed to confirm admission' });
    }
  }
);

export default router;
