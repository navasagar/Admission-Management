import mysql from 'mysql2/promise';
import { createPool } from 'mysql2/promise';

export const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'admission_management',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

// Test database connection
export async function testConnection(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Database connected successfully');
    await connection.release();
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
  const connection = await pool.getConnection();

  try {
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'admission_officer', 'management') NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Institutions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS institutions (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        address VARCHAR(500),
        phone VARCHAR(20),
        email VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Campuses table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS campuses (
        id VARCHAR(36) PRIMARY KEY,
        institutionId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        location VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (institutionId) REFERENCES institutions(id) ON DELETE CASCADE,
        UNIQUE KEY unique_campus (institutionId, code)
      )
    `);

    // Departments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(36) PRIMARY KEY,
        campusId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (campusId) REFERENCES campuses(id) ON DELETE CASCADE,
        UNIQUE KEY unique_dept (campusId, code)
      )
    `);

    // Academic Years table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS academic_years (
        id VARCHAR(36) PRIMARY KEY,
        year VARCHAR(20) NOT NULL UNIQUE,
        startDate DATE NOT NULL,
        endDate DATE NOT NULL,
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Programs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS programs (
        id VARCHAR(36) PRIMARY KEY,
        departmentId VARCHAR(36) NOT NULL,
        academicYearId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        courseType ENUM('UG', 'PG') NOT NULL,
        duration INT NOT NULL,
        totalIntake INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE CASCADE,
        FOREIGN KEY (academicYearId) REFERENCES academic_years(id) ON DELETE CASCADE
      )
    `);

    // Quotas table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quotas (
        id VARCHAR(36) PRIMARY KEY,
        programId VARCHAR(36) NOT NULL,
        quotaType ENUM('KCET', 'COMEDK', 'Management') NOT NULL,
        seats INT NOT NULL,
        filledSeats INT DEFAULT 0,
        isSupernumerary BOOLEAN DEFAULT false,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (programId) REFERENCES programs(id) ON DELETE CASCADE,
        UNIQUE KEY unique_quota (programId, quotaType)
      )
    `);

    // Applicants table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS applicants (
        id VARCHAR(36) PRIMARY KEY,
        applicationNumber VARCHAR(50) NOT NULL UNIQUE,
        programId VARCHAR(36) NOT NULL,
        academicYearId VARCHAR(36) NOT NULL,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        dateOfBirth DATE NOT NULL,
        gender ENUM('Male', 'Female', 'Other') NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        category ENUM('GM', 'SC', 'ST', 'OBC', '2A', '2B', '3A', '3B') NOT NULL,
        entryType ENUM('Regular', 'Lateral') NOT NULL,
        admissionMode ENUM('Government', 'Management') NOT NULL,
        quotaType ENUM('KCET', 'COMEDK', 'Management') NOT NULL,
        qualifyingExam VARCHAR(100),
        marks DECIMAL(5,2),
        rank VARCHAR(50),
        allotmentNumber VARCHAR(50),
        address VARCHAR(500),
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(10),
        applicationStatus ENUM('Draft', 'Submitted', 'Allocated', 'Confirmed', 'Rejected') DEFAULT 'Draft',
        documentStatus ENUM('Pending', 'Submitted', 'Verified') DEFAULT 'Pending',
        feeStatus ENUM('Pending', 'Paid') DEFAULT 'Pending',
        admissionNumber VARCHAR(100) UNIQUE,
        admissionDate DATETIME,
        allocatedSeatId VARCHAR(36),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (programId) REFERENCES programs(id),
        FOREIGN KEY (academicYearId) REFERENCES academic_years(id)
      )
    `);

    // Seat Allocations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS seat_allocations (
        id VARCHAR(36) PRIMARY KEY,
        applicantId VARCHAR(36) NOT NULL UNIQUE,
        programId VARCHAR(36) NOT NULL,
        quotaId VARCHAR(36) NOT NULL,
        allocationDate DATETIME NOT NULL,
        isConfirmed BOOLEAN DEFAULT false,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (applicantId) REFERENCES applicants(id) ON DELETE CASCADE,
        FOREIGN KEY (programId) REFERENCES programs(id),
        FOREIGN KEY (quotaId) REFERENCES quotas(id)
      )
    `);

    // Documents table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(36) PRIMARY KEY,
        applicantId VARCHAR(36) NOT NULL,
        documentType VARCHAR(100) NOT NULL,
        status ENUM('Pending', 'Submitted', 'Verified') DEFAULT 'Pending',
        uploadedAt DATETIME,
        verifiedAt DATETIME,
        verifiedBy VARCHAR(36),
        remarks VARCHAR(500),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (applicantId) REFERENCES applicants(id) ON DELETE CASCADE,
        UNIQUE KEY unique_document (applicantId, documentType)
      )
    `);

    console.log('✓ Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await connection.release();
  }
}
