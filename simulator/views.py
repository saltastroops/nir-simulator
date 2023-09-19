from flask import Blueprint, render_template, redirect, url_for, g
from .forms import MainForm
from .models.throughput import ThroughputSpectra
from .utils.throughput import create_bokeh_plot

main = Blueprint('main', __name__)


@main.route('/', methods=['GET', 'POST'])
def generate():
    form = MainForm()
    html = create_bokeh_plot(ThroughputSpectra(), form.data["configure"])
    if form.data["configure"]["update_throughput"]:
        html = create_bokeh_plot(ThroughputSpectra(), form.data["configure"])

    return render_template(
        'base.html',
        form=form,
        html=html
    )
