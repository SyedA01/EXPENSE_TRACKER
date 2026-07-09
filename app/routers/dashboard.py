from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Transaction, Category, User
from app.auth.dependencies import get_current_user
from app.schemas import DashboardSummary,RecentTransaction,CategorySummary,MonthlySummary
from app.database import SessionLocal

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get(
    "/summarycards",
    response_model=DashboardSummary
)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Total Income
    total_income = (
        db.query(func.sum(Transaction.amount))
        .join(Category)
        .filter(
            Transaction.user_id == current_user.id,
            Category.type == "Income"
        )
        .scalar()
    ) or 0

    # Total Expense
    total_expense = (
        db.query(func.sum(Transaction.amount))
        .join(Category)
        .filter(
            Transaction.user_id == current_user.id,
            Category.type == "Expense"
        )
        .scalar()
    ) or 0

    # Total Transactions
    total_transactions = (
        db.query(func.count(Transaction.id))
        .filter(Transaction.user_id == current_user.id)
        .scalar()
    )

    # Current Balance
    current_balance = total_income - total_expense

    return {
        "current_balance": current_balance,
        "total_income": total_income,
        "total_expense": total_expense,
        "total_transactions": total_transactions
    }
from sqlalchemy.orm import joinedload

@router.get(
    "/recent",
    response_model=list[RecentTransaction]
)
def get_recent_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    transactions = (
        db.query(Transaction)
        .options(joinedload(Transaction.category))
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.date.desc())
        .limit(5)
        .all()
    )

    result = []

    for transaction in transactions:
        result.append({
            "id": transaction.id,
            "amount": transaction.amount,
            "description": transaction.description,
            "date": transaction.date,
            "type": transaction.category.type,
            "category": transaction.category.name
        })

    return result
@router.get(
    "/category-summary",
    response_model=list[CategorySummary]
)
def get_category_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    results = (
        db.query(
            Category.name,
            func.sum(Transaction.amount).label("amount")
        )
        .join(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Category.type == "Expense"
        )
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    summary = []

    for category_name, total_amount in results:
        summary.append({
            "category": category_name,
            "amount": total_amount
        })

    return summary
@router.get(
    "/monthly-summary",
    response_model=list[MonthlySummary]
)
def get_monthly_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    results = (
        db.query(
            func.date_trunc(
                "month",
                Transaction.date
            ).label("month"),

            Category.type,

            func.sum(
                Transaction.amount
            ).label("amount")
        )
        .join(Category)
        .filter(
            Transaction.user_id == current_user.id
        )
        .group_by(
            func.date_trunc(
                "month",
                Transaction.date
            ),
            Category.type
        )
        .order_by(
            func.date_trunc(
                "month",
                Transaction.date
            )
        )
        .all()
    )

    summary = {}

    for month, transaction_type, amount in results:

        month_name = month.strftime("%B")

        if month_name not in summary:

            summary[month_name] = {
                "month": month_name,
                "income": 0,
                "expense": 0
            }

        if transaction_type == "Income":

            summary[month_name]["income"] = amount

        else:

            summary[month_name]["expense"] = amount

    return list(summary.values())