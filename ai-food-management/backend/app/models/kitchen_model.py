
from pydantic import BaseModel, Field
from typing import List, Optional


class KitchenIngredient(BaseModel):
    ingredient_name: str
    quantity_required: float = Field(..., ge=0)
    unit: str


class KitchenCreate(BaseModel):
    order_id: str
    food_name: str
    quantity: int = Field(..., ge=1)
    status: str = "pending"
    estimated_time: int = Field(..., ge=0)
    ingredients: List[KitchenIngredient]


class KitchenUpdate(BaseModel):
    order_id: Optional[str] = None
    food_name: Optional[str] = None
    quantity: Optional[int] = Field(None, ge=1)
    status: Optional[str] = None
    estimated_time: Optional[int] = Field(None, ge=0)
    ingredients: Optional[List[KitchenIngredient]] = None
