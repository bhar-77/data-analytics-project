import io
import os
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.database import get_db

router = APIRouter(prefix="/api/reports", tags=["Reports & Power BI Integration"])

@router.get("/summary")
def get_report_summary(db: Session = Depends(get_db)):
    """Returns analytics snapshot suitable for executive reporting."""
    flight_summary = db.execute(text("SELECT * FROM v_airline_performance;")).fetchall()
    route_summary = db.execute(text("SELECT * FROM v_route_price_summary LIMIT 10;")).fetchall()
    monthly_summary = db.execute(text("SELECT * FROM v_monthly_category_trends;")).fetchall()

    return {
        "airline_performance": [
            {
                "airline": r[0], "code": r[1], "flights": r[2], 
                "avg_price": float(r[3]), "min_price": float(r[4]), 
                "max_price": float(r[5]), "duration": float(r[6])
            } for r in flight_summary
        ],
        "top_routes": [
            {
                "route": r[2], "avg_flight_price": float(r[3]), 
                "min_flight_price": float(r[4]), "options": r[5]
            } for r in route_summary
        ],
        "monthly_indices": [
            {
                "category": r[0], "month": r[1], "avg_price": float(r[2]), 
                "min_price": float(r[3]), "max_price": float(r[4]), "samples": r[5]
            } for r in monthly_summary
        ]
    }


@router.get("/export/powerbi-csv")
def export_powerbi_csv(dataset: str = "flights", db: Session = Depends(get_db)):
    """
    Exports clean, normalized CSV files pre-formatted for Microsoft Power BI import.
    """
    if dataset == "flights":
        q = """
            SELECT 
                f.id AS FlightID,
                f.flight_number AS FlightNumber,
                a.name AS Airline,
                sc.name AS SourceCity,
                dc.name AS DestinationCity,
                CONCAT(sc.name, ' - ', dc.name) AS Route,
                f.departure_time AS DepartureTime,
                f.arrival_time AS ArrivalTime,
                f.duration_hours AS DurationHours,
                f.stops AS Stops,
                f.travel_class AS TravelClass,
                f.base_price AS BasePriceINR,
                f.current_price AS CurrentPriceINR,
                f.journey_date AS JourneyDate,
                f.days_left AS DaysLeft,
                f.seats_available AS SeatsAvailable
            FROM flights f
            JOIN airlines a ON f.airline_id = a.id
            JOIN cities sc ON f.source_city_id = sc.id
            JOIN cities dc ON f.destination_city_id = dc.id;
        """
        filename = "PowerBI_TravelLens_Flights.csv"

    elif dataset == "monthly_trends":
        q = """
            SELECT 
                month_year AS MonthYear,
                category AS TravelCategory,
                avg_price AS AvgPriceINR,
                min_price AS MinPriceINR,
                max_price AS MaxPriceINR,
                sample_count AS SampleCount
            FROM v_monthly_category_trends;
        """
        filename = "PowerBI_Monthly_Trends.csv"

    elif dataset == "airlines":
        q = """
            SELECT 
                airline_name AS AirlineName,
                iata_code AS IATACode,
                total_flights AS TotalFlights,
                avg_price AS AvgFareINR,
                min_price AS MinFareINR,
                max_price AS PeakFareINR,
                avg_duration_hours AS AvgDurationHours
            FROM v_airline_performance;
        """
        filename = "PowerBI_Airline_Performance.csv"

    else:
        raise HTTPException(status_code=400, detail="Invalid dataset type for Power BI export. Options: flights, monthly_trends, airlines.")

    df = pd.read_sql(q, con=db.bind)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    return Response(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
