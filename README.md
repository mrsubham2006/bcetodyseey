# 🏛️ CIVIC NEXUS AI
### The AI Nervous System for a Self-Healing Smart City (Bhubaneswar, Odisha)
**Team:** CODE BLAZE  
**Event:** BPUT Tech Carnival 2026

---

## 🌟 Overview

**CIVIC NEXUS AI** is an intelligent, multi-portal civic operating system engineered for modern urban governance, real-time emergency response, and unified citizen-government collaboration. Built specifically for Bhubaneswar Smart City, it provides an end-to-end synchronized nervous system that connects citizens, field technicians, municipal departments, the city command center, and emergency medical/fire/police services in real time.

---

## 🚀 Key Modules & Architecture

### 1. 📹 AI Emergency Video Intelligence & Automatic SOS Alert System
* **Multi-Hazard Computer Vision Engine**: Decodes real video streams and camera feeds to identify critical emergencies:
  - 🚑 **Ambulances in Transit** (108 Lifeline + 1-Click Green Corridor preemption to AIIMS Bhubaneswar)
  - 🚒 **Fire Engines & Heavy Tenders** (101 Emergency Services)
  - 🔥 **Visible Flames, Dense Smoke & Thermal Plumes**
  - 💥 **Road Accidents, High-Kinetic Crashes & Lane Blockages**
  - 👥 **Abnormal Crowd Density & Bottleneck Surges**
  - ⚠️ **Physical Altercations & Public Safety Hazards**
  - 🚔 **Police PCR / SWAT Interceptors**
* **Temporal Tracking & Evidence HUD**: Highlights emergency candidates with bounding boxes, confidence tags (>90%), and frame timestamps.
* **Instant Multi-Tier SOS Broadcast**: Automatically creates canonical incidents, alerts City Command Center, sounds prioritized dashboard sirens, and streams real-time updates via Server-Sent Events (SSE).

### 2. 🚨 City Command Center & CCTV Telemetry
* Real-time spatial map with live camera feeds across major junctions (Rasulgarh, Vani Vihar, Khandagiri, Master Canteen).
* Cross-agency incident triaging and live sensor telemetry.

### 3. 👥 Unified Citizen Portal
* Multi-lingual (English & Odia - ଓଡ଼ିଆ) complaint registration with photo uploads and AI auto-categorization.
* Interactive Odisha heritage motifs, transparent lifecycle tracking, and instant status notifications.

### 4. 🏢 Municipal Department Operations
* Departmental workload distribution (Drainage & Flood, Sanitation, Roads, Electricity, Healthcare).
* Verification workflows, supervisor approvals, and field dispatch controls.

### 5. 📱 Field Worker Mobile Panel
* Task assignment, location-aware job routing, before/after photographic proof submission, and work completion verification.

### 6. 🔐 Unified Role-Based Governance & Auth
* Isolated role security: `CITIZEN`, `FIELD_WORKER`, `MUNICIPAL_OFFICER`, `CITY_COMMANDER`, `EMERGENCY_COORDINATOR`, and `SUPER_ADMIN`.
* Comprehensive audit logging and persistent system health diagnostics.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Leaflet Maps, HTML5 Canvas Video HUD
* **Backend & API**: Express.js, TypeScript, SSE (Server-Sent Events), Node.js
* **AI & Vision Pipeline**: NexusVision Multi-Hazard Vision Heuristics, Google Gemini 2.5 Flash Vision integration
* **Testing & QA**: End-to-End Automated Synchronization Suite (`tests/e2e-sync-test.ts`)

---

## ⚡ Quick Start & Installation

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm** or **bun**

### 1. Clone the Repository
```bash
git clone https://github.com/mrsubham2006/bcetodyseey.git
cd bcetodyseey
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=3000
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 4. Run Development Server
```bash
npm run dev
```
The application will launch at: **`http://localhost:3000`**

### 5. Run Automated Tests
Execute the full 11-step cross-portal synchronization test suite:
```bash
npm test
```

---

## 👥 Team: CODE BLAZE
* Built for **BPUT Tech Carnival 2026**
* Smart City AI & Emergency Governance Track
