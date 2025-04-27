from fastapi import Depends, Query, Path, Body, HTTPException
from fastapi.routing import APIRouter
from sqlmodel import Session, select

from ..utils import auth_utils, status_utils
from ..use_cases.delivery_request_uc import calculate_distance, calculate_shipping_fee, check_customer_and_driver
from ..models.delivery_requests import (
    DeliveryRequestCreate, DeliveryRequestUpdate, DeliveryRequest, DeliveryRequestStatus
)

from ..database import get_session

router = APIRouter()

@router.post("/test")
async def create_delivery_request(
    session: Session = Depends(get_session),
):
    delivery_request_db = DeliveryRequest(
        branch_id=1,
        order_id=1,
        customer_id=2,
        dropoff_lat=0,
        dropoff_lon=0,
        distance_km=100.00,
        shipping_fee=100.00
    )
    session.add(delivery_request_db)
    session.commit()
    session.refresh(delivery_request_db)
    return delivery_request_db

@router.patch("/{id}/accept")
async def accept_delivery_request(
    session: Session = Depends(get_session),
    current_driver: dict = Depends(auth_utils.require_role(["driver"])),
    id: int = Path()
):
    delivery_request_db = session.get(DeliveryRequest, id)
    if not delivery_request_db.is_active:
        raise HTTPException(
            status_code=400, detail="This order is still not ready"
        )

    delivery_request_db.sqlmodel_update({
        "driver_id": current_driver["id"],
        "status": DeliveryRequestStatus.delivering
    })

    session.add(delivery_request_db)
    session.commit()
    session.refresh(delivery_request_db)
    return delivery_request_db

@router.get("/{order_id}")
async def get_delivery_request(
    session: Session = Depends(get_session),
    current_user: dict = Depends(auth_utils.require_role(["owner", "driver", "customer",])),
    order_id: int = Path()
):
    # if current_user["role"] == "customer":
    #     statement = select(DeliveryRequest).where(DeliveryRequest.customer_id == current_user["id"])
    # if current_user["role"] == "driver":
    #     statement = select(DeliveryRequest).where(DeliveryRequest.driver_id == current_user["id"])
    delivery_request_db = session.get(DeliveryRequest, order_id)

    if not delivery_request_db:
        raise HTTPException(status_code=404, detail="Delivery Request not found")

    check_customer_and_driver(current_user, delivery_request_db)

    return delivery_request_db

@router.get("/",
    dependencies=[Depends(auth_utils.require_role(["onwer", "driver"]))]
)
async def get_delivery_requests(
    session: Session = Depends(get_session),
    offset: int = Query(default=0),
    limit: int = Query(default=100),
    is_active: bool = Query(default=True)
):
    return session.exec(
        select(DeliveryRequest)
        .where(DeliveryRequest.is_active == is_active)
        .offset(offset).limit(limit)
    ).all()

@router.patch("/{order_id}/confirmed")
async def confirmed(
    session: Session = Depends(get_session),
    current_user: dict = Depends(auth_utils.require_role(["driver", "customer"])),
    order_id: int = Path()
):
    delivery_request_db = session.exec(
        select(DeliveryRequest).where(DeliveryRequest.order_id == order_id)
    ).first()

    if not delivery_request_db:
        raise HTTPException(status_code=404, detail="Delivery Request not found")
    
    check_customer_and_driver(current_user, delivery_request_db)

    if delivery_request_db.is_driver_confirmed and delivery_request_db.is_customer_confirmed:
        delivery_request_db.status = DeliveryRequestStatus.delivered

    session.add(delivery_request_db)
    session.commit()
    session.refresh(delivery_request_db)
    return delivery_request_db