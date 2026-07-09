# 💰 Expense Tracker

A modern Full Stack Expense Tracker built using **FastAPI**, **PostgreSQL**, and **HTML/CSS/JavaScript**.
The application allows users to securely manage their personal finances by tracking income and expenses, categorizing transactions, and viewing financial summaries through an interactive dashboard.

---

## 🚀 Features

- 🔐 JWT Authentication (Register/Login)
- 👤 User-specific data isolation
- 💸 Add Income & Expense
- ✏️ Edit Transactions
- 🗑️ Delete Transactions
- 📋 View Transaction History
- 📂 Category Management
- 📊 Dashboard with Financial Summary
- 📈 Analytics Page
- 📄 Reports Section
- 👤 User Profile
- ⚙️ Settings Page
- 🌙 Responsive Modern UI
- ☁️ Cloud Database using Neon PostgreSQL

---

## 🛠 Tech Stack

### Backend
- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- JWT Authentication
- Passlib (Password Hashing)
- Pydantic

### Frontend
- HTML5
- CSS3
- JavaScript (ES6)
- Single Page Application (SPA)

### Database
- PostgreSQL
- Neon Cloud PostgreSQL

### Deployment
- Render (Backend)
- Vercel (Frontend)
- GitHub

---

## 📂 Project Structure

```
Expense_Tracker/
│
├── app/
│   ├── auth/
│   ├── routers/
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── main.py
│
├── Frontend/
│   ├── css/
│   ├── js/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│
├── requirements.txt
├── README.md
└── .gitignore
```

---

## 🔑 Authentication

- User Registration
- User Login
- JWT Access Token
- Protected API Endpoints
- Password Hashing using Passlib

---

## 📌 API Endpoints

### Authentication

| Method | Endpoint |
|---------|----------|
| POST | /auth/register |
| POST | /auth/login |

### Transactions

| Method | Endpoint |
|---------|----------|
| GET | /transactions/get_expense |
| POST | /transactions/Add_expense |
| PUT | /transactions/edit_expense/{id} |
| DELETE | /transactions/delete_expense/{id} |

### Categories

| Method | Endpoint |
|---------|----------|
| GET | /transactions/categories |

---

## 📊 Dashboard

The dashboard provides:

- Total Income
- Total Expense
- Current Balance
- Recent Transactions
- Expense Categories
- Monthly Overview

---

## 🔒 Security

- JWT Authentication
- Password Hashing
- Protected Routes
- User-based Authorization
- Secure Database Connection

---

## 📦 Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/EXPENSE_TRACKER.git
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run FastAPI

```bash
uvicorn app.main:app --reload
```

Open Swagger UI:

```
http://127.0.0.1:8000/docs
```

---

## 🌐 Deployment

### Backend
- Render

### Database
- Neon PostgreSQL

### Frontend
- Vercel

---

## 🎯 Future Enhancements

- PDF Report Generation
- Excel Export
- Email Monthly Statements
- Receipt OCR
- Budget Planning
- Expense Prediction
- Charts using Chart.js
- Dark Theme
- Notifications

---

## 👨‍💻 Author

**Syed Abdul Kathir**

B.Tech Artificial Intelligence & Data Science

Python Full Stack Developer

GitHub:
https://github.com/SyedA01

LinkedIn:
https://www.linkedin.com/in/syed-abdul-qadir-az-58a8a2272?

---

## 📄 License

This project is developed for educational purposes and portfolio demonstration.
