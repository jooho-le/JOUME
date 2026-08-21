from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(80))
    password_hash: Mapped[str] = mapped_column(String(255))
    story_public: Mapped[bool] = mapped_column(Boolean, default=False)
    notifications: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    products: Mapped[list["UserProduct"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Session(Base):
    __tablename__ = "sessions"
    id: Mapped[int] = mapped_column(primary_key=True)
    token: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    expires_at: Mapped[datetime] = mapped_column(DateTime)


class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    sku: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160))
    collection: Mapped[str] = mapped_column(String(100))
    color: Mapped[str] = mapped_column(String(50))
    material: Mapped[str] = mapped_column(String(120))
    manufacture_country: Mapped[str] = mapped_column(String(80), default="Korea")
    price: Mapped[int] = mapped_column(default=0)
    story: Mapped[str] = mapped_column(Text)
    care_summary: Mapped[str] = mapped_column(Text)
    image_url: Mapped[str] = mapped_column(String(500))
    authentic: Mapped[bool] = mapped_column(Boolean, default=True)


class UserProduct(Base):
    __tablename__ = "user_products"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    source: Mapped[str] = mapped_column(String(30), default="official")
    nickname: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False)
    registered_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    user: Mapped[User] = relationship(back_populates="products")
    product: Mapped[Product] = relationship()
    journeys: Mapped[list["Journey"]] = relationship(back_populates="user_product", cascade="all, delete-orphan")


class Journey(Base):
    __tablename__ = "journeys"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_product_id: Mapped[int] = mapped_column(ForeignKey("user_products.id", ondelete="CASCADE"), index=True)
    city: Mapped[str] = mapped_column(String(100))
    country: Mapped[str] = mapped_column(String(100))
    place: Mapped[str] = mapped_column(String(160))
    journey_date: Mapped[date] = mapped_column(Date)
    experience_type: Mapped[str] = mapped_column(String(40))
    note: Mapped[str] = mapped_column(Text, default="")
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    user_product: Mapped[UserProduct] = relationship(back_populates="journeys")


class GeneratedStory(Base):
    __tablename__ = "generated_stories"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_product_id: Mapped[int] = mapped_column(ForeignKey("user_products.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(160))
    content: Mapped[str] = mapped_column(Text)
    is_saved: Mapped[bool] = mapped_column(Boolean, default=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class NextStory(Base):
    __tablename__ = "next_stories"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_product_id: Mapped[int] = mapped_column(ForeignKey("user_products.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    title: Mapped[str] = mapped_column(String(160))
    reason: Mapped[str] = mapped_column(Text)
    city: Mapped[str] = mapped_column(String(100))
    theme: Mapped[str] = mapped_column(String(100))
    is_saved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    product: Mapped[Product] = relationship()


class CareRecord(Base):
    __tablename__ = "care_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_product_id: Mapped[int] = mapped_column(ForeignKey("user_products.id", ondelete="CASCADE"), index=True)
    care_type: Mapped[str] = mapped_column(String(80))
    store_name: Mapped[str] = mapped_column(String(160))
    status: Mapped[str] = mapped_column(String(30), default="requested")
    note: Mapped[str] = mapped_column(Text, default="")
    requested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class CustomerContext(Base):
    __tablename__ = "customer_contexts"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_product_id: Mapped[int] = mapped_column(ForeignKey("user_products.id", ondelete="CASCADE"), unique=True, index=True)
    interests: Mapped[str] = mapped_column(Text, default="")
    preferred_cities: Mapped[str] = mapped_column(Text, default="")
    usage_purposes: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class StoryProposal(Base):
    __tablename__ = "story_proposals"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_product_id: Mapped[int] = mapped_column(ForeignKey("user_products.id", ondelete="CASCADE"), index=True)
    theme: Mapped[str] = mapped_column(String(120))
    city: Mapped[str] = mapped_column(String(100))
    activity: Mapped[str] = mapped_column(String(180))
    reason: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="suggested")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Experience(Base):
    __tablename__ = "experiences"
    id: Mapped[int] = mapped_column(primary_key=True)
    kind: Mapped[str] = mapped_column(String(40))
    title: Mapped[str] = mapped_column(String(160))
    city: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    product_id: Mapped[Optional[int]] = mapped_column(ForeignKey("products.id"), nullable=True)


class ExperienceRecommendation(Base):
    __tablename__ = "experience_recommendations"
    id: Mapped[int] = mapped_column(primary_key=True)
    story_proposal_id: Mapped[int] = mapped_column(ForeignKey("story_proposals.id", ondelete="CASCADE"), index=True)
    experience_id: Mapped[int] = mapped_column(ForeignKey("experiences.id"))
    rank: Mapped[int] = mapped_column(Integer, default=1)
    reason: Mapped[str] = mapped_column(Text)
    experience: Mapped[Experience] = relationship()


class UserAction(Base):
    __tablename__ = "user_actions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    action_type: Mapped[str] = mapped_column(String(50), index=True)
    target_type: Mapped[str] = mapped_column(String(50))
    target_id: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_product_id: Mapped[int] = mapped_column(ForeignKey("user_products.id", ondelete="CASCADE"), index=True)
    context_json: Mapped[str] = mapped_column(Text)
    input_snapshot_json: Mapped[str] = mapped_column(Text)
    model: Mapped[str] = mapped_column(String(80))
    provider_response_id: Mapped[str] = mapped_column(String(120), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
