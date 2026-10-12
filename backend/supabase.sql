-- ========================================================
-- CareLink Enterprise Multi-Hospital & OPD Queue Platform
-- PostgreSQL Database Schema for Supabase
-- Paste and Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. HOSPITAL ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS hospital_organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    tagline TEXT,
    logo_url TEXT,
    contact_email VARCHAR(255),
    phone VARCHAR(50),
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. HOSPITAL BRANCHES TABLE
CREATE TABLE IF NOT EXISTS hospital_branches (
    id SERIAL PRIMARY KEY,
    org_id INT REFERENCES hospital_organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Metro City',
    phone VARCHAR(50),
    emergency_phone VARCHAR(50) DEFAULT '911',
    operating_hours VARCHAR(100) DEFAULT '08:00 AM - 08:00 PM',
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    checkin_cutoff_mins INT DEFAULT 15,
    token_prefix VARCHAR(10) DEFAULT 'OPD',
    walkin_policy VARCHAR(50) DEFAULT 'ACCEPT_ALL', -- ACCEPT_ALL, LIMITED_SLOTS, EMERGENCY_ONLY
    image_url TEXT,
    rating NUMERIC(2, 1) DEFAULT 4.8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backward compatibility view / table for hospitals
CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'Multi-Specialty',
    rating NUMERIC(2, 1) DEFAULT 4.8,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    emergency_phone VARCHAR(50) DEFAULT '911',
    departments TEXT[] DEFAULT ARRAY['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General Medicine'],
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CLINICAL DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES hospital_branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    token_prefix VARCHAR(10) DEFAULT 'OPD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('patient', 'staff', 'admin')) DEFAULT 'patient',
    gender VARCHAR(20) DEFAULT 'Male',
    age INT DEFAULT 32,
    blood_group VARCHAR(10) DEFAULT 'O+',
    height VARCHAR(20) DEFAULT '180 cm',
    weight VARCHAR(20) DEFAULT '75 kg',
    location VARCHAR(255) DEFAULT 'Metro City, NY',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. DOCTORS ROSTER TABLE
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES hospital_branches(id) ON DELETE CASCADE,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    dept VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) DEFAULT 'Consultant Specialist',
    experience VARCHAR(50) DEFAULT '10 Years',
    rating NUMERIC(2, 1) DEFAULT 4.8,
    consultation_fee VARCHAR(50) DEFAULT '$150.00',
    room_number VARCHAR(50) DEFAULT 'OPD Room 1',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    slots TEXT[] DEFAULT ARRAY['09:00 AM', '10:30 AM', '01:30 PM', '03:15 PM', '04:30 PM'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DOCTOR SHIFTS & SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id SERIAL PRIMARY KEY,
    doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL, -- 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    start_time TIME NOT NULL DEFAULT '09:00',
    end_time TIME NOT NULL DEFAULT '17:00',
    break_start TIME DEFAULT '13:00',
    break_end TIME DEFAULT '14:00',
    slot_duration_mins INT DEFAULT 30,
    max_capacity_per_slot INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    branch_id INT REFERENCES hospital_branches(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(50) DEFAULT '+1 555-0199',
    doctor_name VARCHAR(255) NOT NULL,
    dept VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    expected_checkin_time VARCHAR(50),
    fee VARCHAR(50) DEFAULT '$150.00',
    status VARCHAR(50) CHECK (status IN ('Confirmed', 'CheckedIn', 'InConsultation', 'Completed', 'Cancelled', 'NoShow')) DEFAULT 'Confirmed',
    token_number INT,
    token_code VARCHAR(50),
    notes TEXT,
    cancel_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hospital_id INT DEFAULT 1,
    CONSTRAINT unique_doctor_slot UNIQUE (doctor_name, appointment_date, time_slot)
);

-- 8. LIVE OPD QUEUE TOKENS TABLE
CREATE TABLE IF NOT EXISTS queue_tokens (
    id SERIAL PRIMARY KEY,
    token_number INT NOT NULL,
    token_code VARCHAR(50) NOT NULL,
    branch_id INT REFERENCES hospital_branches(id) ON DELETE CASCADE,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    patient_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    visit_type VARCHAR(100) DEFAULT 'Consultation',
    priority VARCHAR(50) CHECK (priority IN ('NORMAL', 'SENIOR', 'EMERGENCY')) DEFAULT 'NORMAL',
    status VARCHAR(50) CHECK (status IN ('PENDING_CHECKIN', 'WAITING', 'CALLED', 'IN_CONSULTATION', 'COMPLETED', 'SKIPPED', 'NO_SHOW')) DEFAULT 'WAITING',
    wait_time VARCHAR(50) DEFAULT '10m',
    estimated_call_time VARCHAR(50),
    hospital_id INT DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES hospital_branches(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    actor_name VARCHAR(255) DEFAULT 'OPD Desk Staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- SEED DATA: TWO INDEPENDENT CONFIGURABLE HOSPITALS
-- ========================================================

-- Organization 1: City Central Health System
INSERT INTO hospital_organizations (id, name, code, tagline, logo_url, contact_email, phone)
VALUES 
(1, 'City Central Health System', 'CCHS', 'Excellence in Tertiary & Emergency Care', 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=200&q=80', 'admin@citycentral.org', '+1 234-567-8900'),
(2, 'Green Valley Medical Care', 'GVMC', 'Community-First Family & Preventive Medicine', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=200&q=80', 'care@greenvalley.org', '+1 234-567-8901')
ON CONFLICT (id) DO NOTHING;

-- Branches for Org 1 (City Central) and Org 2 (Green Valley)
INSERT INTO hospital_branches (id, org_id, name, code, address, city, phone, emergency_phone, operating_hours, checkin_cutoff_mins, token_prefix, walkin_policy, rating, image_url)
VALUES 
(1, 1, 'Downtown Main Campus', 'CCHS-DT', '124 Downtown Ave, Metro City', 'Metro City', '+1 234-567-8900', '911 / +1 800-EMERGENCY', '07:30 AM - 09:00 PM', 15, 'CC', 'ACCEPT_ALL', 4.8, 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80'),
(2, 1, 'Westside Ambulatory Pavilion', 'CCHS-WS', '880 Westside Pkwy, Metro City', 'Metro City', '+1 234-567-8905', '+1 800-CC-WEST', '08:00 AM - 06:00 PM', 20, 'CCW', 'LIMITED_SLOTS', 4.7, 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80'),
(3, 2, 'North Hills Wellness Center', 'GVMC-NH', '88 Oakwood Blvd, Westside', 'Westside', '+1 234-567-8901', '+1 800-GREEN-VALLEY', '08:00 AM - 07:00 PM', 10, 'GV', 'ACCEPT_ALL', 4.6, 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (id) DO NOTHING;

-- Legacy Hospitals Table Sync for compatibility
INSERT INTO hospitals (id, name, type, rating, address, phone, emergency_phone, departments, image_url)
VALUES 
(1, 'City Central Hospital (Downtown)', 'Multi-Specialty', 4.8, '124 Downtown Ave, Metro City', '+1 234-567-8900', '911 / +1 800-EMERGENCY', ARRAY['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General Medicine'], 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80'),
(2, 'Green Valley Medical Center', 'General Care', 4.6, '88 Oakwood Blvd, Westside', '+1 234-567-8901', '+1 800-GREEN-VALLEY', ARRAY['General Medicine', 'ENT', 'Dermatology'], 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80'),
(3, 'City Central - Westside Pavilion', 'Ambulatory Care', 4.7, '880 Westside Pkwy, Metro City', '+1 234-567-8905', '+1 800-CC-WEST', ARRAY['General Medicine', 'Urgent Care', 'Pediatrics'], 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80')
ON CONFLICT (id) DO NOTHING;

-- Clinical Departments for Branches
INSERT INTO departments (id, branch_id, name, code, token_prefix, description)
VALUES 
(1, 1, 'Cardiology', 'CARD', 'C', 'Comprehensive cardiac assessment & diagnostics'),
(2, 1, 'General Medicine', 'GMED', 'GM', 'Primary healthcare, internal medicine & triage'),
(3, 1, 'Pediatrics', 'PED', 'P', 'Neonatal, child healthcare & immunization'),
(4, 1, 'Orthopedics', 'ORTH', 'O', 'Musculoskeletal injury & joint care'),
(5, 2, 'General Medicine', 'GMED', 'GW', 'Outpatient walk-ins and general consultations'),
(6, 2, 'Pediatrics', 'PED', 'PW', 'Child health outpatient clinics'),
(7, 3, 'General Medicine', 'GMED', 'GV', 'Preventive wellness and family medicine'),
(8, 3, 'ENT & Allergy', 'ENT', 'E', 'Ear, Nose, Throat and sinus therapies'),
(9, 3, 'Dermatology', 'DERM', 'D', 'Skin disorders and clinical laser treatments')
ON CONFLICT (id) DO NOTHING;

-- Doctors Roster with Branch and Department assignments
INSERT INTO doctors (id, branch_id, department_id, name, dept, specialization, experience, rating, consultation_fee, room_number, slots)
VALUES 
(1, 1, 1, 'Dr. Sarah Jenkins', 'Cardiology', 'Senior Interventional Cardiologist', '12 Years', 4.9, '$180.00', 'OPD Room 102', ARRAY['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM']),
(2, 1, 2, 'Dr. Michael Chen', 'General Medicine', 'Chief Internal Medicine Consultant', '8 Years', 4.7, '$120.00', 'OPD Room 104', ARRAY['09:30 AM', '11:00 AM', '01:30 PM', '03:15 PM']),
(3, 1, 3, 'Dr. Emily Blunt', 'Pediatrics', 'Senior Pediatrician & Neonatologist', '15 Years', 4.9, '$150.00', 'Pediatrics Wing B', ARRAY['09:30 AM', '01:00 PM', '02:30 PM', '04:30 PM']),
(4, 1, 4, 'Dr. Robert Hayes', 'Orthopedics', 'Consultant Orthopedic Surgeon', '11 Years', 4.8, '$160.00', 'OPD Room 108', ARRAY['10:00 AM', '11:30 AM', '03:00 PM']),
(5, 3, 7, 'Dr. Alistair Vance', 'General Medicine', 'Preventive Family Physician', '14 Years', 4.8, '$110.00', 'Suite 12', ARRAY['08:30 AM', '10:00 AM', '01:00 PM', '03:30 PM']),
(6, 3, 9, 'Dr. Sophia Morales', 'Dermatology', 'Consultant Dermatologist', '9 Years', 4.9, '$140.00', 'Derm Suite 4', ARRAY['09:00 AM', '11:30 AM', '02:00 PM'])
ON CONFLICT (id) DO NOTHING;

-- Doctor Weekly Schedules (0=Sun to 6=Sat)
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, break_start, break_end, slot_duration_mins, max_capacity_per_slot)
VALUES 
(1, 1, '09:00', '17:00', '13:00', '14:00', 30, 1),
(1, 2, '09:00', '17:00', '13:00', '14:00', 30, 1),
(1, 3, '09:00', '17:00', '13:00', '14:00', 30, 1),
(1, 4, '09:00', '17:00', '13:00', '14:00', 30, 1),
(1, 5, '09:00', '14:00', '12:00', '12:30', 30, 1),
(2, 1, '09:00', '16:00', '12:30', '13:30', 20, 1),
(2, 3, '09:00', '16:00', '12:30', '13:30', 20, 1),
(2, 5, '09:00', '16:00', '12:30', '13:30', 20, 1)
ON CONFLICT DO NOTHING;

-- Initial Seed Active Tokens
INSERT INTO queue_tokens (token_number, token_code, branch_id, department_id, doctor_id, patient_name, department, doctor_name, visit_type, priority, status, wait_time, estimated_call_time)
VALUES 
(420, 'C-420', 1, 1, 1, 'John Doe', 'Cardiology', 'Dr. Sarah Jenkins', 'Consultation', 'NORMAL', 'IN_CONSULTATION', 'Serving Now', '10:15 AM'),
(421, 'C-421', 1, 1, 1, 'Alice Smith', 'Cardiology', 'Dr. Sarah Jenkins', 'Consultation', 'NORMAL', 'WAITING', '5m', '10:45 AM'),
(422, 'C-422', 1, 1, 1, 'Robert Johnson', 'Cardiology', 'Dr. Sarah Jenkins', 'Follow-up', 'SENIOR', 'WAITING', '12m', '11:00 AM'),
(423, 'C-423', 1, 1, 1, 'Emily Davis', 'Cardiology', 'Dr. Sarah Jenkins', 'Consultation', 'NORMAL', 'WAITING', '20m', '11:30 AM'),
(428, 'C-428', 1, 1, 1, 'Alex Robertson', 'Cardiology', 'Dr. Sarah Jenkins', 'Consultation', 'NORMAL', 'WAITING', '35m', '12:00 PM')
ON CONFLICT DO NOTHING;

-- Enable Supabase Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE queue_tokens;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
