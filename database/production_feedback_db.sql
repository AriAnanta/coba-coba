-- =====================================================
-- PRODUCTION FEEDBACK SERVICE DATABASE
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS production_feedback_db;
USE production_feedback_db;

-- Drop existing tables
DROP TABLE IF EXISTS production_feedbacks;
DROP TABLE IF EXISTS feedback_notifications;
DROP TABLE IF EXISTS quantity_stock;

-- Production feedbacks table
CREATE TABLE production_feedbacks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    feedback_id VARCHAR(50) UNIQUE NOT NULL,
    batch_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    production_plan_id VARCHAR(50),
    status ENUM('pending', 'in_production', 'on_hold', 'completed', 'cancelled', 'rejected') NOT NULL DEFAULT 'pending',
    planned_quantity INT NOT NULL,
    actual_quantity INT,
    start_date DATETIME,
    end_date DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_feedback_id (feedback_id),
    INDEX idx_batch_id (batch_id),
    INDEX idx_status (status)
);
-- Feedback notifications table
CREATE TABLE feedback_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    notification_id VARCHAR(50) UNIQUE NOT NULL,
    feedback_id VARCHAR(50) NOT NULL,
    type ENUM('status_change', 'quality_issue', 'step_completion', 'comment', 'system') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES production_feedbacks(feedback_id) ON DELETE CASCADE,
    INDEX idx_notification_id (notification_id),
    INDEX idx_feedback (feedback_id),
    INDEX idx_type (type)
);

-- Quantity Stock table
CREATE TABLE quantity_stock (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    reorder_point INT,
    status ENUM('received', 'cancelled', 'in_transit', 'returned') NOT NULL DEFAULT 'received',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_name (product_name)
);

