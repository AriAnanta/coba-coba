-- =====================================================
-- USER SERVICE DATABASE
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS user_service_db;
USE user_service_db;

-- Drop existing tables
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('admin', 'manager', 'operator', 'customer', 'supervisor') NOT NULL DEFAULT 'operator',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Insert dummy data
INSERT INTO users (username, email, password_hash, full_name, role, is_active, last_login)
VALUES 
('admin_john', 'john.admin@example.com', '$2y$10$EXAMPLEHASH12345678a', 'John Admin', 'admin', TRUE, '2025-06-01 08:45:00'),
('manager_sara', 'sara.manager@example.com', '$2y$10$EXAMPLEHASH12345678a', 'Sara Manager', 'manager', TRUE, '2025-06-03 09:20:00'),
('operator_budi', 'budi.operator@example.com', '$2y$10$EXAMPLEHASH12345678a', 'Budi Operator', 'operator', TRUE, '2025-06-04 14:10:00'),
('customer_lisa', 'lisa.customer@example.com', '$2y$10$EXAMPLEHASH12345678a', 'Lisa Customer', 'customer', TRUE, NULL),
('supervisor_dian', 'dian.supervisor@example.com', '$2y$10$EXAMPLEHASH12345678a', 'Dian Supervisor', 'supervisor', TRUE, '2025-05-30 10:00:00'),
('operator_wati', 'wati.operator@example.com', '$2y$10$EXAMPLEHASH12345678a', 'Wati Operator', 'operator', FALSE, NULL),
('manager_andre', 'andre.manager@example.com', '$2y$10$EXAMPLEHASH12345678a', 'Andre Manager', 'manager', TRUE, '2025-06-02 13:30:00'),
('customer_roni', 'roni.customer@example.com', '$2y$10$EXAMPLEHASH12345678a', 'Roni Customer', 'customer', TRUE, NULL),
('admin_nina', 'nina.admin@example.com', '$2y$10$EXAMPLEHASH12345678a', 'Nina Admin', 'admin', FALSE, '2025-05-28 07:55:00'),
('supervisor_tono', 'tono.supervisor@example.com', '$2y$10$EXAMPLEHASH12345678a', 'Tono Supervisor', 'supervisor', TRUE, '2025-06-01 11:15:00');

