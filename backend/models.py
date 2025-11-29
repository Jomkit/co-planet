from app import db
from datetime import datetime
import json

class Trip(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(200))
    destination_place_name = db.Column(db.String(255))
    destination_lat = db.Column(db.Float)
    destination_lng = db.Column(db.Float)
    destination_mapbox_id = db.Column(db.String(100))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    summary = db.Column(db.Text)
    people = db.Column(db.Text) # Storing as JSON string for MVP
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    activities = db.relationship('Activity', backref='trip', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'destination': self.destination,
            'destination_place_name': self.destination_place_name,
            'destination_lat': self.destination_lat,
            'destination_lng': self.destination_lng,
            'destination_mapbox_id': self.destination_mapbox_id,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'summary': self.summary,
            'people': json.loads(self.people) if self.people else [],
            'created_at': self.created_at.isoformat()
        }

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trip.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50))
    date = db.Column(db.DateTime)
    location = db.Column(db.String(200))
    notes = db.Column(db.Text)
    status = db.Column(db.String(20), default='planned')

    def to_dict(self):
        return {
            'id': self.id,
            'trip_id': self.trip_id,
            'name': self.name,
            'type': self.type,
            'date': self.date.isoformat() if self.date else None,
            'location': self.location,
            'notes': self.notes,
            'status': self.status
        }
