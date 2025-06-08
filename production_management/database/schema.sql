-- =====================================================
-- PRODUCTION MANAGEMENT SERVICE DATABASE
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS production_management_db;
USE production_management_db;

-- Drop existing tables
DROP TABLE IF EXISTS material_allocations;
DROP TABLE IF EXISTS production_steps;
DROP TABLE IF EXISTS production_batches;
DROP TABLE IF EXISTS production_requests;
DROP TABLE IF EXISTS production_logs;
DROP TABLE IF EXISTS quality_controls;

-- Production requests table
CREATE TABLE production_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    due_date DATE NOT NULL,
    specifications TEXT,
    status ENUM('received', 'planned', 'in_production', 'completed', 'cancelled') DEFAULT 'received',
    marketplace_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_due_date (due_date),
    INDEX idx_customer_id (customer_id)
);

-- Production batches table
CREATE TABLE production_batches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_number VARCHAR(50) UNIQUE NOT NULL,
    request_id INT NOT NULL,
    scheduled_start_date DATE,
    scheduled_end_date DATE,
    actual_start_date DATETIME,
    actual_end_date DATETIME,
    quantity INT NOT NULL,
    status ENUM('pending', 'scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    materials_assigned BOOLEAN DEFAULT FALSE,
    machine_assigned BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES production_requests(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_request_id (request_id),
    INDEX idx_scheduled_start (scheduled_start_date),
    INDEX idx_batch_number (batch_number)
);

-- Production steps table
CREATE TABLE production_steps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_id INT NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_order INT NOT NULL,
    machine_type VARCHAR(50),
    scheduled_start_time DATETIME,
    scheduled_end_time DATETIME,
    actual_start_time DATETIME,
    actual_end_time DATETIME,
    machine_id INT,
    operator_id INT,
    status ENUM('pending', 'scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES production_batches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_batch_step_order (batch_id, step_order),
    INDEX idx_batch_id (batch_id),
    INDEX idx_status (status),
    INDEX idx_step_order (step_order),
    INDEX idx_machine_type (machine_type)
);

-- Material allocations table
CREATE TABLE material_allocations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_id INT NOT NULL,
    material_id INT NOT NULL COMMENT 'Reference to material_inventory service',
    quantity_required DECIMAL(10,3) NOT NULL,
    quantity_allocated DECIMAL(10,3) DEFAULT 0,
    unit_of_measure VARCHAR(20) NOT NULL,
    status ENUM('pending', 'partial', 'allocated', 'consumed') DEFAULT 'pending',
    allocation_date DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES production_batches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_batch_material (batch_id, material_id),
    INDEX idx_batch_id (batch_id),
    INDEX idx_material_id (material_id),
    INDEX idx_status (status)
);

-- Production Logs Table (for tracking changes and events)
CREATE TABLE production_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entity_type ENUM('request', 'batch', 'step', 'material') NOT NULL,
    entity_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSON,
    new_values JSON,
    user_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id)
);

-- Quality Control Table
CREATE TABLE quality_controls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_id INT NOT NULL,
    step_id INT,
    inspector_id INT,
    quality_check_type VARCHAR(100) NOT NULL,
    pass_criteria TEXT,
    actual_result TEXT,
    status ENUM('pending', 'passed', 'failed', 'rework') DEFAULT 'pending',
    inspection_date DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES production_batches(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES production_steps(id) ON DELETE SET NULL,
    INDEX idx_batch_id (batch_id),
    INDEX idx_step_id (step_id),
    INDEX idx_status (status),
    INDEX idx_inspection_date (inspection_date)
);

-- Insert sample data for development/testing
INSERT INTO production_requests (request_id, customer_id, product_name, quantity, priority, due_date, specifications, status) VALUES
('REQ-2024-001', 'CUST-001', 'Steel Bracket Type A', 1000, 'high', '2024-12-31', 'Material: Stainless Steel 304, Tolerance: ±0.1mm', 'received'),
('REQ-2024-002', 'CUST-002', 'Aluminum Housing', 500, 'normal', '2024-12-25', 'Material: Aluminum 6061, Anodized finish', 'planned'),
('REQ-2024-003', 'CUST-001', 'Precision Gear', 200, 'urgent', '2024-12-20', 'Material: Carbon Steel, Heat treated', 'in_production'),
('REQ-2024-004', 'CUST-003', 'Custom Valve', 50, 'normal', '2025-01-15', 'Material: Brass, Pressure tested', 'received');

INSERT INTO production_batches (batch_number, request_id, quantity, scheduled_start_date, scheduled_end_date, status) VALUES
('B1734567890-123', 1, 500, '2024-12-15', '2024-12-20', 'pending'),
('B1734567891-456', 1, 500, '2024-12-21', '2024-12-25', 'scheduled'),
('B1734567892-789', 2, 250, '2024-12-10', '2024-12-15', 'in_progress'),
('B1734567893-012', 2, 250, '2024-12-16', '2024-12-20', 'pending');

INSERT INTO production_steps (batch_id, step_name, step_order, machine_type, status) VALUES
(1, 'Material Preparation', 1, 'cutting', 'pending'),
(1, 'Machining', 2, 'milling', 'pending'),
(1, 'Quality Check', 3, 'inspection', 'pending'),
(1, 'Assembly', 4, 'assembly', 'pending'),
(3, 'Material Cut', 1, 'cutting', 'completed'),
(3, 'Drilling', 2, 'drilling', 'in_progress'),
(3, 'Finishing', 3, 'grinding', 'pending');

INSERT INTO material_allocations (batch_id, material_id, quantity_required, unit_of_measure, status) VALUES
(1, 101, 50.5, 'kg', 'pending'),
(1, 102, 100, 'pcs', 'pending'),
(3, 103, 25.0, 'kg', 'allocated'),
(3, 104, 50, 'pcs', 'consumed');

-- Create views for reporting
CREATE VIEW batch_summary AS
SELECT 
    pb.id,
    pb.batch_number,
    pr.request_id,
    pr.product_name,
    pr.customer_id,
    pb.quantity,
    pb.status as batch_status,
    pr.priority,
    pb.scheduled_start_date,
    pb.scheduled_end_date,
    pb.actual_start_date,
    pb.actual_end_date,
    COUNT(ps.id) as total_steps,
    SUM(CASE WHEN ps.status = 'completed' THEN 1 ELSE 0 END) as completed_steps,
    COUNT(ma.id) as total_materials,
    SUM(CASE WHEN ma.status = 'allocated' THEN 1 ELSE 0 END) as allocated_materials
FROM production_batches pb
LEFT JOIN production_requests pr ON pb.request_id = pr.id
LEFT JOIN production_steps ps ON pb.id = ps.batch_id
LEFT JOIN material_allocations ma ON pb.id = ma.batch_id
GROUP BY pb.id, pb.batch_number, pr.request_id, pr.product_name, pr.customer_id, 
         pb.quantity, pb.status, pr.priority, pb.scheduled_start_date, 
         pb.scheduled_end_date, pb.actual_start_date, pb.actual_end_date;

CREATE VIEW production_overview AS
SELECT 
    pr.id,
    pr.request_id,
    pr.product_name,
    pr.customer_id,
    pr.quantity as total_quantity,
    pr.status as request_status,
    pr.priority,
    pr.due_date,
    COUNT(pb.id) as total_batches,
    SUM(pb.quantity) as batched_quantity,
    SUM(CASE WHEN pb.status = 'completed' THEN pb.quantity ELSE 0 END) as completed_quantity
FROM production_requests pr
LEFT JOIN production_batches pb ON pr.id = pb.request_id
GROUP BY pr.id, pr.request_id, pr.product_name, pr.customer_id, 
         pr.quantity, pr.status, pr.priority, pr.due_date;
