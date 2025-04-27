from typing import Callable, Any
from httpx import AsyncClient, RequestError, HTTPStatusError, Response
from fastapi import HTTPException

async def http_call(
    method: Callable[..., Any],
    *args, 
    **kwargs
) -> Response:
    try:
        async with AsyncClient() as client:
            response: Response = await method(client, *args, **kwargs)
            response.raise_for_status()
            return response.json()
    except RequestError as exc:
        # For resquest
        raise HTTPException(
            status_code=500,
            detail=f"Request error while calling {exc.request.url!r}"
        )
    except HTTPStatusError as exc:
        # For response
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.json().get("detail", "Unknown error")
        )