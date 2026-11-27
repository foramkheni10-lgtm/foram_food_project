from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


class InventoryTransactionCreate(BaseModel):
    ingredient_name: str
    transaction_type: Literal[
        "purchase",
        "usage",
        "adjustment"
    ]

    quantity: float = Field(gt=0)
    unit: str

    reference_id: Optional[str] = None
    notes: Optional[str] = None


class InventoryTransactionResponse(BaseModel):
    ingredient_name: str
    transaction_type: str
    quantity: float
    unit: str
    previous_stock: float
    new_stock: float
    reference_id: Optional[str] = None
    notes: Optional[str] = None
    transaction_date: datetime