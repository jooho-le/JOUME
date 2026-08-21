from __future__ import annotations

from datetime import datetime
from pathlib import Path
import json
import shutil
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import desc, select
from sqlalchemy.orm import Session, selectinload

from .auth import current_user, issue_session, hash_password, verify_password
from .ai_service import (AIConfigurationError, AIProviderError, EXPERIENCE_INSTRUCTIONS,
                         EXPERIENCE_SCHEMA, PIPELINE_INSTRUCTIONS, PIPELINE_SCHEMA,
                         structured_response)
from .database import get_db
from .models import (AIAnalysis, CareRecord, CustomerContext, Experience, ExperienceRecommendation,
                     GeneratedStory, Journey, NextStory, Product, StoryProposal,
                     User, UserAction, UserProduct)
from .schemas import (
    AIPipelineOut, CareIn, CareOut, ContextIn, ContextOut, ExperienceRecommendationOut,
    JourneyIn, JourneyOut, JourneyUpdate, LoginIn, NextStoryOut,
    ProductOut, RegisterProductIn, SettingsIn, SignupIn, StoryOut, StoryUpdate,
    StoryProposalOut, TokenOut, UserOut, UserProductOut,
)

router = APIRouter(prefix="/api/v1")


def ai_http_error(exc: RuntimeError) -> HTTPException:
    if isinstance(exc, AIConfigurationError):
        return HTTPException(503, str(exc))
    return HTTPException(502, str(exc))


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


def split_context(value: str) -> list[str]:
    return [item for item in value.split("|") if item]


@router.put("/me/products/{item_id}/context", response_model=ContextOut)
def save_context(item_id: int, payload: ContextIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    owned_product(db, user, item_id)
    context = db.scalar(select(CustomerContext).where(CustomerContext.user_product_id == item_id))
    if not context:
        context = CustomerContext(user_product_id=item_id)
        db.add(context)
    context.interests = "|".join(payload.interests)
    context.preferred_cities = "|".join(payload.preferred_cities)
    context.usage_purposes = "|".join(payload.usage_purposes)
    db.commit()
    return ContextOut(user_product_id=item_id, interests=split_context(context.interests), preferred_cities=split_context(context.preferred_cities), usage_purposes=split_context(context.usage_purposes))


@router.get("/me/products/{item_id}/context", response_model=ContextOut)
def get_context(item_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    owned_product(db, user, item_id)
    context = db.scalar(select(CustomerContext).where(CustomerContext.user_product_id == item_id))
    if not context:
        return ContextOut(user_product_id=item_id, interests=[], preferred_cities=[], usage_purposes=[])
    return ContextOut(user_product_id=item_id, interests=split_context(context.interests), preferred_cities=split_context(context.preferred_cities), usage_purposes=split_context(context.usage_purposes))


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


@router.post("/ai/pipeline/{user_product_id}", response_model=AIPipelineOut)
def run_ai_pipeline(user_product_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = owned_product(db, user, user_product_id)
    journeys = db.scalars(select(Journey).where(Journey.user_product_id == item.id).order_by(Journey.journey_date)).all()
    if not journeys:
        raise HTTPException(400, "AI Story를 만들 Journey가 없습니다.")
    actions = db.scalars(select(UserAction).where(UserAction.user_id == user.id).order_by(desc(UserAction.created_at)).limit(50)).all()
    saved_context = db.scalar(select(CustomerContext).where(CustomerContext.user_product_id == item.id))
    product_payload = {
        "sku": item.product.sku, "name": item.product.name, "collection": item.product.collection,
        "material": item.product.material, "manufacture_country": item.product.manufacture_country,
        "official_story": item.product.story, "official_care": item.product.care_summary,
    }
    journey_payload = [{
        "id": record.id, "date": record.journey_date.isoformat(), "city": record.city,
        "country": record.country, "place": record.place, "experience_type": record.experience_type,
        "note": record.note,
    } for record in journeys]
    input_snapshot = {
        "official_product": product_payload,
        "journeys": journey_payload,
        "saved_context": {
            "interests": split_context(saved_context.interests) if saved_context else [],
            "preferred_cities": split_context(saved_context.preferred_cities) if saved_context else [],
            "usage_purposes": split_context(saved_context.usage_purposes) if saved_context else [],
        },
        "actions": [{"type": action.action_type, "target_type": action.target_type, "target_id": action.target_id} for action in actions],
    }
    try:
        result = structured_response("joume_journey_pipeline", PIPELINE_SCHEMA, PIPELINE_INSTRUCTIONS, input_snapshot, [record.image_url for record in journeys if record.image_url][:5])
    except (AIConfigurationError, AIProviderError) as exc:
        raise ai_http_error(exc)
    generated = result["data"]
    context_data = generated["context"]
    if not saved_context:
        saved_context = CustomerContext(user_product_id=item.id)
        db.add(saved_context)
    saved_context.interests = "|".join(context_data["interests"])
    saved_context.usage_purposes = "|".join(context_data["usage_purposes"])
    saved_context.preferred_cities = "|".join(dict.fromkeys(record.city for record in journeys))
    story_data = generated["journey_story"]
    story = GeneratedStory(user_product_id=item.id, title=story_data["title"], content=story_data["content"])
    db.add(story)
    proposals = [StoryProposal(user_product_id=item.id, **proposal) for proposal in generated["next_stories"]]
    db.add_all(proposals)
    analysis = AIAnalysis(user_product_id=item.id, context_json=json.dumps(context_data, ensure_ascii=False), input_snapshot_json=json.dumps(input_snapshot, ensure_ascii=False), model=result["model"], provider_response_id=result["response_id"])
    db.add(analysis)
    db.flush()
    db.add(UserAction(user_id=user.id, action_type="generate", target_type="ai_analysis", target_id=analysis.id))
    db.commit()
    db.refresh(story)
    for proposal in proposals:
        db.refresh(proposal)
    return AIPipelineOut(analysis_id=analysis.id, context=context_data, story=story, next_stories=proposals, model=result["model"])


@router.patch("/ai/story-proposals/{proposal_id}/select")
def select_story_with_ai(proposal_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    proposal = db.scalar(select(StoryProposal).join(UserProduct).where(StoryProposal.id == proposal_id, UserProduct.user_id == user.id))
    if not proposal:
        raise HTTPException(404, "Next Story를 찾을 수 없습니다.")
    item = owned_product(db, user, proposal.user_product_id)
    context = db.scalar(select(CustomerContext).where(CustomerContext.user_product_id == item.id))
    catalog = db.scalars(select(Experience).order_by(Experience.id)).all()
    payload = {
        "selected_story": {"id": proposal.id, "theme": proposal.theme, "city": proposal.city, "activity": proposal.activity, "reason": proposal.reason},
        "customer_context": {"interests": split_context(context.interests) if context else [], "usage_purposes": split_context(context.usage_purposes) if context else []},
        "experience_catalog": [{"id": experience.id, "kind": experience.kind, "title": experience.title, "city": experience.city, "description": experience.description} for experience in catalog],
    }
    try:
        result = structured_response("joume_experience_recommendations", EXPERIENCE_SCHEMA, EXPERIENCE_INSTRUCTIONS, payload)
    except (AIConfigurationError, AIProviderError) as exc:
        raise ai_http_error(exc)
    allowed = {experience.id: experience for experience in catalog}
    db.query(ExperienceRecommendation).filter(ExperienceRecommendation.story_proposal_id == proposal.id).delete()
    recommendations = []
    for rank, recommendation in enumerate(result["data"]["recommendations"], 1):
        experience = allowed.get(recommendation["experience_id"])
        if not experience:
            continue
        row = ExperienceRecommendation(story_proposal_id=proposal.id, experience_id=experience.id, rank=rank, reason=recommendation["reason"])
        row.experience = experience
        db.add(row)
        recommendations.append(row)
    if not recommendations:
        raise HTTPException(502, "AI가 유효한 Experience를 선택하지 못했습니다.")
    proposal.status = "selected"
    db.add(UserAction(user_id=user.id, action_type="select", target_type="story_proposal", target_id=proposal.id))
    db.commit()
    return {"story": StoryProposalOut.model_validate(proposal), "recommendations": [ExperienceRecommendationOut.model_validate(row) for row in recommendations], "model": result["model"]}


@router.post("/next-stories/generate/{user_product_id}", response_model=NextStoryOut)
def generate_next_story(user_product_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    raise HTTPException(410, "제품 선추천 방식은 종료되었습니다. /story-proposals/generate/{user_product_id}를 사용하세요.")


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


@router.post("/story-proposals/generate/{user_product_id}", response_model=list[StoryProposalOut])
def generate_story_proposals(user_product_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    owned_product(db, user, user_product_id)
    journeys = db.scalars(select(Journey).where(Journey.user_product_id == user_product_id).order_by(desc(Journey.journey_date))).all()
    context = db.scalar(select(CustomerContext).where(CustomerContext.user_product_id == user_product_id))
    cities = split_context(context.preferred_cities) if context else []
    purposes = split_context(context.usage_purposes) if context else []
    base_city = cities[0] if cities else (journeys[0].city if journeys else "서울")
    proposals = [
        StoryProposal(user_product_id=user_product_id, theme="새로운 시선", city=base_city, activity="디자인과 건축을 따라 걷기", reason="기존 기록의 도시 경험을 새로운 문화적 장면으로 확장합니다."),
        StoryProposal(user_product_id=user_product_id, theme="일상의 이동", city=cities[1] if len(cities)>1 else "부산", activity=purposes[0] if purposes else "주말의 느린 산책", reason="제품을 사용하는 일상의 목적을 다음 기록으로 자연스럽게 연결합니다."),
    ]
    db.add_all(proposals)
    db.commit()
    for proposal in proposals:
        db.refresh(proposal)
    return proposals


@router.patch("/story-proposals/{proposal_id}/select", response_model=StoryProposalOut)
def select_story_proposal(proposal_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    proposal = db.scalar(select(StoryProposal).join(UserProduct).where(StoryProposal.id == proposal_id, UserProduct.user_id == user.id))
    if not proposal:
        raise HTTPException(404, "Next Story를 찾을 수 없습니다.")
    proposal.status = "selected"
    db.add(UserAction(user_id=user.id, action_type="select", target_type="story_proposal", target_id=proposal.id))
    experiences = db.scalars(select(Experience).where(Experience.city.in_([proposal.city, "ALL"])).order_by(Experience.id).limit(4)).all()
    if not experiences:
        experiences = db.scalars(select(Experience).order_by(Experience.id).limit(4)).all()
    for rank, experience in enumerate(experiences, 1):
        db.add(ExperienceRecommendation(story_proposal_id=proposal.id, experience_id=experience.id, rank=rank, reason=f"‘{proposal.theme}’ Story를 실제 행동으로 이어주는 MCM Experience입니다."))
    db.commit()
    db.refresh(proposal)
    return proposal


@router.get("/story-proposals/{proposal_id}/experiences", response_model=list[ExperienceRecommendationOut])
def proposal_experiences(proposal_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    proposal = db.scalar(select(StoryProposal).join(UserProduct).where(StoryProposal.id == proposal_id, UserProduct.user_id == user.id, StoryProposal.status == "selected"))
    if not proposal:
        raise HTTPException(404, "선택된 Next Story가 아닙니다.")
    return db.scalars(select(ExperienceRecommendation).options(selectinload(ExperienceRecommendation.experience)).where(ExperienceRecommendation.story_proposal_id == proposal_id).order_by(ExperienceRecommendation.rank)).all()


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
