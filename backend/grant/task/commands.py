import ast
from datetime import datetime

import click
from flask.cli import with_appcontext

from .models import Task, db


@click.command()
@click.argument('job_type')
@click.argument('blob')
@with_appcontext
def create_task(job_type, blob):
    task = Task(ast.literal_eval(job_type), ast.literal_eval(blob), datetime.now())
    db.session.add(task)
    db.session.commit()
