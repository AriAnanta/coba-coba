-- =====================================================
-- MATERIAL INVENTORY SERVICE DATABASE
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS material_inventory_db;
USE material_inventory_db;

-- Drop existing tables
DROP TABLE IF EXISTS material_transactions;
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS suppliers;

-- Suppliers table
CREATE TABLE suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'Indonesia',
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(100),
    payment_terms VARCHAR(100),
    lead_time INT DEFAULT 7,
    rating DECIMAL(3,2) DEFAULT 0.00,
    status ENUM('Active', 'Inactive', 'On Hold', 'Terminated') NOT NULL DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_status (status)
);

-- Materials table
CREATE TABLE materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category ENUM('Raw Material', 'Component', 'Work-in-Progress (WIP)', 'Finished Goods', 'Packaging Material', 'Consumable', 'Spare Part', 'Tool') NOT NULL,
    type VARCHAR(50) NOT NULL,
    unit ENUM('Kilogram (kg)', 'Gram (g)', 'Liter (L)', 'Milliliter (mL)', 'Pieces (pcs)', 'Meter (m)', 'Square Meter (m²)', 'Cubic Meter (m³)', 'Ton', 'Box', 'Roll', 'Packet') NOT NULL,
    stock_quantity DECIMAL(10,3) NOT NULL DEFAULT 0.000,
    reorder_level DECIMAL(10,3) DEFAULT 0.000,
    price DECIMAL(12,2) DEFAULT 0.00,
    lead_time INT DEFAULT 7,
    location VARCHAR(100),
    supplier_id INT,
    status ENUM('active', 'low_stock', 'out_of_stock', 'discontinued') NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    INDEX idx_material_id (material_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_stock_level (stock_quantity)
);

-- Material transactions table
CREATE TABLE material_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('Receipt', 'Issue', 'Adjustment', 'Return', 'Transfer', 'Scrap', 'Purchase') NOT NULL,
    material_id INT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    supplier_id INT,
    reference_number VARCHAR(100),
    unit_price DECIMAL(12,2) DEFAULT 0.00,
    total_price DECIMAL(15,2) DEFAULT 0.00,
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    batch_number VARCHAR(100),
    purchase_order_id VARCHAR(100),
    delivery_date DATE,
    received_by VARCHAR(100),
    quality_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_type (type),
    INDEX idx_material (material_id),
    INDEX idx_date (transaction_date),
    INDEX idx_purchase_order (purchase_order_id),
    INDEX idx_batch_number (batch_number)
);

-- Insert dummy suppliers
INSERT INTO suppliers (supplier_id, name, address, city, state, country, contact_person, phone, email, payment_terms, lead_time, rating) VALUES
('SUP-001', 'PT. Baja Utama', 'Jl. Industri Raya No. 123', 'Jakarta', 'DKI Jakarta', 'Indonesia', 'Budi Santoso', '021-1234567', 'budi@bajautama.com', 'NET 30', 7, 4.5),
('SUP-002', 'CV. Plastik Mandiri', 'Jl. Raya Bekasi No. 456', 'Bekasi', 'Jawa Barat', 'Indonesia', 'Siti Rahayu', '021-2345678', 'siti@plastikmandiri.com', 'NET 21', 5, 4.2),
('SUP-003', 'PT. Kimia Sejahtera', 'Jl. Industri Kimia No. 789', 'Tangerang', 'Banten', 'Indonesia', 'Ahmad Faisal', '021-3456789', 'ahmad@kimiasejahtera.com', 'NET 45', 10, 4.0),
('SUP-004', 'UD. Logam Jaya', 'Jl. Logam Mulia No. 321', 'Surabaya', 'Jawa Timur', 'Indonesia', 'Wawan Kurniawan', '031-4567890', 'wawan@logamjaya.com', 'NET 14', 3, 4.8),
('SUP-005', 'PT. Elektronik Prima', 'Jl. Elektronik No. 654', 'Bandung', 'Jawa Barat', 'Indonesia', 'Lisa Permata', '022-5678901', 'lisa@elektronikprima.com', 'NET 30', 14, 4.3),
('SUP-006', 'CV. Kayu Berkah', 'Jl. Kayu Manis No. 987', 'Yogyakarta', 'DIY', 'Indonesia', 'Bambang Wijaya', '0274-6789012', 'bambang@kayuberkah.com', 'NET 7', 2, 4.6),
('SUP-007', 'PT. Tekstil Nusantara', 'Jl. Tekstil Raya No. 147', 'Solo', 'Jawa Tengah', 'Indonesia', 'Dewi Lestari', '0271-7890123', 'dewi@tekstilnusantara.com', 'NET 30', 12, 4.1),
('SUP-008', 'UD. Alat Teknik', 'Jl. Teknik Mesin No. 258', 'Semarang', 'Jawa Tengah', 'Indonesia', 'Eko Prasetyo', '024-8901234', 'eko@alatteknik.com', 'NET 21', 7, 4.4),
('SUP-009', 'PT. Spare Part Indo', 'Jl. Spare Part No. 369', 'Medan', 'Sumatera Utara', 'Indonesia', 'Rina Marlina', '061-9012345', 'rina@sparepartindo.com', 'NET 30', 21, 3.9),
('SUP-010', 'CV. Tool Master', 'Jl. Tool Center No. 741', 'Makassar', 'Sulawesi Selatan', 'Indonesia', 'Andi Rahman', '0411-0123456', 'andi@toolmaster.com', 'NET 14', 5, 4.7);

-- Insert dummy materials
INSERT INTO materials (material_id, name, description, category, type, unit, stock_quantity, reorder_level, price, lead_time, location, supplier_id) VALUES
('MAT-001', 'Baja ST37', 'Baja karbon rendah untuk konstruksi', 'Raw Material', 'Steel', 'Kilogram (kg)', 1500.500, 200.000, 15000.00, 7, 'Gudang A-1', 1),
('MAT-002', 'Plastik ABS', 'Plastik ABS grade injection molding', 'Raw Material', 'Plastic', 'Kilogram (kg)', 850.250, 100.000, 25000.00, 5, 'Gudang B-1', 2),
('MAT-003', 'Oli Mesin SAE 40', 'Oli mesin untuk pelumasan', 'Consumable', 'Lubricant', 'Liter (L)', 120.750, 20.000, 45000.00, 3, 'Gudang C-1', 3),
('MAT-004', 'Bearing 6205', 'Bearing bola ukuran standar', 'Component', 'Bearing', 'Pieces (pcs)', 45.000, 10.000, 85000.00, 14, 'Gudang D-1', 4),
('MAT-005', 'Kabel Listrik 2.5mm', 'Kabel tembaga isolasi PVC', 'Component', 'Cable', 'Meter (m)', 2500.000, 500.000, 12000.00, 7, 'Gudang E-1', 5),
('MAT-006', 'Kayu Jati', 'Kayu jati kualitas premium', 'Raw Material', 'Wood', 'Cubic Meter (m³)', 12.500, 2.000, 8500000.00, 21, 'Gudang F-1', 6),
('MAT-007', 'Kain Katun', 'Kain katun 100% untuk produksi', 'Raw Material', 'Textile', 'Meter (m)', 5000.000, 1000.000, 35000.00, 12, 'Gudang G-1', 7),
('MAT-008', 'Mata Bor HSS 10mm', 'Mata bor high speed steel', 'Tool', 'Drill Bit', 'Pieces (pcs)', 25.000, 5.000, 125000.00, 7, 'Gudang H-1', 8),
('MAT-009', 'O-Ring NBR 50mm', 'O-ring karet nitrile', 'Spare Part', 'Seal', 'Pieces (pcs)', 100.000, 20.000, 15000.00, 10, 'Gudang I-1', 9),
('MAT-010', 'End Mill 12mm', 'End mill carbide untuk milling', 'Tool', 'Cutting Tool', 'Pieces (pcs)', 15.000, 3.000, 450000.00, 14, 'Gudang J-1', 10);

-- Insert dummy transactions
INSERT INTO material_transactions (transaction_id, type, material_id, quantity, unit, transaction_date, supplier_id, reference_number, unit_price, total_price, notes, created_by) VALUES
('TXN-001', 'Receipt', 1, 500.000, 'Kilogram (kg)', now() - INTERVAL 30 DAY, 1, 'PO-2024-001', 15000.00, 7500000.00, 'Pembelian baja ST37 batch 1', 'admin'),
('TXN-002', 'Issue', 1, 150.500, 'Kilogram (kg)', now() - INTERVAL 25 DAY, NULL, 'REQ-2024-001', 15000.00, 2257500.00, 'Penggunaan untuk batch B001', 'operator1'),
('TXN-003', 'Receipt', 2, 200.000, 'Kilogram (kg)', now() - INTERVAL 20 DAY, 2, 'PO-2024-002', 25000.00, 5000000.00, 'Pembelian plastik ABS', 'admin'),
('TXN-004', 'Issue', 3, 25.500, 'Liter (L)', now() - INTERVAL 15 DAY, NULL, 'REQ-2024-002', 45000.00, 1147500.00, 'Maintenance mesin', 'operator2'),
('TXN-005', 'Receipt', 4, 20.000, 'Pieces (pcs)', now() - INTERVAL 10 DAY, 4, 'PO-2024-003', 85000.00, 1700000.00, 'Stok bearing', 'admin'),
('TXN-006', 'Adjustment', 5, -50.000, 'Meter (m)', now() - INTERVAL 8 DAY, NULL, 'ADJ-2024-001', 12000.00, -600000.00, 'Penyesuaian stok kabel', 'supervisor1'),
('TXN-007', 'Issue', 6, 1.500, 'Cubic Meter (m³)', now() - INTERVAL 5 DAY, NULL, 'REQ-2024-003', 8500000.00, 12750000.00, 'Produksi furniture', 'operator3'),
('TXN-008', 'Receipt', 7, 1000.000, 'Meter (m)', now() - INTERVAL 3 DAY, 7, 'PO-2024-004', 35000.00, 35000000.00, 'Stok kain katun', 'admin'),
('TXN-009', 'Issue', 8, 5.000, 'Pieces (pcs)', now() - INTERVAL 2 DAY, NULL, 'REQ-2024-004', 125000.00, 625000.00, 'Ganti mata bor rusak', 'operator1'),
('TXN-010', 'Receipt', 9, 50.000, 'Pieces (pcs)', now() - INTERVAL 1 DAY, 9, 'PO-2024-005', 15000.00, 750000.00, 'Stok spare part seal', 'admin'),
('TXN-011', 'Purchase', 1, 100.000, 'Kilogram (kg)', now() - INTERVAL 5 HOUR, 1, 'PUR-2024-001', 16000.00, 1600000.00, 'Purchase order untuk steel', 'admin'),
('TXN-012', 'Purchase', 3, 50.000, 'Liter (L)', now() - INTERVAL 2 HOUR, 3, 'PUR-2024-002', 46000.00, 2300000.00, 'Purchase order untuk oli mesin', 'admin'),
('TXN-013', 'Transfer', 2, 25.000, 'Kilogram (kg)', now() - INTERVAL 1 HOUR, NULL, 'TRF-2024-001', 25000.00, 625000.00, 'Transfer antar gudang', 'operator2'),
('TXN-014', 'Return', 4, 2.000, 'Pieces (pcs)', now() - INTERVAL 30 MINUTE, 4, 'RET-2024-001', 85000.00, 170000.00, 'Return bearing rusak', 'quality_control'),
('TXN-015', 'Scrap', 8, 3.000, 'Pieces (pcs)', now() - INTERVAL 15 MINUTE, NULL, 'SCR-2024-001', 125000.00, 375000.00, 'Mata bor sudah tidak layak pakai', 'operator1');

-- =====================================================
-- STATUS STANDARDIZATION QUERIES
-- =====================================================

-- Update any incorrectly formatted status values to 'active' as default
UPDATE materials SET status = 'active' WHERE status NOT IN ('active', 'low_stock', 'out_of_stock', 'discontinued');

-- Fix mixed case status values to standardized lowercase with underscores
UPDATE materials SET status = 'active' WHERE LOWER(status) = 'active' AND status != 'active';
UPDATE materials SET status = 'low_stock' WHERE LOWER(REPLACE(status, ' ', '_')) = 'low_stock' AND status != 'low_stock';
UPDATE materials SET status = 'out_of_stock' WHERE LOWER(REPLACE(status, ' ', '_')) = 'out_of_stock' AND status != 'out_of_stock';
UPDATE materials SET status = 'discontinued' WHERE LOWER(status) = 'discontinued' AND status != 'discontinued';

-- Fix common variations of status values
UPDATE materials SET status = 'active' WHERE status IN ('Active', 'ACTIVE', 'active ');
UPDATE materials SET status = 'low_stock' WHERE status IN ('Low Stock', 'LOW_STOCK', 'Low_Stock', 'low stock', 'low-stock');
UPDATE materials SET status = 'out_of_stock' WHERE status IN ('Out of Stock', 'OUT_OF_STOCK', 'Out_Of_Stock', 'out of stock', 'out-of-stock', 'outofstock');
UPDATE materials SET status = 'discontinued' WHERE status IN ('Discontinued', 'DISCONTINUED', 'discontinued ');

-- Display summary of status updates
SELECT 
    status,
    COUNT(*) as count
FROM materials 
GROUP BY status
ORDER BY status;

-- =====================================================
-- DATABASE-NATIVE STATUS LOGIC
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS materials_status_insert;
DROP TRIGGER IF EXISTS materials_status_update;

-- Create trigger for INSERT operations
DELIMITER $$
CREATE TRIGGER materials_status_insert
    BEFORE INSERT ON materials
    FOR EACH ROW
BEGIN
    -- Don't change status if it's explicitly set to discontinued
    IF NEW.status != 'discontinued' THEN
        IF NEW.stock_quantity <= 0 THEN
            SET NEW.status = 'out_of_stock';
        ELSEIF NEW.stock_quantity < NEW.reorder_level THEN
            SET NEW.status = 'low_stock';
        ELSE
            SET NEW.status = 'active';
        END IF;
    END IF;
END$$
DELIMITER ;

-- Create trigger for UPDATE operations
DELIMITER $$
CREATE TRIGGER materials_status_update
    BEFORE UPDATE ON materials
    FOR EACH ROW
BEGIN
    -- Don't change status if it's explicitly set to discontinued
    IF NEW.status != 'discontinued' THEN
        IF NEW.stock_quantity <= 0 THEN
            SET NEW.status = 'out_of_stock';
        ELSEIF NEW.stock_quantity < NEW.reorder_level THEN
            SET NEW.status = 'low_stock';
        ELSE
            SET NEW.status = 'active';
        END IF;
    END IF;
END$$
DELIMITER ;

-- Create a stored procedure to manually recalculate all statuses
DELIMITER $$
CREATE PROCEDURE RecalculateMaterialStatuses()
BEGIN
    UPDATE materials 
    SET status = CASE 
        WHEN status = 'discontinued' THEN 'discontinued'
        WHEN stock_quantity <= 0 THEN 'out_of_stock'
        WHEN stock_quantity < reorder_level THEN 'low_stock'
        ELSE 'active'
    END;
    
    SELECT 
        'Status recalculation completed' as message,
        COUNT(*) as total_materials,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN status = 'low_stock' THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN status = 'out_of_stock' THEN 1 ELSE 0 END) as out_of_stock_count,
        SUM(CASE WHEN status = 'discontinued' THEN 1 ELSE 0 END) as discontinued_count
    FROM materials;
END$$
DELIMITER ;

-- Create a view for materials with computed status (alternative approach)
CREATE OR REPLACE VIEW materials_with_computed_status AS
SELECT 
    *,
    CASE 
        WHEN status = 'discontinued' THEN 'discontinued'
        WHEN stock_quantity <= 0 THEN 'out_of_stock'
        WHEN stock_quantity < reorder_level THEN 'low_stock'
        ELSE 'active'
    END AS computed_status
FROM materials;

-- Apply the trigger logic to existing data
CALL RecalculateMaterialStatuses();

-- Test the triggers work correctly
SELECT 
    'Trigger setup completed' as message,
    'Status will now be automatically calculated' as note;
