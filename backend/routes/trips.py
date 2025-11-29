from flask import Blueprint, request, jsonify
from app import db
from models import Trip, Activity
from datetime import datetime
import json

trips_bp = Blueprint('trips', __name__)

@trips_bp.route('/api/trips', methods=['POST'])
def create_trip():
    data = request.get_json()
    try:
        destination_lat = float(data.get('destination_lat')) if data.get('destination_lat') is not None else None
        destination_lng = float(data.get('destination_lng')) if data.get('destination_lng') is not None else None

        if destination_lat is None or destination_lng is None:
            return jsonify({'error': 'Destination coordinates are required. Please select a validated place.'}), 400

        new_trip = Trip(
            name=data['name'],
            destination=data.get('destination') or data.get('destination_place_name'),
            destination_place_name=data.get('destination_place_name'),
            destination_lat=destination_lat,
            destination_lng=destination_lng,
            destination_mapbox_id=data.get('destination_mapbox_id'),
            start_date=datetime.fromisoformat(data['start_date']).date() if data.get('start_date') else None,
            end_date=datetime.fromisoformat(data['end_date']).date() if data.get('end_date') else None,
            summary=data.get('summary'),
            people=json.dumps(data.get('people', []))
        )
        db.session.add(new_trip)
        db.session.commit()
        return jsonify(new_trip.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@trips_bp.route('/api/trips', methods=['GET'])
def get_trips():
    trips = Trip.query.order_by(Trip.created_at.desc()).all()
    return jsonify([trip.to_dict() for trip in trips])

@trips_bp.route('/api/trips/<int:id>', methods=['GET'])
def get_trip(id):
    trip = Trip.query.get_or_404(id)
    trip_data = trip.to_dict()
    trip_data['activities'] = [activity.to_dict() for activity in trip.activities]
    return jsonify(trip_data)

@trips_bp.route('/api/trips/<int:id>', methods=['PUT'])
def update_trip(id):
    trip = Trip.query.get_or_404(id)
    data = request.get_json()
    try:
        if 'name' in data: trip.name = data['name']
        if 'destination' in data or 'destination_place_name' in data or 'destination_lat' in data or 'destination_lng' in data:
            lat = float(data.get('destination_lat')) if data.get('destination_lat') is not None else None
            lng = float(data.get('destination_lng')) if data.get('destination_lng') is not None else None

            if (lat is None) != (lng is None):
                return jsonify({'error': 'Destination latitude and longitude must both be provided.'}), 400

            if lat is not None and lng is not None:
                trip.destination_lat = lat
                trip.destination_lng = lng

            if 'destination' in data or 'destination_place_name' in data:
                trip.destination = data.get('destination') or data.get('destination_place_name')
                trip.destination_place_name = data.get('destination_place_name')

            if 'destination_mapbox_id' in data:
                trip.destination_mapbox_id = data.get('destination_mapbox_id')
        if 'start_date' in data: trip.start_date = datetime.fromisoformat(data['start_date']).date()
        if 'end_date' in data: trip.end_date = datetime.fromisoformat(data['end_date']).date()
        if 'summary' in data: trip.summary = data['summary']
        if 'people' in data: trip.people = json.dumps(data['people'])
        
        db.session.commit()
        return jsonify(trip.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@trips_bp.route('/api/trips/<int:id>', methods=['DELETE'])
def delete_trip(id):
    trip = Trip.query.get_or_404(id)
    db.session.delete(trip)
    db.session.commit()
    return jsonify({'message': 'Trip deleted successfully'})
