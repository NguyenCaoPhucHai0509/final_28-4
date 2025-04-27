from fastapi import HTTPException, Depends, Path, Body, Query
from fastapi.routing import APIRouter
from sqlmodel import Session, select, col
from typing import Annotated

from ..utils.auth_utils import require_role
from ..models.menu_items import (
    MenuItem, MenuItemPublic, MenuItemUpdate, MenuItemCreate
)
from ..database import get_session

router = APIRouter()

"""
Update a Menu Item
Actors: restaurant owner
"""
@router.put("/menu-items/{id}", 
    response_model=MenuItemPublic, 
    dependencies=[Depends(require_role(["owner"]))]
)
async def update_menu_item_(
    session: Session = Depends(get_session),
    id: int = Path(),
    item: MenuItemUpdate = Body()
):
    item_db = session.get(MenuItem, id)

    item_data = item.model_dump(exclude_unset=True)
    item_db.sqlmodel_update(item_data)

    session.add(item_db)
    session.commit()
    session.refresh(item_db)

    return item_db


"""
Delete a Menu Item
Actors: restaurant owner
"""
@router.delete("/menu-items/{id}", 
    dependencies=[Depends(require_role(["owner"]))], 
    responses={
        200: {
            "description": "Successful Response",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Item deleted"
                    }
                }
            }
        }
    }
)
async def delete_menu_item_(
    session: Session = Depends(get_session),
    id: int = Path()
):
    item_db = session.get(MenuItem, id)
    session.delete(item_db)
    session.commit()
    return {"message": "Item deleted"}


"""
View multiple menu items (for Order Service)
"""
@router.get("/menu-items", include_in_schema=False)
async def read_menu_items_by_ids(
    session: Session = Depends(get_session), 
    ids: list[int] = Query()
):
    menu_items = session.exec(
        select(MenuItem).where(col(MenuItem.id).in_(ids))
    ).all()

    return menu_items