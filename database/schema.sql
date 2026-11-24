-- =====================================================================
-- TravelLens AI – Intelligent Travel Search and Price Analytics System
-- Database Schema: travellens_db
-- Relational Database: MySQL 8.x
-- Compliance: 3rd Normal Form (3NF), Foreign Keys, Indexes, Constraints
-- =====================================================================

CREATE DATABASE IF NOT EXISTS travellens_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE travellens_db;

-- Disable foreign key checks for clean tear-down if re-running
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS data_cleaning_logs;
DROP TABLE IF EXISTS uploaded_datasets;
DROP TABLE IF EXISTS search_history;
DROP TABLE IF EXISTS predictions;
DROP TABLE IF EXISTS price_history;
DROP TABLE IF EXISTS buses;
DROP TABLE IF EXISTS trains;
DROP TABLE IF EXISTS hotels;
DROP TABLE IF EXISTS flights;
DROP TABLE IF EXISTS airlines;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS users;

DROP VIEW IF EXISTS v_airline_performance;
DROP VIEW IF EXISTS v_route_price_summary;
DROP VIEW IF EXISTS v_monthly_category_trends;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. Table: users
-- User accounts for authentication and personalized searches
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user', 'analyst') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_username (username)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. Table: cities
-- Normalized major Indian travel hubs
-- ---------------------------------------------------------------------
CREATE TABLE cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    state VARCHAR(50) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    popular_attractions TEXT,
    tier ENUM('Metro', 'Tier-1', 'Tier-2') DEFAULT 'Metro',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_city_code (code),
    INDEX idx_city_name (name)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. Table: airlines
-- Normalized airline operators
-- ---------------------------------------------------------------------
CREATE TABLE airlines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    iata_code VARCHAR(10) NOT NULL UNIQUE,
    country VARCHAR(50) DEFAULT 'India',
    rating DECIMAL(3, 2) DEFAULT 4.00,
    fleet_size INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_airline_iata (iata_code),
    INDEX idx_airline_name (name)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. Table: flights
-- Flight schedules, routes, seat classes, and pricing
-- ---------------------------------------------------------------------
CREATE TABLE flights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    airline_id INT NOT NULL,
    source_city_id INT NOT NULL,
    destination_city_id INT NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    duration_hours DECIMAL(4, 2) NOT NULL,
    stops INT DEFAULT 0,
    travel_class ENUM('Economy', 'Premium Economy', 'Business') DEFAULT 'Economy',
    base_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    journey_date DATE NOT NULL,
    days_left INT DEFAULT 15,
    seats_available INT DEFAULT 60,
    data_source VARCHAR(50) DEFAULT 'Historical Flight Dataset',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_flight_airline FOREIGN KEY (airline_id) REFERENCES airlines(id) ON DELETE CASCADE,
    CONSTRAINT fk_flight_source FOREIGN KEY (source_city_id) REFERENCES cities(id) ON DELETE RESTRICT,
    CONSTRAINT fk_flight_dest FOREIGN KEY (destination_city_id) REFERENCES cities(id) ON DELETE RESTRICT,
    INDEX idx_flight_route (source_city_id, destination_city_id),
    INDEX idx_flight_journey_date (journey_date),
    INDEX idx_flight_price (current_price),
    INDEX idx_flight_airline (airline_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. Table: hotels
-- Hotel listings, room prices, amenities, ratings
-- ---------------------------------------------------------------------
CREATE TABLE hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city_id INT NOT NULL,
    star_rating DECIMAL(2, 1) NOT NULL,
    user_rating DECIMAL(3, 2) DEFAULT 4.2,
    price_per_night DECIMAL(10, 2) NOT NULL,
    address VARCHAR(255) NOT NULL,
    amenities TEXT,
    available_rooms INT DEFAULT 15,
    data_source VARCHAR(50) DEFAULT 'Travel Portal Aggregation',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_hotel_city FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_hotel_city (city_id),
    INDEX idx_hotel_price (price_per_night),
    INDEX idx_hotel_rating (star_rating)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. Table: trains
-- Indian Railways (IRCTC) routes, Vande Bharat, Rajdhani, fares
-- ---------------------------------------------------------------------
CREATE TABLE trains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_number VARCHAR(20) NOT NULL,
    train_name VARCHAR(100) NOT NULL,
    source_city_id INT NOT NULL,
    destination_city_id INT NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    duration_hours DECIMAL(4, 2) NOT NULL,
    travel_class VARCHAR(20) NOT NULL,
    fare DECIMAL(10, 2) NOT NULL,
    runs_on_days VARCHAR(50) DEFAULT 'Daily',
    data_source VARCHAR(50) DEFAULT 'Indian Railways Portal',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_train_source FOREIGN KEY (source_city_id) REFERENCES cities(id) ON DELETE RESTRICT,
    CONSTRAINT fk_train_dest FOREIGN KEY (destination_city_id) REFERENCES cities(id) ON DELETE RESTRICT,
    INDEX idx_train_route (source_city_id, destination_city_id),
    INDEX idx_train_fare (fare)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. Table: buses
-- Intercity bus routes, operators, luxury coach fares
-- ---------------------------------------------------------------------
CREATE TABLE buses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operator_name VARCHAR(100) NOT NULL,
    bus_type VARCHAR(60) NOT NULL,
    source_city_id INT NOT NULL,
    destination_city_id INT NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    duration_hours DECIMAL(4, 2) NOT NULL,
    ticket_price DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 4.10,
    data_source VARCHAR(50) DEFAULT 'Bus Aggregator Portal',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bus_source FOREIGN KEY (source_city_id) REFERENCES cities(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bus_dest FOREIGN KEY (destination_city_id) REFERENCES cities(id) ON DELETE RESTRICT,
    INDEX idx_bus_route (source_city_id, destination_city_id),
    INDEX idx_bus_price (ticket_price)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. Table: price_history
-- Multi-month historical price time-series for trend analytics
-- ---------------------------------------------------------------------
CREATE TABLE price_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('flight', 'hotel', 'train', 'bus') NOT NULL,
    item_id INT NOT NULL,
    route_or_name VARCHAR(100) NOT NULL,
    recorded_date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    surge_multiplier DECIMAL(4, 2) DEFAULT 1.00,
    is_weekend BOOLEAN DEFAULT FALSE,
    season VARCHAR(60) DEFAULT 'Normal',
    INDEX idx_history_date (recorded_date),
    INDEX idx_history_cat (category),
    INDEX idx_history_route (route_or_name)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. Table: predictions
-- Genuine machine learning prediction logs
-- ---------------------------------------------------------------------
CREATE TABLE predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    airline_name VARCHAR(50) NOT NULL,
    source_city VARCHAR(50) NOT NULL,
    destination_city VARCHAR(50) NOT NULL,
    journey_date DATE NOT NULL,
    travel_class VARCHAR(30) NOT NULL DEFAULT 'Economy',
    stops INT DEFAULT 0,
    duration_hours DECIMAL(4, 2) NOT NULL,
    predicted_price DECIMAL(10, 2) NOT NULL,
    model_version VARCHAR(50) DEFAULT 'RandomForestRegressor_v1.0',
    confidence_score DECIMAL(5, 4) DEFAULT 0.9250,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pred_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_pred_route (source_city, destination_city),
    INDEX idx_pred_date (journey_date)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. Table: search_history
-- Log of user search activity
-- ---------------------------------------------------------------------
CREATE TABLE search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    category ENUM('flight', 'hotel', 'train', 'bus') NOT NULL,
    source_city VARCHAR(50),
    destination_city VARCHAR(50) NOT NULL,
    travel_date DATE,
    results_count INT DEFAULT 0,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_search_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_search_time (searched_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. Table: uploaded_datasets
-- Tracks all uploaded raw and processed travel datasets
-- ---------------------------------------------------------------------
CREATE TABLE uploaded_datasets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_size_bytes INT NOT NULL,
    records_count INT NOT NULL,
    dataset_type VARCHAR(50) NOT NULL,
    source VARCHAR(100) DEFAULT 'Uploaded File / API',
    upload_status VARCHAR(50) DEFAULT 'Completed',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 12. Table: data_cleaning_logs
-- Detailed audit trail of ETL transformation operations
-- ---------------------------------------------------------------------
CREATE TABLE data_cleaning_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dataset_id INT NULL,
    operation VARCHAR(100) NOT NULL,
    raw_records INT NOT NULL,
    null_values_fixed INT NOT NULL,
    duplicates_removed INT NOT NULL,
    outliers_detected INT NOT NULL,
    cleaned_records INT NOT NULL,
    cleaning_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_clean_dataset FOREIGN KEY (dataset_id) REFERENCES uploaded_datasets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- Analytical Views for High-Performance Queries & Power BI
-- =====================================================================

-- View 1: Airline Performance & Pricing Metrics
CREATE OR REPLACE VIEW v_airline_performance AS
SELECT 
    a.name AS airline_name,
    a.iata_code,
    COUNT(f.id) AS total_flights,
    ROUND(AVG(f.current_price), 2) AS avg_price,
    ROUND(MIN(f.current_price), 2) AS min_price,
    ROUND(MAX(f.current_price), 2) AS max_price,
    ROUND(AVG(f.duration_hours), 2) AS avg_duration_hours
FROM airlines a
JOIN flights f ON a.id = f.airline_id
GROUP BY a.id, a.name, a.iata_code;

-- View 2: Route Price Summary Across All Modes
CREATE OR REPLACE VIEW v_route_price_summary AS
SELECT 
    c1.name AS source_city,
    c2.name AS destination_city,
    CONCAT(c1.name, ' -> ', c2.name) AS route_label,
    ROUND(AVG(f.current_price), 2) AS avg_flight_price,
    ROUND(MIN(f.current_price), 2) AS min_flight_price,
    COUNT(DISTINCT f.id) AS flight_options
FROM flights f
JOIN cities c1 ON f.source_city_id = c1.id
JOIN cities c2 ON f.destination_city_id = c2.id
GROUP BY c1.id, c2.id, c1.name, c2.name;

-- View 3: Monthly Category Price Trends
CREATE OR REPLACE VIEW v_monthly_category_trends AS
SELECT 
    category,
    DATE_FORMAT(recorded_date, '%Y-%m') AS month_year,
    ROUND(AVG(price), 2) AS avg_price,
    ROUND(MIN(price), 2) AS min_price,
    ROUND(MAX(price), 2) AS max_price,
    COUNT(*) AS sample_count
FROM price_history
GROUP BY category, DATE_FORMAT(recorded_date, '%Y-%m')
ORDER BY month_year ASC;
