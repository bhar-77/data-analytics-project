from typing import Optional, List
import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.database import get_db
from backend.models import City, Airline, Flight, Hotel, Train, Bus, SearchHistory

router = APIRouter(prefix="/api/travel", tags=["Travel Search & Comparison"])

@router.get("/meta")
def get_travel_metadata(db: Session = Depends(get_db)):
    """Returns cities, airlines, and available travel classes for dropdown filters."""
    cities = db.query(City).order_by(City.name).all()
    airlines = db.query(Airline).order_by(Airline.name).all()

    return {
        "cities": [
            {
                "id": c.id, "name": c.name, "code": c.code, 
                "state": c.state, "lat": float(c.latitude), "lng": float(c.longitude)
            } for c in cities
        ],
        "airlines": [
            {
                "id": a.id, "name": a.name, "iata_code": a.iata_code, "rating": float(a.rating)
            } for a in airlines
        ],
        "flight_classes": ["Economy", "Business", "Premium Economy"],
        "train_classes": ["1A", "2A", "3A", "CC", "EC", "SL"],
        "bus_types": ["Volvo Multi-Axle AC Sleeper", "Scania AC Semi-Sleeper", "BharatBenz AC"]
    }

@router.get("/flights")
def search_flights(
    source: Optional[str] = Query(None),
    destination: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    airline: Optional[str] = Query(None),
    travel_class: Optional[str] = Query(None),
    max_price: Optional[float] = Query(None),
    stops: Optional[int] = Query(None),
    sort_by: Optional[str] = Query("price_asc"),
    db: Session = Depends(get_db)
):
    query_str = """
        SELECT 
            f.id,
            f.flight_number,
            a.name AS airline,
            a.iata_code,
            sc.name AS source_city,
            dc.name AS destination_city,
            f.departure_time,
            f.arrival_time,
            f.duration_hours,
            f.stops,
            f.travel_class,
            f.base_price,
            f.current_price,
            f.journey_date,
            f.days_left,
            f.seats_available,
            f.data_source,
            f.last_updated
        FROM flights f
        JOIN airlines a ON f.airline_id = a.id
        JOIN cities sc ON f.source_city_id = sc.id
        JOIN cities dc ON f.destination_city_id = dc.id
        WHERE 1=1
    """
    params = {}

    if source:
        query_str += " AND (sc.name = :src OR sc.code = :src)"
        params["src"] = source
    if destination:
        query_str += " AND (dc.name = :dst OR dc.code = :dst)"
        params["dst"] = destination
    if date:
        query_str += " AND f.journey_date >= :jdate"
        params["jdate"] = date
    if airline:
        query_str += " AND (a.name = :al OR a.iata_code = :al)"
        params["al"] = airline
    if travel_class:
        query_str += " AND f.travel_class = :tc"
        params["tc"] = travel_class
    if max_price:
        query_str += " AND f.current_price <= :mp"
        params["mp"] = max_price
    if stops is not None:
        query_str += " AND f.stops = :st"
        params["st"] = stops

    if sort_by == "price_asc":
        query_str += " ORDER BY f.current_price ASC"
    elif sort_by == "price_desc":
        query_str += " ORDER BY f.current_price DESC"
    elif sort_by == "duration_asc":
        query_str += " ORDER BY f.duration_hours ASC"
    else:
        query_str += " ORDER BY f.current_price ASC"

    query_str += " LIMIT 100;"

    rows = db.execute(text(query_str), params).fetchall()

    # Record search history if user searched for specific route
    if source and destination:
        log_entry = SearchHistory(
            user_id=1,
            category="flight",
            source_city=source,
            destination_city=destination,
            travel_date=datetime.date.fromisoformat(date) if date else None,
            results_count=len(rows)
        )
        db.add(log_entry)
        db.commit()

    return [
        {
            "id": r[0],
            "flight_number": r[1],
            "airline": r[2],
            "airline_code": r[3],
            "source_city": r[4],
            "destination_city": r[5],
            "departure_time": str(r[6]),
            "arrival_time": str(r[7]),
            "duration_hours": float(r[8]),
            "stops": int(r[9]),
            "travel_class": r[10],
            "base_price": float(r[11]),
            "current_price": float(r[12]),
            "journey_date": str(r[13]),
            "days_left": int(r[14]),
            "seats_available": int(r[15]),
            "data_source": r[16],
            "last_updated": r[17].strftime("%Y-%m-%d %H:%M") if r[17] else "Recent"
        } for r in rows
    ]

@router.get("/hotels")
def search_hotels(
    city: Optional[str] = Query(None),
    min_star: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    query_str = """
        SELECT 
            h.id,
            h.name,
            c.name AS city,
            h.star_rating,
            h.user_rating,
            h.price_per_night,
            h.address,
            h.amenities,
            h.available_rooms,
            h.data_source,
            h.last_updated
        FROM hotels h
        JOIN cities c ON h.city_id = c.id
        WHERE 1=1
    """
    params = {}
    if city:
        query_str += " AND (c.name = :city OR c.code = :city)"
        params["city"] = city
    if min_star:
        query_str += " AND h.star_rating >= :star"
        params["star"] = min_star
    if max_price:
        query_str += " AND h.price_per_night <= :mp"
        params["mp"] = max_price

    query_str += " ORDER BY h.star_rating DESC, h.price_per_night ASC;"

    rows = db.execute(text(query_str), params).fetchall()

    if city:
        log_entry = SearchHistory(
            user_id=1,
            category="hotel",
            source_city=None,
            destination_city=city,
            results_count=len(rows)
        )
        db.add(log_entry)
        db.commit()

    return [
        {
            "id": r[0],
            "name": r[1],
            "city": r[2],
            "star_rating": float(r[3]),
            "user_rating": float(r[4]),
            "price_per_night": float(r[5]),
            "address": r[6],
            "amenities": r[7].split(", ") if r[7] else [],
            "available_rooms": int(r[8]),
            "data_source": r[9],
            "last_updated": r[10].strftime("%Y-%m-%d %H:%M") if r[10] else "Recent"
        } for r in rows
    ]

@router.get("/trains")
def search_trains(
    source: Optional[str] = Query(None),
    destination: Optional[str] = Query(None),
    travel_class: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query_str = """
        SELECT 
            t.id,
            t.train_number,
            t.train_name,
            sc.name AS source_city,
            dc.name AS destination_city,
            t.departure_time,
            t.arrival_time,
            t.duration_hours,
            t.travel_class,
            t.fare,
            t.runs_on_days,
            t.data_source,
            t.last_updated
        FROM trains t
        JOIN cities sc ON t.source_city_id = sc.id
        JOIN cities dc ON t.destination_city_id = dc.id
        WHERE 1=1
    """
    params = {}
    if source:
        query_str += " AND (sc.name = :src OR sc.code = :src)"
        params["src"] = source
    if destination:
        query_str += " AND (dc.name = :dst OR dc.code = :dst)"
        params["dst"] = destination
    if travel_class:
        query_str += " AND t.travel_class = :tc"
        params["tc"] = travel_class

    query_str += " ORDER BY t.fare ASC;"
    rows = db.execute(text(query_str), params).fetchall()

    return [
        {
            "id": r[0],
            "train_number": r[1],
            "train_name": r[2],
            "source_city": r[3],
            "destination_city": r[4],
            "departure_time": str(r[5]),
            "arrival_time": str(r[6]),
            "duration_hours": float(r[7]),
            "travel_class": r[8],
            "fare": float(r[9]),
            "runs_on_days": r[10],
            "data_source": r[11],
            "last_updated": r[12].strftime("%Y-%m-%d %H:%M") if r[12] else "Recent"
        } for r in rows
    ]

@router.get("/buses")
def search_buses(
    source: Optional[str] = Query(None),
    destination: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query_str = """
        SELECT 
            b.id,
            b.operator_name,
            b.bus_type,
            sc.name AS source_city,
            dc.name AS destination_city,
            b.departure_time,
            b.arrival_time,
            b.duration_hours,
            b.ticket_price,
            b.rating,
            b.data_source,
            b.last_updated
        FROM buses b
        JOIN cities sc ON b.source_city_id = sc.id
        JOIN cities dc ON b.destination_city_id = dc.id
        WHERE 1=1
    """
    params = {}
    if source:
        query_str += " AND (sc.name = :src OR sc.code = :src)"
        params["src"] = source
    if destination:
        query_str += " AND (dc.name = :dst OR dc.code = :dst)"
        params["dst"] = destination

    query_str += " ORDER BY b.ticket_price ASC;"
    rows = db.execute(text(query_str), params).fetchall()

    return [
        {
            "id": r[0],
            "operator_name": r[1],
            "bus_type": r[2],
            "source_city": r[3],
            "destination_city": r[4],
            "departure_time": str(r[5]),
            "arrival_time": str(r[6]),
            "duration_hours": float(r[7]),
            "ticket_price": float(r[8]),
            "rating": float(r[9]),
            "data_source": r[10],
            "last_updated": r[11].strftime("%Y-%m-%d %H:%M") if r[11] else "Recent"
        } for r in rows
    ]

@router.get("/compare")
def compare_travel_modes(
    source: str = Query(..., description="Source city name"),
    destination: str = Query(..., description="Destination city name"),
    db: Session = Depends(get_db)
):
    """
    Direct head-to-head comparison between Flights, Trains, and Buses for any specified route.
    """
    # Cheapest flight
    f_res = db.execute(
        text("""
            SELECT f.flight_number, a.name, f.current_price, f.duration_hours, f.stops
            FROM flights f
            JOIN airlines a ON f.airline_id = a.id
            JOIN cities sc ON f.source_city_id = sc.id
            JOIN cities dc ON f.destination_city_id = dc.id
            WHERE sc.name = :src AND dc.name = :dst
            ORDER BY f.current_price ASC LIMIT 1;
        """), {"src": source, "dst": destination}
    ).fetchone()

    # Cheapest train
    t_res = db.execute(
        text("""
            SELECT t.train_number, t.train_name, t.fare, t.duration_hours, t.travel_class
            FROM trains t
            JOIN cities sc ON t.source_city_id = sc.id
            JOIN cities dc ON t.destination_city_id = dc.id
            WHERE sc.name = :src AND dc.name = :dst
            ORDER BY t.fare ASC LIMIT 1;
        """), {"src": source, "dst": destination}
    ).fetchone()

    # Cheapest bus
    b_res = db.execute(
        text("""
            SELECT b.operator_name, b.bus_type, b.ticket_price, b.duration_hours
            FROM buses b
            JOIN cities sc ON b.source_city_id = sc.id
            JOIN cities dc ON b.destination_city_id = dc.id
            WHERE sc.name = :src AND dc.name = :dst
            ORDER BY b.ticket_price ASC LIMIT 1;
        """), {"src": source, "dst": destination}
    ).fetchone()

    modes = []
    if f_res:
        modes.append({
            "mode": "Flight",
            "name": f"{f_res[1]} ({f_res[0]})",
            "cost": float(f_res[2]),
            "duration_hours": float(f_res[3]),
            "details": f"{f_res[4]} stops",
            "speed_rating": 5,
            "cost_rating": 2
        })
    if t_res:
        modes.append({
            "mode": "Train",
            "name": f"{t_res[1]} ({t_res[0]})",
            "cost": float(t_res[2]),
            "duration_hours": float(t_res[3]),
            "details": f"Class {t_res[4]}",
            "speed_rating": 3,
            "cost_rating": 4
        })
    if b_res:
        modes.append({
            "mode": "Bus",
            "name": f"{b_res[0]}",
            "cost": float(b_res[2]),
            "duration_hours": float(b_res[3]),
            "details": b_res[1],
            "speed_rating": 2,
            "cost_rating": 5
        })

    return {
        "route": f"{source} → {destination}",
        "comparison": modes
    }
