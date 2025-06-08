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
    product_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    status ENUM('received', 'planned', 'in_production', 'completed', 'cancelled') DEFAULT 'received',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_priority (priority)
);

-- Production batches table
CREATE TABLE production_batches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_number VARCHAR(50) UNIQUE NOT NULL,
    request_id INT NOT NULL,
    scheduled_start_date DATE DEFAULT NULL,
    scheduled_end_date DATE DEFAULT NULL,
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
INSERT INTO production_requests (request_id, product_name, quantity, priority, status) VALUES
('REQ-2024-001', 'Steel Bracket Type A', 1000, 'high', 'received'),
('REQ-2024-002', 'Aluminum Housing', 500, 'normal', 'planned'),
('REQ-2024-003', 'Precision Gear', 200, 'urgent', 'in_production'),
('REQ-2024-004', 'Custom Valve', 50, 'normal', 'received'),
('REQ-2024-005', 'Plastic Casing', 1200, 'low', 'received'),
('REQ-2024-006', 'Rubber Seal', 800, 'high', 'received');

INSERT INTO production_batches (batch_number, request_id, quantity, scheduled_start_date, scheduled_end_date, status) VALUES
('B1734567890-123', 1, 500, NULL, NULL, 'pending'),
('B1734567891-456', 1, 500, NULL, NULL, 'pending'),
('B1734567892-789', 2, 250, NULL, NULL, 'pending'),
('B1734567893-012', 2, 250, NULL, NULL, 'pending'),
('B1734567894-345', 5, 600, NULL, NULL, 'pending'),
('B1734567895-678', 5, 600, NULL, NULL, 'pending'),
('B1734567896-901', 6, 800, NULL, NULL, 'pending');

INSERT INTO production_steps (batch_id, step_name, step_order, machine_type, status) VALUES
(1, 'Material Preparation', 1, 'cutting', 'pending'),
(1, 'Machining', 2, 'milling', 'pending'),
(1, 'Quality Check', 3, 'inspection', 'pending'),
(1, 'Assembly', 4, 'assembly', 'pending'),
(3, 'Material Cut', 1, 'cutting', 'completed'),
(3, 'Drilling', 2, 'drilling', 'in_progress'),
(3, 'Finishing', 3, 'grinding', 'pending'),
(5, 'Injection Molding', 1, 'molding', 'pending'),
(5, 'Cooling', 2, NULL, 'pending'),
(6, 'Compression Forming', 1, NULL, 'pending'),
(6, 'Curing', 2, NULL, 'pending');

INSERT INTO material_allocations (batch_id, material_id, quantity_required, unit_of_measure, status) VALUES
(1, 101, 50.5, 'kg', 'pending'),
(1, 102, 100, 'pcs', 'pending'),
(3, 103, 25.0, 'kg', 'allocated'),
(3, 104, 50, 'pcs', 'consumed'),
(5, 201, 150.0, 'kg', 'pending'),
(5, 202, 50, 'pcs', 'pending'),
(6, 301, 80.0, 'kg', 'pending');

INSERT INTO production_logs (entity_type, entity_id, action, old_values, new_values, user_id, notes) VALUES
('request', 1, 'create', NULL, '{"status": "received"}', 1, 'Production request created'),
('batch', 1, 'create', NULL, '{"status": "pending"}', 1, 'Batch created for REQ-2024-001'),
('step', 3, 'start', '{"status": "pending"}', '{"status": "in_progress"}', 2, 'Drilling started for batch B1734567892-789'),
('material', 3, 'allocate', '{"quantityAllocated": 0}', '{"quantityAllocated": 25.0}', 3, 'Material 103 allocated to batch B1734567892-789');

INSERT INTO quality_controls (batch_id, step_id, inspector_id, quality_check_type, pass_criteria, actual_result, status, inspection_date, notes) VALUES
(3, 5, 10, 'Dimension Check', 'Length: 200mm ±0.1mm', 'Length: 200.05mm', 'passed', '2024-12-12 10:00:00', 'Passed initial dimension check'),
(3, 6, 11, 'Surface Finish', 'Ra value < 0.8', 'Ra value: 0.9', 'failed', '2024-12-13 14:30:00', 'Surface finish slightly rough, requires re-work');

-- Create views for reporting
CREATE VIEW batch_summary AS
SELECT 
    pb.id,
    pb.batch_number,
    pr.request_id,
    pr.product_name,
    pb.quantity,
    pb.status as batch_status,
    pr.priority,
    pb.scheduled_start_date,
    pb.scheduled_end_date,
    COUNT(ps.id) as total_steps,
    SUM(CASE WHEN ps.status = 'completed' THEN 1 ELSE 0 END) as completed_steps,
    COUNT(ma.id) as total_materials,
    SUM(CASE WHEN ma.status = 'allocated' THEN 1 ELSE 0 END) as allocated_materials
FROM production_batches pb
LEFT JOIN production_requests pr ON pb.request_id = pr.id
LEFT JOIN production_steps ps ON pb.id = ps.batch_id
LEFT JOIN material_allocations ma ON pb.id = ma.batch_id
GROUP BY pb.id, pb.batch_number, pr.request_id, pr.product_name, 
         pb.quantity, pb.status, pr.priority, pb.scheduled_start_date, 
         pb.scheduled_end_date;

CREATE VIEW production_overview AS
SELECT 
    pr.id,
    pr.request_id,
    pr.product_name,
    pr.quantity as total_quantity,
    pr.status as request_status,
    pr.priority,
    COUNT(pb.id) as total_batches,
    SUM(pb.quantity) as batched_quantity,
    SUM(CASE WHEN pb.status = 'completed' THEN pb.quantity ELSE 0 END) as completed_quantity
FROM production_requests pr
LEFT JOIN production_batches pb ON pr.id = pb.request_id
GROUP BY pr.id, pr.request_id, pr.product_name, 
         pr.quantity, pr.status, pr.priority;
