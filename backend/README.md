# Co-Planet Backend

The backend API server for Co-Planet, a collaborative trip planning application. Built with Flask and SQLAlchemy, this RESTful API manages trips, activities, and trip-related data.

## Overview

Co-Planet Backend is a Flask-based REST API that provides endpoints for creating, managing, and organizing trips and their associated activities. It uses SQLite for data persistence and supports CORS for frontend integration.

## Project Structure

```
backend/
├── app.py                 # Flask application initialization and configuration
├── models.py              # SQLAlchemy database models (Trip, Activity)
├── routes/
│   ├── trips.py          # Trip-related API endpoints
│   ├── activities.py     # Activity-related API endpoints
│   └── places.py         # Mapbox-backed place search endpoint
├── co_planet.db          # SQLite database file
├── requirements.txt      # Python dependencies
└── venv/                 # Virtual environment (not tracked in git)
```

## Features

### Trip Management
- Create new trips with destination, dates, summary, and attendees
- Validate destinations with Mapbox geocoding (stored place name + coordinates)
- View all trips or individual trip details
- Update trip information
- Delete trips (cascades to associated activities)

### Activity Management
- Add activities to trips (excursions, restaurants, flights, lodging)
- Update activity details
- Delete activities
- Activities are automatically linked to their parent trip

## Database Models

### Trip
- `id`: Primary key
- `name`: Trip name (required)
- `destination`: Trip destination(s) (backwards-compatible text)
- `destination_place_name`: Normalized destination name from Mapbox
- `destination_lat`: Latitude from Mapbox geocoding
- `destination_lng`: Longitude from Mapbox geocoding
- `destination_mapbox_id`: Mapbox feature id (optional caching key)
- `start_date`: Trip start date
- `end_date`: Trip end date
- `summary`: Trip description
- `people`: JSON array of attendees
- `created_at`: Timestamp
- `activities`: One-to-many relationship with Activity model

### Activity
- `id`: Primary key
- `trip_id`: Foreign key to Trip (required)
- `name`: Activity name (required)
- `type`: Activity type (excursion, restaurant, flight, lodging)
- `date`: Activity date/time
- `location`: Activity location
- `notes`: Additional notes
- `status`: Activity status (default: 'planned')

## API Endpoints

### Trips

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/trips` | Get all trips |
| `POST` | `/api/trips` | Create a new trip |
| `GET` | `/api/trips/<id>` | Get trip details with activities |
| `PUT` | `/api/trips/<id>` | Update trip information |
| `DELETE` | `/api/trips/<id>` | Delete a trip |

### Activities

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/trips/<trip_id>/activities` | Add activity to a trip |
| `PUT` | `/api/activities/<id>` | Update an activity |
| `DELETE` | `/api/activities/<id>` | Delete an activity |

### Places (Mapbox Geocoding Proxy)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/places/search?query=<text>` | Search for destinations via Mapbox (requires access token) |

### Root

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check endpoint |

## Setup and Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Environment Variables

Copy the provided example file and fill in your credentials before running the server:

```bash
cp .env.example .env
```

Load the variables into your shell (or export them via your preferred method):

```bash
export $(grep -v '^#' .env | xargs)
```

- `MAPBOX_ACCESS_TOKEN` (required): Mapbox token used by the `/api/places/search` geocoding proxy.
- `MAPBOX_TOKEN` (optional): Alternate variable name supported by the proxy.

### Installation Steps

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Initialize the database:**
   ```bash
   flask db upgrade
   ```
   
   If migrations haven't been created yet, you can initialize the database by running:
   ```bash
   python
   >>> from app import app, db
   >>> with app.app_context():
   ...     db.create_all()
   >>> exit()
   ```

## Running the Server

1. **Ensure your virtual environment is activated**

2. **Run the Flask development server:**
   ```bash
   python app.py
   ```
   
   Or using Flask CLI:
   ```bash
   flask run
   ```

3. **The server will start on `http://localhost:5000`**

You should see output similar to:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

## Development

### Dependencies

The project uses the following main dependencies:
- **flask**: Web framework
- **flask-cors**: Cross-Origin Resource Sharing support
- **flask-sqlalchemy**: SQLAlchemy integration for Flask
- **flask-migrate**: Database migration support
- **pytest**: Testing framework

### Database Migrations

To create a new migration after model changes:
```bash
flask db migrate -m "Description of changes"
flask db upgrade
```

#### Why the new destination migration fixes the missing-column error
If you see an error such as `table trip has no column named destination_place_name` when creating a trip, it means the database was created before the Mapbox destination fields existed. The initial Alembic migration (`20250212_add_destination_coordinates.py`) now:

- Creates the `trip` and `activity` tables from scratch on a brand-new database **with** the destination columns included.
- Adds the destination columns to an existing `trip` table that was created manually (outside Alembic) so you do not need to rebuild your data.

To apply the fix on an existing database, run:

```bash
flask db upgrade
```

If you prefer a clean slate for local development, you can also remove `co_planet.db` and rerun `flask db upgrade` to recreate the schema with the corrected columns.

### Testing

Run tests using pytest:
```bash
pytest
```

## Configuration

The application uses the following configuration:
- **Database**: SQLite (`co_planet.db` in the backend directory)
- **CORS**: Enabled for all origins (suitable for development)
- **Debug Mode**: Enabled when running via `app.py`
- **Mapbox**: Set `MAPBOX_ACCESS_TOKEN` (or `MAPBOX_TOKEN`) to enable `/api/places/search`

## API Response Format

All endpoints return JSON responses. Successful responses include the requested data, while errors return an error message:

**Success Example:**
```json
{
  "id": 1,
  "name": "Road Trip to California",
  "destination": "California, Nevada",
  "start_date": "2024-06-01",
  "end_date": "2024-06-10",
  "summary": "Epic west coast adventure",
  "people": ["Me", "John", "Jane"],
  "created_at": "2024-01-15T10:30:00"
}
```

**Error Example:**
```json
{
  "error": "Trip not found"
}
```

## Notes

- The database file (`co_planet.db`) is created automatically on first run
- All dates should be in ISO format (YYYY-MM-DD)
- The `people` field is stored as a JSON string in the database
- Deleting a trip will automatically delete all associated activities (cascade delete)
