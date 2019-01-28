from datetime import datetime

from flask import Blueprint, jsonify
from grant.task.jobs import JOBS
from grant.task.models import Task, tasks_schema

blueprint = Blueprint("task", __name__, url_prefix="/api/v1/task")


@blueprint.route("/", methods=["GET"])
def task():
    tasks = Task.query.filter(Task.execute_after <= datetime.now()).all()
    for each_task in tasks:
        JOBS[each_task.job_id](each_task.id)
    return jsonify(tasks_schema.dump(tasks))
