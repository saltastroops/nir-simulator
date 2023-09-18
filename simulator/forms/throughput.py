from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, RadioField, SelectField
from wtforms.validators import DataRequired


class Throughput(FlaskForm):
    configuration_options = RadioField(
        'Favorite Color',
        choices=[('imaging-mode', 'Imaging Mode'), ('spectroscopy-mode', 'Spectroscopy Mode')],
        default='imaging-mode'
    )
    slit_type = SelectField(
        'Slit Type',
        choices=[('longslit', 'Longslit')],
        default='longslit'
    )
    slit_width = SelectField(
        'Slit Type',
        choices=[
            ('0.6', '0.6'),
            ('1.0', '1.0'),
            ('1.25', '1.25'),
            ('1.5', '1.5'),
            ('2', '2'),
            ('3', '3'),
            ('4', '4')
        ],
        default='1.5'
    )
    filter = SelectField(
        'Filter',
        choices=[('clear-filter', 'Clear Filter'), ('lwbf', 'LWBF')],
        default='clear-filter'
    )
    grating = SelectField(
        'Slit Type',
        choices=[('950', '950')],
        default='950'
    )
    grating_angle = SelectField(
        'Slit Type',
        choices=[
            ('30', '30'),
            ('35', '35'),
            ('40', '40'),
            ('45', '45'),
            ('50', '50'),

        ],
        default='40'
    )
    update_throughput = SubmitField('Update Throughput')


