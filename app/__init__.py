from flask import Flask, render_template
from flask_bootstrap import Bootstrap

app = Flask(__name__)
Bootstrap(app)

# Create a blueprint for the tabs
from flask import Blueprint

tabs = Blueprint('/', __name__)


@tabs.route('/')
def generate():
    return render_template('generate.html')


@tabs.route('/configure')
def configure():
    return render_template('configure.html')


@tabs.route('/exposure')
def exposure():
    return render_template('exposure.html')


app.register_blueprint(tabs)

if __name__ == '__main__':
    app.run(debug=True)
