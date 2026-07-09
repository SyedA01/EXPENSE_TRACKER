from datetime import date
from pydantic import BaseModel, EmailStr, ConfigDict


# ==========================
# User Schemas
# ==========================

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)


# ==========================
# Category Schemas
# ==========================

class CategoryCreate(BaseModel):
    name: str
    type: str


class CategoryResponse(BaseModel):
    id:int
    name: str
    type: str



# ==========================
# Transaction Schemas
# ==========================

class TransactionCreate(BaseModel):
    amount: float
    description: str
    date: date
    category_id: int

class TransactionUpdate(BaseModel):
    amount:float
    description:str
    date:date
    category_id:int


class DashboardSummary(BaseModel):
    current_balance: float
    total_income: float
    total_expense: float
    total_transactions: int

class RecentTransaction(BaseModel):
    id: int
    amount: float
    description: str
    date: date
    type: str
    category: str
class CategorySummary(BaseModel):
    category: str
    amount: float

class MonthlySummary(BaseModel):
    month: str
    income: float
    expense: float

class TransactionResponse(BaseModel):
    id: int
    amount: float
    description: str
    date: date
    category: CategoryResponse

    class Config:
       from_attributes = True

