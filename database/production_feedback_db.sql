-- =====================================================
-- PRODUCTION FEEDBACK SERVICE DATABASE
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS production_feedback_db;
USE production_feedback_db;

-- Drop existing tables
DROP TABLE IF EXISTS production_feedbacks;
DROP TABLE IF EXISTS production_steps_feedback;
DROP TABLE IF EXISTS quality_checks;
DROP TABLE IF EXISTS feedback_images;
DROP TABLE IF EXISTS feedback_comments;
DROP TABLE IF EXISTS feedback_notifications;

-- Production feedbacks table
CREATE TABLE production_feedbacks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    feedback_id VARCHAR(50) UNIQUE NOT NULL,
    batch_id VARCHAR(50) NOT NULL,
    order_id VARCHAR(50),
    product_id VARCHAR(50),
    product_name VARCHAR(100) NOT NULL,
    production_plan_id VARCHAR(50),
    status ENUM('pending', 'in_production', 'on_hold', 'completed', 'cancelled', 'rejected') NOT NULL DEFAULT 'pending',
    planned_quantity INT NOT NULL,
    actual_quantity INT,
    defect_quantity INT,
    quality_score FLOAT,
    start_date DATETIME,
    end_date DATETIME,
    notes TEXT,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_feedback_id (feedback_id),
    INDEX idx_batch_id (batch_id),
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id),
    INDEX idx_status (status)
);

-- Production steps feedback table
CREATE TABLE production_steps_feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    step_id VARCHAR(50) UNIQUE NOT NULL,
    feedback_id VARCHAR(50) NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_order INT NOT NULL,
    machine_id VARCHAR(50),
    machine_name VARCHAR(100),
    machine_category ENUM('cutting', 'milling', 'drilling', 'turning', 'grinding', 'welding', 'assembly', 'inspection', 'packaging', 'other'),
    operator_id VARCHAR(50),
    operator_name VARCHAR(100),
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    start_time DATETIME,
    end_time DATETIME,
    duration INT,
    planned_quantity INT NOT NULL,
    actual_quantity INT,
    defect_quantity INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES production_feedbacks(feedback_id) ON DELETE CASCADE,
    INDEX idx_step_id (step_id),
    INDEX idx_feedback (feedback_id),
    INDEX idx_status (status)
);

-- Quality checks table
CREATE TABLE quality_checks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    check_id VARCHAR(50) UNIQUE NOT NULL,
    feedback_id VARCHAR(50) NOT NULL,
    step_id VARCHAR(50),
    check_name VARCHAR(100) NOT NULL,
    check_type VARCHAR(50) NOT NULL,
    check_date DATETIME NOT NULL,
    inspector_id VARCHAR(100),
    inspector_name VARCHAR(100),
    result ENUM('pending', 'pass', 'fail', 'conditional_pass', 'needs_rework') NOT NULL DEFAULT 'pending',
    measurements TEXT,
    standard_value VARCHAR(100),
    actual_value VARCHAR(100),
    tolerance VARCHAR(100),
    deviation_percentage DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES production_feedbacks(feedback_id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES production_steps_feedback(step_id) ON DELETE CASCADE,
    INDEX idx_check_id (check_id),
    INDEX idx_feedback (feedback_id),
    INDEX idx_step (step_id),
    INDEX idx_result (result)
);

-- Feedback images table
CREATE TABLE feedback_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    image_id VARCHAR(50) UNIQUE NOT NULL,
    feedback_id VARCHAR(50) NOT NULL,
    step_id VARCHAR(50),
    quality_check_id VARCHAR(50),
    image_type ENUM('product', 'machine', 'defect', 'material', 'document', 'other') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    uploaded_by VARCHAR(100),
    upload_date DATETIME NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES production_feedbacks(feedback_id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES production_steps_feedback(step_id) ON DELETE CASCADE,
    FOREIGN KEY (quality_check_id) REFERENCES quality_checks(check_id) ON DELETE CASCADE,
    INDEX idx_image_id (image_id),
    INDEX idx_feedback (feedback_id),
    INDEX idx_type (image_type)
);

-- Feedback comments table
CREATE TABLE feedback_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    comment_id VARCHAR(50) UNIQUE NOT NULL,
    feedback_id VARCHAR(50) NOT NULL,
    comment_type ENUM('internal', 'customer', 'marketplace', 'system') NOT NULL,
    content TEXT NOT NULL,
    user_id VARCHAR(100),
    user_name VARCHAR(100),
    user_role VARCHAR(50),
    is_important BOOLEAN NOT NULL DEFAULT FALSE,
    parent_comment_id VARCHAR(50),
    is_edited BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    visible_to_customer BOOLEAN NOT NULL DEFAULT FALSE,
    visible_to_marketplace BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES production_feedbacks(feedback_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES feedback_comments(comment_id) ON DELETE CASCADE,
    INDEX idx_comment_id (comment_id),
    INDEX idx_feedback (feedback_id),
    INDEX idx_type (comment_type)
);

-- Feedback notifications table
CREATE TABLE feedback_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    notification_id VARCHAR(50) UNIQUE NOT NULL,
    feedback_id VARCHAR(50) NOT NULL,
    type ENUM('status_change', 'quality_issue', 'step_completion', 'comment', 'system') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    recipient_type VARCHAR(50) NOT NULL,
    recipient_id VARCHAR(100) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_delivered BOOLEAN NOT NULL DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    delivery_method ENUM('in_app', 'email', 'both') NOT NULL DEFAULT 'in_app',
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES production_feedbacks(feedback_id) ON DELETE CASCADE,
    INDEX idx_notification_id (notification_id),
    INDEX idx_feedback (feedback_id),
    INDEX idx_recipient (recipient_type, recipient_id),
    INDEX idx_type (type)
);

-- Insert dummy production feedbacks
INSERT INTO production_feedbacks (feedback_id, batch_id, order_id, product_id, product_name, production_plan_id, status, planned_quantity, actual_quantity, defect_quantity, quality_score, start_date, end_date, notes, created_by) VALUES
('FB-001', 'BATCH-001', 'ORD-001', 'PROD-001', 'Bracket Logam Ukuran L', 'PLAN-001', 'in_production', 50, 25, 2, 92.5, NOW() - INTERVAL 2 DAY, NULL, 'Produksi batch pertama bracket logam', 'operator1'),
('FB-002', 'BATCH-007', 'ORD-007', 'PROD-007', 'Industrial Valve Body', 'PLAN-007', 'in_production', 30, 15, 1, 95.0, NOW() - INTERVAL 1 DAY, NULL, 'Produksi valve body stainless steel', 'operator1'),
('FB-003', 'BATCH-003', 'ORD-002', 'PROD-002', 'Cover Plastik Elektronik', 'PLAN-002', 'pending', 100, 0, 0, NULL, NULL, NULL, 'Menunggu jadwal produksi', 'supervisor1'),
('FB-004', 'BATCH-005', 'ORD-003', 'PROD-003', 'Gear Box Housing', 'PLAN-003', 'pending', 50, 0, 0, NULL, NULL, NULL, 'Menunggu setup mesin CNC', 'operator2'),
('FB-005', 'BATCH-008', 'ORD-010', 'PROD-010', 'Automotive Bracket', 'PLAN-010', 'pending', 150, 0, 0, NULL, NULL, NULL, 'Batch pertama automotive bracket', 'supervisor1'),
('FB-006', 'BATCH-002', 'ORD-001', 'PROD-001', 'Bracket Logam Ukuran L', 'PLAN-001', 'pending', 50, 0, 0, NULL, NULL, NULL, 'Batch kedua bracket logam', 'operator1'),
('FB-007', 'BATCH-006', 'ORD-006', 'PROD-006', 'Precision Machined Parts', 'PLAN-006', 'pending', 75, 0, 0, NULL, NULL, NULL, 'Precision parts dengan toleransi ketat', 'operator3'),
('FB-008', 'BATCH-004', 'ORD-002', 'PROD-002', 'Cover Plastik Elektronik', 'PLAN-002', 'pending', 100, 0, 0, NULL, NULL, NULL, 'Batch kedua cover plastik', 'supervisor1'),
('FB-009', 'BATCH-009', 'ORD-010', 'PROD-010', 'Automotive Bracket', 'PLAN-010', 'pending', 150, 0, 0, NULL, NULL, NULL, 'Batch kedua automotive bracket', 'supervisor1'),
('FB-010', 'BATCH-010', 'ORD-004', 'PROD-004', 'Furniture Set Kayu Jati', 'PLAN-004', 'pending', 25, 0, 0, NULL, NULL, NULL, 'Furniture set premium kayu jati', 'operator2');

-- Insert dummy production steps feedback
INSERT INTO production_steps_feedback (step_id, feedback_id, step_name, step_order, machine_id, machine_name, machine_category, operator_id, operator_name, status, start_time, end_time, duration, planned_quantity, actual_quantity, defect_quantity, notes) VALUES
('STEP-001', 'FB-001', 'Cutting Material', 1, 'MCH-003', 'Plasma Cutting Table', 'cutting', 'OP001', 'Machine Operator 1', 'completed', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY + INTERVAL 4 HOUR, 240, 50, 50, 0, 'Pemotongan baja ST37 selesai'),
('STEP-002', 'FB-001', 'Drilling Holes', 2, 'MCH-004', 'Drill Press 1', 'drilling', 'OP002', 'Machine Operator 2', 'in_progress', NOW() - INTERVAL 1 DAY, NULL, NULL, 50, 25, 2, 'Pengeboran lubang bracket sedang berlangsung'),
('STEP-003', 'FB-001', 'Surface Finishing', 3, 'MCH-005', 'Surface Grinder', 'grinding', NULL, NULL, 'pending', NULL, NULL, NULL, 50, 0, 0, 'Menunggu proses drilling selesai'),
('STEP-004', 'FB-002', 'Turning Operation', 1, 'MCH-002', 'CNC Lathe 1', 'turning', 'OP001', 'Machine Operator 1', 'in_progress', NOW() - INTERVAL 1 DAY, NULL, NULL, 30, 15, 1, 'Turning valve body berlangsung'),
('STEP-005', 'FB-002', 'Thread Cutting', 2, 'MCH-002', 'CNC Lathe 1', 'turning', NULL, NULL, 'pending', NULL, NULL, NULL, 30, 0, 0, 'Menunggu turning selesai'),
('STEP-006', 'FB-003', 'Injection Molding', 1, 'MCH-006', 'Injection Molding Machine', 'other', NULL, NULL, 'pending', NULL, NULL, NULL, 100, 0, 0, 'Belum dimulai'),
('STEP-007', 'FB-004', 'CNC Machining', 1, 'MCH-001', 'CNC Milling Machine 1', 'milling', NULL, NULL, 'pending', NULL, NULL, NULL, 50, 0, 0, 'Menunggu setup'),
('STEP-008', 'FB-004', 'Quality Inspection', 2, 'MCH-009', 'Quality Inspection Table', 'inspection', NULL, NULL, 'pending', NULL, NULL, NULL, 50, 0, 0, 'Menunggu machining selesai'),
('STEP-009', 'FB-005', 'Material Preparation', 1, 'MCH-003', 'Plasma Cutting Table', 'cutting', NULL, NULL, 'pending', NULL, NULL, NULL, 150, 0, 0, 'Belum dijadwalkan'),
('STEP-010', 'FB-007', 'Precision Milling', 1, 'MCH-001', 'CNC Milling Machine 1', 'milling', NULL, NULL, 'pending', NULL, NULL, NULL, 75, 0, 0, 'Precision machining parts');

-- Insert dummy quality checks
INSERT INTO quality_checks (check_id, feedback_id, step_id, check_name, check_type, check_date, inspector_id, inspector_name, result, measurements, standard_value, actual_value, tolerance, deviation_percentage, notes) VALUES
('QC-001', 'FB-001', 'STEP-001', 'Dimensional Check - Length', 'dimensional', NOW() - INTERVAL 2 DAY + INTERVAL 4 HOUR, 'QC001', 'Quality Control 1', 'pass', 'Length: 100.2mm', '100mm', '100.2mm', '±0.5mm', 0.20, 'Dimensi sesuai standar'),
('QC-002', 'FB-001', 'STEP-001', 'Surface Quality Check', 'visual', NOW() - INTERVAL 2 DAY + INTERVAL 4 HOUR, 'QC001', 'Quality Control 1', 'pass', 'Visual inspection OK', 'Smooth surface', 'Good', 'No defects', 0.00, 'Permukaan halus, tidak ada cacat'),
('QC-003', 'FB-001', 'STEP-002', 'Hole Diameter Check', 'dimensional', NOW() - INTERVAL 1 DAY + INTERVAL 2 HOUR, 'QC002', 'Quality Control 2', 'conditional_pass', 'Diameter: 10.15mm', '10mm', '10.15mm', '±0.1mm', 1.50, 'Sedikit over tolerance, masih dapat diterima'),
('QC-004', 'FB-002', 'STEP-004', 'Threading Pitch Check', 'dimensional', NOW() - INTERVAL 1 DAY + INTERVAL 4 HOUR, 'QC001', 'Quality Control 1', 'pass', 'Pitch: 1.25mm', '1.25mm', '1.25mm', '±0.02mm', 0.00, 'Thread pitch perfect'),
('QC-005', 'FB-002', 'STEP-004', 'Material Hardness Test', 'mechanical', NOW() - INTERVAL 1 DAY + INTERVAL 4 HOUR, 'QC002', 'Quality Control 2', 'pass', 'HRC: 58', 'HRC 55-60', 'HRC 58', 'HRC ±5', 0.00, 'Kekerasan sesuai spesifikasi'),
('QC-006', 'FB-001', 'STEP-002', 'Drill Bit Condition', 'tool_check', NOW() - INTERVAL 1 DAY + INTERVAL 1 HOUR, 'OP002', 'Machine Operator 2', 'needs_rework', 'Bit wear detected', 'Sharp edge', 'Worn', 'Visual check', 0.00, 'Mata bor perlu diganti'),
('QC-007', 'FB-002', 'STEP-004', 'Surface Roughness', 'surface', NOW() - INTERVAL 1 DAY + INTERVAL 3 HOUR, 'QC001', 'Quality Control 1', 'pass', 'Ra: 1.2µm', 'Ra ≤ 1.6µm', 'Ra: 1.2µm', 'Ra ±0.4µm', 0.00, 'Kekasaran permukaan baik'),
('QC-008', 'FB-001', 'STEP-001', 'Cut Edge Quality', 'visual', NOW() - INTERVAL 2 DAY + INTERVAL 4 HOUR, 'QC002', 'Quality Control 2', 'pass', 'Clean cut edge', 'No burr', 'Clean', 'Visual', 0.00, 'Hasil potong bersih'),
('QC-009', 'FB-002', 'STEP-004', 'Concentricity Check', 'dimensional', NOW() - INTERVAL 1 DAY + INTERVAL 5 HOUR, 'QC001', 'Quality Control 1', 'pass', 'Runout: 0.03mm', '≤ 0.05mm', '0.03mm', '±0.02mm', 0.00, 'Konsentrisitas baik'),
('QC-010', 'FB-001', 'STEP-002', 'Hole Position Accuracy', 'dimensional', NOW() - INTERVAL 1 DAY + INTERVAL 3 HOUR, 'QC002', 'Quality Control 2', 'pass', 'Position: ±0.05mm', '±0.1mm', '±0.05mm', '±0.1mm', 0.00, 'Posisi lubang akurat');

-- Insert dummy feedback images
INSERT INTO feedback_images (image_id, feedback_id, step_id, quality_check_id, image_type, title, description, file_path, file_url, file_type, file_size, uploaded_by, upload_date, is_public) VALUES
('IMG-001', 'FB-001', 'STEP-001', 'QC-001', 'product', 'Hasil Cutting Bracket', 'Foto hasil pemotongan bracket logam', '/uploads/images/fb001_step001_cutting.jpg', 'http://localhost:5005/uploads/images/fb001_step001_cutting.jpg', 'image/jpeg', 245678, 'QC001', NOW() - INTERVAL 2 DAY + INTERVAL 4 HOUR, TRUE),
('IMG-002', 'FB-001', 'STEP-002', 'QC-003', 'defect', 'Lubang Over Tolerance', 'Dokumentasi lubang yang sedikit melebihi toleransi', '/uploads/images/fb001_step002_hole_defect.jpg', 'http://localhost:5005/uploads/images/fb001_step002_hole_defect.jpg', 'image/jpeg', 189432, 'QC002', NOW() - INTERVAL 1 DAY + INTERVAL 2 HOUR, FALSE),
('IMG-003', 'FB-002', 'STEP-004', 'QC-004', 'product', 'Threading Valve Body', 'Hasil thread cutting pada valve body', '/uploads/images/fb002_step004_threading.jpg', 'http://localhost:5005/uploads/images/fb002_step004_threading.jpg', 'image/jpeg', 198765, 'QC001', NOW() - INTERVAL 1 DAY + INTERVAL 4 HOUR, TRUE),
('IMG-004', 'FB-001', 'STEP-001', NULL, 'machine', 'Setup Plasma Cutting', 'Setup mesin plasma cutting untuk bracket', '/uploads/images/fb001_machine_setup.jpg', 'http://localhost:5005/uploads/images/fb001_machine_setup.jpg', 'image/jpeg', 267890, 'OP001', NOW() - INTERVAL 2 DAY, FALSE),
('IMG-005', 'FB-002', 'STEP-004', 'QC-005', 'document', 'Hardness Test Report', 'Laporan hasil uji kekerasan material', '/uploads/documents/fb002_hardness_report.pdf', 'http://localhost:5005/uploads/documents/fb002_hardness_report.pdf', 'application/pdf', 456123, 'QC002', NOW() - INTERVAL 1 DAY + INTERVAL 4 HOUR, FALSE),
('IMG-006', 'FB-001', 'STEP-002', 'QC-006', 'material', 'Worn Drill Bit', 'Mata bor yang sudah aus dan perlu diganti', '/uploads/images/fb001_worn_drill_bit.jpg', 'http://localhost:5005/uploads/images/fb001_worn_drill_bit.jpg', 'image/jpeg', 123456, 'OP002', NOW() - INTERVAL 1 DAY + INTERVAL 1 HOUR, FALSE),
('IMG-007', 'FB-002', 'STEP-004', 'QC-007', 'product', 'Surface Finish Quality', 'Kualitas finishing permukaan valve body', '/uploads/images/fb002_surface_finish.jpg', 'http://localhost:5005/uploads/images/fb002_surface_finish.jpg', 'image/jpeg', 234567, 'QC001', NOW() - INTERVAL 1 DAY + INTERVAL 3 HOUR, TRUE),
('IMG-008', 'FB-001', NULL, NULL, 'product', 'Work in Progress', 'Progress keseluruhan batch bracket logam', '/uploads/images/fb001_wip_overview.jpg', 'http://localhost:5005/uploads/images/fb001_wip_overview.jpg', 'image/jpeg', 345678, 'supervisor1', NOW() - INTERVAL 1 DAY, TRUE),
('IMG-009', 'FB-002', NULL, NULL, 'product', 'Valve Body Assembly', 'Valve body yang sudah selesai di-machining', '/uploads/images/fb002_valve_assembly.jpg', 'http://localhost:5005/uploads/images/fb002_valve_assembly.jpg', 'image/jpeg', 456789, 'OP001', NOW() - INTERVAL 12 HOUR, TRUE),
('IMG-010', 'FB-001', 'STEP-002', 'QC-010', 'document', 'Measurement Report', 'Laporan pengukuran posisi lubang', '/uploads/documents/fb001_measurement_report.pdf', 'http://localhost:5005/uploads/documents/fb001_measurement_report.pdf', 'application/pdf', 567890, 'QC002', NOW() - INTERVAL 1 DAY + INTERVAL 3 HOUR, FALSE);

-- Insert dummy feedback comments
INSERT INTO feedback_comments (comment_id, feedback_id, comment_type, content, user_id, user_name, user_role, is_important, visible_to_customer, visible_to_marketplace) VALUES
('CMT-001', 'FB-001', 'internal', 'Batch pertama berjalan lancar, hanya ada sedikit masalah pada step drilling. Mata bor perlu diganti.', 'supervisor1', 'Production Supervisor', 'supervisor', TRUE, FALSE, FALSE),
('CMT-002', 'FB-001', 'internal', 'Quality check menunjukkan hasil baik, satu lubang sedikit over tolerance tapi masih dalam batas acceptable.', 'QC001', 'Quality Control 1', 'operator', FALSE, FALSE, FALSE),
('CMT-003', 'FB-002', 'internal', 'Valve body machining berjalan sesuai rencana. Material stainless steel 316 memberikan hasil finishing yang excellent.', 'OP001', 'Machine Operator 1', 'operator', FALSE, FALSE, FALSE),
('CMT-004', 'FB-001', 'customer', 'Progress update: Batch pertama bracket logam sudah 50% selesai. Estimasi selesai sesuai jadwal.', 'supervisor1', 'Production Supervisor', 'supervisor', FALSE, TRUE, TRUE),
('CMT-005', 'FB-002', 'internal', 'Threading operation memerlukan extra attention untuk memastikan pitch accuracy. Setup time lebih lama dari biasanya.', 'OP001', 'Machine Operator 1', 'operator', TRUE, FALSE, FALSE),
('CMT-006', 'FB-001', 'system', 'Automatic quality alert: Hole diameter QC-003 flagged as conditional pass. Review required.', 'system', 'System', 'system', TRUE, FALSE, FALSE),
('CMT-007', 'FB-002', 'customer', 'Industrial valve body production started. High quality stainless steel material used as specified.', 'supervisor1', 'Production Supervisor', 'supervisor', FALSE, TRUE, TRUE),
('CMT-008', 'FB-001', 'internal', 'Material consumption sesuai planning. Stock baja ST37 masih sufficient untuk batch kedua.', 'operator2', 'Machine Operator 2', 'operator', FALSE, FALSE, FALSE),
('CMT-009', 'FB-002', 'marketplace', 'Production update for order TKP-007: Valve body machining in progress, quality tests passing.', 'supervisor1', 'Production Supervisor', 'supervisor', FALSE, FALSE, TRUE),
('CMT-010', 'FB-001', 'internal', 'Recommended action: Replace drill bit before continuing to next batch untuk maintain quality standard.', 'QC002', 'Quality Control 2', 'operator', TRUE, FALSE, FALSE);

-- Insert dummy feedback notifications
INSERT INTO feedback_notifications (notification_id, feedback_id, type, title, message, recipient_type, recipient_id, is_read, priority, delivery_method, created_by) VALUES
('NOT-001', 'FB-001', 'quality_issue', 'Quality Alert - Hole Diameter', 'Lubang pada bracket FB-001 sedikit melebihi toleransi. Review diperlukan.', 'role', 'supervisor', FALSE, 'high', 'both', 'QC002'),
('NOT-002', 'FB-001', 'step_completion', 'Step Completed - Cutting', 'Step cutting untuk batch FB-001 telah selesai dengan hasil baik.', 'user', 'supervisor1', TRUE, 'medium', 'in_app', 'OP001'),
('NOT-003', 'FB-002', 'status_change', 'Production Started', 'Produksi valve body FB-002 telah dimulai dengan turning operation.', 'role', 'manager', TRUE, 'medium', 'in_app', 'OP001'),
('NOT-004', 'FB-001', 'comment', 'New Comment Added', 'Supervisor menambahkan komentar penting pada batch FB-001.', 'role', 'operator', FALSE, 'low', 'in_app', 'supervisor1'),
('NOT-005', 'FB-002', 'quality_issue', 'Tool Maintenance Required', 'Mata bor pada operasi drilling perlu diganti untuk maintain quality.', 'user', 'OP002', FALSE, 'medium', 'in_app', 'QC001'),
('NOT-006', 'FB-001', 'system', 'Batch Progress Update', 'Batch FB-001 telah mencapai 50% completion rate.', 'role', 'customer', TRUE, 'low', 'email', 'system'),
('NOT-007', 'FB-002', 'step_completion', 'Threading Completed', 'Thread cutting pada valve body telah selesai dengan hasil excellent.', 'user', 'supervisor1', FALSE, 'medium', 'in_app', 'OP001'),
('NOT-008', 'FB-001', 'quality_issue', 'Quality Review Required', 'QC check QC-003 memerlukan review supervisor untuk conditional pass.', 'role', 'supervisor', FALSE, 'high', 'both', 'QC002'),
('NOT-009', 'FB-002', 'status_change', 'Material Quality Confirmed', 'Hardness test pada material stainless steel passed dengan excellent result.', 'role', 'quality', TRUE, 'medium', 'in_app', 'QC002'),
('NOT-010', 'FB-001', 'comment', 'Customer Update Posted', 'Progress update telah dikirim ke customer untuk batch FB-001.', 'user', 'supervisor1', TRUE, 'low', 'in_app', 'supervisor1');