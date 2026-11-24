import datetime
from sqlalchemy import Column, Integer, String, Numeric, Boolean, Date, Time, DateTime, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default="user")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    predictions = relationship("Prediction", back_populates="user")
    searches = relationship("SearchHistory", back_populates="user")


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    code = Column(String(10), unique=True, nullable=False, index=True)
    state = Column(String(50), nullable=False)
    latitude = Column(Numeric(9, 6), nullable=False)
    longitude = Column(Numeric(9, 6), nullable=False)
    popular_attractions = Column(Text, nullable=True)
    tier = Column(String(20), default="Metro")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    departing_flights = relationship("Flight", foreign_keys="Flight.source_city_id", back_populates="source_city")
    arriving_flights = relationship("Flight", foreign_keys="Flight.destination_city_id", back_populates="destination_city")
    hotels = relationship("Hotel", back_populates="city")


class Airline(Base):
    __tablename__ = "airlines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    iata_code = Column(String(10), unique=True, nullable=False, index=True)
    country = Column(String(50), default="India")
    rating = Column(Numeric(3, 2), default=4.0)
    fleet_size = Column(Integer, default=50)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    flights = relationship("Flight", back_populates="airline")


class Flight(Base):
    __tablename__ = "flights"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    flight_number = Column(String(20), nullable=False)
    airline_id = Column(Integer, ForeignKey("airlines.id", ondelete="CASCADE"), nullable=False, index=True)
    source_city_id = Column(Integer, ForeignKey("cities.id"), nullable=False, index=True)
    destination_city_id = Column(Integer, ForeignKey("cities.id"), nullable=False, index=True)
    departure_time = Column(Time, nullable=False)
    arrival_time = Column(Time, nullable=False)
    duration_hours = Column(Numeric(4, 2), nullable=False)
    stops = Column(Integer, default=0)
    travel_class = Column(String(30), default="Economy")
    base_price = Column(Numeric(10, 2), nullable=False)
    current_price = Column(Numeric(10, 2), nullable=False, index=True)
    journey_date = Column(Date, nullable=False, index=True)
    days_left = Column(Integer, default=15)
    seats_available = Column(Integer, default=50)
    data_source = Column(String(50), default="Historical Flight Dataset")
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    airline = relationship("Airline", back_populates="flights")
    source_city = relationship("City", foreign_keys=[source_city_id], back_populates="departing_flights")
    destination_city = relationship("City", foreign_keys=[destination_city_id], back_populates="arriving_flights")


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    star_rating = Column(Numeric(2, 1), nullable=False)
    user_rating = Column(Numeric(3, 2), default=4.2)
    price_per_night = Column(Numeric(10, 2), nullable=False, index=True)
    address = Column(String(255), nullable=False)
    amenities = Column(Text, nullable=True)
    available_rooms = Column(Integer, default=10)
    data_source = Column(String(50), default="Travel Portal Aggregation")
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    city = relationship("City", back_populates="hotels")


class Train(Base):
    __tablename__ = "trains"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    train_number = Column(String(20), nullable=False)
    train_name = Column(String(100), nullable=False)
    source_city_id = Column(Integer, ForeignKey("cities.id"), nullable=False, index=True)
    destination_city_id = Column(Integer, ForeignKey("cities.id"), nullable=False, index=True)
    departure_time = Column(Time, nullable=False)
    arrival_time = Column(Time, nullable=False)
    duration_hours = Column(Numeric(4, 2), nullable=False)
    travel_class = Column(String(20), nullable=False)
    fare = Column(Numeric(10, 2), nullable=False, index=True)
    runs_on_days = Column(String(50), default="Daily")
    data_source = Column(String(50), default="Indian Railways Portal")
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    source_city = relationship("City", foreign_keys=[source_city_id])
    destination_city = relationship("City", foreign_keys=[destination_city_id])


class Bus(Base):
    __tablename__ = "buses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    operator_name = Column(String(100), nullable=False)
    bus_type = Column(String(60), nullable=False)
    source_city_id = Column(Integer, ForeignKey("cities.id"), nullable=False, index=True)
    destination_city_id = Column(Integer, ForeignKey("cities.id"), nullable=False, index=True)
    departure_time = Column(Time, nullable=False)
    arrival_time = Column(Time, nullable=False)
    duration_hours = Column(Numeric(4, 2), nullable=False)
    ticket_price = Column(Numeric(10, 2), nullable=False, index=True)
    rating = Column(Numeric(3, 2), default=4.1)
    data_source = Column(String(50), default="Bus Aggregator Portal")
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    source_city = relationship("City", foreign_keys=[source_city_id])
    destination_city = relationship("City", foreign_keys=[destination_city_id])


class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category = Column(String(20), nullable=False, index=True)
    item_id = Column(Integer, nullable=False)
    route_or_name = Column(String(100), nullable=False, index=True)
    recorded_date = Column(Date, nullable=False, index=True)
    price = Column(Numeric(10, 2), nullable=False)
    surge_multiplier = Column(Numeric(4, 2), default=1.0)
    is_weekend = Column(Boolean, default=False)
    season = Column(String(60), default="Normal")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    airline_name = Column(String(50), nullable=False)
    source_city = Column(String(50), nullable=False)
    destination_city = Column(String(50), nullable=False)
    journey_date = Column(Date, nullable=False)
    travel_class = Column(String(30), default="Economy")
    stops = Column(Integer, default=0)
    duration_hours = Column(Numeric(4, 2), nullable=False)
    predicted_price = Column(Numeric(10, 2), nullable=False)
    model_version = Column(String(50), default="RandomForestRegressor_v1.0")
    confidence_score = Column(Numeric(5, 4), default=0.9250)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="predictions")


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    category = Column(String(20), nullable=False)
    source_city = Column(String(50), nullable=True)
    destination_city = Column(String(50), nullable=False)
    travel_date = Column(Date, nullable=True)
    results_count = Column(Integer, default=0)
    searched_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="searches")


class UploadedDataset(Base):
    __tablename__ = "uploaded_datasets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    records_count = Column(Integer, nullable=False)
    dataset_type = Column(String(50), nullable=False)
    source = Column(String(100), default="Uploaded File / API")
    upload_status = Column(String(50), default="Completed")
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)


class DataCleaningLog(Base):
    __tablename__ = "data_cleaning_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_id = Column(Integer, ForeignKey("uploaded_datasets.id", ondelete="CASCADE"), nullable=True)
    operation = Column(String(100), nullable=False)
    raw_records = Column(Integer, nullable=False)
    null_values_fixed = Column(Integer, nullable=False)
    duplicates_removed = Column(Integer, nullable=False)
    outliers_detected = Column(Integer, nullable=False)
    cleaned_records = Column(Integer, nullable=False)
    cleaning_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
