from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class SignupIn(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(ORMModel):
    id: int
    email: EmailStr
    name: str
    story_public: bool
    notifications: bool


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class SettingsIn(BaseModel):
    name: Optional[str] = None
    story_public: Optional[bool] = None
    notifications: Optional[bool] = None


class ProductOut(ORMModel):
    id: int
    sku: str
    name: str
    collection: str
    color: str
    material: str
    manufacture_country: str
    price: int
    story: str
    care_summary: str
    image_url: str
    authentic: bool


class UserProductOut(ORMModel):
    id: int
    source: str
    nickname: Optional[str]
    is_current: bool
    registered_at: datetime
    product: ProductOut


class RegisterProductIn(BaseModel):
    sku: str
    source: str = Field(default="official", pattern="^(official|resale)$")
    nickname: Optional[str] = None


class JourneyIn(BaseModel):
    user_product_id: int
    city: str
    country: str
    place: str
    journey_date: date
    experience_type: str
    note: str = ""
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_public: bool = False


class JourneyUpdate(BaseModel):
    city: Optional[str] = None
    country: Optional[str] = None
    place: Optional[str] = None
    journey_date: Optional[date] = None
    experience_type: Optional[str] = None
    note: Optional[str] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_public: Optional[bool] = None


class JourneyOut(ORMModel):
    id: int
    user_product_id: int
    city: str
    country: str
    place: str
    journey_date: date
    experience_type: str
    note: str
    image_url: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    is_public: bool
    created_at: datetime


class StoryUpdate(BaseModel):
    is_saved: Optional[bool] = None
    is_public: Optional[bool] = None


class StoryOut(ORMModel):
    id: int
    user_product_id: int
    title: str
    content: str
    is_saved: bool
    is_public: bool
    created_at: datetime


class NextStoryOut(ORMModel):
    id: int
    user_product_id: int
    title: str
    reason: str
    city: str
    theme: str
    is_saved: bool
    created_at: datetime
    product: ProductOut


class CareIn(BaseModel):
    user_product_id: int
    care_type: str
    store_name: str
    note: str = ""


class CareOut(ORMModel):
    id: int
    user_product_id: int
    care_type: str
    store_name: str
    status: str
    note: str
    requested_at: datetime
    completed_at: Optional[datetime]


class AIJourneyIn(BaseModel):
    city: str = Field(min_length=1, max_length=60)
    country: str = ""
    place: str = ""
    date: date
    experience_type: str = ""
    note: str = Field(default="", max_length=500)


class AIStoryIn(BaseModel):
    product_name: str = Field(min_length=1, max_length=120)
    product_collection: str = ""
    journeys: list[AIJourneyIn] = Field(min_length=1, max_length=30)


class AIStoryOut(BaseModel):
    title: str
    content: str
    source: str  # "llm" | "fallback"


class ContextIn(BaseModel):
    interests: list[str] = Field(default_factory=list)
    preferred_cities: list[str] = Field(default_factory=list)
    usage_purposes: list[str] = Field(default_factory=list)


class ContextOut(BaseModel):
    user_product_id: int
    interests: list[str]
    preferred_cities: list[str]
    usage_purposes: list[str]


class StoryProposalOut(ORMModel):
    id: int
    user_product_id: int
    theme: str
    city: str
    activity: str
    reason: str
    status: str
    created_at: datetime


class ExperienceOut(ORMModel):
    id: int
    kind: str
    title: str
    city: str
    description: str
    image_url: Optional[str]
    product_id: Optional[int]


class ExperienceRecommendationOut(ORMModel):
    id: int
    story_proposal_id: int
    rank: int
    reason: str
    experience: ExperienceOut


class AIPipelineOut(BaseModel):
    analysis_id: int
    context: dict
    story: StoryOut
    next_stories: list[StoryProposalOut]
    model: str
