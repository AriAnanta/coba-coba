-- =====================================================
-- PRODUCTION PLANNING SERVICE DATABASE
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS production_planning_db;
USE production_planning_db;

-- Drop existing table
DROP TABLE IF EXISTS production_plans;

-- Production plans table
CREATE TABLE production_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id VARCHAR(50) UNIQUE NOT NULL,
    request_id INT,
    production_request_id VARCHAR(50),
    product_name VARCHAR(100) NOT NULL,
    planned_start_date DATE,
    planned_end_date DATE,
    priority ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
    status ENUM('draft', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'draft',
    planning_notes TEXT,
    planned_batches INT DEFAULT 1,
    batch_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_plan_id (plan_id),
    INDEX idx_status (status),
    INDEX idx_request (request_id)
);

-- Insert dummy production plans
INSERT INTO production_plans (plan_id, request_id, production_request_id, product_name, planned_start_date, planned_end_date, priority, status, planning_notes, planned_batches, batch_id) VALUES
('PLAN-001', 1, 'REQ-2024-001', 'Bracket Logam Ukuran L', CURDATE() + INTERVAL 1 DAY, CURDATE() + INTERVAL 10 DAY, 'high', 'approved', 'Rencana produksi bracket logam dengan 2 batch', 2, NULL),
('PLAN-002', 2, 'REQ-2024-002', 'Cover Plastik Elektronik', CURDATE() + INTERVAL 3 DAY, CURDATE() + INTERVAL 14 DAY, 'normal', 'approved', 'Injection molding untuk cover plastik', 2, NULL),
('PLAN-003', 3, 'REQ-2024-003', 'Gear Box Housing', CURDATE() + INTERVAL 2 DAY, CURDATE() + INTERVAL 7 DAY, 'urgent', 'approved', 'CNC machining untuk housing', 1, NULL),
('PLAN-004', 4, 'REQ-2024-004', 'Furniture Set Kayu Jati', CURDATE() + INTERVAL 7 DAY, CURDATE() + INTERVAL 21 DAY, 'normal', 'draft', 'Rencana furniture kayu jati belum final', 1, NULL),
('PLAN-005', 5, 'REQ-2024-005', 'Komponen Tekstil Custom', CURDATE() + INTERVAL 15 DAY, CURDATE() + INTERVAL 35 DAY, 'low', 'draft', 'Menunggu spesifikasi detail dari customer', 3, NULL),
('PLAN-006', 6, 'REQ-2024-006', 'Precision Machined Parts', CURDATE() + INTERVAL 4 DAY, CURDATE() + INTERVAL 9 DAY, 'high', 'approved', 'Precision machining dengan toleransi ketat', 1, NULL),
('PLAN-007', 7, 'REQ-2024-007', 'Industrial Valve Body', CURDATE() + INTERVAL 1 DAY, CURDATE() + INTERVAL 6 DAY, 'urgent', 'approved', 'Valve body stainless steel', 1, NULL),
('PLAN-008', 8, 'REQ-2024-008', 'Electronic Enclosure', CURDATE() + INTERVAL 8 DAY, CURDATE() + INTERVAL 18 DAY, 'normal', 'draft', 'Enclosure dengan rating IP65', 2, NULL),
('PLAN-009', 9, 'REQ-2024-009', 'Custom Wooden Cabinet', CURDATE() + INTERVAL 12 DAY, CURDATE() + INTERVAL 28 DAY, 'normal', 'draft', 'Cabinet kayu custom design', 2, NULL),
('PLAN-010', 10, 'REQ-2024-010', 'Automotive Bracket', CURDATE() + INTERVAL 5 DAY, CURDATE() + INTERVAL 15 DAY, 'high', 'approved', 'Bracket otomotif high tensile', 2, NULL),
('PLAN-011', 11, 'REQ-2024-011', 'Lampu LED Industri', CURDATE() + INTERVAL 2 DAY, CURDATE() + INTERVAL 8 DAY, 'normal', 'draft', 'Rencana lampu LED dari batch B16789012345', 1, 12345),
('PLAN-012', 12, 'REQ-2024-012', 'Suku Cadang Mesin', CURDATE() + INTERVAL 4 DAY, CURDATE() + INTERVAL 12 DAY, 'high', 'draft', 'Suku cadang mesin dari batch B54321098765', 1, 67890);
