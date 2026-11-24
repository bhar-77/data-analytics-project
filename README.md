# TravelLens AI – Intelligent Travel Search and Price Analytics System

TravelLens AI is an enterprise-grade full-stack travel intelligence and price analytics web application. It combines travel data collection, relational SQL database management, statistical data analytics, machine learning price prediction, generative AI assistance, and interactive 3D visualizations to help users compare domestic travel prices, uncover historical seasonal trends, and make smarter journeys.

---

## 1. System Technology Stack

- **Frontend**: React.js (v18.3.1) + Vite
- **Styling**: Tailwind CSS (Apple-inspired liquid glass, frosted panels, dark midnight aesthetics)
- **Animations**: Framer Motion
- **3D Visualization**: Three.js + React Three Fiber + Drei (Interactive 3D Earth Globe with animated glowing flight arcs)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Animated trend lines, bar charts, donut charts, scatter plots)
- **Backend**: Python 3.13 + FastAPI
- **Relational Database**: MySQL 8.x Community Server (`travellens_db`, 3NF Normalization)
- **Database Connectivity**: SQLAlchemy 2.x + PyMySQL
- **Data Processing & ETL**: Pandas + NumPy
- **Machine Learning**: Scikit-Learn (`RandomForestRegressor`, Joblib model serialization)
- **Generative AI**: Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-flash`)
- **Business Intelligence**: Microsoft Power BI compatible CSV models and SQL views

---

## 2. Key Architecture & Features

### A. Cinematic 3D Landing Page
- Realistic interactive 3D Earth rendered via React Three Fiber.
- Animated flight paths connecting Indian metro hubs (Bengaluru, Delhi, Mumbai, Chennai, Hyderabad, Kolkata, Pune, Goa) with traveling glowing photons.
- Atmosphere lighting, space starfield, smooth mouse-responsive rotation.
- Smooth cinematic camera zoom transition into the main analytics dashboard.

### B. Executive Analytics Dashboard
- Total travel records analysed calculated directly from MySQL.
- Average fares for Flights, IRCTC Trains, Luxury AC Buses, and 5-Star/4-Star Hotels.
- Dynamic route bargain finder and destination density telemetry.
- 12-month historical price trend area charts with route toggles.
- Airline competitiveness bar charts (IndiGo, Air India, Vistara, SpiceJet, Akasa Air).
- Donut chart of travel mode cost distribution.

### C. Multi-Modal Travel Search & Comparison
- **Flights**: Filter by origin, destination, airline, travel class (Economy, Business), stops (Direct vs 1-Stop), price sorting, with ML price insights button.
- **Hotels**: Filter by destination and minimum star rating (3 to 5 stars), with real amenities and verified tariffs.
- **Trains**: Indian Railways schedules for Vande Bharat Express, Rajdhani, and Shatabdi with class-wise pricing (1A, 2A, 3A, CC, EC, SL).
- **Buses**: Luxury coach services (Volvo Multi-Axle AC Sleeper, Scania Semi-Sleeper, BharatBenz AC) across major operators (KSRTC, Orange, SRS, VRL, Zingbus).
- **Head-to-Head Compare**: Side-by-side comparison of flight vs train vs bus for any selected city pair.

### D. Machine Learning Price Prediction Engine
- Algorithm: `RandomForestRegressor` with 120 decision estimators.
- Input Features: Airline, Origin, Destination, Departure Hour, Duration, Stops, Travel Class, Days Left, Weekend Factor, Journey Month.
- **Evaluation Performance**:
  - **R² Score**: **0.9827 (98.27% accuracy)**
  - **MAE**: **±₹288.13**
  - **RMSE**: **₹440.08**
  - **MSE**: **193,672.68**
- Model persistence using Joblib (`models/flight_price_rf_model.joblib`).
- Feature importance visualization and actual vs predicted scatter plot.
- Genuine predictions saved into MySQL `predictions` table.

### E. SQL Analytics Studio & Explorer
- Executes predefined and custom analytical SQL queries with execution timing (ms) and tabular/chart visualizations.
- Demonstrates advanced SQL:
  - **Window Functions**: `ROW_NUMBER() OVER (...)`, `LAG() OVER (...)`
  - **Common Table Expressions (CTEs)**: Multi-stage CTEs computing cross-modal price premiums
  - **Correlated Subqueries**: Identifying flights priced 15% below route averages
  - **Views**: `v_airline_performance`, `v_route_price_summary`, `v_monthly_category_trends`
- Safety: Strictly validated read-only queries.

### F. Google Gemini AI Travel Assistant
- Connected to Google Gemini API (`gemini-2.5-flash`).
- Grounded with real-time MySQL database context to prevent hallucination.
- Glassmorphic chat bubbles with markdown formatting and quick question chips.

### G. Dataset Management & ETL Pipeline
- Complete Extract, Transform, Load (ETL) pipeline script in Python (`backend/etl/pipeline.py`).
- Imputes missing values, removes duplicates, detects IQR price outliers, and logs audit entries in `data_cleaning_logs`.
- Supports user CSV uploads and one-click raw / cleaned dataset downloads.

### H. Microsoft Power BI Integration
- Pre-formatted CSV exports (`PowerBI_TravelLens_Flights.csv`, `PowerBI_Monthly_Trends.csv`, `PowerBI_Airline_Performance.csv`).
- Comprehensive step-by-step documentation in `documentation/POWER_BI_GUIDE.md`.

---

## 3. Project Directory Structure

```
travel dash board/
├── backend/
│   ├── etl/
│   │   └── pipeline.py            # Automated Extract, Transform, Load pipeline
│   ├── ml/
│   │   └── train.py               # Random Forest Regressor training & evaluation
│   ├── routers/
│   │   ├── auth.py                # Authentication & user profile endpoints
│   │   ├── dashboard.py           # Real-time metrics & historical charts
│   │   ├── travel.py              # Flights, hotels, trains, buses search
│   │   ├── predict.py             # ML inference & prediction logging
│   │   ├── sql_explorer.py        # Safe read-only SQL query execution
│   │   ├── datasets.py            # Dataset summary, previews, CSV upload
│   │   ├── assistant.py           # Gemini AI with SQL-grounded context
│   │   └── reports.py             # Power BI CSV exports & summaries
│   ├── database.py                # SQLAlchemy engine & session maker
│   ├── models.py                  # SQLAlchemy models for all 12 tables
│   ├── schemas.py                 # Pydantic validation schemas
│   ├── main.py                    # FastAPI application setup & CORS
│   ├── requirements.txt           # Python dependencies
│   └── .env                       # Backend environment configuration
├── database/
│   ├── schema.sql                 # MySQL schema (12 tables, 3 views, constraints)
│   └── queries.sql                # Comprehensive analytical SQL queries
├── datasets/
│   ├── raw_flights.csv            # Raw domestic flight schedule records
│   ├── raw_hotels.csv             # Raw hotel listings
│   ├── raw_trains.csv             # Raw IRCTC train schedules
│   ├── raw_buses.csv              # Raw bus coach routes
│   └── cleaned_flights.csv        # Cleaned & normalized flight records
├── documentation/
│   ├── DATABASE_ARCHITECTURE.md   # Relational schema & normalization docs
│   └── POWER_BI_GUIDE.md          # Power BI dashboard creation blueprint
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EarthGlobe.jsx     # Three.js 3D Earth Globe with flight arcs
│   │   │   ├── Navbar.jsx         # Frosted glass top navigation bar
│   │   │   └── Sidebar.jsx        # Modern 12-section sidebar
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx    # Cinematic 3D Landing Page
│   │   │   ├── OverviewPage.jsx   # Analytics dashboard & KPI counters
│   │   │   ├── FlightsPage.jsx    # Flight search & price comparison
│   │   │   ├── HotelsPage.jsx     # Hotel listings & amenity filters
│   │   │   ├── TrainsPage.jsx     # Indian Railways train schedules
│   │   │   ├── BusesPage.jsx      # Luxury coach bus schedules
│   │   │   ├── PricePredictionPage.jsx # ML flight price forecast studio
│   │   │   ├── DataAnalyticsPage.jsx   # Seasonal charts & price variance
│   │   │   ├── AiAssistantPage.jsx     # Gemini AI chat interface
│   │   │   ├── DatasetManagementPage.jsx # ETL preview & CSV upload
│   │   │   ├── SqlExplorerPage.jsx     # Interactive SQL runner & visualizer
│   │   │   ├── ReportsPage.jsx         # Power BI exports & guides
│   │   │   └── SettingsPage.jsx        # Telemetry & API keys configuration
│   │   ├── services/
│   │   │   └── api.js             # Axios client communicating with FastAPI
│   │   ├── App.jsx                # Root view router
│   │   ├── index.css              # Tailwind directives & sleek scrollbars
│   │   └── main.jsx               # React entry point
│   ├── package.json               # Node.js dependencies
│   ├── tailwind.config.js         # Midnight navy & electric accents theme
│   └── vite.config.js             # Vite configuration with proxy
├── models/
│   ├── flight_price_rf_model.joblib # Trained Random Forest artifact
│   └── model_metrics.json         # Evaluation metrics & feature importances
├── reports/
│   ├── PowerBI_TravelLens_Flights.csv
│   ├── PowerBI_Monthly_Trends.csv
│   └── PowerBI_Airline_Performance.csv
├── .env.example
├── .gitignore
├── README.md
├── requirements.txt
├── run_project.bat                # Windows batch launcher
└── run_project.ps1                # PowerShell launcher
```

---

## 4. Setup and Installation Instructions

### Prerequisites
- **Python**: 3.10+ (Tested on Python 3.13)
- **Node.js**: v18+ or v20+ (with npm)
- **MySQL**: 8.x Community Server

---

### Step 1: MySQL Database Initialization
1. Ensure your MySQL Server is running on port `3306`.
2. Connect to MySQL and initialize the database schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   *(If your root user has no password, simply run `mysql -u root < database/schema.sql`)*.

---

### Step 2: Backend Setup (Python + FastAPI)

1. Create and activate a Python virtual environment:
   - **Windows**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **macOS (Apple Silicon M1/M2/M3/M4) / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

2. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Configure environment variables in `backend/.env`:
   ```ini
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_HOST=127.0.0.1
   MYSQL_PORT=3306
   MYSQL_DATABASE=travellens_db
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Run the ETL Pipeline (extracts, cleans, and seeds authentic data into MySQL):
   ```bash
   python backend/etl/pipeline.py
   ```

5. Train the Random Forest Regressor Model:
   ```bash
   python backend/ml/train.py
   ```

6. Start the FastAPI Backend Server:
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - API Root: `http://127.0.0.1:8000`
   - Interactive Swagger UI: `http://127.0.0.1:8000/docs`

---

### Step 3: Frontend Setup (React + Vite)

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   ```
   http://127.0.0.1:3000
   ```

---

## 5. One-Click Quick Start (Windows)

Simply double-click `run_project.bat` or run:
```powershell
.\run_project.ps1
```
This automatically verifies the database, launches FastAPI on `127.0.0.1:8000`, and starts the React frontend on `127.0.0.1:3000`.

---

## 6. Verification Checklist

- [x] **3D Earth Globe**: Interactive 3D Earth with animated travel routes and smooth rotation.
- [x] **FastAPI Backend**: Responding on `http://127.0.0.1:8000` with interactive Swagger docs at `/docs`.
- [x] **MySQL Database**: Genuinely connected to `travellens_db` with 8,211 authentic records.
- [x] **SQL Analytics**: Live execution of CTEs, Window functions, and Views in SQL Explorer.
- [x] **Machine Learning**: RandomForestRegressor producing genuine predictions (R²: 0.9827, MAE: ±₹288.13).
- [x] **Multi-Modal Comparison**: Separate search interfaces for Flights, Hotels, Trains, and Buses.
- [x] **ETL Pipeline**: Pandas & NumPy cleaning with duplicate removal, null handling, and audit logs.
- [x] **Gemini AI**: Context-grounded conversational assistant.
- [x] **Power BI Exports**: Clean CSV models in `reports/` with documentation in `documentation/POWER_BI_GUIDE.md`.
