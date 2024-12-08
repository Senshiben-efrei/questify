from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import TypeDecorator
import json
from ..utils.json_encoder import CustomJSONEncoder

class JSONBType(TypeDecorator):
    impl = JSONB
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.loads(
                json.dumps(value, cls=CustomJSONEncoder)
            )
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return value
        return value 