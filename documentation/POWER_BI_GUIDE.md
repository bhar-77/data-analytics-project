# TravelLens AI – Microsoft Power BI Integration Guide

This guide provides instructions to connect **Microsoft Power BI Desktop** to the **TravelLens AI** analytics engine, import historical datasets, and design executive business intelligence dashboards.

---

## 1. Data Connection Methods

You can connect Power BI to TravelLens AI using two approaches:

### Method A: Direct MySQL Database Connection (Live / DirectQuery)

1. Launch **Microsoft Power BI Desktop**.
2. On the **Home** tab, click **Get Data** → select **MySQL database** → click **Connect**.
3. In the MySQL database dialog:
   - **Server**: `127.0.0.1:3306` (or `localhost:3306`)
   - **Database**: `travellens_db`
   - **Data Connectivity Mode**: Select **Import** or **DirectQuery**.
4. Authentication prompt:
   - Select **Database** tab.
   - **User name**: `root`
   - **Password**: *(Leave blank if using default local configuration, or provide your MySQL password)*.
5. In the Navigator window, select the following analytical views and tables:
   - `v_airline_performance` (Carrier pricing & duration benchmarks)
   - `v_route_price_summary` (Trunk corridor route aggregates)
   - `v_monthly_category_trends` (Multi-month time-series)
   - `flights` (Full 8,150+ transactional flight records)
   - `cities` (Geospatial coordinate dimension)
6. Click **Load**.

---

### Method B: Pre-Formatted Power BI CSV Datasets (Offline / Fast Start)

If you prefer using pre-formatted, normalized CSV files:
1. Navigate to the `reports/` folder in the project directory, or download them directly from the web dashboard:
   - `reports/PowerBI_TravelLens_Flights.csv` (8,152 clean flight records)
   - `reports/PowerBI_Monthly_Trends.csv` (12-month category price indices)
   - `reports/PowerBI_Airline_Performance.csv` (Airline carrier metrics)
2. In Power BI, click **Get Data** → **Text/CSV** → browse to the file.
3. Review preview and click **Load**.

---

## 2. Recommended Data Modeling (Star Schema)

In Power BI **Model View**, establish the following relationships:

- **Fact Table**: `flights` (`PowerBI_TravelLens_Flights`)
  - Key Fields: `FlightID`, `Route`, `Airline`, `JourneyDate`, `CurrentPriceINR`
- **Dimension 1**: `cities`
  - Relationship: `cities.name` (1) ───< (Many) `flights.SourceCity`
  - Relationship: `cities.name` (1) ───< (Many) `flights.DestinationCity`
- **Dimension 2**: `airlines`
  - Relationship: `airlines.name` (1) ───< (Many) `flights.Airline`
- **Date Dimension**: Auto-calendar on `JourneyDate`

---

## 3. Recommended Dashboard Layout & Visuals

Design a canvas with dark theme (`#030712` background, cyan/blue `#00f0ff` accent) matching the TravelLens AI visual identity:

### Row 1: Executive KPI Cards
1. **Total Records Analysed**:
   - Visual: Card
   - Field: `COUNT(flights[FlightID])`
   - Value: ~8,211
2. **Average Flight Fare**:
   - Visual: Card
   - Field: `AVERAGE(flights[CurrentPriceINR])`
   - Format: Currency (₹)
3. **Cheapest Recorded Fare**:
   - Visual: Card
   - Field: `MIN(flights[CurrentPriceINR])`
   - Format: Currency (₹)
4. **Accuracy Score**:
   - Visual: Card
   - Value: `98.27% (Random Forest ML R²)`

### Row 2: Analytical Visualizations
1. **Airline Fare Competitiveness**:
   - Visual: Clustered Bar Chart
   - X-Axis: `Airline`
   - Y-Axis: `AVERAGE(CurrentPriceINR)` and `MIN(CurrentPriceINR)`
2. **Monthly Price Trends & Seasonality**:
   - Visual: Line and Clustered Area Chart
   - Shared Axis: `MonthYear`
   - Column Values: `AvgPriceINR`
   - Line Values: `MaxPriceINR`
3. **Multi-Modal Expenditure Breakdown**:
   - Visual: Donut Chart
   - Legend: `TravelCategory`
   - Values: `AvgPriceINR`

### Row 3: Geospatial & Route Matrix
1. **Interactive Route Bargain Matrix**:
   - Visual: Matrix
   - Rows: `SourceCity`, `DestinationCity`
   - Columns: `TravelClass`
   - Values: `MIN(CurrentPriceINR)`, `AVERAGE(CurrentPriceINR)`
2. **Interactive Slicers**:
   - Slicer 1: `SourceCity` dropdown
   - Slicer 2: `DestinationCity` dropdown
   - Slicer 3: `Stops` buttons (0 Non-stop, 1 Stop)
   - Slicer 4: `DaysLeft` slider (1 to 45 days)
