import datetime
from typing import List, Optional
from pydantic import BaseModel

# Auth Schemas
class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# Travel Schemas
class CityOut(BaseModel):
    id: int
    name: str
    code: str
    state: str
    latitude: float
    longitude: float
    popular_attractions: Optional[str] = None
    tier: str

    class Config:
        from_attributes = True

class AirlineOut(BaseModel):
    id: int
    name: str
    iata_code: str
    rating: float
    fleet_size: int

    class Config:
        from_attributes = True

class FlightOut(BaseModel):
    id: int
    flight_number: str
    airline: str
    airline_code: str
    source_city: str
    destination_city: str
    departure_time: str
    arrival_time: str
    duration_hours: float
    stops: int
    travel_class: str
    base_price: float
    current_price: float
    journey_date: str
    days_left: int
    seats_available: int
    data_source: str

class HotelOut(BaseModel):
    id: int
    name: str
    city: str
    star_rating: float
    user_rating: float
    price_per_night: float
    address: str
    amenities: Optional[str]
    available_rooms: int

class TrainOut(BaseModel):
    id: int
    train_number: str
    train_name: str
    source_city: str
    destination_city: str
    departure_time: str
    arrival_time: str
    duration_hours: float
    travel_class: str
    fare: float
    runs_on_days: str

class BusOut(BaseModel):
    id: int
    operator_name: str
    bus_type: str
    source_city: str
    destination_city: str
    departure_time: str
    arrival_time: str
    duration_hours: float
    ticket_price: float
    rating: float

# ML Prediction Schemas
class PredictRequest(BaseModel):
    airline: str
    source_city: str
    destination_city: str
    journey_date: str
    departure_hour: Optional[float] = 9.0
    duration_hours: Optional[float] = 2.5
    stops: Optional[int] = 0
    travel_class: Optional[str] = "Economy"
    days_left: Optional[int] = 14

class PredictResponse(BaseModel):
    estimated_price: float
    confidence_score: float
    model_version: str
    input_details: dict
    historical_benchmark: dict
    features_used: List[str]

# SQL Explorer Schemas
class QueryRequest(BaseModel):
    query: str

class PredefinedQueryItem(BaseModel):
    id: str
    title: str
    description: str
    sql: str
    category: str

# Assistant Chat
class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[dict]] = []
