from sqlalchemy import select
from sqlalchemy.orm import Session

from .auth import hash_password
from .models import Product, User, UserProduct

PRODUCTS = [
    dict(sku="MMA-AVE1SC0001", name="STARK BACKPACK IN VISETOS", collection="Stark", color="Cognac", material="Visetos coated canvas", manufacture_country="Korea", price=1450000, image_url="/src/assets/visetos-backpack.png", story="도시를 넘나드는 이동을 위해 탄생한 MCM의 대표 백팩입니다.", care_summary="부드러운 마른 천으로 닦고 직사광선과 습기를 피해 보관하세요."),
    dict(sku="MWRA-ATRC01", name="AREN CROSSBODY", collection="Aren", color="Cognac", material="Visetos canvas", manufacture_country="Italy", price=1050000, image_url="/src/assets/orange-crossbody.png", story="가벼운 이동과 일상의 기록을 위한 컴팩트 크로스바디입니다.", care_summary="사용 후 더스트 백에 보관하고 가죽 트림의 수분 접촉을 피하세요."),
    dict(sku="MWPA-MIL01", name="MILLA TOTE", collection="Milla", color="Orange", material="Spanish leather", manufacture_country="Italy", price=1890000, image_url="/src/assets/backpack.png", story="선명한 컬러와 구조적인 실루엣으로 다음 장면을 완성합니다.", care_summary="가죽 전용 클리너를 소량 사용하고 전문 케어를 권장합니다."),
]


def seed(db: Session) -> None:
    if not db.scalar(select(Product.id).limit(1)):
        db.add_all([Product(**item) for item in PRODUCTS])
        db.commit()
    user = db.scalar(select(User).where(User.email == "demo@mcm.com"))
    if not user:
        user = User(email="demo@mcm.com", name="멋쟁이", password_hash=hash_password("mcm1234"))
        db.add(user)
        db.flush()
        first_product = db.scalar(select(Product).order_by(Product.id))
        db.add(UserProduct(user_id=user.id, product_id=first_product.id, source="official", is_current=True))
        db.commit()
