from fastapi import FastAPI
from app.database import engine
from app.database import Base
from fastapi.middleware.cors import CORSMiddleware
from app.routers import transactions
import app.models
from app.routers import auth
from app.routers import dashboard

Base.metadata.create_all(bind=engine)
app=FastAPI(
    title="expense Tracker API",
    version="1.0.0"
)
origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)

@app.get("/")
def home():
    return {
        "message": "Expense Tracker API is Running Successfully!"
    }
