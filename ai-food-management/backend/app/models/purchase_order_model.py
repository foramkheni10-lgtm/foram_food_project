from pydantic import BaseModel, Field
from typing import Optional, Literal


class PurchaseOrderCreate(BaseModel):
    supplier_id: str = Field(min_length=1)
    ingredient_name: str = Field(min_length=1)
    quantity: float = Field(gt=0)
    unit: str = Field(min_length=1)
    status: Literal["pending", "ordered"] = "pending"


class PurchaseOrderUpdate(BaseModel):
    supplier_id: Optional[str] = Field(default=None, min_length=1)
    ingredient_name: Optional[str] = Field(default=None, min_length=1)
    quantity: Optional[float] = Field(default=None, gt=0)
    unit: Optional[str] = Field(default=None, min_length=1)
    status: Optional[Literal["pending", "ordered"]] = None
