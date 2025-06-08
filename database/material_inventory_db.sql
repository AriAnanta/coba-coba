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
    status ENUM('active', 'inactive', 'discontinued') NOT NULL DEFAULT 'active',
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
    type ENUM('Receipt', 'Issue', 'Adjustment', 'Return', 'Transfer', 'Scrap') NOT NULL,
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
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_type (type),
    INDEX idx_material (material_id),
    INDEX idx_date (transaction_date)
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
('TXN-010', 'Receipt', 9, 50.000, 'Pieces (pcs)', now() - INTERVAL 1 DAY, 9, 'PO-2024-005', 15000.00, 750000.00, 'Stok spare part seal', 'admin');
