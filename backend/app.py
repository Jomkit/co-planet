from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
import os

app = Flask(__name__)
CORS(app)

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'co_planet.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

from models import Trip, Activity
from routes.trips import trips_bp
from routes.activities import activities_bp

app.register_blueprint(trips_bp)
app.register_blueprint(activities_bp)

@app.route('/')
def hello():
    return "Co-Planet API is running!"

if __name__ == '__main__':
    app.run(debug=True)
