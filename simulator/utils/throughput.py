import math

from bokeh.plotting import figure, output_file, show
from bokeh.embed import file_html
from bokeh.resources import CDN

from simulator.models.spectrum import VariableModifier, ConstantModifier

detector = VariableModifier("data_sheets/adjusted_program_datasheets/detectorqe.csv", "detector")
telescope = VariableModifier("data_sheets/adjusted_program_datasheets/combinedtelescope.csv", "telescope")
nirsky = VariableModifier("data_sheets/adjusted_program_datasheets/nirskytransmission.csv", "nirsky")
clearfilter = VariableModifier("data_sheets/adjusted_program_datasheets/clearfiltertransmission.csv", "clearfilter")
lwbf = VariableModifier("data_sheets/adjusted_program_datasheets/lwbftransmission.csv", "lwbf")
grating30 = VariableModifier("data_sheets/adjusted_program_datasheets/tempVPH30.csv", '30')
grating35 = VariableModifier("data_sheets/adjusted_program_datasheets/tempVPH35.csv", '35')
grating40 = VariableModifier("data_sheets/adjusted_program_datasheets/tempVPH40.csv", '40')
grating45 = VariableModifier("data_sheets/adjusted_program_datasheets/tempVPH45.csv", '45')
grating50 = VariableModifier("data_sheets/adjusted_program_datasheets/tempVPH50.csv", '50')

grating_angle_store = {
    '30': grating30,
    '35': grating35,
    '40': grating40,
    '45': grating45,
    '50': grating50
}

ZA = 31  # IntVar() TODO What is the value of ZA this needs to be set as Global variable from General specta Tab


def query_configure_modifiers(form_data):
    modifier_list = [telescope, detector]
    if form_data["configuration_options"] == "imaging-mode":
        if form_data["filter"] == "clear-filter":
            modifier_list.append(clearfilter)
        elif form_data["filter"] == "lwbf":
            modifier_list.append(lwbf)
    elif form_data["configuration_options"] == "spectroscopy-mode":
        slit_losses = math.erf(
            (float(form_data["slit_width"]) * math.sqrt(math.log(2)))
            / math.sqrt(
                0.6**2
                + ((1 / math.cos(ZA * math.pi / 180)) ** (3 / 5) * 1)
                ** 2
            )
        )
        slit = ConstantModifier(slit_losses, "slit")
        modifier_list.append(slit)
        if form_data["filter"] == "clear-filter":
            modifier_list.append(clearfilter)
        elif form_data["filter"] == "lwbf":
            modifier_list.append(lwbf)
        if form_data["grating"] == "950":
            modifier_list.append(grating_angle_store[form_data["grating_angle"]])

    return modifier_list


def instrument_tput_update(throughput_spectra, form_data):

    tputlis = []
    modifier_list = query_configure_modifiers(form_data)
    throughput_spectra.adjust_spectrum(modifier_list)

    wavelength = []
    throughput = []
    for i in range(0, 40001, 500):
        tputlis.append((throughput_spectra.wavelength[i], throughput_spectra.modified_spectra[i]))

    for l, t in tputlis:
        wavelength.append(l)
        throughput.append(t)
    return wavelength, throughput


def create_bokeh_plot(throughput_spectra, form_data):
    # Create a Bokeh plot
    plot = figure(
        title="Telescope Throughput",
        x_axis_label="Wavelength (\u00E2\u2329\u00AB)",
        y_axis_label="Throughput",
        width=1200,
        height=500,
        y_range=[-0.015, 0.35]
    )

    wavelength, throughput = instrument_tput_update(throughput_spectra, form_data)
    plot.line(wavelength, throughput, line_width=2)
    # Embed the plot components (HTML and JavaScript)
    html = file_html(plot, CDN, "Telescope Throughput")
    return html
