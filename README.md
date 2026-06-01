# 📦 InventTrack

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge\&logo=fastapi\&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge\&logo=react\&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge\&logo=sqlite\&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge)

### Modern Inventory Management System Built with FastAPI, React & TypeScript

Manage inventories, categories, and items through a secure, scalable, and user-friendly platform.

</div>

---

## ✨ Overview

**InventTrack** is a full-stack inventory management application designed to help businesses and individuals efficiently organize and manage inventory records.

The platform combines a powerful **FastAPI backend** with a responsive **React + TypeScript frontend**, delivering secure authentication, inventory tracking, category management, item monitoring, and real-time dashboard insights.

---

## 🚀 Key Features

### 🔐 Authentication & Security

* JWT-based authentication
* Secure user registration and login
* Protected routes and API endpoints
* Session persistence
* User-specific inventory management

### 📦 Inventory Management

* Create and manage multiple inventories
* Organize inventories into categories
* Track inventory items
* Update and delete records
* Structured inventory hierarchy

### 📊 Dashboard Analytics

* Inventory summaries
* Category statistics
* Item tracking overview
* Personalized user dashboard

### 🎨 Modern Frontend

* React + TypeScript SPA
* Protected navigation
* Responsive UI
* Route-based architecture
* Context API authentication flow

---

## 🏗️ System Architecture

```mermaid
flowchart LR

A[👤 User]
--> B[⚛️ React Frontend]

B --> C[🔐 JWT Authentication]

C --> D[🚀 FastAPI Backend]

D --> E[(🗄️ SQLite)]

D --> F[(🐘 PostgreSQL)]
```

---

## 📂 Project Structure

```text
InventTrack/
│
├── backend/
│   ├── .dockerignore
│   ├── .env.example
│   ├── .env (optional)
│   ├── Dockerfile
│   ├── drop_tables.py
│   ├── README.md
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── reports/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── crud.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_inventories.py
│       └── test_items.py
│
├── frontend/
│   ├── README.md
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vercel.json
│   ├── vite.config.ts
│   └── src/
│       ├── api.ts
│       ├── App.tsx
│       ├── config.ts
│       ├── index.css
│       ├── main.tsx
│       ├── types.ts
│       ├── vite-env.d.ts
│       ├── components/
│       │   ├── Layout.tsx
│       │   └── ProtectedRoute.tsx
│       ├── context/
│       │   └── AuthContext.tsx
│       └── pages/
│           ├── CategoryDetail.tsx
│           ├── Dashboard.tsx
│           ├── Inventories.tsx
│           ├── InventoryDetail.tsx
│           ├── Items.tsx
│           ├── Login.tsx
│           └── Register.tsx
│
└── README.md
```

---

## 🛠️ Technology Stack

### Backend

| Technology | Purpose             |
| ---------- | ------------------- |
| FastAPI    | REST API Framework  |
| SQLAlchemy | ORM                 |
| SQLite     | Default Database    |
| PostgreSQL | Production Database |
| JWT        | Authentication      |
| Pydantic   | Data Validation     |

### Frontend

| Technology   | Purpose          |
| ------------ | ---------------- |
| React        | UI Library       |
| TypeScript   | Type Safety      |
| Vite         | Build Tool       |
| React Router | Routing          |
| Context API  | State Management |

---

## 🔄 Application Workflow

```mermaid
flowchart TD

A[User Registration]
--> B[Login]

B --> C[JWT Token Issued]

C --> D[Dashboard]

D --> E[Create Inventory]

E --> F[Create Categories]

F --> G[Manage Items]

G --> H[Update/Delete Records]
```

---

## 📋 Core Functionalities

### 👥 User Management

* Register account
* Login securely
* Token-based authorization
* Access protected resources

### 📦 Inventory Operations

* Create inventories
* View inventories
* Edit inventory details
* Delete inventories

### 🗂️ Category Management

* Create categories
* Update categories
* Delete categories
* Organize inventory structures

### 🏷️ Item Management

* Add inventory items
* Update item information
* Remove items
* Track inventory contents

---

## ⚙️ Getting Started

### Clone Repository

```bash
git clone https://github.com/Creative-Sandesh/InventTrack-AI-Training.git

cd inventtrack
```

---

### Backend Setup

```bash
cd backend

python -m pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs at:

```text
http://localhost:8000
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## 🗄️ Database Configuration

### Default Configuration

Uses SQLite automatically:

```text
backend/sql_app.db
```

### PostgreSQL Configuration

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=postgresql://username:password@localhost/database_name
```

The application will use PostgreSQL when available.

---

## 🧪 Testing

Run backend tests:

```bash
cd backend

pytest
```

Test files are located in:

```text
backend/tests/
```

---

## 🔒 Security Features

* Password hashing
* JWT Authentication
* Protected API endpoints
* Route Guards
* User-scoped resources
* CORS configuration

---

## 🚀 Future Enhancements

* Role-Based Access Control (RBAC)
* Inventory Reports & Exports
* Barcode Scanning
* Email Notifications
* Audit Logging
* Docker Compose Deployment
* Cloud Database Integration
* Analytics Dashboard

---

## ⭐ Highlights

* Full-stack architecture
* Production-ready API design
* Secure authentication workflow
* Modular and scalable codebase
* Clean separation of frontend and backend
* PostgreSQL-ready deployment support

---

<div align="center">

### 📦 Built with FastAPI, React, TypeScript & SQLAlchemy

**Secure • Scalable • Modern**

⭐ Star this repository if you found it useful!

</div>
