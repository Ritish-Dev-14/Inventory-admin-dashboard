from typing import Optional
from sqlmodel import SQLModel
from datetime import datetime

class ItemCreate(SQLModel):
    department: str
    item_name: str
    page: Optional[int] = None
    closing_balance: Optional[float] = None
    note: Optional[str] = None

class ItemUpdate(SQLModel):
    department: Optional[str] = None
    item_name: Optional[str] = None
    page: Optional[int] = None
    closing_balance: Optional[float] = None
    note: Optional[str] = None

class ItemRead(SQLModel):
    id: int
    department: str
    item_name: str
    page: Optional[int]
    closing_balance: Optional[float]
    last_updated: datetime
