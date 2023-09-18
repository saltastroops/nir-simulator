from flask import Blueprint, render_template, redirect, url_for
from .forms import TaskForm
from .forms.throughput import Throughput as ThroughputForm
from .models import db, Task
from .models.throughput import ThroughputSpectra
from .utils.throughput import create_bokeh_plot

main = Blueprint('main', __name__)


@main.route('/')
def generate():
    return render_template('generate.html')


@main.route('/configure', methods=['GET', 'POST'])
def configure():
    throughput_form = ThroughputForm()
    html = create_bokeh_plot(ThroughputSpectra(), throughput_form.data)
    if throughput_form.data["update_throughput"]:
        pass
        # return redirect(url_for('main.configure'))
    return render_template(
        'configure.html',
        form=throughput_form,
        html=html
    )


@main.route('/exposure',)
def exposure():
    return render_template('exposure.html')


@main.route('/index', methods=['GET', 'POST'])
def index():
    form = TaskForm()

    if form.validate_on_submit():
        new_task = Task(description=form.task.data)
        db.session.add(new_task)
        db.session.commit()
        return redirect(url_for('main.index'))

    tasks = Task.query.all()
    return render_template('index.html', form=form, tasks=tasks)


@main.route('/complete/<int:task_id>')
def complete_task(task_id):
    task = Task.query.get(task_id)
    if task:
        task.completed = True
        db.session.commit()
    return redirect(url_for('main.index'))
