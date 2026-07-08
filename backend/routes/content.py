from fastapi import APIRouter

from services.content_service import get_amenities, get_faq

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/faq")
async def faq():
    return get_faq()


@router.get("/amenities")
async def amenities():
    return get_amenities()
