import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.database import get_db
from backend.schemas import QueryRequest

router = APIRouter(prefix="/api/sql", tags=["SQL Explorer & Analytics"])

PREDEFINED_QUERIES = [
    {
        "id": "q1_airline_avg",
        "title": "Airline Fare Ranking & Performance",
        "category": "Aggregations & Group By",
        "description": "Calculates average, minimum, and peak ticket prices for all domestic airlines, filtered by airlines with at least 5 flights.",
        "sql": """
SELECT 
    a.name AS airline_name,
    COUNT(f.id) AS total_flights,
    ROUND(AVG(f.current_price), 2) AS average_fare,
    ROUND(MIN(f.current_price), 2) AS lowest_fare,
    ROUND(MAX(f.current_price), 2) AS peak_fare
FROM airlines a
JOIN flights f ON a.id = f.airline_id
GROUP BY a.id, a.name
HAVING COUNT(f.id) >= 5
ORDER BY average_fare ASC;
        """.strip()
    },
    {
        "id": "q2_cheapest_vs_expensive",
        "title": "Route Price Extremes & Range",
        "category": "Route Analytics",
        "description": "Finds the routes with the widest price gap between budget options and luxury offerings.",
        "sql": """
SELECT 
    sc.name AS source_city,
    dc.name AS destination_city,
    ROUND(MIN(f.current_price), 2) AS min_fare,
    ROUND(MAX(f.current_price), 2) AS max_fare,
    ROUND(MAX(f.current_price) - MIN(f.current_price), 2) AS price_spread,
    ROUND(AVG(f.current_price), 2) AS avg_fare
FROM flights f
JOIN cities sc ON f.source_city_id = sc.id
JOIN cities dc ON f.destination_city_id = dc.id
GROUP BY sc.name, dc.name
ORDER BY price_spread DESC
LIMIT 12;
        """.strip()
    },
    {
        "id": "q3_cte_flight_vs_train",
        "title": "Multi-tier CTE: Flight vs Train Savings",
        "category": "Common Table Expressions",
        "description": "Uses Common Table Expressions (CTEs) to compute flight and train averages per route and evaluate the flight speed premium.",
        "sql": """
WITH RouteFlights AS (
    SELECT 
        sc.name AS source,
        dc.name AS destination,
        ROUND(AVG(f.current_price), 2) AS avg_flight_price,
        ROUND(MIN(f.current_price), 2) AS min_flight_price
    FROM flights f
    JOIN cities sc ON f.source_city_id = sc.id
    JOIN cities dc ON f.destination_city_id = dc.id
    GROUP BY sc.name, dc.name
),
RouteTrains AS (
    SELECT 
        sc.name AS source,
        dc.name AS destination,
        ROUND(AVG(t.fare), 2) AS avg_train_fare,
        ROUND(MIN(t.fare), 2) AS min_train_fare
    FROM trains t
    JOIN cities sc ON t.source_city_id = sc.id
    JOIN cities dc ON t.destination_city_id = dc.id
    GROUP BY sc.name, dc.name
)
SELECT 
    rf.source,
    rf.destination,
    rf.avg_flight_price,
    rt.avg_train_fare,
    ROUND(rf.avg_flight_price - rt.avg_train_fare, 2) AS flight_premium_over_train
FROM RouteFlights rf
INNER JOIN RouteTrains rt ON rf.source = rt.source AND rf.destination = rt.destination
ORDER BY flight_premium_over_train ASC;
        """.strip()
    },
    {
        "id": "q4_window_ranked_flights",
        "title": "Window Function: Top 2 Bargains Per Route",
        "category": "Window Functions",
        "description": "Uses ROW_NUMBER() OVER (PARTITION BY route ORDER BY price) to pick the top 2 lowest priced flights on each city pair.",
        "sql": """
WITH RankedFlights AS (
    SELECT 
        f.flight_number,
        a.name AS airline,
        sc.name AS source_city,
        dc.name AS destination_city,
        f.current_price,
        f.duration_hours,
        ROW_NUMBER() OVER(
            PARTITION BY f.source_city_id, f.destination_city_id 
            ORDER BY f.current_price ASC
        ) as price_rank
    FROM flights f
    JOIN airlines a ON f.airline_id = a.id
    JOIN cities sc ON f.source_city_id = sc.id
    JOIN cities dc ON f.destination_city_id = dc.id
)
SELECT 
    flight_number, airline, source_city, destination_city, current_price, duration_hours, price_rank
FROM RankedFlights
WHERE price_rank <= 2
ORDER BY source_city, destination_city, price_rank;
        """.strip()
    },
    {
        "id": "q5_window_lag_shift",
        "title": "Window Function: Historical Price Shifts (LAG)",
        "category": "Window Functions",
        "description": "Calculates day-over-day price adjustments and percentage change using the LAG() analytical window function.",
        "sql": """
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
ORDER BY route_or_name, recorded_date ASC
LIMIT 30;
        """.strip()
    },
    {
        "id": "q6_subquery_below_avg",
        "title": "Correlated Subquery: Flights Below Route Average",
        "category": "Subqueries",
        "description": "Finds flight options priced at least 20% lower than the aggregate route mean.",
        "sql": """
SELECT 
    f.flight_number,
    a.name AS airline,
    sc.name AS source,
    dc.name AS destination,
    f.current_price,
    (SELECT ROUND(AVG(f2.current_price), 2)
     FROM flights f2
     WHERE f2.source_city_id = f.source_city_id AND f2.destination_city_id = f.destination_city_id) AS route_avg_price
FROM flights f
JOIN airlines a ON f.airline_id = a.id
JOIN cities sc ON f.source_city_id = sc.id
JOIN cities dc ON f.destination_city_id = dc.id
WHERE f.current_price < (
    SELECT AVG(f3.current_price) * 0.85
    FROM flights f3
    WHERE f3.source_city_id = f.source_city_id AND f3.destination_city_id = f.destination_city_id
)
ORDER BY f.current_price ASC
LIMIT 20;
        """.strip()
    },
    {
        "id": "q7_monthly_category_trends",
        "title": "Analytical View: Monthly Travel Category Index",
        "category": "Views & Group By",
        "description": "Queries the predefined view v_monthly_category_trends for multi-month cross-modal fare trajectories.",
        "sql": """
SELECT 
    month_year,
    category,
    avg_price,
    min_price,
    max_price,
    sample_count
FROM v_monthly_category_trends
ORDER BY month_year ASC, category ASC;
        """.strip()
    }
]

@router.get("/predefined")
def get_predefined_queries():
    """Returns catalog of educational and analytical SQL queries."""
    return PREDEFINED_QUERIES

@router.post("/execute")
def execute_sql_query(req: QueryRequest, db: Session = Depends(get_db)):
    """
    Executes validated, read-only SQL queries and returns tabular results with execution metrics.
    """
    clean_sql = req.query.strip().rstrip(";")
    upper_sql = clean_sql.upper()

    # Security check: strictly read-only execution
    forbidden_keywords = ["DROP", "DELETE", "TRUNCATE", "ALTER", "CREATE", "INSERT", "UPDATE", "GRANT", "REVOKE"]
    for kw in forbidden_keywords:
        # Check whole word boundary
        if f" {kw} " in f" {upper_sql} ":
            raise HTTPException(
                status_code=400,
                detail=f"Security restriction: Operation '{kw}' is not permitted. Only validated read-only SQL queries (SELECT, WITH, SHOW, EXPLAIN) are permitted."
            )

    start_time = time.time()
    try:
        result = db.execute(text(clean_sql))
        execution_time_ms = round((time.time() - start_time) * 1000, 2)

        if result.returns_rows:
            columns = list(result.keys())
            rows = result.fetchall()
            row_data = [dict(zip(columns, [float(v) if hasattr(v, 'as_integer_ratio') else str(v) if v is not None else None for v in r])) for r in rows]
            return {
                "columns": columns,
                "rows": row_data,
                "row_count": len(row_data),
                "execution_time_ms": execution_time_ms,
                "status": "success"
            }
        else:
            return {
                "columns": [],
                "rows": [],
                "row_count": 0,
                "execution_time_ms": execution_time_ms,
                "status": "success",
                "message": "Query executed successfully with 0 rows returned."
            }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"SQL Execution Error: {str(e)}"
        )
