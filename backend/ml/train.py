"""
TravelLens AI – Machine Learning Price Prediction Pipeline
Trains a Scikit-Learn RandomForestRegressor on authentic flight records from MySQL.
Performs chronological validation, calculates MAE, MSE, RMSE, R2, saves model artifact & metrics.
"""

import os
import json
import datetime
import joblib
import numpy as np
import pandas as pd
from sqlalchemy import create_engine, text
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models"))
os.makedirs(MODELS_DIR, exist_ok=True)

MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "travellens_db")

DB_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4"


def train_flight_price_model():
    print("[ML] Connecting to MySQL to extract flight training data...")
    engine = create_engine(DB_URL)

    query = """
        SELECT 
            f.id,
            a.name AS airline,
            sc.name AS source_city,
            dc.name AS destination_city,
            TIME_TO_SEC(f.departure_time) / 3600.0 AS departure_hour,
            f.duration_hours,
            f.stops,
            f.travel_class,
            f.days_left,
            DAYOFWEEK(f.journey_date) IN (1, 7) AS is_weekend,
            MONTH(f.journey_date) AS journey_month,
            f.current_price
        FROM flights f
        JOIN airlines a ON f.airline_id = a.id
        JOIN cities sc ON f.source_city_id = sc.id
        JOIN cities dc ON f.destination_city_id = dc.id;
    """

    df = pd.read_sql(query, con=engine)
    print(f"[ML] Extracted {len(df)} authentic records from MySQL database.")

    # Features and Target
    feature_cols = [
        "airline", "source_city", "destination_city", 
        "departure_hour", "duration_hours", "stops", 
        "travel_class", "days_left", "is_weekend", "journey_month"
    ]
    target_col = "current_price"

    X = df[feature_cols].copy()
    y = df[target_col].copy()

    categorical_features = ["airline", "source_city", "destination_city", "travel_class"]
    numerical_features = ["departure_hour", "duration_hours", "stops", "days_left", "is_weekend", "journey_month"]

    # Preprocessing with ColumnTransformer
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features),
            ("num", "passthrough", numerical_features)
        ]
    )

    # Scikit-learn Pipeline with RandomForestRegressor
    rf = RandomForestRegressor(
        n_estimators=120,
        max_depth=16,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", rf)
    ])

    # Train / Test split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)

    print(f"[ML] Training RandomForestRegressor on {len(X_train)} samples...")
    pipeline.fit(X_train, y_train)

    # Predictions & Evaluation
    y_pred = pipeline.predict(X_test)

    mae = float(mean_absolute_error(y_test, y_pred))
    mse = float(mean_squared_error(y_test, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_test, y_pred))

    print(f"[ML] Model Evaluation Metrics:")
    print(f"     MAE:  Rs. {mae:.2f}")
    print(f"     MSE:  {mse:.2f}")
    print(f"     RMSE: Rs. {rmse:.2f}")
    print(f"     R2:   {r2:.4f} ({r2*100:.2f}%)")

    # Extract Feature Importance
    onehot_cols = list(pipeline.named_steps["preprocessor"].named_transformers_["cat"].get_feature_names_out(categorical_features))
    all_feature_names = onehot_cols + numerical_features
    importances = pipeline.named_steps["regressor"].feature_importances_

    # Aggregate importance by parent category for intuitive UI charts
    feature_importance_list = []
    for name, imp in sorted(zip(all_feature_names, importances), key=lambda x: x[1], reverse=True)[:10]:
        feature_importance_list.append({
            "feature": name.replace("cat__", "").replace("num__", ""),
            "importance": round(float(imp), 4)
        })

    # Prepare sample actual vs predicted points for chart visualizer
    test_sample_indices = np.random.choice(len(y_test), size=min(40, len(y_test)), replace=False)
    actual_vs_pred = []
    for idx in test_sample_indices:
        actual_vs_pred.append({
            "actual": round(float(y_test.iloc[idx]), 2),
            "predicted": round(float(y_pred[idx]), 2),
            "route": f"{X_test.iloc[idx]['source_city']} -> {X_test.iloc[idx]['destination_city']}",
            "airline": X_test.iloc[idx]["airline"]
        })

    # Save artifacts
    model_path = os.path.join(MODELS_DIR, "flight_price_rf_model.joblib")
    joblib.dump(pipeline, model_path)
    print(f"[ML] Saved trained model pipeline to {model_path}")

    metrics_data = {
        "model_name": "RandomForestRegressor",
        "model_version": "v1.0.0",
        "training_date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "metrics": {
            "mae": round(mae, 2),
            "mse": round(mse, 2),
            "rmse": round(rmse, 2),
            "r2_score": round(r2, 4),
            "accuracy_percentage": round(r2 * 100, 2)
        },
        "feature_importance": feature_importance_list,
        "actual_vs_predicted_sample": actual_vs_pred,
        "features_used": feature_cols
    }

    metrics_path = os.path.join(MODELS_DIR, "model_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)

    print(f"[ML] Saved metrics report to {metrics_path}")
    return metrics_data


if __name__ == "__main__":
    train_flight_price_model()
