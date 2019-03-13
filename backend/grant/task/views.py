from datetime import datetime
from flask import Blueprint, jsonify, current_app
from sentry_sdk import capture_exception
from traceback import format_exc

from grant.task.jobs import JOBS
from grant.task.models import Task, tasks_schema
from grant.extensions import db

blueprint = Blueprint("task", __name__, url_prefix="/api/v1/task")


@blueprint.route("/", methods=["GET"])
def task():
    tasks = Task.query.filter(Task.execute_after <= datetime.now()).filter_by(completed=False).all()
    for each_task in tasks:
        try:
            JOBS[each_task.job_type](each_task)
            each_task.completed = True
            db.session.add(each_task)
        except Exception as e:
            current_app.logger.info("Task #{} failed: {}".format(each_task.id, e))
            capture_exception(e)
    db.session.commit()
    return jsonify(tasks_schema.dump(tasks))
