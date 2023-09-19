from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, FormField

from simulator.forms.exposure import ExposureForm
from simulator.forms.throughput import ThroughputForm


class MainForm(FlaskForm):
    configure = FormField(ThroughputForm)
    exposure = FormField(ExposureForm)
