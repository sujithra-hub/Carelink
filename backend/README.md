# CareLink Backend Server with Supabase

High-performance Node.js / Express backend with Supabase PostgreSQL database integration for the CareLink Smart Hospital & OPD Queue Management platform.

---

## 🚀 Quick Start Guide

### 1. Install Backend Dependencies
Open PowerShell or Terminal in the `backend` directory:
```bash
cd d:\Design\backend
npm install
```

### 2. Connect Supabase Database
1. Go to [https://supabase.com](https://supabase.com) and create a free project (or open an existing one).
2. Go to **SQL Editor** in your Supabase dashboard (left sidebar).
3. Open [`supabase.sql`](./supabase.sql) in this directory, copy its entire contents, and paste it into the Supabase SQL Editor.
4. Click **Run**. This will automatically create:
   - `hospitals` table
   - `users` table
   - `doctors` table
   - `appointments` table (with duplicate booking constraints)
   - `queue_tokens` table (with real-time replication enabled)
   - `audit_logs` table
   - Seed data for City Central Hospital and active OPD queue
5. Go to **Project Settings** -> **API** in Supabase and copy:
   - **Project URL**
   - **anon / public key** or **service_role key**
6. Open `.env` inside `d:\Design\backend` and update:
   ```env
   PORT=5000
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

### 3. Start the Backend Server
```bash
npm run dev
```
The server will boot at `http://localhost:5000`.

---

## 📡 API Endpoints Reference

### 🔐 Authentication
* `POST /api/auth/login` - Sign in as patient, staff, or admin
* `GET /api/auth/profile/:id` - Fetch patient profile & records

### 🏥 Hospital Management
* `GET /api/hospitals` - Fetch list of hospitals and live token load
* `GET /api/hospitals/:id` - Fetch single hospital details
* `PATCH /api/hospitals/:id` - Update hospital info & departments (Admin only)

### ⏱️ Live OPD Queue
* `GET /api/queue` - Get currently serving patient and waiting queue
* `POST /api/queue/call-next` - Advance queue (moves next patient to examination room)
* `POST /api/queue/skip` - Skip current patient
* `POST /api/queue/walk-in` - Register walk-in patient and assign incremental token
* `GET /api/queue/audit-logs` - Fetch audit log of queue operations

### 📅 Appointments
* `GET /api/appointments` - Fetch all booked appointments
* `POST /api/appointments` - Book appointment with conflict prevention & token assignment
* `PATCH /api/appointments/:id/reschedule` - Reschedule appointment to a new date & slot
* `PATCH /api/appointments/:id/cancel` - Cancel appointment and liberate reserved slot
