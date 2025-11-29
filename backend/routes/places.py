from flask import Blueprint, request, jsonify
import os
import requests
from urllib.parse import quote

places_bp = Blueprint('places', __name__)


@places_bp.route('/api/places/search')
def search_places():
    mapbox_token = os.environ.get('MAPBOX_ACCESS_TOKEN') or os.environ.get('MAPBOX_TOKEN')
    query = request.args.get('query')

    if not query:
        return jsonify({'error': 'A search query is required.'}), 400

    if not mapbox_token:
        return jsonify({'error': 'Mapbox access token is not configured on the server.'}), 500

    try:
        response = requests.get(
            f"https://api.mapbox.com/geocoding/v5/mapbox.places/{quote(query)}.json",
            params={
                'access_token': mapbox_token,
                'autocomplete': 'true',
                'types': 'place,region,locality,neighborhood,postcode',
                'limit': 5
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()

        features = []
        for feature in data.get('features', []):
            center = feature.get('center', [])
            if len(center) != 2:
                continue
            features.append({
                'id': feature.get('id'),
                'place_name': feature.get('place_name'),
                'text': feature.get('text'),
                'latitude': center[1],
                'longitude': center[0],
                'context': feature.get('context', [])
            })

        return jsonify({'features': features})
    except requests.RequestException as e:
        return jsonify({'error': f'Failed to fetch places from Mapbox: {str(e)}'}), 502
