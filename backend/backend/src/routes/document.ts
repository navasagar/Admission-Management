import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get documents for applicant
router.get('/applicant/:applicantId', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [documents]: any = await connection.execute(
        'SELECT * FROM documents WHERE applicantId = ? ORDER BY documentType',
        [req.params.applicantId]
      );
      res.json({ success: true, data: documents });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
});

// Update document status
router.put(
  '/:applicantId/:documentType',
  authMiddleware,
  roleMiddleware(['admin', 'admission_officer']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { status, remarks } = req.body;
      const { applicantId, documentType } = req.params;

      if (!status || !['Pending', 'Submitted', 'Verified'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid document status',
        });
      }

      const connection = await pool.getConnection();
      try {
        const [result]: any = await connection.execute(
          `UPDATE documents SET status = ?, remarks = ?, verifiedAt = ?, verifiedBy = ?, updatedAt = ? 
           WHERE applicantId = ? AND documentType = ?`,
          [
            status,
            remarks || null,
            status === 'Verified' ? new Date() : null,
            status === 'Verified' ? req.user?.id : null,
            new Date(),
            applicantId,
            documentType,
          ]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Update applicant document status if all verified
        const [docs]: any = await connection.execute(
          'SELECT COUNT(*) as total, SUM(CASE WHEN status = "Verified" THEN 1 ELSE 0 END) as verified FROM documents WHERE applicantId = ?',
          [applicantId]
        );

        let docStatus = 'Pending';
        if (docs[0].verified === docs[0].total) {
          docStatus = 'Verified';
        } else if (docs[0].verified > 0) {
          docStatus = 'Submitted';
        }

        await connection.execute(
          'UPDATE applicants SET documentStatus = ?, updatedAt = ? WHERE id = ?',
          [docStatus, new Date(), applicantId]
        );

        res.json({
          success: true,
          message: 'Document status updated successfully',
        });
      } finally {
        await connection.release();
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update document' });
    }
  }
);

// Mark fee as paid
router.post(
  '/fee/:applicantId',
  authMiddleware,
  roleMiddleware(['admin', 'admission_officer']),
  async (req: AuthRequest, res: Response) => {
    try {
      const connection = await pool.getConnection();
      try {
        const [result]: any = await connection.execute(
          'UPDATE applicants SET feeStatus = "Paid", updatedAt = ? WHERE id = ?',
          [new Date(), req.params.applicantId]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Applicant not found' });
        }

        res.json({
          success: true,
          message: 'Fee marked as paid',
        });
      } finally {
        await connection.release();
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update fee status' });
    }
  }
);

export default router;
