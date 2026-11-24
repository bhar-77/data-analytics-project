-- =====================================================================
-- TravelLens AI – Intelligent Travel Search and Price Analytics System
-- Comprehensive SQL Analytical Queries (queries.sql)
-- =====================================================================

USE travellens_db;

-- ---------------------------------------------------------------------
-- 1. BASIC SELECT, WHERE, ORDER BY
-- Find all direct economy flights from Bengaluru to Delhi under Rs 6000
-- ---------------------------------------------------------------------
SELECT 
    f.flight_number,
    a.name AS airline,
    f.departure_time,
    f.arrival_time,
    f.duration_hours,
    f.current_price
FROM flights f
INNER JOIN airlines a ON f.airline_id = a.id
INNER JOIN cities s ON f.source_city_id = s.id
INNER JOIN cities d ON f.destination_city_id = d.id
WHERE s.name = 'Bengaluru' 
  AND d.name = 'Delhi' 
  AND f.stops = 0 
  AND f.current_price < 6000.00
ORDER BY f.current_price ASC;

-- ---------------------------------------------------------------------
-- 2. GROUP BY, HAVING, AGGREGATES
-- Airlines offering more than 5 routes with an average ticket price < Rs 7500
-- ---------------------------------------------------------------------
SELECT 
    a.name AS airline_name,
    COUNT(f.id) AS flights_operated,
    ROUND(AVG(f.current_price), 2) AS average_fare,
    ROUND(MIN(f.current_price), 2) AS lowest_fare,
    ROUND(MAX(f.current_price), 2) AS peak_fare
FROM airlines a
INNER JOIN flights f ON a.id = f.airline_id
GROUP BY a.id, a.name
HAVING COUNT(f.id) >= 5 AND AVG(f.current_price) < 7500.00
ORDER BY average_fare ASC;

-- ---------------------------------------------------------------------
-- 3. INNER JOIN & LEFT JOIN COMPARISON
-- Compare flight and train alternatives for all city pairs
-- ---------------------------------------------------------------------
SELECT 
    s.name AS source_city,
    d.name AS destination_city,
    f.flight_number,
    f.current_price AS flight_price,
    f.duration_hours AS flight_duration,
    t.train_number,
    t.train_name,
    t.fare AS train_fare,
    t.duration_hours AS train_duration
FROM cities s
CROSS JOIN cities d
INNER JOIN flights f ON s.id = f.source_city_id AND d.id = f.destination_city_id
LEFT JOIN trains t ON s.id = t.source_city_id AND d.id = t.destination_city_id
WHERE s.id != d.id
ORDER BY s.name, d.name, f.current_price ASC;

-- ---------------------------------------------------------------------
-- 4. SUBQUERY
-- Find all flights priced lower than the overall route average price
-- ---------------------------------------------------------------------
SELECT 
    f.flight_number,
    a.name AS airline,
    s.name AS source_city,
    d.name AS destination_city,
    f.current_price,
    (SELECT ROUND(AVG(f2.current_price), 2) 
     FROM flights f2 
     WHERE f2.source_city_id = f.source_city_id 
       AND f2.destination_city_id = f.destination_city_id) AS route_average_price
FROM flights f
JOIN airlines a ON f.airline_id = a.id
JOIN cities s ON f.source_city_id = s.id
JOIN cities d ON f.destination_city_id = d.id
WHERE f.current_price < (
    SELECT AVG(f3.current_price) 
    FROM flights f3 
    WHERE f3.source_city_id = f.source_city_id 
      AND f3.destination_city_id = f.destination_city_id
)
ORDER BY f.current_price ASC;

-- ---------------------------------------------------------------------
-- 5. COMMON TABLE EXPRESSIONS (CTE)
-- Multi-tier CTE to rank routes by cost savings vs alternatives
-- ---------------------------------------------------------------------
WITH RouteStats AS (
    SELECT 
        s.name AS source,
        d.name AS destination,
        AVG(f.current_price) AS avg_flight_price,
        MIN(f.current_price) AS min_flight_price,
        COUNT(f.id) AS flight_count
    FROM flights f
    JOIN cities s ON f.source_city_id = s.id
    JOIN cities d ON f.destination_city_id = d.id
    GROUP BY s.name, d.name
),
TrainStats AS (
    SELECT 
        s.name AS source,
        d.name AS destination,
        AVG(t.fare) AS avg_train_fare,
        MIN(t.fare) AS min_train_fare
    FROM trains t
    JOIN cities s ON t.source_city_id = s.id
    JOIN cities d ON t.destination_city_id = d.id
    GROUP BY s.name, d.name
)
SELECT 
    r.source,
    r.destination,
    ROUND(r.avg_flight_price, 2) AS flight_avg,
    ROUND(r.min_flight_price, 2) AS flight_min,
    ROUND(t.avg_train_fare, 2) AS train_avg,
    ROUND(r.avg_flight_price - t.avg_train_fare, 2) AS flight_premium_over_train
FROM RouteStats r
LEFT JOIN TrainStats t ON r.source = t.source AND r.destination = t.destination
ORDER BY flight_premium_over_train DESC;

-- ---------------------------------------------------------------------
-- 6. WINDOW FUNCTIONS: DENSE_RANK() & ROW_NUMBER()
-- Find top 3 cheapest flights per route
-- ---------------------------------------------------------------------
WITH RankedFlights AS (
    SELECT 
        f.id,
        f.flight_number,
        a.name AS airline,
        s.name AS source_city,
        d.name AS destination_city,
        f.current_price,
        f.duration_hours,
        ROW_NUMBER() OVER(
            PARTITION BY f.source_city_id, f.destination_city_id 
            ORDER BY f.current_price ASC
        ) as price_rank
    FROM flights f
    JOIN airlines a ON f.airline_id = a.id
    JOIN cities s ON f.source_city_id = s.id
    JOIN cities d ON f.destination_city_id = d.id
)
SELECT * 
FROM RankedFlights 
WHERE price_rank <= 3;

-- ---------------------------------------------------------------------
-- 7. WINDOW FUNCTIONS: LAG() & LEAD()
-- Analyze historical price shifts and percentage change
-- ---------------------------------------------------------------------
SELECT 
    route_or_name,
    recorded_date,
    price,
    LAG(price, 1) OVER (
        PARTITION BY route_or_name ORDER BY recorded_date ASC
    ) AS previous_price,
    ROUND(
        ((price - LAG(price, 1) OVER (
            PARTITION BY route_or_name ORDER BY recorded_date ASC
        )) / LAG(price, 1) OVER (
            PARTITION BY route_or_name ORDER BY recorded_date ASC
        )) * 100, 2
    ) AS percentage_change
FROM price_history
WHERE category = 'flight'
ORDER BY route_or_name, recorded_date;

-- ---------------------------------------------------------------------
-- 8. WINDOW FUNCTION: MOVING AVERAGE
-- 7-day moving average of flight prices
-- ---------------------------------------------------------------------
SELECT 
    recorded_date,
    route_or_name,
    price,
    ROUND(
        AVG(price) OVER (
            PARTITION BY route_or_name 
            ORDER BY recorded_date 
            ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING
        ), 2
    ) AS rolling_avg_price
FROM price_history
WHERE category = 'flight';

-- ---------------------------------------------------------------------
-- 9. ANALYTICAL VIEW QUERIES
-- ---------------------------------------------------------------------
SELECT * FROM v_airline_performance ORDER BY avg_price ASC;
SELECT * FROM v_route_price_summary ORDER BY avg_flight_price ASC;
SELECT * FROM v_monthly_category_trends ORDER BY month_year, category;

-- ---------------------------------------------------------------------
-- 10. CRUD EXAMPLES (INSERT, UPDATE, DELETE)
-- ---------------------------------------------------------------------
-- Insert new search history record
INSERT INTO search_history (user_id, category, source_city, destination_city, travel_date, results_count)
VALUES (1, 'flight', 'Bengaluru', 'Delhi', '2026-12-01', 12);

-- Update seat availability and surge price on a flight
UPDATE flights 
SET current_price = current_price * 1.05, seats_available = seats_available - 1
WHERE id = 1 AND seats_available > 0;

-- Delete old search history older than 90 days
DELETE FROM search_history 
WHERE searched_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
