from flask import Flask, render_template
from flask_bootstrap import Bootstrap
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from config import Config
from flask import Blueprint


db = SQLAlchemy()
csrf = CSRFProtect()


# Create a blueprint for the tabs

def create_app(config_class=Config):
    app = Flask(__name__, template_folder='templates')

    app.config.from_object(Config)
    db.init_app(app)
    csrf.init_app(app)
    migrate = Migrate(app, db)
    Bootstrap(app)


    with app.app_context():
        from .views import main  # Import the Blueprint

        # Register the Blueprint with the app
        app.register_blueprint(main)

        return app
