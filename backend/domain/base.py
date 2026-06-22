"""Shared persistence primitives — ObjectId handling and the base document model.

Single source of truth: every stored entity extends BaseDocument and uses
from_mongo()/to_mongo() rather than spreading raw Mongo dicts.
"""
from datetime import datetime, timezone
from typing import Annotated, Any, Optional

from bson import ObjectId
from pydantic import BaseModel, BeforeValidator, ConfigDict, Field


def _validate_object_id(v: Any) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str):
        return v
    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[str, BeforeValidator(_validate_object_id)]


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def utc_now_iso() -> str:
    return utc_now().isoformat()


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc: Optional[dict]):
        if not doc:
            return None
        return cls(**doc)

    def to_mongo(self, exclude_none: bool = True) -> dict:
        return self.model_dump(by_alias=True, exclude={"id"}, exclude_none=exclude_none)
