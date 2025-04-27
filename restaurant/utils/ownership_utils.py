from fastapi import HTTPException
from sqlmodel import Session

from ..models.branches import Restaurant


def check_ownership(
    session: Session, current_owner_id: int, restaurant_id: int,
):
    restaurant_db = session.get(Restaurant, restaurant_id)
    if restaurant_db.owner_id != current_owner_id:
        raise HTTPException(
            status_code=400,
            detail="You do not own this restaurant"
        )