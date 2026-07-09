from fastapi import APIRouter,HTTPException,Depends,HTTPException,status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.auth.dependencies import get_current_user
from app.models import User
from app.database import SessionLocal
from app.models import User
from app.schemas import UserCreate, UserResponse
from app.schemas import UserLogin
from app.auth.hashing import verify_password,hash_password
from app.auth.jwt import create_access_token,decode_access_token
from app.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Create User
    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password)
    )

    # Save into database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    # Find user by email
    db_user = db.query(User).filter(User.email == user.email).first()

    # Check if user exists
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate JWT
    access_token = create_access_token(
        data={"sub": db_user.email}
    )
    login_time = datetime.now(timezone.utc)

    expires_at = login_time + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Return token
    return {
        "access_token": access_token,
        "token_type": "bearer",

        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email
        },

        "session": {
            "login_time": login_time.isoformat(),
            "expires_at": expires_at.isoformat(),
            "expires_in_minutes": ACCESS_TOKEN_EXPIRE_MINUTES
        }
    }



@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }
