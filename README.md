# GPS-Based Fuel Deviation Detection System for Mining Vehicles

An end-to-end IoT solution for mining vehicle monitoring using GPS data, edge processing, a backend ingestion pipeline, and a live Mapbox dashboard.

This system detects:
- Route deviation
- Idle behavior
- high fuel consumption detection

It is designed as a practical mining operations monitoring system where GPS devices connected to a Raspberry Pi send location data, edge logic identifies inefficiencies, and a web dashboard visualizes live movement and alerts.

---

## Key Features

- Raspberry Pi interfacing with multiple GPS modules
- GPS data parsing:
  - Latitude
  - Longitude
  - Speed
  - Timestamp
- Edge-level detection logic for:
  - Route deviation
  - Idle behavior
  - Fuel anomaly detection
- Backend API for GPS ingestion
- MongoDB-based data storage
- Real-time dashboard using React + Mapbox
- Socket.IO live updates
- Replay mode for vehicle path visualization
- Alerts panel for active mining vehicle events

---
## Setup For Accessing the Deployed Dashboard via Live URL


Clone the Raspberry Pi / edge repository:
```
git clone https://github.com/parthapritamkaran/IOTproject_raspberry
cd IOTproject_raspberry
```
Install Python dependencies:
```
pip install -r requirements.txt
```
Run the edge application:
```
python main.py
```
Open that link in the browser to view the dashboard.
```
https://io-tproject-frontend-z4e9-yf6oj0c6h.vercel.app/
```

## Setup for Running the Project Locally
This project is organized into three separate repositories:

- **Backend repository**
- **Frontend repository**
- **Raspberry Pi / Edge repository**

Clone each repository separately and set them up as follows.

### 1. Backend Setup

Clone the backend repository:

```bash
git clone https://github.com/parthapritamkaran/IOTproject_backend
cd IOTproject_backend
```
Install backend dependencies:

```bash
npm install
```
Create a .env file in the backend repository and add:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```
start server
```bash
node server.js
```
Expected console output:
```Bash
MongoDB Connected
Server running on port 5000
```
### 2. Frontend Setup
Clone the frontend repository:
```
git clone https://github.com/parthapritamkaran/IOTproject_frontend
cd IOTproject_frontend
```
Install frontend dependencies:
```
npm install
```
Create a .env file in the frontend repository and add:
```
VITE_MAPBOX_TOKEN=your_mapbox_access_token
VITE_API_URL=http://localhost:5000
```
Start the frontend development server:
```
npm run dev
```
You should get a local URL such as:
```
http://localhost:5173
```
Open that link in the browser to view the dashboard.

### 3. Raspberry Pi / Edge Setup

Clone the Raspberry Pi / edge repository:
```
git clone https://github.com/parthapritamkaran/IOTproject_raspberry
cd IOTproject_raspberry
```
Install Python dependencies:
```
pip install -r requirements.txt
```
In the Python code, set the backend ingestion URL:
```
SERVER_URL = "http://localhost:5000/api/gps-data"
```
Run the edge application:
```
python main.py
```


## Author

**Partha Pritam Karan**  
