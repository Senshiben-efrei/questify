from .base import Base, JSONBType
# ... other imports ...

class Routine(Base):
    __tablename__ = 'routines'

    # ... other columns ...
    queue = Column(JSONBType, nullable=False) 