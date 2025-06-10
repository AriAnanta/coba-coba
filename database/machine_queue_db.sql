-- =====================================================
-- MACHINE QUEUE SERVICE DATABASE
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS machine_queue_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use database
USE machine_queue_db;

-- Drop existing tables
DROP TABLE IF EXISTS machine_queues;
DROP TABLE IF EXISTS machines;

-- Machines table
CREATE TABLE IF NOT EXISTS machines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    machine_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'ID unik mesin',
    name VARCHAR(100) NOT NULL COMMENT 'Nama mesin',
    type VARCHAR(50) NOT NULL COMMENT 'Tipe/kategori mesin',
    manufacturer VARCHAR(100) COMMENT 'Pembuat mesin',
    model_number VARCHAR(100) COMMENT 'Nomor model mesin',
    capacity DECIMAL(10,2) COMMENT 'Kapasitas dalam satuan yang sesuai untuk tipe mesin',
    capacity_unit VARCHAR(20) COMMENT 'Satuan kapasitas (kg/hour, units/hour, dll)',
    location VARCHAR(100) COMMENT 'Lokasi mesin di pabrik',
    installation_date DATE COMMENT 'Tanggal instalasi mesin',
    last_maintenance DATE COMMENT 'Tanggal maintenance terakhir',
    next_maintenance DATE COMMENT 'Tanggal maintenance berikutnya',
    status ENUM('operational', 'maintenance', 'breakdown', 'inactive') DEFAULT 'operational' COMMENT 'Status operasional mesin',
    hours_per_day DECIMAL(4,2) NOT NULL DEFAULT 8.00 COMMENT 'Jam kerja mesin per hari',
    notes TEXT COMMENT 'Catatan tambahan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_machine_type (type),
    INDEX idx_machine_status (status),
    INDEX idx_machine_location (location)
) ENGINE=InnoDB COMMENT='Tabel data mesin produksi';

-- Machine queues table
CREATE TABLE IF NOT EXISTS machine_queues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    queue_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'ID unik antrian',
    machine_id INT NOT NULL COMMENT 'Reference ke mesin',
    batch_id INT NOT NULL COMMENT 'ID referensi ke batch di production_management service',
    batch_number VARCHAR(50) NOT NULL COMMENT 'Batch number dari production_management service',
    product_name VARCHAR(100) NOT NULL COMMENT 'Nama produk yang diproduksi',
    step_id INT COMMENT 'ID referensi ke step di production_management service',
    step_name VARCHAR(100) COMMENT 'Nama langkah produksi',
    scheduled_start_time DATETIME COMMENT 'Waktu mulai yang dijadwalkan',
    scheduled_end_time DATETIME COMMENT 'Waktu selesai yang dijadwalkan',
    actual_start_time DATETIME COMMENT 'Waktu mulai aktual',
    actual_end_time DATETIME COMMENT 'Waktu selesai aktual',
    hours_required DECIMAL(6,2) NOT NULL COMMENT 'Jam yang dibutuhkan untuk menyelesaikan',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal' COMMENT 'Prioritas antrian',
    status ENUM('waiting', 'in_progress', 'completed', 'paused', 'cancelled') DEFAULT 'waiting' COMMENT 'Status antrian',
    operator_id VARCHAR(100) COMMENT 'ID operator yang mengerjakan',
    operator_name VARCHAR(100) COMMENT 'Nama operator yang mengerjakan',
    setup_time DECIMAL(6,2) DEFAULT 0.00 COMMENT 'Waktu setup dalam jam',
    position INT NOT NULL DEFAULT 0 COMMENT 'Posisi dalam antrian (0 = sedang dikerjakan)',
    notes TEXT COMMENT 'Catatan tambahan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_queue_machine (machine_id),
    INDEX idx_queue_batch (batch_id),
    INDEX idx_queue_status (status),
    INDEX idx_queue_priority (priority),
    INDEX idx_queue_position (position),
    INDEX idx_queue_scheduled_start (scheduled_start_time),
    INDEX idx_queue_scheduled_end (scheduled_end_time)
) ENGINE=InnoDB COMMENT='Tabel antrian pekerjaan mesin';

-- Insert sample data untuk machines
INSERT IGNORE INTO machines (machine_id, name, type, manufacturer, model_number, capacity, capacity_unit, location, status, hours_per_day) VALUES
('MCH-001', 'CNC Mill 1', 'Milling Machine', 'Haas', 'VF-2', 100, 'parts/hour', 'Shop Floor A', 'operational', 8.00),
('MCH-002', 'Lathe 2', 'Turning Machine', 'Mazak', 'QT-200', 50, 'parts/hour', 'Shop Floor B', 'operational', 8.00),
('MCH-003', '3D Printer 1', 'Additive Manufacturing', 'Stratasys', 'F370', 10, 'parts/day', 'R&D Lab', 'operational', 24.00),
('MCH-004', 'Welding Station 1', 'Welding', 'Lincoln Electric', 'Power Wave S350', 20, 'joints/hour', 'Assembly Area', 'operational', 8.00),
('MCH-005', 'Press Machine 1', 'Forming', 'Schuler', 'PH-100', 200, 'parts/hour', 'Press Shop', 'maintenance', 8.00);

-- Insert sample data untuk machine_queues
INSERT IGNORE INTO machine_queues (queue_id, machine_id, batch_id, batch_number, product_name, step_name, hours_required, priority, status, position) VALUES
('QUEUE-001', 1, 1, 'BATCH-001', 'Product A', 'Milling', 4.00, 'normal', 'waiting', 1),
('QUEUE-002', 2, 2, 'BATCH-002', 'Product B', 'Turning', 2.00, 'high', 'waiting', 1),
('QUEUE-003', 1, 3, 'BATCH-003', 'Product C', 'Rough Milling', 6.00, 'normal', 'waiting', 2),
('QUEUE-004', 3, 4, 'BATCH-004', 'Prototype X', '3D Printing', 12.00, 'urgent', 'in_progress', 0),
('QUEUE-005', 4, 5, 'BATCH-005', 'Frame Assembly', 'Welding', 3.00, 'normal', 'waiting', 1);

-- Views untuk reporting
CREATE OR REPLACE VIEW v_machine_utilization AS
SELECT 
    m.id,
    m.machine_id,
    m.name,
    m.type,
    m.status,
    m.hours_per_day,
    COUNT(CASE WHEN mq.status IN ('waiting', 'in_progress') THEN 1 END) as pending_jobs,
    COUNT(CASE WHEN mq.status = 'in_progress' THEN 1 END) as active_jobs,
    SUM(CASE WHEN mq.status IN ('waiting', 'in_progress') THEN mq.hours_required ELSE 0 END) as total_pending_hours,
    ROUND(
        (SUM(CASE WHEN mq.status IN ('waiting', 'in_progress') THEN mq.hours_required ELSE 0 END) / m.hours_per_day) * 100, 
        2
    ) as utilization_percentage
FROM machines m
LEFT JOIN machine_queues mq ON m.id = mq.machine_id
WHERE m.status = 'operational'
GROUP BY m.id, m.machine_id, m.name, m.type, m.status, m.hours_per_day;

CREATE OR REPLACE VIEW v_queue_summary AS
SELECT 
    DATE(created_at) as queue_date,
    status,
    priority,
    COUNT(*) as count,
    SUM(hours_required) as total_hours,
    AVG(hours_required) as avg_hours
FROM machine_queues
WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY DATE(created_at), status, priority
ORDER BY queue_date DESC, priority DESC;

-- Stored procedures untuk operasi queue
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS sp_start_queue_item(
    IN p_queue_id VARCHAR(50),
    IN p_operator_id VARCHAR(100),
    IN p_operator_name VARCHAR(100)
)
BEGIN
    DECLARE v_machine_id INT;
    DECLARE v_queue_internal_id INT;
    DECLARE v_current_status VARCHAR(20);
    
    -- Get queue details
    SELECT id, machine_id, status INTO v_queue_internal_id, v_machine_id, v_current_status
    FROM machine_queues 
    WHERE queue_id = p_queue_id;
    
    -- Check if queue exists and is in waiting status
    IF v_queue_internal_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Queue item not found';
    END IF;
    
    IF v_current_status != 'waiting' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Queue item must be in waiting status to start';
    END IF;
    
    -- Check if machine has any active jobs
    IF EXISTS (
        SELECT 1 FROM machine_queues 
        WHERE machine_id = v_machine_id AND status = 'in_progress'
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Machine already has an active job';
    END IF;
    
    -- Start the queue item
    UPDATE machine_queues 
    SET 
        status = 'in_progress',
        actual_start_time = NOW(),
        position = 0,
        operator_id = p_operator_id,
        operator_name = p_operator_name,
        updated_at = NOW()
    WHERE id = v_queue_internal_id;
    
    SELECT 'Queue item started successfully' as message;
END$$

CREATE PROCEDURE IF NOT EXISTS sp_complete_queue_item(
    IN p_queue_id VARCHAR(50),
    IN p_notes TEXT
)
BEGIN
    DECLARE v_queue_internal_id INT;
    DECLARE v_machine_id INT;
    DECLARE v_current_status VARCHAR(20);
    
    -- Get queue details
    SELECT id, machine_id, status INTO v_queue_internal_id, v_machine_id, v_current_status
    FROM machine_queues 
    WHERE queue_id = p_queue_id;
    
    -- Check if queue exists and is in progress
    IF v_queue_internal_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Queue item not found';
    END IF;
    
    IF v_current_status != 'in_progress' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Queue item must be in progress to complete';
    END IF;
    
    -- Complete the queue item
    UPDATE machine_queues 
    SET 
        status = 'completed',
        actual_end_time = NOW(),
        notes = COALESCE(p_notes, notes),
        updated_at = NOW()
    WHERE id = v_queue_internal_id;
    
    -- Reorder remaining waiting items
    SET @pos = 0;
    UPDATE machine_queues 
    SET position = (@pos := @pos + 1)
    WHERE machine_id = v_machine_id 
    AND status = 'waiting'
    ORDER BY priority DESC, created_at ASC;
    
    SELECT 'Queue item completed successfully' as message;
END$$

DELIMITER ;

-- Triggers untuk audit log
CREATE TABLE IF NOT EXISTS machine_audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    machine_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_machine (machine_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_date (changed_at)
) ENGINE=InnoDB COMMENT='Log perubahan data mesin';

CREATE TABLE IF NOT EXISTS queue_audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    queue_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_queue (queue_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_date (changed_at)
) ENGINE=InnoDB COMMENT='Log perubahan data antrian';

-- Grant permissions (jika menggunakan user khusus untuk port 3308)
-- CREATE USER IF NOT EXISTS 'machine_queue_user'@'localhost' IDENTIFIED BY 'machine_queue_password';
-- GRANT ALL PRIVILEGES ON machine_queue_db.* TO 'machine_queue_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Commit changes
COMMIT;
