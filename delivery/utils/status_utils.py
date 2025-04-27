from fastapi import HTTPException
from sqlmodel import Field

from ..models.delivery_requests import DeliveryRequestStatus

STATUS_CHANGE = {
    DeliveryRequestStatus.pending: {DeliveryRequestStatus.delivering},
    DeliveryRequestStatus.delivering: {DeliveryRequestStatus.delivered},
    DeliveryRequestStatus.delivered: {},
}

def validate_status_change(
    current_status: DeliveryRequestStatus,
    new_status: DeliveryRequestStatus
):
    
    if new_status not in STATUS_CHANGE[current_status]:
        raise HTTPException(
            status_code=400,
            detail="Invalid status transition" +
            f" from {current_status.value} to {new_status.value}"
        )
    