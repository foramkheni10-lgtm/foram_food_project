
from pydantic import BaseModel, Field
from typing import Optional


class FoodFeedbackCreate(BaseModel):
    order_id: str
    food_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = ""