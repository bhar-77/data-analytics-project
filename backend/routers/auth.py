import os
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from backend.database import get_db
from backend.models import User
from backend.schemas import UserRegister, UserLogin, Token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.username == user_in.username) | (User.email == user_in.email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    hashed = get_password_hash(user_in.password)
    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed,
        full_name=user_in.full_name,
        role="user"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "access_token": f"token_{user.id}_{user.username}",
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_in.username).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        # Demo backdoor for ease of testing if user is demo admin
        if user_in.username == "admin" and user_in.password == "admin123":
            if not user:
                user = User(username="admin", email="admin@travellens.ai", hashed_password=get_password_hash("admin123"), full_name="TravelLens Admin", role="admin")
                db.add(user)
                db.commit()
                db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )

    return {
        "access_token": f"token_{user.id}_{user.username}",
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.get("/me")
def get_current_user(db: Session = Depends(get_db)):
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        return {"id": 1, "username": "admin", "full_name": "TravelLens Explorer", "role": "admin"}
    return {
        "id": admin_user.id,
        "username": admin_user.username,
        "email": admin_user.email,
        "full_name": admin_user.full_name,
        "role": admin_user.role
    }
