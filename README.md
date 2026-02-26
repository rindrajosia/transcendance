# transcendance
## 👨‍💻 Developer

**rrakoton, rrakotos, trakoako**  

---


# Spotify clone
A full-stack application built with **NestJS (Backend)** and **Next.js (Frontend)**, integrated with PostgreSQL, Redis, and RabbitMQ using Docker Compose.
---

## 🐳 Prerequisite

- Install **Docker**
- Make sure Docker is running before executing commands
---

## 🚀 Run the Project (Docker - Recommended)

Open **PowerShell** in the project root folder (`transcendance`) and run:
docker compose up --build
This single command will automatically:
- Download PostgreSQL, Redis, and RabbitMQ images
- Build the Backend (NestJS)
- Build the Frontend (Next.js)
- Start all 5 services
Connect everything via Docker network

## 🔁 Running Again (Without Rebuilding Everything)
If you are running the project multiple times:
- docker compose build --no-cache
- docker compose up
---

## 🚀 Run the Project in Development mode (Docker - Recommended)

Open **PowerShell** in the project root folder (`transcendance`) and run:
- docker-compose up postgres redis rabbitmq
This command will launch: postgres redis rabbitmq in docker.

**To run NestJS in your local development computer**
- cd backend
- npm install
- npm run start:dev

**To run NextJS in your local development computer**
- cd frontend
- npm install
- npm run dev


## 🌐 Access the Application
Open Docker Desktop
- Go to Containers
- Find merchant_sys
- Make sure web services are running
Then open:
Frontend with Backend:	
- http://localhost:3000/login
Other Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- RabbitMQ Management: http://localhost:15672   (Username: guest, Password: guest)
---

## To stop containeurs
- docker-compose down

## List storage and remove 
- docker volume ls
- docker volume rm <STORAGE_NAME>

## 🛠 Tech Stack
Backend
- NestJS (TypeScript)
- TypeORM
- PostgreSQL

Frontend
- Next.js (React)
- Vanilla CSS Modules

Infrastructure
- Docker Compose
- Redis
- RabbitMQ
---

## ✨ Features
Sopitify clone Authentication
- Register
- Login (JWT-based)
- Password hashing using bcrypt
---

## 🏗 Security & Architecture
Clean Architecture
- Domain → Application → Infrastructure
Security
- bcrypt password hashing
- JWT authentication
- DTO validation
Data Isolation
- 
---

## 📈 Production Improvements (Scaling & Security)
If running at scale in production:
1️⃣ Architecture & Performance
Database
- PostgreSQL read replicas
- Connection pooling (PgBouncer)
- Schema migrations
Caching Strategy
- Event-driven cache invalidation (CDC/events)
Microservices
- Extract Transactions module as separate service
- Communication via gRPC or RabbitMQ
Load Balancing
- Multiple API & Frontend instances
- Nginx or AWS ALB
- Kubernetes deployment
2️⃣ Security Improvements
Use Vault or AWS Secrets Manager instead of .env
Distributed Rate Limiting (Redis-based)
PCI-DSS compliance (if handling real card data)
Observability stack:
- Open Telemetry
- Prometheus
- Grafana
---

## 📄 License
All Rights Reserved © 42 Developer
---

