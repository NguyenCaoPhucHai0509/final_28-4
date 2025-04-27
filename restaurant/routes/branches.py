from fastapi import Depends, Body, Query, Path, HTTPException
from fastapi.routing import APIRouter
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from ..models.branches import (
    Branch, BranchCreate, BranchPublic
)
from ..models.menu_items import (
    MenuItemPublic, MenuItemCreate, MenuItem
)
from ..utils import auth_utils
from ..database import get_session

router = APIRouter()
"""
Create a branch, 
Actors: owner
"""
@router.post("/branches", 
    dependencies=[Depends(auth_utils.require_role(["owner"]))],
    response_model=BranchPublic
)
async def create_branch(
    session: Session = Depends(get_session),
    branch: BranchCreate = Body()
):
    branch_db = Branch.model_validate(branch)
    session.add(branch_db)
    session.commit()
    session.refresh(branch_db)

    return branch_db
    
"""
List all branches
Actors: all
"""
@router.get("/branches", response_model=list[BranchPublic])
async def read_branches(
    *,
    session: Session = Depends(get_session),
    offset: int = Query(default=0),
    limit: int = Query(default=100)
):
    branches_db = session.exec(
        select(Branch).offset(offset).limit(limit)
    ).all()
    return branches_db

"""
View a branch by its ids
Actors: all
"""
@router.get("/branches/{id}", response_model=BranchPublic)
async def read_branch(
    session: Session = Depends(get_session),
    id: int = Path()
):
    branch_db = session.get(Branch, id)
    if not branch_db:
        raise HTTPException(
            status_code=404, detail="Branch not found"
        )
    return branch_db

"""
Add a menu item to the restaurant
Actors: all
"""
@router.post("/branches/{id}/menu-items", 
    dependencies=[Depends(auth_utils.require_role(["owner"]))]
)
async def create_menu_item(
    session: Session = Depends(get_session),
    id: int = Path(),
    menu_item: MenuItemCreate = Body()
):
    try:
        menu_item_db = MenuItem.model_validate(menu_item, update={"branch_id": id})
        session.add(menu_item_db)
        session.commit()
        session.refresh(menu_item_db)
    except IntegrityError:
        raise HTTPException(
            status_code=404, detail="Branch not found"
        )
    
    return menu_item_db

"""
View the menu of a specific restaurant
Actors: all
"""
@router.get("/branches/{id}/menu-items", 
    response_model=list[MenuItemPublic]
)
async def read_menu_items_of_branch(
    session: Session = Depends(get_session),
    id: int = Path(),
    offset: int = Query(default=0),
    limit: int = Query(default=100),
    is_available: int = Query(default=True),
):
    menu_items_db = session.exec(
        select(MenuItem)
        .where(MenuItem.branch_id == id)
        .where(MenuItem.is_available == is_available)
        .offset(offset).limit(limit)
    ).all()

    return menu_items_db