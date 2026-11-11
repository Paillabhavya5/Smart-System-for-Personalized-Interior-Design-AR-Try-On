from datetime import datetime
from typing import Generator

from sqlalchemy import Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()


class SavedDesign(Base):
    __tablename__ = "saved_designs"

    id = Column(Integer, primary_key=True, index=True)
    room_category = Column(String, nullable=False)
    style = Column(String, nullable=False)
    color_palette = Column(String, nullable=False)
    furniture_detections = Column(Text, default="[]")
    recommendations = Column(Text, nullable=False)
    original_image_path = Column(String, default="")
    generated_image_path = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


SQLALCHEMY_DATABASE_URL = "sqlite:///./designs.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
