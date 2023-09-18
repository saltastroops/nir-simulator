from simulator import db


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    completed = db.Column(db.Boolean, default=False)

    def __init__(self, description):
        self.description = description

    def __repr__(self):
        return f"Task('{self.description}', '{self.completed}')"

