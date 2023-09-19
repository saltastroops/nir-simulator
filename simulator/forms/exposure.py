from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, RadioField, SelectField, FormField
from wtforms.validators import DataRequired


class GainOptions(FlaskForm):
    electrons = StringField(
        'Electrons',
        default='1'
    )
    read_noice = StringField(
        'Read Noice',
        default='10'
    )
    full_well = StringField(
        'Full Well',
        default='100 000'
    )


class ExposureForm(FlaskForm):
    gain = RadioField(
        'Gain',
        choices=[
            ('bright-object', 'Bright Object', 'expo-bright-object'),
            ('faint-object', 'Faint Object', 'expo-faint-object'),
            ('custom-object', 'Custom Object', 'expo-custom-object')
        ],
        default='faint-object'
    )
    sampling = RadioField(
        'Sampling',
        choices=[
            ('expo-fowler-sampling', 'Fowler', 'images/Fowler.png'),
            ('expo-up-the-ramp-sampling', 'Up The Ramp', 'images/UpTheRamp.png'),
        ],
        default='expo-fowler-sampling'
    )
    samples_number = StringField(
        'Number Of Samples',
        default="20"

    )
    electrons = StringField(
        'Electrons',
        default='1'
    )
    read_noice = StringField(
        'Read Noice',
        default='10'
    )
    full_well = StringField(
        'Full Well',
        default='100 000'
    )
    exposure_time = StringField(
        'Exposure Time',
        default='3600'
    )
    detector_iterations = StringField(
        'Detector Iterations',
        default='1'
    )

    requested_snr = StringField(
        'Requested SNR',
        default='10'
    )
    requested_snr_wavelength = RadioField(
        'Requested SNR',
        choices=[
            ('central_wavelength', 'Central Wavelength'),
            ('specified_wavelength', 'Specified Wavelength')
        ],
        default='faint-object'
    )

    central_wavelength = StringField(
        'Central Wavelength',
        default='13000',
        render_kw={'disabled': True}
    )
    specified_wavelength = StringField(
        'Specified Wavelength',
        default='13000',
        render_kw={'disabled': True}
    )
    solve_snr = SubmitField('Solve For Signal To Noice')
    solve_ext = SubmitField('Solve For Exposure Time')

    def set_default_values(self):
        selected_gain_type = self.gain.data

        # Modify custom_value based on the selected_option
        if selected_gain_type == 'faint-object':
            self.electrons.data = '2.04'
            self.read_noice.data = '17'
            self.full_well.data = '60 000'

        if selected_gain_type == 'bright-object':
            self.electrons.data = '5.74'
            self.read_noice.data = '20'
            self.full_well.data = '120 000'






