import json

from grant.extensions import ma, db
from sqlalchemy.ext import mutable


class JsonEncodedDict(db.TypeDecorator):
    """Enables JSON storage by encoding and decoding on the fly."""
    impl = db.Text

    def process_bind_param(self, value, dialect):
        if value is None:
            return '{}'
        else:
            return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return {}
        else:
            return json.loads(value)


mutable.MutableDict.associate_with(JsonEncodedDict)


class Task(db.Model):
    __tablename__ = 'task'

    id = db.Column(db.Integer(), primary_key=True)
    job_id = db.Column(db.Integer(), nullable=False)
    blob = db.Column(JsonEncodedDict, nullable=False)
    execute_after = db.Column(db.DateTime, nullable=False)
    completed = db.Column(db.Boolean, default=False)

    def __init__(self, job_id, blob, execute_after, completed=False):
        assert job_id in list(JOBS.keys()), "Not a valid job"
        self.job_id = job_id
        self.blob = blob
        self.execute_after = execute_after
        self.completed = completed


class TaskSchema(ma.Schema):
    class Meta:
        model = Task
        # Fields to expose
        fields = (
            "id",
            "job_id",
            "blob",
            "execute_after",
            "completed"
        )


task_schema = TaskSchema()
tasks_schema = TaskSchema(many=True)
