from flask import Blueprint, request, jsonify
from app import db
from models import Activity, Trip
from datetime import datetime

activities_bp = Blueprint('activities', __name__)

@activities_bp.route('/api/trips/<int:trip_id>/activities', methods=['POST'])
def add_activity(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    data = request.get_json()
    try:
        new_activity = Activity(
            trip_id=trip.id,
            name=data['name'],
            type=data.get('type'),
            date=datetime.fromisoformat(data['date']) if data.get('date') else None,
            location=data.get('location'),
            notes=data.get('notes'),
            status=data.get('status', 'planned')
        )
        db.session.add(new_activity)
        db.session.commit()
        return jsonify(new_activity.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@activities_bp.route('/api/activities/<int:id>', methods=['PUT'])
def update_activity(id):
    activity = Activity.query.get_or_404(id)
    data = request.get_json()
    try:
        if 'name' in data: activity.name = data['name']
        if 'type' in data: activity.type = data['type']
        if 'date' in data: activity.date = datetime.fromisoformat(data['date'])
        if 'location' in data: activity.location = data['location']
        if 'notes' in data: activity.notes = data['notes']
        if 'status' in data: activity.status = data['status']
        
        db.session.commit()
        return jsonify(activity.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@activities_bp.route('/api/activities/<int:id>', methods=['DELETE'])
def delete_activity(id):
    activity = Activity.query.get_or_404(id)
    db.session.delete(activity)
    db.session.commit()
    return jsonify({'message': 'Activity deleted successfully'})
