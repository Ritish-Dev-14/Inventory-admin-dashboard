from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from sqlmodel import Session, select
from typing import List, Optional
import math
from datetime import datetime
import os

from .database import engine, get_session, init_db
from .models import Item, StockHistory
from .schemas import ItemCreate, ItemRead, ItemUpdate

app = FastAPI(title="Inventory API")

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/v1/dashboard/stats")
def get_dashboard_stats(session: Session = Depends(get_session)):
    items = session.exec(select(Item)).all()
    total_items = len(items)
    total_departments = len(set(i.department for i in items))
    total_value = sum(i.closing_balance for i in items if i.closing_balance and i.closing_balance > 0)
    negative_items = sum(1 for i in items if i.closing_balance and i.closing_balance < 0)
    unknown_items = sum(1 for i in items if i.closing_balance is None)
    
    recently_updated = session.exec(select(Item).order_by(Item.last_updated.desc()).limit(5)).all()

    return {
        "total_departments": total_departments,
        "total_items": total_items,
        "total_value": total_value,
        "negative_items": negative_items,
        "unknown_items": unknown_items,
        "recently_updated": recently_updated
    }
