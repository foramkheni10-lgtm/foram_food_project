from pydantic import BaseModel, Field
from typing import Optional


class InventoryCreate(BaseModel):

    ingredient_id: str

    quantity: float = Field(..., ge=0)

    unit: str = Field(..., min_length=1)

    minimum_stock: float = Field(..., ge=0)

    supplier_id: Optional[str] = None


class InventoryUpdate(BaseModel):

    ingredient_id: Optional[str] = None

    quantity: Optional[float] = Field(None, ge=0)

    unit: Optional[str] = Field(None, min_length=1)

    minimum_stock: Optional[float] = Field(None, ge=0)

    supplier_id: Optional[str] = None
