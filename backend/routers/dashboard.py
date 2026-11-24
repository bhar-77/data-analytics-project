from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from backend.database import get_db
from backend.models import Flight, Hotel, Train, Bus, City, Airline, PriceHistory, SearchHistory

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard Analytics"])

@router.get("/stats")
def get_dashboard_stats(
    source_city: Optional[str] = Query(None),
    destination_city: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Computes summary metrics dynamically from authentic MySQL database records.
    """
    # 1. Total records count
    flight_count = db.query(func.count(Flight.id)).scalar() or 0
    hotel_count = db.query(func.count(Hotel.id)).scalar() or 0
    train_count = db.query(func.count(Train.id)).scalar() or 0
    bus_count = db.query(func.count(Bus.id)).scalar() or 0
    total_records = flight_count + hotel_count + train_count + bus_count

    # 2. Averages
    avg_flight_price = db.query(func.avg(Flight.current_price)).scalar() or 0
    avg_hotel_price = db.query(func.avg(Hotel.price_per_night)).scalar() or 0
    avg_train_fare = db.query(func.avg(Train.fare)).scalar() or 0
    avg_bus_fare = db.query(func.avg(Bus.ticket_price)).scalar() or 0

    # 3. Cheapest Available Route (Flight)
    cheapest_q = text("""
        SELECT 
            f.id,
            f.flight_number,
            a.name AS airline,
            sc.name AS source,
            dc.name AS destination,
            f.current_price,
            f.duration_hours
        FROM flights f
        JOIN airlines a ON f.airline_id = a.id
        JOIN cities sc ON f.source_city_id = sc.id
        JOIN cities dc ON f.destination_city_id = dc.id
        ORDER BY f.current_price ASC
        LIMIT 1;
    """)
    cheapest_res = db.execute(cheapest_q).fetchone()
    cheapest_route = {
        "flight_number": cheapest_res[1],
        "airline": cheapest_res[2],
        "route": f"{cheapest_res[3]} → {cheapest_res[4]}",
        "price": float(cheapest_res[5]),
        "duration": float(cheapest_res[6])
    } if cheapest_res else None

    # 4. Most Frequent Destination
    freq_dest_q = text("""
        SELECT dc.name, COUNT(f.id) AS count
        FROM flights f
        JOIN cities dc ON f.destination_city_id = dc.id
        GROUP BY dc.id, dc.name
        ORDER BY count DESC
        LIMIT 1;
    """)
    freq_res = db.execute(freq_dest_q).fetchone()
    most_frequent_destination = {
        "city": freq_res[0],
        "flights_count": int(freq_res[1])
    } if freq_res else {"city": "Delhi", "flights_count": 0}

    # 5. Recent Search History
    searches = db.query(SearchHistory).order_by(SearchHistory.searched_at.desc()).limit(5).all()
    recent_searches = [
        {
            "id": s.id,
            "category": s.category,
            "source": s.source_city,
            "destination": s.destination_city,
            "date": str(s.travel_date) if s.travel_date else None,
            "searched_at": s.searched_at.strftime("%b %d, %H:%M") if s.searched_at else ""
        } for s in searches
    ]

    return {
        "total_records_analysed": total_records,
        "flight_records": flight_count,
        "hotel_records": hotel_count,
        "train_records": train_count,
        "bus_records": bus_count,
        "average_flight_price": round(float(avg_flight_price), 2),
        "average_hotel_price": round(float(avg_hotel_price), 2),
        "average_train_fare": round(float(avg_train_fare), 2),
        "average_bus_fare": round(float(avg_bus_fare), 2),
        "cheapest_route": cheapest_route,
        "most_frequent_destination": most_frequent_destination,
        "recent_searches": recent_searches
    }

@router.get("/historical-trends")
def get_historical_trends(
    route: Optional[str] = Query("Bengaluru -> Delhi"),
    db: Session = Depends(get_db)
):
    """
    Returns time-series historical price trends aggregated by date for line charts.
    """
    query = text("""
        SELECT 
            recorded_date,
            route_or_name,
            ROUND(AVG(price), 2) as avg_price,
            ROUND(MIN(price), 2) as min_price,
            ROUND(MAX(price), 2) as max_price,
            season
        FROM price_history
        WHERE category = 'flight'
        GROUP BY recorded_date, route_or_name, season
        ORDER BY recorded_date ASC;
    """)
    rows = db.execute(query).fetchall()

    data_by_date = {}
    for r in rows:
        d_str = str(r[0])
        if d_str not in data_by_date:
            data_by_date[d_str] = {
                "date": d_str,
                "season": r[5]
            }
        
        # Route specific keys
        if "Bengaluru -> Delhi" in r[1]:
            data_by_date[d_str]["blr_delhi"] = float(r[2])
        elif "Mumbai -> Delhi" in r[1]:
            data_by_date[d_str]["bom_delhi"] = float(r[2])
        elif "Bengaluru -> Mumbai" in r[1]:
            data_by_date[d_str]["blr_mumbai"] = float(r[2])
        elif "Mumbai -> Goa" in r[1]:
            data_by_date[d_str]["bom_goa"] = float(r[2])

    result = list(data_by_date.values())
    return result

@router.get("/airline-comparison")
def get_airline_comparison(db: Session = Depends(get_db)):
    """
    Returns airline average, minimum, and maximum ticket pricing from MySQL view.
    """
    query = text("""
        SELECT 
            airline_name,
            iata_code,
            total_flights,
            avg_price,
            min_price,
            max_price,
            avg_duration_hours
        FROM v_airline_performance
        ORDER BY avg_price ASC;
    """)
    rows = db.execute(query).fetchall()
    return [
        {
            "airline": r[0],
            "code": r[1],
            "total_flights": int(r[2]),
            "avg_price": float(r[3]),
            "min_price": float(r[4]),
            "max_price": float(r[5]),
            "avg_duration": float(r[6])
        } for r in rows
    ]

@router.get("/monthly-seasonal-trends")
def get_monthly_seasonal_trends(db: Session = Depends(get_db)):
    """
    Returns monthly price trends and seasonal fluctuations across travel categories.
    """
    query = text("""
        SELECT 
            month_year,
            category,
            avg_price,
            min_price,
            max_price,
            sample_count
        FROM v_monthly_category_trends
        ORDER BY month_year ASC;
    """)
    rows = db.execute(query).fetchall()

    trends_map = {}
    for r in rows:
        my = r[0]
        cat = r[1]
        avg_p = float(r[2])
        if my not in trends_map:
            trends_map[my] = {"month": my}
        trends_map[my][f"{cat}_avg"] = avg_p

    return list(trends_map.values())

@router.get("/category-comparison")
def get_category_comparison(db: Session = Depends(get_db)):
    """
    Returns breakdown across Flights, Hotels, Trains, and Buses for Donut and Bar charts.
    """
    f_price = db.query(func.avg(Flight.current_price)).scalar() or 0
    h_price = db.query(func.avg(Hotel.price_per_night)).scalar() or 0
    t_price = db.query(func.avg(Train.fare)).scalar() or 0
    b_price = db.query(func.avg(Bus.ticket_price)).scalar() or 0

    f_cnt = db.query(func.count(Flight.id)).scalar() or 0
    h_cnt = db.query(func.count(Hotel.id)).scalar() or 0
    t_cnt = db.query(func.count(Train.id)).scalar() or 0
    b_cnt = db.query(func.count(Bus.id)).scalar() or 0

    return [
        {"category": "Flights", "avg_cost": round(float(f_price), 2), "records": f_cnt, "color": "#00f0ff"},
        {"category": "Hotels (Night)", "avg_cost": round(float(h_price), 2), "records": h_cnt, "color": "#3b82f6"},
        {"category": "Trains", "avg_cost": round(float(t_price), 2), "records": t_cnt, "color": "#8b5cf6"},
        {"category": "Buses", "avg_cost": round(float(b_price), 2), "records": b_cnt, "color": "#ec4899"}
    ]

@router.get("/destination-map-data")
def get_destination_map_data(db: Session = Depends(get_db)):
    """
    Returns Indian travel hubs with geolocation and live average inbound prices for 3D Earth / Map.
    """
    query = text("""
        SELECT 
            c.name,
            c.code,
            c.state,
            c.latitude,
            c.longitude,
            c.tier,
            ROUND(AVG(f.current_price), 2) AS avg_incoming_price,
            COUNT(f.id) AS inbound_flights
        FROM cities c
        LEFT JOIN flights f ON c.id = f.destination_city_id
        GROUP BY c.id, c.name, c.code, c.state, c.latitude, c.longitude, c.tier;
    """)
    rows = db.execute(query).fetchall()
    return [
        {
            "name": r[0],
            "code": r[1],
            "state": r[2],
            "lat": float(r[3]),
            "lng": float(r[4]),
            "tier": r[5],
            "avg_price": float(r[6]) if r[6] else 4200.0,
            "flights_count": int(r[7])
        } for r in rows
    ]
