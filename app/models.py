from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import Date
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password_hash = Column(String, nullable=False)

    transactions = relationship(
        "Transaction",
        back_populates="user"
    )


class Category(Base):

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)

    name = Column(String, nullable=False)

    type = Column(String)

    transactions = relationship(
        "Transaction",
        back_populates="category"
    )


class Transaction(Base):

    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)

    amount = Column(Float)

    description = Column(String)

    date = Column(Date)

    user_id = Column(Integer, ForeignKey("users.id"))

    category_id = Column(Integer, ForeignKey("categories.id"))

    user = relationship(
        "User",
        back_populates="transactions"
    )

    category = relationship(
        "Category",
        back_populates="transactions"
    )