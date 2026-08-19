from __future__ import annotations

from datetime import datetime
from pathlib import Path
import shutil
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import desc, select
from sqlalchemy.orm import Session, selectinload

from .auth import current_user, issue_session, hash_password, verify_password
from .database import get_db
from .models import CareRecord, GeneratedStory, Journey, NextStory, Product, User, UserProduct
from .schemas import (
    CareIn, CareOut, JourneyIn, JourneyOut, JourneyUpdate, LoginIn, NextStoryOut,
    ProductOut, RegisterProductIn, SettingsIn, SignupIn, StoryOut, StoryUpdate,
    TokenOut, UserOut, UserProductOut,
)

router = APIRouter(prefix="/api/v1")


def owned_product(db: Session, user: User, user_product_id: int) -> UserProduct:
    item = db.scalar(
        select(UserProduct)
        .options(selectinload(UserProduct.product))
        .where(UserProduct.id == user_product_id, UserProduct.user_id == user.id)
    )
    if not item:
        raise HTTPException(404, "등록된 제품을 찾을 수 없습니다.")
    return item


@router.post("/auth/signup", response_model=TokenOut, status_code=201)
def signup(payload: SignupIn, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == payload.email.lower())):
        raise HTTPException(409, "이미 가입된 이메일입니다.")
    user = User(email=payload.email.lower(), name=payload.name, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenOut(access_token=issue_session(db, user.id), user=user)


@router.post("/auth/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "이메일 또는 비밀번호가 올바르지 않습니다.")
    return TokenOut(access_token=issue_session(db, user.id), user=user)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user


@router.patch("/me", response_model=UserOut)
def update_me(payload: SettingsIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.get("/products", response_model=list[ProductOut])
def products(db: Session = Depends(get_db)):
    return db.scalars(select(Product).order_by(Product.id)).all()


@router.get("/products/passport/{sku}", response_model=ProductOut)
def passport(sku: str, db: Session = Depends(get_db)):
    product = db.scalar(select(Product).where(Product.sku == sku.upper()))
    if not product:
        raise HTTPException(404, "제품 Passport를 찾을 수 없습니다.")
    return product


@router.get("/products/{product_id}", response_model=ProductOut)
def product_detail(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "제품을 찾을 수 없습니다.")
    return product


@router.post("/me/products", response_model=UserProductOut, status_code=201)
def register_product(payload: RegisterProductIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    product = db.scalar(select(Product).where(Product.sku == payload.sku.upper()))
    if not product:
        raise HTTPException(404, "제품을 확인할 수 없습니다.")
    duplicate = db.scalar(select(UserProduct).where(UserProduct.user_id == user.id, UserProduct.product_id == product.id))
    if duplicate:
        raise HTTPException(409, "이미 등록된 제품입니다.")
    has_product = db.scalar(select(UserProduct.id).where(UserProduct.user_id == user.id).limit(1))
    item = UserProduct(user_id=user.id, product_id=product.id, source=payload.source, nickname=payload.nickname, is_current=not bool(has_product))
    db.add(item)
    db.commit()
    return owned_product(db, user, item.id)


@router.get("/me/products", response_model=list[UserProductOut])
def my_products(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.scalars(select(UserProduct).options(selectinload(UserProduct.product)).where(UserProduct.user_id == user.id).order_by(desc(UserProduct.is_current), desc(UserProduct.registered_at))).all()


@router.patch("/me/products/{item_id}/current", response_model=UserProductOut)
def set_current(item_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    target = owned_product(db, user, item_id)
    for item in db.scalars(select(UserProduct).where(UserProduct.user_id == user.id)):
        item.is_current = item.id == target.id
    db.commit()
    return owned_product(db, user, item_id)


@router.post("/journeys", response_model=JourneyOut, status_code=201)
def create_journey(payload: JourneyIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    owned_product(db, user, payload.user_product_id)
    journey = Journey(**payload.model_dump())
    db.add(journey)
    db.commit()
    db.refresh(journey)
    return journey


@router.get("/journeys", response_model=list[JourneyOut])
def journeys(user_product_id: Optional[int] = None, user: User = Depends(current_user), db: Session = Depends(get_db)):
    query = select(Journey).join(UserProduct).where(UserProduct.user_id == user.id)
    if user_product_id:
        query = query.where(Journey.user_product_id == user_product_id)
    return db.scalars(query.order_by(desc(Journey.journey_date))).all()


@router.get("/journeys/map", response_model=list[JourneyOut])
def journey_map(user: User = Depends(current_user), db: Session = Depends(get_db)):
    query = select(Journey).join(UserProduct).where(UserProduct.user_id == user.id, Journey.latitude.is_not(None), Journey.longitude.is_not(None))
    return db.scalars(query.order_by(desc(Journey.journey_date))).all()


@router.get("/journeys/{journey_id}", response_model=JourneyOut)
def journey_detail(journey_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = db.scalar(select(Journey).join(UserProduct).where(Journey.id == journey_id, UserProduct.user_id == user.id))
    if not item:
        raise HTTPException(404, "여정 기록을 찾을 수 없습니다.")
    return item


@router.patch("/journeys/{journey_id}", response_model=JourneyOut)
def update_journey(journey_id: int, payload: JourneyUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = journey_detail(journey_id, user, db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/journeys/{journey_id}", status_code=204)
def delete_journey(journey_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = journey_detail(journey_id, user, db)
    db.delete(item)
    db.commit()


@router.post("/stories/generate/{user_product_id}", response_model=StoryOut)
def generate_story(user_product_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = owned_product(db, user, user_product_id)
    records = db.scalars(select(Journey).where(Journey.user_product_id == item.id).order_by(Journey.journey_date)).all()
    if not records:
        raise HTTPException(400, "스토리를 만들 여정 기록이 없습니다.")
    cities = " · ".join(dict.fromkeys(record.city for record in records))
    title = f"{item.product.name}과 함께한 {len(records)}개의 장면"
    content = f"{records[0].journey_date:%Y년 %m월}, {records[0].city}에서 시작된 기록은 {cities}로 이어졌습니다. " + " ".join(record.note for record in records if record.note)
    story = GeneratedStory(user_product_id=item.id, title=title, content=content.strip())
    db.add(story)
    db.commit()
    db.refresh(story)
    return story


@router.get("/stories", response_model=list[StoryOut])
def stories(saved_only: bool = False, user: User = Depends(current_user), db: Session = Depends(get_db)):
    query = select(GeneratedStory).join(UserProduct).where(UserProduct.user_id == user.id)
    if saved_only:
        query = query.where(GeneratedStory.is_saved.is_(True))
    return db.scalars(query.order_by(desc(GeneratedStory.created_at))).all()


@router.patch("/stories/{story_id}", response_model=StoryOut)
def update_story(story_id: int, payload: StoryUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    story = db.scalar(select(GeneratedStory).join(UserProduct).where(GeneratedStory.id == story_id, UserProduct.user_id == user.id))
    if not story:
        raise HTTPException(404, "스토리를 찾을 수 없습니다.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(story, key, value)
    db.commit()
    db.refresh(story)
    return story


@router.post("/next-stories/generate/{user_product_id}", response_model=NextStoryOut)
def generate_next_story(user_product_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    current = owned_product(db, user, user_product_id)
    journeys = db.scalars(select(Journey).where(Journey.user_product_id == current.id)).all()
    recommended = db.scalar(select(Product).where(Product.id != current.product_id).order_by(Product.id))
    city = journeys[-1].city if journeys else "서울"
    next_story = NextStory(user_product_id=current.id, product_id=recommended.id, title=f"{city}, 다음 장면을 위한 {recommended.collection}", reason=f"현재 보유한 {current.product.collection}과 다른 실루엣으로 기록의 폭을 넓혀주는 제품입니다.", city=city, theme="City Journey")
    db.add(next_story)
    db.commit()
    db.refresh(next_story)
    return db.scalar(select(NextStory).options(selectinload(NextStory.product)).where(NextStory.id == next_story.id))


@router.get("/next-stories", response_model=list[NextStoryOut])
def next_stories(saved_only: bool = False, user: User = Depends(current_user), db: Session = Depends(get_db)):
    query = select(NextStory).options(selectinload(NextStory.product)).join(UserProduct).where(UserProduct.user_id == user.id)
    if saved_only:
        query = query.where(NextStory.is_saved.is_(True))
    return db.scalars(query.order_by(desc(NextStory.created_at))).all()


@router.patch("/next-stories/{story_id}/save", response_model=NextStoryOut)
def save_next_story(story_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = db.scalar(select(NextStory).options(selectinload(NextStory.product)).join(UserProduct).where(NextStory.id == story_id, UserProduct.user_id == user.id))
    if not item:
        raise HTTPException(404, "추천을 찾을 수 없습니다.")
    item.is_saved = not item.is_saved
    db.commit()
    db.refresh(item)
    return item


@router.post("/care", response_model=CareOut, status_code=201)
def request_care(payload: CareIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    owned_product(db, user, payload.user_product_id)
    record = CareRecord(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/care", response_model=list[CareOut])
def care_history(user_product_id: Optional[int] = None, user: User = Depends(current_user), db: Session = Depends(get_db)):
    query = select(CareRecord).join(UserProduct).where(UserProduct.user_id == user.id)
    if user_product_id:
        query = query.where(CareRecord.user_product_id == user_product_id)
    return db.scalars(query.order_by(desc(CareRecord.requested_at))).all()


@router.patch("/care/{record_id}/complete", response_model=CareOut)
def complete_care(record_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = db.scalar(select(CareRecord).join(UserProduct).where(CareRecord.id == record_id, UserProduct.user_id == user.id))
    if not item:
        raise HTTPException(404, "케어 기록을 찾을 수 없습니다.")
    item.status = "completed"
    item.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return item


@router.get("/community/journeys", response_model=list[JourneyOut])
def public_journeys(city: Optional[str] = None, db: Session = Depends(get_db)):
    query = select(Journey).where(Journey.is_public.is_(True))
    if city:
        query = query.where(Journey.city == city)
    return db.scalars(query.order_by(desc(Journey.journey_date)).limit(100)).all()


@router.post("/uploads")
def upload_image(file: UploadFile = File(...), user: User = Depends(current_user)):
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(415, "JPG, PNG, WEBP 이미지만 업로드할 수 있습니다.")
    suffix = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}[file.content_type]
    upload_dir = Path(__file__).resolve().parents[1] / "uploads"
    upload_dir.mkdir(exist_ok=True)
    filename = f"{uuid.uuid4().hex}{suffix}"
    with (upload_dir / filename).open("wb") as output:
        shutil.copyfileobj(file.file, output)
    return {"url": f"/uploads/{filename}"}
