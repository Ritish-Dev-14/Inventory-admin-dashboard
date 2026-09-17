from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class ItemBase(SQLModel):
    department: str
    item_name: str
    page: Optional[int] = None
    closing_balance: Optional[float] = None

class Item(ItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class StockHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    item_id: int
    old_value: Optional[float] = None
    new_value: Optional[float] = None
    changed_at: datetime = Field(default_factory=datetime.utcnow)
    note: Optional[str] = None
