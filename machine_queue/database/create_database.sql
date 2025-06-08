-- Script untuk membuat database Machine Queue Service

-- Buat database
CREATE DATABASE IF NOT EXISTS machine_queue_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Gunakan database
USE machine_queue_db;

-- Buat user khusus untuk service ini (opsional)
-- CREATE USER IF NOT EXISTS 'machine_queue_user'@'localhost' IDENTIFIED BY 'machine_queue_password';
-- GRANT ALL PRIVILEGES ON machine_queue_db.* TO 'machine_queue_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Tabel akan dibuat otomatis oleh Sequelize
-- Script ini hanya untuk memastikan database sudah ada
