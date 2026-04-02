import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth';
import { generateId, generateApplicationNumber, validateEmail, validatePhone, validatePincode } from '../utils/admissionNumberGenerator';

const router = Router();

// Get all applicants
router.get('/', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [applicants]: any = await connection.execute(
        'SELECT * FROM applicants ORDER BY createdAt DESC'
      );
      res.json({ success: true, data: applicants });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch applicants' });
  }
});

// Get applicants by program
router.get('/program/:programId', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [applicants]: any = await connection.execute(
        'SELECT * FROM applicants WHERE programId = ? ORDER BY createdAt DESC',
        [req.params.programId]
      );
      res.json({ success: true, data: applicants });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch applicants' });
  }
});

// Get single applicant
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [applicants]: any = await connection.execute(
        'SELECT * FROM applicants WHERE id = ?',
        [req.params.id]
      );
      if (!applicants.length) {
        return res.status(404).json({ success: false, message: 'Applicant not found' });
      }

      // Get documents
      const [documents]: any = await connection.execute(
        'SELECT * FROM documents WHERE applicantId = ?',
        [req.params.id]
      );

      res.json({
        success: true,
        data: { ...applicants[0], documents },
      });
    } finally {
      await connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch applicant' });
  }
});

// Create applicant
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin', 'admission_officer']),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        programId,
        academicYearId,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        email,
        phone,
        category,
        entryType,
        admissionMode,
        quotaType,
        qualifyingExam,
        marks,
        rank,
        allotmentNumber,
        address,
        city,
        state,
        pincode,
      } = req.body;

      // Validation
      if (
        !programId ||
        !academicYearId ||
        !firstName ||
        !lastName ||
        !dateOfBirth ||
        !gender ||
        !email ||
        !phone ||
        !category ||
        !entryType ||
        !admissionMode ||
        !quotaType
      ) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be provided',
        });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }

      if (!validatePhone(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number (must be 10 digits)',
        });
      }

      if (!validatePincode(pincode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pincode (must be 6 digits)',
        });
      }

      const connection = await pool.getConnection();
      try {
        // Get latest application number
        const [countResult]: any = await connection.execute(
          'SELECT COUNT(*) as count FROM applicants'
        );
        const applicationNumber = generateApplicationNumber(countResult[0].count + 1);

        const id = generateId();
        const now = new Date().toISOString();

        await connection.execute(
          `INSERT INTO applicants (
            id, applicationNumber, programId, academicYearId, firstName, lastName, 
            dateOfBirth, gender, email, phone, category, entryType, admissionMode, 
            quotaType, qualifyingExam, marks, rank, allotmentNumber, address, city, 
            state, pincode, applicationStatus, documentStatus, feeStatus, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            applicationNumber,
            programId,
            academicYearId,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            email,
            phone,
            category,
            entryType,
            admissionMode,
            quotaType,
            qualifyingExam,
            marks,
            rank || null,
            allotmentNumber || null,
            address,
            city,
            state,
            pincode,
            'Submitted',
            'Pending',
            'Pending',
            now,
            now,
          ]
        );

        // Create default documents
        const documentTypes = [
          '10th Certificate',
          '12th Certificate',
          'Qualifying Exam Result',
          'Address Proof',
          'Category Certificate',
        ];

        for (const docType of documentTypes) {
          const docId = generateId();
          await connection.execute(
            'INSERT INTO documents (id, applicantId, documentType, status) VALUES (?, ?, ?, ?)',
            [docId, id, docType, 'Pending']
          );
        }

        res.status(201).json({
          success: true,
          message: 'Applicant created successfully',
          data: {
            id,
            applicationNumber,
            programId,
            academicYearId,
            firstName,
            lastName,
            email,
            applicationStatus: 'Submitted',
          },
        });
      } finally {
        await connection.release();
      }
    } catch (error: any) {
      console.error('Error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }
      res.status(500).json({ success: false, message: 'Failed to create applicant' });
    }
  }
);

// Update applicant
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin', 'admission_officer']),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        email,
        phone,
        category,
        entryType,
        admissionMode,
        quotaType,
        qualifyingExam,
        marks,
        rank,
        allotmentNumber,
        address,
        city,
        state,
        pincode,
        applicationStatus,
        documentStatus,
        feeStatus,
      } = req.body;

      const connection = await pool.getConnection();
      try {
        const [result]: any = await connection.execute(
          `UPDATE applicants SET 
            firstName=?, lastName=?, dateOfBirth=?, gender=?, email=?, phone=?, 
            category=?, entryType=?, admissionMode=?, quotaType=?, qualifyingExam=?, 
            marks=?, rank=?, allotmentNumber=?, address=?, city=?, state=?, pincode=?, 
            applicationStatus=?, documentStatus=?, feeStatus=?, updatedAt=? 
          WHERE id=?`,
          [
            firstName,
            lastName,
            dateOfBirth,
            gender,
            email,
            phone,
            category,
            entryType,
            admissionMode,
            quotaType,
            qualifyingExam,
            marks,
            rank || null,
            allotmentNumber || null,
            address,
            city,
            state,
            pincode,
            applicationStatus,
            documentStatus,
            feeStatus,
            new Date().toISOString(),
            req.params.id,
          ]
        );

        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Applicant not found' });
        }

        res.json({ success: true, message: 'Applicant updated successfully' });
      } finally {
        await connection.release();
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update applicant' });
    }
  }
);

export default router;
