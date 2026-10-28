# 🏅 State Sports Academy Management & Talent Scouting Portal

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![AI Vision](https://img.shields.io/badge/AI%20Vision-MediaPipe%20Pose-FF6F00?logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![Animations](https://img.shields.io/badge/Animations-GSAP%203-88CE02?logo=greensock&logoColor=black)](https://gsap.com/)
[![Deployment](https://img.shields.io/badge/Deployment-Render-46E3B7?logo=render&logoColor=black)](https://render.com/)

A modern, role-driven Sports Academy Management and Biomechanical Talent Identification Web Platform designed for state sports authorities, coaches, scouts, and elite athletes.

---

## 📑 Table of Contents

- [🌟 System Architecture](#-system-architecture)
- [👥 Multi-Role Ecosystem](#-multi-role-ecosystem)
- [🔬 Core Modules & Key Features](#-core-modules--key-features)
  - [1. 🤖 Biomechanical AI Pose Lab](#1--biomechanical-ai-pose-lab)
  - [2. 🎯 Selection Board & Scouting Pipeline](#2--selection-board--scouting-pipeline)
  - [3. 📋 Coach Hub & Training Management](#3--coach-hub--training-management)
  - [4. 🗂️ Athlete Document Vault (KYC)](#4-️-athlete-document-vault-kyc)
  - [5. 🔔 Automated Notification Engine](#5--automated-notification-engine)
  - [6. 🏆 State Sports Leaderboard](#6--state-sports-leaderboard)
- [🛠️ Tech Stack](#️-tech-stack)
- [🗄️ Database Models](#️-database-models)
- [🛣️ REST API Documentation](#️-rest-api-documentation)
- [💻 Local Installation & Setup](#-local-installation--setup)
- [☁️ Cloud Deployment Guide (Render)](#️-cloud-deployment-guide-render)

---

## 🌟 System Architecture

```
                  ┌───────────────────────────────────────────────┐
                  │       Client Layer (React 19 + Vite)          │
                  │  Modern Dark-Neon Glassmorphic UI & Canvas   │
                  └───────────────────────┬───────────────────────┘
                                          │  HTTP / REST / JWT
                                          ▼
                  ┌───────────────────────────────────────────────┐
                  │        API Layer (Node.js & Express)          │
                  │  Auth Middleware • Role Guard • Notifications  │
                  └───────────────────────┬───────────────────────┘
                                          │  Mongoose ODM
                                          ▼
                  ┌───────────────────────────────────────────────┐
                  │       Database Layer (MongoDB Atlas)          │
                  │   Users • Candidates • Squads • KYC • Ledger  │
                  └───────────────────────────────────────────────┘
```

---

## 👥 Multi-Role Ecosystem

The portal enforces granular Role-Based Access Control (RBAC) across 4 official stakeholder groups:

| Role | Dashboard Highlights | Core Permissions |
| :--- | :--- | :--- |
| **🏃 Athlete** | Personal points, performance benchmarks, training schedule, KYC Document Vault, state leaderboard. | Upload verification documents, view assigned coach, track training sessions, inspect selection status. |
| **📋 Coach** | Quick Launchpad, squad roster, attendance tracker, training scheduler, bonus points ledger. | Create & log training sessions, take squad attendance, award performance bonus points, inspect biomechanics. |
| **🎯 Selector** | Selection command hub, candidate scorecard evaluation, shortlist management, scouting analytics. | Grade trial athletes (Speed, Stamina, Technique, Tactical), shortlist candidates, nominate state squads. |
| **🛡️ Admin** | Master user management, full role modification, verification oversight, system audits, account deletion. | CRUD on all system accounts, oversee document verification, inspect global academy reports. |

---

## 🔬 Core Modules & Key Features

### 1. 🤖 Biomechanical AI Pose Lab
- Real-time computer vision joint tracking using device webcam or uploaded athletic performance video.
- Analyzes key kinematic angles:
  - Knee Flexion & Extension Angles
  - Hip-Knee-Ankle Kinetic Chain Alignment
  - Jump Height, Squat Depth & Spine Neutrality
- Generates automated physical safety warnings for improper loading and high joint strain.

### 2. 🎯 Selection Board & Scouting Pipeline
- Visual talent progression pipeline:
  `Trials Registration` ➔ `Fitness Testing` ➔ `Scorecard Review` ➔ `Final State Squad Nomination`
- Multi-dimensional candidate evaluation scorecard:
  - **Speed & Agility** (0–100)
  - **Stamina & Endurance** (0–100)
  - **Technical Mastery** (0–100)
  - **Tactical Awareness** (0–100)
- Single-click state team shortlisting with instant status synchronization.

### 3. 📋 Coach Hub & Training Management
- Interactive scheduling for athletic disciplines (Athletics, Volleyball, Tennis, Badminton, Archery, etc.).
- Real-time squad check-in system with attendance rate calculation.
- **Performance Bonus Points System**:
  - `+5 PTS (Minor)` — Punctuality & sportsmanship
  - `+10 PTS (Standard)` — Session drill completion
  - `+20 PTS (Major)` — Milestone & personal best
  - `+50 PTS (Exceptional)` — State record breakthrough

### 4. 🗂️ Athlete Document Vault (KYC)
- Secure verification gateway for mandatory athlete credentials:
  - Birth Certificate
  - Medical Fitness Clearance
  - Aadhaar Identification Copy
  - Tournament Achievement Certificate
- Coaches & Admins can inspect documents and toggle verification status (`Pending` ➔ `Verified` / `Rejected`).

### 5. 🔔 Automated Notification Engine
- **Event-Driven Alerts**:
  - Whenever a State Selector shortlists or selects an athlete, an instant notification is dispatched to that athlete's **respective coach**.
  - Athletes receive congratulatory selection confirmations.
  - Interactive top-bar bell with unread counter, read-all, and individual clear buttons.

### 6. 🏆 State Sports Leaderboard
- Real-time aggregate points rankings across all registered academy athletes.
- Sport-specific filters to view top contenders discipline by discipline.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19, Vite
- **Styling**: Vanilla CSS, Modern Dark-Neon Glassmorphic Design System
- **Motion & Dynamics**: GSAP 3 (GreenSock), Canvas Biomechanics Overlay
- **Icons**: Handcrafted lightweight SVG icon pack

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Security**: JWT (JSON Web Tokens), Bcrypt.js password hashing, CORS
- **Database Connection**: Mongoose ODM with MongoDB Atlas

---

## 🗄️ Database Models

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    User     │◄──────┤ SquadAssignment │──────►│ TrainingSession │
└──────┬──────┘       └─────────────────┘       └─────────────────┘
       │
       ├──────────────►┌─────────────────┐
       │               │    Candidate    │ (Selection Scorecard)
       │               └─────────────────┘
       ├──────────────►┌─────────────────┐
       │               │   PointLedger   │ (Points Audit History)
       │               └─────────────────┘
       ├──────────────►┌─────────────────┐
       │               │   KycDocument   │ (Document Vault)
       │               └─────────────────┘
       └──────────────►┌─────────────────┐
                       │  Notification   │ (Real-Time Alerts)
                       └─────────────────┘
```

---

## 🛣️ REST API Documentation

### Authentication & Profiles (`/api/auth`)
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Athlete, Coach, or Selector account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |

### Selection & Candidates (`/api/candidates`)
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/candidates` | Protected | Fetch talent scouting scorecards & status |
| `PUT` | `/api/candidates/:id` | Selector | Update scores, assessment notes & selection status |
| `PUT` | `/api/candidates/:id/shortlist` | Selector | Toggle shortlist status & notify coach |

### Squads & Training (`/api/squads` & `/api/trainings`)
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/squads` | Protected | Retrieve roster of assigned squad athletes |
| `POST` | `/api/squads` | Coach | Assign athlete to coach's active squad |
| `GET` | `/api/trainings` | Protected | Get scheduled training workouts |
| `POST` | `/api/trainings` | Coach | Create and broadcast new training session |
| `PUT` | `/api/trainings/:id/attendance`| Coach | Log athlete session attendance |

### Points & Leaderboard (`/api/points`)
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/points/leaderboard` | Protected | Overall and sport-wise top 10 rankings |
| `GET` | `/api/points/history/:athleteId`| Protected | View points history ledger for an athlete |
| `POST` | `/api/points/bonus` | Coach | Award performance bonus points to an athlete |

### Notifications (`/api/notifications`)
| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications/my` | Protected | Fetch user's unread & recent notifications |
| `PUT` | `/api/notifications/read-all` | Protected | Mark all notifications as read |
| `DELETE` | `/api/notifications/clear-all`| Protected | Clear user notification history |

---

## 💻 Local Installation & Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- Git
- MongoDB Atlas cluster or local MongoDB instance

### 2. Clone Repository
```bash
git clone https://github.com/Ranjithkumar-B/StateSportstool.git
cd StateSportstool
```

### 3. Install All Dependencies
```bash
# Installs dependencies for both backend and frontend simultaneously
npm run install:all
```

### 4. Configure Environment Variables
Create a file named `.env` inside the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=StateSportsAcademy_SuperSecret_JWT_Key_2026
```

### 5. Run in Development Mode
```bash
# Terminal 1: Start Backend Server
npm run dev:backend

# Terminal 2: Start Frontend Dev Server
npm run dev:frontend
```
Open **`http://localhost:5173`** in your browser.

---

## ☁️ Cloud Deployment Guide (Render)

The project is structured to deploy on **Render** as a single, unified web service:

1. **Sign in to Render**: Log in at [Render.com](https://render.com) using your GitHub account.
2. **Create New Web Service**: Click **New +** ➔ **Web Service** ➔ Connect repository `StateSportstool`.
3. **Configure Settings**:
   - **Runtime**: `Node`
   - **Build Command**: `npm run build:render`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. **Environment Variables**:
   - `MONGO_URI`: `your_mongodb_connection_string`
   - `JWT_SECRET`: `StateSportsAcademy_SuperSecret_JWT_Key_2026`
   - `NODE_ENV`: `production`
5. **Click Deploy**: Your live website URL will be ready at `https://your-service-name.onrender.com`.

---

## 📄 License
This project is licensed under the MIT License — created for the State Sports Academy & Talent Identification Initiative.
