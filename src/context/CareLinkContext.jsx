import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { hospitalAudio } from '../utils/hospitalAudio';

const CareLinkContext = createContext(null);

const INITIAL_ORGANIZATIONS = [
  {
    id: 1,
    name: 'City Central Health System',
    code: 'CCHS',
    tagline: 'Excellence in Tertiary & Emergency Care',
    logo_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=200&q=80',
    contact_email: 'admin@citycentral.org',
    phone: '+1 234-567-8900',
    branches: [
      {
        id: 1,
        org_id: 1,
        name: 'Downtown Main Campus',
        code: 'CCHS-DT',
        address: '124 Downtown Ave, Metro City, NY 10001',
        city: 'Metro City',
        phone: '+1 234-567-8900',
        emergency_phone: '911 / +1 800-EMERGENCY',
        operating_hours: '07:30 AM - 09:00 PM',
        timezone: 'America/New_York',
        checkin_cutoff_mins: 15,
        token_prefix: 'CC',
        walkin_policy: 'ACCEPT_ALL',
        rating: 4.8,
        image_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80',
        departments: [
          { id: 1, name: 'Cardiology', code: 'CARD', prefix: 'C', active: true },
          { id: 2, name: 'General Medicine', code: 'GMED', prefix: 'GM', active: true },
          { id: 3, name: 'Pediatrics', code: 'PED', prefix: 'P', active: true },
          { id: 4, name: 'Orthopedics', code: 'ORTH', prefix: 'O', active: true }
        ],
        doctors: [
          {
            id: 1,
            name: 'Dr. Sarah Jenkins',
            dept: 'Cardiology',
            specialization: 'Senior Interventional Cardiologist',
            experience: '12 Years',
            rating: 4.9,
            consultation_fee: '$180.00',
            room_number: 'OPD Room 102',
            slot_duration_mins: 30,
            slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '04:00 PM'],
            schedule: { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00', slotDuration: 30 }
          },
          {
            id: 2,
            name: 'Dr. Michael Chen',
            dept: 'General Medicine',
            specialization: 'Chief Internal Medicine Consultant',
            experience: '8 Years',
            rating: 4.7,
            consultation_fee: '$120.00',
            room_number: 'OPD Room 104',
            slot_duration_mins: 20,
            slots: ['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '01:30 PM', '02:00 PM', '03:15 PM'],
            schedule: { days: [1, 2, 3, 4, 5], start: '09:00', end: '16:00', slotDuration: 20 }
          },
          {
            id: 3,
            name: 'Dr. Emily Blunt',
            dept: 'Pediatrics',
            specialization: 'Senior Pediatrician & Neonatologist',
            experience: '15 Years',
            rating: 4.9,
            consultation_fee: '$150.00',
            room_number: 'Pediatrics Wing B',
            slot_duration_mins: 30,
            slots: ['09:30 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'],
            schedule: { days: [1, 2, 3, 4, 5], start: '09:30', end: '17:00', slotDuration: 30 }
          },
          {
            id: 4,
            name: 'Dr. Robert Hayes',
            dept: 'Orthopedics',
            specialization: 'Consultant Orthopedic Surgeon',
            experience: '11 Years',
            rating: 4.8,
            consultation_fee: '$160.00',
            room_number: 'OPD Room 108',
            slot_duration_mins: 30,
            slots: ['10:00 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:00 PM'],
            schedule: { days: [1, 2, 3, 4], start: '10:00', end: '16:00', slotDuration: 30 }
          }
        ]
      },
      {
        id: 2,
        org_id: 1,
        name: 'Westside Ambulatory Pavilion',
        code: 'CCHS-WS',
        address: '880 Westside Pkwy, Metro City, NY 10024',
        city: 'Metro City',
        phone: '+1 234-567-8905',
        emergency_phone: '+1 800-CC-WEST',
        operating_hours: '08:00 AM - 06:00 PM',
        timezone: 'America/New_York',
        checkin_cutoff_mins: 20,
        token_prefix: 'CCW',
        walkin_policy: 'LIMITED_SLOTS',
        rating: 4.7,
        image_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
        departments: [
          { id: 5, name: 'General Medicine', code: 'GMED', prefix: 'GW', active: true },
          { id: 6, name: 'Pediatrics', code: 'PED', prefix: 'PW', active: true },
          { id: 7, name: 'Urgent Care', code: 'URG', prefix: 'UC', active: true }
        ],
        doctors: [
          {
            id: 5,
            name: 'Dr. Nathan Drake',
            dept: 'General Medicine',
            specialization: 'Attending Physician',
            experience: '7 Years',
            rating: 4.6,
            consultation_fee: '$110.00',
            room_number: 'Pavilion Suite A',
            slot_duration_mins: 20,
            slots: ['08:30 AM', '09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM'],
            schedule: { days: [1, 2, 3, 4, 5], start: '08:30', end: '16:00', slotDuration: 20 }
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Green Valley Medical Care',
    code: 'GVMC',
    tagline: 'Community-First Family & Preventive Medicine',
    logo_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=200&q=80',
    contact_email: 'care@greenvalley.org',
    phone: '+1 234-567-8901',
    branches: [
      {
        id: 3,
        org_id: 2,
        name: 'North Hills Wellness Center',
        code: 'GVMC-NH',
        address: '88 Oakwood Blvd, Westside, NY 10032',
        city: 'Westside',
        phone: '+1 234-567-8901',
        emergency_phone: '+1 800-GREEN-VALLEY',
        operating_hours: '08:00 AM - 07:00 PM',
        timezone: 'America/New_York',
        checkin_cutoff_mins: 10,
        token_prefix: 'GV',
        walkin_policy: 'ACCEPT_ALL',
        rating: 4.6,
        image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
        departments: [
          { id: 8, name: 'General Medicine', code: 'GMED', prefix: 'GV', active: true },
          { id: 9, name: 'ENT & Allergy', code: 'ENT', prefix: 'E', active: true },
          { id: 10, name: 'Dermatology', code: 'DERM', prefix: 'D', active: true }
        ],
        doctors: [
          {
            id: 6,
            name: 'Dr. Alistair Vance',
            dept: 'General Medicine',
            specialization: 'Preventive Family Physician',
            experience: '14 Years',
            rating: 4.8,
            consultation_fee: '$130.00',
            room_number: 'Wellness Suite 12',
            slot_duration_mins: 30,
            slots: ['08:30 AM', '10:00 AM', '01:00 PM', '03:30 PM'],
            schedule: { days: [1, 2, 3, 4, 5], start: '08:30', end: '17:00', slotDuration: 30 }
          },
          {
            id: 7,
            name: 'Dr. Sophia Morales',
            dept: 'Dermatology',
            specialization: 'Consultant Dermatologist & Laser Specialist',
            experience: '9 Years',
            rating: 4.9,
            consultation_fee: '$140.00',
            room_number: 'Derm Suite 4',
            slot_duration_mins: 30,
            slots: ['09:00 AM', '10:30 AM', '11:30 AM', '02:00 PM'],
            schedule: { days: [1, 3, 5], start: '09:00', end: '15:00', slotDuration: 30 }
          }
        ]
      }
    ]
  }
];

const flattenHospitals = (orgs) => {
  const list = [];
  orgs.forEach(org => {
    (org.branches || []).forEach(branch => {
      list.push({
        id: branch.id,
        orgId: org.id,
        orgName: org.name,
        name: `${org.name} - ${branch.name}`,
        branchName: branch.name,
        code: branch.code,
        type: 'Multi-Specialty Facility',
        rating: branch.rating || 4.8,
        address: branch.address,
        phone: branch.phone,
        emergencyPhone: branch.emergency_phone || '911',
        operating_hours: branch.operating_hours || '08:00 AM - 08:00 PM',
        checkin_cutoff_mins: branch.checkin_cutoff_mins || 15,
        token_prefix: branch.token_prefix || 'OPD',
        walkin_policy: branch.walkin_policy || 'ACCEPT_ALL',
        departments: (branch.departments || []).map(d => typeof d === 'string' ? d : d.name),
        departmentList: branch.departments || [],
        doctors: branch.doctors || [],
        image: branch.image_url || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80',
        activeTokens: 38 + branch.id * 14
      });
    });
  });
  return list;
};

export const PATIENT_PROFILES = [
  {
    id: 'pat-101',
    name: 'Alex Robertson',
    email: 'alex@patient.carelink.com',
    role: 'patient',
    gender: 'Male',
    age: 32,
    location: 'Metro City, NY',
    bloodGroup: 'O+',
    height: '180 cm',
    weight: '75 kg',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    conditions: [
      { id: 1, title: 'Mild Asthma', desc: 'Diagnosed 2018. Prescribed Albuterol Inhaler.', severity: 'warning' },
      { id: 2, title: 'No Known Allergies (NKA)', desc: 'Verified during last annual checkup.', severity: 'success' }
    ],
    reports: [
      { id: 1, title: 'Complete Blood Count (CBC)', date: 'Oct 10, 2023', doctor: 'Dr. Sarah Jenkins', fileUrl: '#' },
      { id: 2, title: 'Chest X-Ray', date: 'Jun 15, 2023', doctor: 'Dr. Michael Chen', fileUrl: '#' }
    ],
    pastVisits: [
      { id: 1, date: 'Oct 10, 2023', hosp: 'City Central Hospital', dept: 'Cardiology', doc: 'Dr. Sarah Jenkins', status: 'Completed' },
      { id: 2, date: 'Aug 22, 2023', hosp: 'Green Valley Medical', dept: 'General Medicine', doc: 'Dr. Emily Blunt', status: 'Completed' }
    ]
  },
  {
    id: 'pat-102',
    name: 'Maria Garcia',
    email: 'maria@patient.carelink.com',
    role: 'patient',
    gender: 'Female',
    age: 45,
    location: 'Westside, Metro City',
    bloodGroup: 'A+',
    height: '165 cm',
    weight: '64 kg',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    conditions: [
      { id: 1, title: 'Pre-Hypertension', desc: 'Blood pressure tracking recommended quarterly.', severity: 'warning' },
      { id: 2, title: 'Penicillin Allergy', desc: 'Severe cutaneous rash. Avoid Beta-lactams.', severity: 'warning' }
    ],
    reports: [
      { id: 1, title: 'Lipid Profile & Glucose Fasting', date: 'Sep 12, 2023', doctor: 'Dr. Michael Chen', fileUrl: '#' }
    ],
    pastVisits: [
      { id: 1, date: 'Sep 12, 2023', hosp: 'City Central Hospital', dept: 'General Medicine', doc: 'Dr. Michael Chen', status: 'Completed' }
    ]
  },
  {
    id: 'pat-103',
    name: 'David Kim',
    email: 'david@patient.carelink.com',
    role: 'patient',
    gender: 'Male',
    age: 28,
    location: 'East River, Metro City',
    bloodGroup: 'B+',
    height: '175 cm',
    weight: '70 kg',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    conditions: [
      { id: 1, title: 'Right Knee Post-Op Recovery', desc: 'ACL reconstruction therapy ongoing.', severity: 'warning' }
    ],
    reports: [
      { id: 1, title: 'Right Knee Diagnostic MRI', date: 'Jul 20, 2023', doctor: 'Dr. Robert Hayes', fileUrl: '#' }
    ],
    pastVisits: [
      { id: 1, date: 'Jul 20, 2023', hosp: 'City Central Hospital', dept: 'Orthopedics', doc: 'Dr. Robert Hayes', status: 'Completed' }
    ]
  },
  {
    id: 'pat-104',
    name: 'Sarah Connor',
    email: 'sarah@patient.carelink.com',
    role: 'patient',
    gender: 'Female',
    age: 36,
    location: 'Downtown, Metro City',
    bloodGroup: 'AB+',
    height: '168 cm',
    weight: '59 kg',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahConnor',
    conditions: [
      { id: 1, title: 'Good Overall Health', desc: 'Routine preventative annual checkups up to date.', severity: 'success' }
    ],
    reports: [],
    pastVisits: []
  }
];

const INITIAL_USERS = {
  patient: PATIENT_PROFILES[0],
  staff: {
    id: 'stf-201',
    name: 'Dr. Sarah Jenkins',
    email: 'demo@staff.carelink.com',
    role: 'staff',
    dept: 'Cardiology',
    hospitalId: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  admin: {
    id: 'adm-301',
    name: 'Hospital Administrator',
    email: 'demo@admin.carelink.com',
    role: 'admin',
    hospitalId: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  }
};

const INITIAL_QUEUE = [
  { token: 421, tokenCode: 'C-421', name: 'Alice Smith', status: 'Waiting', waitTime: '5m', type: 'Consultation', priority: 'NORMAL', dept: 'Cardiology', doctor: 'Dr. Sarah Jenkins', roomNumber: 'OPD Room 102' },
  { token: 422, tokenCode: 'C-422', name: 'Robert Johnson', status: 'Waiting', waitTime: '12m', type: 'Follow-up', priority: 'SENIOR', dept: 'Cardiology', doctor: 'Dr. Sarah Jenkins', roomNumber: 'OPD Room 102' },
  { token: 423, tokenCode: 'C-423', name: 'Emily Davis', status: 'Waiting', waitTime: '20m', type: 'Consultation', priority: 'NORMAL', dept: 'Cardiology', doctor: 'Dr. Sarah Jenkins', roomNumber: 'OPD Room 102' },
  { token: 428, tokenCode: 'C-428', name: 'Alex Robertson', status: 'Waiting', waitTime: '30m', type: 'Consultation', priority: 'NORMAL', dept: 'Cardiology', doctor: 'Dr. Sarah Jenkins', patientId: 'pat-101', roomNumber: 'OPD Room 102', bookingReference: 'CL-2026-8910' },
  { token: 431, tokenCode: 'GM-431', name: 'Maria Garcia', status: 'Waiting', waitTime: '45m', type: 'Consultation', priority: 'NORMAL', dept: 'General Medicine', doctor: 'Dr. Michael Chen', patientId: 'pat-102', roomNumber: 'OPD Room 104', bookingReference: 'CL-2026-4421' }
];

// Helper to normalize serving tokens so both camelCase and snake_case properties are always present
export const normalizeServing = (serving) => {
  if (!serving) return {
    id: 100,
    token: 420,
    token_number: 420,
    tokenCode: 'C-420',
    token_code: 'C-420',
    name: 'John Doe',
    patient_name: 'John Doe',
    doctor: 'Dr. Sarah Jenkins',
    doctor_name: 'Dr. Sarah Jenkins',
    dept: 'Cardiology',
    department: 'Cardiology',
    roomNumber: 'OPD Room 102',
    room_number: 'OPD Room 102',
    startedAt: '10:15 AM',
    started_at: '10:15 AM'
  };

  const tokenNum = Number(serving.token ?? serving.token_number ?? 420) || 420;
  const tokenCode = serving.tokenCode || serving.token_code || `C-${tokenNum}`;
  return {
    ...serving,
    token: tokenNum,
    token_number: tokenNum,
    tokenCode,
    token_code: tokenCode,
    name: serving.name || serving.patient_name || 'John Doe',
    patient_name: serving.patient_name || serving.name || 'John Doe',
    doctor: serving.doctor || serving.doctor_name || 'Dr. Sarah Jenkins',
    doctor_name: serving.doctor_name || serving.doctor || 'Dr. Sarah Jenkins',
    dept: serving.dept || serving.department || 'Cardiology',
    department: serving.department || serving.dept || 'Cardiology',
    roomNumber: serving.roomNumber || serving.room_number || 'OPD Room 102',
    room_number: serving.room_number || serving.roomNumber || 'OPD Room 102',
    startedAt: serving.startedAt || serving.started_at || '10:15 AM',
    started_at: serving.started_at || serving.startedAt || '10:15 AM'
  };
};

export const getDepartmentPrefix = (deptName = '') => {
  const d = String(deptName || '').toLowerCase();
  if (d.includes('cardio')) return 'C';
  if (d.includes('general') || d.includes('medicine')) return 'GM';
  if (d.includes('pedia')) return 'P';
  if (d.includes('ortho')) return 'O';
  if (d.includes('derma')) return 'DE';
  if (d.includes('ent')) return 'E';
  return (String(deptName || 'OPD').substring(0, 2)).toUpperCase();
};

// Helper to normalize queue entries
export const normalizeQueueItem = (item, idx = 0) => {
  if (!item) return null;
  const tokenNum = Number(item.token ?? item.token_number ?? (421 + idx)) || (421 + idx);
  const dept = item.department || item.dept || 'Cardiology';
  const prefix = getDepartmentPrefix(dept);

  let tokenCode = item.tokenCode || item.token_code;
  // If no code, or corrupt code, or wrong GE prefix, regenerate cleanly
  if (!tokenCode || String(tokenCode).startsWith('GE-') || String(tokenCode).includes('NaN') || String(tokenCode).includes('undefined')) {
    tokenCode = `${prefix}-${tokenNum}`;
  }

  return {
    ...item,
    token: tokenNum,
    token_number: tokenNum,
    tokenCode,
    token_code: tokenCode,
    name: item.name || item.patient_name || `Patient #${tokenNum}`,
    patient_name: item.patient_name || item.name || `Patient #${tokenNum}`,
    doctor: item.doctor || item.doctor_name || 'Dr. Sarah Jenkins',
    doctor_name: item.doctor_name || item.doctor || 'Dr. Sarah Jenkins',
    dept,
    department: dept,
    roomNumber: item.roomNumber || item.room_number || 'OPD Room 102',
    room_number: item.room_number || item.roomNumber || 'OPD Room 102',
    waitTime: item.waitTime || item.wait_time || `${(idx + 1) * 8}m`,
    wait_time: item.wait_time || item.waitTime || `${(idx + 1) * 8}m`,
    priority: item.priority || 'NORMAL',
    status: item.status || 'WAITING'
  };
};

// Sanitize corrupt appointments from previous NaN bugs
export const sanitizeAppointments = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map((a, i) => {
    let t = Number(a.token ?? a.token_number);
    if (isNaN(t) || !t) {
      t = 430 + (i + 1);
    }
    let code = a.tokenCode || a.token_code;
    if (!code || String(code).includes('NaN') || String(code).includes('undefined')) {
      const prefix = ((a.dept || 'OPD').substring(0, 2)).toUpperCase();
      code = `${prefix}-${t}`;
    }
    return {
      ...a,
      token: t,
      token_number: t,
      tokenCode: code,
      token_code: code
    };
  });
};

// Keep active waiting queue tokens completely unified with patient appointment records
export const reconcileQueueWithAppointments = (rawQueue, appointmentList) => {
  if (!Array.isArray(rawQueue)) return [];
  const apts = Array.isArray(appointmentList) ? appointmentList : [];

  return rawQueue.map((item, idx) => {
    const norm = normalizeQueueItem(item, idx);
    const matchedApt = apts.find(a => 
      (a.bookingReference && norm.bookingReference && a.bookingReference.toLowerCase() === norm.bookingReference.toLowerCase()) ||
      (a.patientName && norm.name && a.patientName.toLowerCase() === norm.name.toLowerCase()) ||
      (a.patientId && norm.patientId && a.patientId === norm.patientId)
    );

    if (matchedApt && matchedApt.status !== 'Cancelled') {
      const aptToken = Number(matchedApt.token || matchedApt.token_number) || norm.token;
      const aptCode = matchedApt.tokenCode || matchedApt.token_code || norm.tokenCode;
      return {
        ...norm,
        token: aptToken,
        token_number: aptToken,
        tokenCode: aptCode,
        token_code: aptCode,
        doctor: matchedApt.doctor || norm.doctor,
        doctor_name: matchedApt.doctor || norm.doctor,
        dept: matchedApt.dept || norm.dept,
        department: matchedApt.dept || norm.department,
        bookingReference: matchedApt.bookingReference || norm.bookingReference
      };
    }
    return norm;
  });
};

const DEFAULT_APPOINTMENTS = [
  {
    id: 'apt-001',
    bookingReference: 'CL-2026-8910',
    patientId: 'pat-101',
    patientName: 'Alex Robertson',
    doctor: 'Dr. Sarah Jenkins',
    dept: 'Cardiology',
    hospitalId: 1,
    hospitalName: 'City Central Health System - Downtown Main Campus',
    date: '2026-10-14',
    timeSlot: '10:30 AM',
    expectedCheckin: '10:15 AM',
    fee: '$180.00',
    status: 'Confirmed',
    checkedIn: true,
    token: 428,
    tokenCode: 'C-428'
  },
  {
    id: 'apt-002',
    bookingReference: 'CL-2026-4421',
    patientId: 'pat-102',
    patientName: 'Maria Garcia',
    doctor: 'Dr. Michael Chen',
    dept: 'General Medicine',
    hospitalId: 1,
    hospitalName: 'City Central Health System - Downtown Main Campus',
    date: '2026-10-14',
    timeSlot: '11:00 AM',
    expectedCheckin: '10:45 AM',
    fee: '$120.00',
    status: 'Confirmed',
    checkedIn: true,
    token: 431,
    tokenCode: 'GM-431'
  },
  {
    id: 'apt-003',
    bookingReference: 'CL-2026-7890',
    patientId: 'pat-103',
    patientName: 'David Kim',
    doctor: 'Dr. Robert Hayes',
    dept: 'Orthopedics',
    hospitalId: 1,
    hospitalName: 'City Central Health System - Downtown Main Campus',
    date: '2026-10-15',
    timeSlot: '02:00 PM',
    expectedCheckin: '01:45 PM',
    fee: '$160.00',
    status: 'Confirmed',
    checkedIn: false,
    token: 435,
    tokenCode: 'O-435'
  }
];

export function CareLinkProvider({ children }) {
  const loadStored = (key, fallback) => {
    try {
      const stored = localStorage.getItem(`carelink_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const saveStored = (key, val) => {
    try {
      localStorage.setItem(`carelink_${key}`, JSON.stringify(val));
    } catch (e) {
      console.error('Storage write error', e);
    }
  };

  // State Definitions
  const [currentUser, setCurrentUser] = useState(() => loadStored('user', PATIENT_PROFILES[0]));
  const [organizations, setOrganizations] = useState(() => loadStored('organizations', INITIAL_ORGANIZATIONS));
  const [hospitals, setHospitals] = useState(() => loadStored('hospitals', flattenHospitals(INITIAL_ORGANIZATIONS)));
  const [selectedHospitalId, setSelectedHospitalId] = useState(() => loadStored('selectedHospitalId', 1));

  // Live Queue & Delays State
  const [currentServing, setCurrentServing] = useState(() =>
    normalizeServing(loadStored('currentServing', { token: 420, tokenCode: 'C-420', name: 'John Doe', startedAt: '10:15 AM', dept: 'Cardiology', doctor: 'Dr. Sarah Jenkins', roomNumber: 'OPD Room 102' }))
  );

  const [activeRooms, setActiveRooms] = useState(() => loadStored('activeRooms', {
    'OPD Room 102': { room_number: 'OPD Room 102', doctor_name: 'Dr. Sarah Jenkins', dept: 'Cardiology', token_code: 'C-420', token_number: 420, patient_name: 'John Doe', status: 'IN_CONSULTATION', started_at: '10:15 AM' },
    'OPD Room 104': { room_number: 'OPD Room 104', doctor_name: 'Dr. Michael Chen', dept: 'General Medicine', token_code: 'GM-415', token_number: 415, patient_name: 'William Brown', status: 'IN_CONSULTATION', started_at: '10:20 AM' },
    'OPD Room 106': { room_number: 'OPD Room 106', doctor_name: 'Dr. Emily Blunt', dept: 'Pediatrics', token_code: 'P-418', token_number: 418, patient_name: 'Lucas Miller', status: 'IN_CONSULTATION', started_at: '10:25 AM' },
    'OPD Room 108': { room_number: 'OPD Room 108', doctor_name: 'Dr. Robert Hayes', dept: 'Orthopedics', token_code: 'O-419', token_number: 419, patient_name: 'Emma Watson', status: 'IN_CONSULTATION', started_at: '10:18 AM' }
  }));

  // Multi-Patient Appointments State (Auto-sanitized to prevent NaN or undefined)
  const [appointments, setAppointments] = useState(() => {
    const raw = loadStored('appointments', null);
    if (!raw) return DEFAULT_APPOINTMENTS;
    return sanitizeAppointments(raw);
  });

  const [queue, setQueue] = useState(() => {
    const raw = loadStored('queue', INITIAL_QUEUE);
    const initialApts = loadStored('appointments', null) ? sanitizeAppointments(loadStored('appointments', null)) : DEFAULT_APPOINTMENTS;
    return reconcileQueueWithAppointments(Array.isArray(raw) ? raw : INITIAL_QUEUE, initialApts);
  });
  const [skippedQueue, setSkippedQueue] = useState(() => loadStored('skippedQueue', []));
  const [doctorDelays, setDoctorDelays] = useState(() => loadStored('doctorDelays', {}));
  const [completedCount, setCompletedCount] = useState(() => loadStored('completedCount', 28));
  const [auditLog, setAuditLog] = useState(() => loadStored('auditLog', []));

  // Active Branch Helper
  const activeHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];
  const activeOrganization = organizations.find(o => o.branches.some(b => b.id === selectedHospitalId)) || organizations[0];
  const activeBranch = activeOrganization?.branches?.find(b => b.id === selectedHospitalId) || activeOrganization?.branches?.[0];

  // Refresh data from backend on mount
  useEffect(() => {
    async function initData() {
      try {
        const orgRes = await api.getOrganizations();
        if (orgRes.success && orgRes.data && orgRes.data.length > 0) {
          setOrganizations(orgRes.data);
          saveStored('organizations', orgRes.data);
          const flat = flattenHospitals(orgRes.data);
          setHospitals(flat);
          saveStored('hospitals', flat);
        }

        const qRes = await api.getQueue();
        if (qRes.success && qRes.data) {
          if (qRes.data.currentServing) {
            const normServing = normalizeServing(qRes.data.currentServing);
            setCurrentServing(normServing);
            saveStored('currentServing', normServing);
          }
          if (qRes.data.queue && Array.isArray(qRes.data.queue)) {
            const normQueue = reconcileQueueWithAppointments(qRes.data.queue, appointments);
            setQueue(normQueue);
            saveStored('queue', normQueue);
          }
          if (qRes.data.delays) setDoctorDelays(qRes.data.delays);
        }
      } catch (e) {
        console.warn('Initial backend fetch fallback:', e.message);
      }
    }
    initData();
  }, []);

  // Multi-tab Broadcast Channel
  useEffect(() => {
    let channel;
    try {
      channel = new BroadcastChannel('carelink_sync_channel');
      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'QUEUE_ADVANCED') {
          if (payload.currentServing) setCurrentServing(normalizeServing(payload.currentServing));
          if (payload.activeRooms) setActiveRooms(payload.activeRooms);
          if (payload.queue && Array.isArray(payload.queue)) setQueue(reconcileQueueWithAppointments(payload.queue, appointments));
          if (payload.skippedQueue) setSkippedQueue(payload.skippedQueue);
          if (payload.completedCount !== undefined) setCompletedCount(payload.completedCount);
          if (payload.doctorDelays) setDoctorDelays(payload.doctorDelays);
        } else if (type === 'APPOINTMENT_BOOKED' || type === 'APPOINTMENT_UPDATED') {
          if (payload.appointments) setAppointments(sanitizeAppointments(payload.appointments));
          if (payload.queue && Array.isArray(payload.queue)) setQueue(reconcileQueueWithAppointments(payload.queue, appointments));
        } else if (type === 'ORGANIZATIONS_UPDATED') {
          setOrganizations(payload.organizations);
          setHospitals(payload.hospitals);
        }
      };
    } catch { }
    return () => {
      if (channel) channel.close();
    };
  }, [appointments]);

  // Real-Time Server-Sent Events (SSE) Stream for cross-device synchronization
  useEffect(() => {
    let evtSource;
    try {
      evtSource = new EventSource('http://localhost:5000/api/queue/stream');
      evtSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'TOKEN_CALLED' || parsed.type === 'QUEUE_UPDATED') {
            const p = parsed.payload;
            if (p.currentServing) {
              const normServing = normalizeServing(p.currentServing);
              setCurrentServing(normServing);
              saveStored('currentServing', normServing);
            }
            if (p.activeRooms) {
              setActiveRooms(p.activeRooms);
              saveStored('activeRooms', p.activeRooms);
            }
            if (p.queue && Array.isArray(p.queue)) {
              const normQueue = reconcileQueueWithAppointments(p.queue, appointments);
              setQueue(normQueue);
              saveStored('queue', normQueue);
            }
            if (p.skippedQueue && Array.isArray(p.skippedQueue)) {
              setSkippedQueue(p.skippedQueue);
              saveStored('skippedQueue', p.skippedQueue);
            }
            if (p.completedCount !== undefined) {
              setCompletedCount(p.completedCount);
              saveStored('completedCount', p.completedCount);
            }

            // Audio Announcement on Display & Patient screen
            if (parsed.type === 'TOKEN_CALLED' && p.currentServing) {
              const normServing = normalizeServing(p.currentServing);
              hospitalAudio.announceToken({
                tokenCode: normServing.tokenCode,
                patientName: normServing.name,
                roomNumber: normServing.roomNumber
              });
            }
          }
        } catch (e) { }
      };
    } catch (err) {
      console.warn('SSE subscription notice:', err.message);
    }
    return () => {
      if (evtSource) evtSource.close();
    };
  }, []);

  const broadcastSync = (type, payload) => {
    try {
      const channel = new BroadcastChannel('carelink_sync_channel');
      channel.postMessage({ type, payload });
      channel.close();
    } catch { }
  };

  // Auth Operations
  const login = (role, email = '', patientId = null) => {
    let userToSet;
    if (role === 'patient') {
      if (patientId) {
        userToSet = PATIENT_PROFILES.find(p => p.id === patientId) || PATIENT_PROFILES[0];
      } else if (email) {
        userToSet = PATIENT_PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase()) || {
          id: `pat-${Date.now()}`,
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email,
          role: 'patient',
          gender: 'Not Specified',
          age: 30,
          location: 'Metro City, NY',
          bloodGroup: 'O+',
          height: '175 cm',
          weight: '70 kg',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
          conditions: [],
          reports: [],
          pastVisits: []
        };
      } else {
        userToSet = PATIENT_PROFILES[0];
      }
    } else {
      userToSet = INITIAL_USERS[role] || {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0] || 'CareLink User',
        email: email || `user@${role}.carelink.com`,
        role
      };
    }
    setCurrentUser(userToSet);
    saveStored('user', userToSet);
    return userToSet;
  };

  const loginAsPatient = (patientId) => {
    return login('patient', '', patientId);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('carelink_user');
  };

  const selectHospital = (hospitalId) => {
    const numId = Number(hospitalId);
    setSelectedHospitalId(numId);
    saveStored('selectedHospitalId', numId);
  };

  // Branch Configuration
  const updateBranchConfig = async (branchId, configUpdates) => {
    const bId = Number(branchId);
    const updatedOrgs = organizations.map(org => ({
      ...org,
      branches: org.branches.map(b => {
        if (b.id === bId) {
          return { ...b, ...configUpdates };
        }
        return b;
      })
    }));

    setOrganizations(updatedOrgs);
    const flat = flattenHospitals(updatedOrgs);
    setHospitals(flat);

    saveStored('organizations', updatedOrgs);
    saveStored('hospitals', flat);

    try {
      await api.updateBranchConfig(bId, configUpdates);
    } catch { }

    broadcastSync('ORGANIZATIONS_UPDATED', { organizations: updatedOrgs, hospitals: flat });
    return true;
  };

  const updateHospital = (updatedData) => {
    return updateBranchConfig(updatedData.id, updatedData);
  };

  // Departments
  const addDepartment = async (branchId, deptData) => {
    const bId = Number(branchId);
    const newDept = {
      id: Date.now(),
      name: deptData.name,
      code: deptData.code || deptData.name.substring(0, 4).toUpperCase(),
      prefix: deptData.prefix || deptData.name.substring(0, 1).toUpperCase(),
      active: true
    };

    const updatedOrgs = organizations.map(org => ({
      ...org,
      branches: org.branches.map(b => {
        if (b.id === bId) {
          return { ...b, departments: [...(b.departments || []), newDept] };
        }
        return b;
      })
    }));

    setOrganizations(updatedOrgs);
    const flat = flattenHospitals(updatedOrgs);
    setHospitals(flat);
    saveStored('organizations', updatedOrgs);
    saveStored('hospitals', flat);

    try {
      await api.addDepartment(bId, deptData);
    } catch { }

    broadcastSync('ORGANIZATIONS_UPDATED', { organizations: updatedOrgs, hospitals: flat });
    return newDept;
  };

  const removeDepartment = async (branchId, deptId) => {
    const bId = Number(branchId);
    const updatedOrgs = organizations.map(org => ({
      ...org,
      branches: org.branches.map(b => {
        if (b.id === bId) {
          return {
            ...b,
            departments: (b.departments || []).filter(d => d.id !== deptId && d.name !== deptId)
          };
        }
        return b;
      })
    }));

    setOrganizations(updatedOrgs);
    const flat = flattenHospitals(updatedOrgs);
    setHospitals(flat);
    saveStored('organizations', updatedOrgs);
    saveStored('hospitals', flat);

    try {
      await api.removeDepartment(bId, deptId);
    } catch { }

    broadcastSync('ORGANIZATIONS_UPDATED', { organizations: updatedOrgs, hospitals: flat });
  };

  // Doctors & Shifts
  const addDoctor = async (branchId, docData) => {
    const bId = Number(branchId);
    const newDoc = {
      id: Date.now(),
      name: docData.name,
      dept: docData.dept,
      specialization: docData.specialization || 'Consultant Specialist',
      experience: docData.experience || '5 Years',
      rating: 4.8,
      consultation_fee: docData.consultation_fee || '$150.00',
      room_number: docData.room_number || 'OPD Room 1',
      slot_duration_mins: Number(docData.slot_duration_mins) || 30,
      slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:30 PM'],
      schedule: { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00', slotDuration: Number(docData.slot_duration_mins) || 30 }
    };

    const updatedOrgs = organizations.map(org => ({
      ...org,
      branches: org.branches.map(b => {
        if (b.id === bId) {
          return { ...b, doctors: [...(b.doctors || []), newDoc] };
        }
        return b;
      })
    }));

    setOrganizations(updatedOrgs);
    const flat = flattenHospitals(updatedOrgs);
    setHospitals(flat);
    saveStored('organizations', updatedOrgs);
    saveStored('hospitals', flat);

    try {
      await api.addDoctor(bId, docData);
    } catch { }

    broadcastSync('ORGANIZATIONS_UPDATED', { organizations: updatedOrgs, hospitals: flat });
    return newDoc;
  };

  const updateDoctorSchedule = async (doctorId, scheduleData) => {
    const docId = Number(doctorId);
    const updatedOrgs = organizations.map(org => ({
      ...org,
      branches: org.branches.map(b => ({
        ...b,
        doctors: (b.doctors || []).map(d => {
          if (d.id === docId) {
            return {
              ...d,
              consultation_fee: scheduleData.consultationFee || d.consultation_fee,
              room_number: scheduleData.roomNumber || d.room_number,
              slot_duration_mins: scheduleData.slotDurationMins || d.slot_duration_mins,
              schedule: {
                ...d.schedule,
                days: scheduleData.workingDays || d.schedule?.days || [1, 2, 3, 4, 5],
                start: scheduleData.startTime || d.schedule?.start || '09:00',
                end: scheduleData.endTime || d.schedule?.end || '17:00',
                slotDuration: scheduleData.slotDurationMins || d.schedule?.slotDuration || 30
              }
            };
          }
          return d;
        })
      }))
    }));

    setOrganizations(updatedOrgs);
    const flat = flattenHospitals(updatedOrgs);
    setHospitals(flat);
    saveStored('organizations', updatedOrgs);
    saveStored('hospitals', flat);

    try {
      await api.updateDoctorSchedule(docId, scheduleData);
    } catch { }

    broadcastSync('ORGANIZATIONS_UPDATED', { organizations: updatedOrgs, hospitals: flat });
    return true;
  };

  // 1. Patient Arrival Check-In (Transitions into Live Queue)
  const checkInPatient = async ({ bookingReference, patientName, appointmentId }) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let matchedApt = appointments.find(a =>
      (bookingReference && a.bookingReference === bookingReference) ||
      (appointmentId && a.id === appointmentId) ||
      (patientName && a.patientName.toLowerCase().includes(patientName.toLowerCase()))
    );

    if (matchedApt) {
      const targetToken = Number(matchedApt.token || matchedApt.token_number) || 435;
      const targetCode = matchedApt.tokenCode || matchedApt.token_code || `CK-${targetToken}`;

      const updatedAppointments = appointments.map(a =>
        a.id === matchedApt.id ? {
          ...a,
          token: targetToken,
          token_number: targetToken,
          tokenCode: targetCode,
          token_code: targetCode,
          status: 'CheckedIn',
          checkedIn: true,
          checkedInAt: timeNow
        } : a
      );
      setAppointments(updatedAppointments);
      saveStored('appointments', updatedAppointments);

      // Ensure patient is in queue
      const existingInQueue = queue.some(q =>
        (Number(q.token || q.token_number) === targetToken) ||
        (String(q.tokenCode || q.token_code || '').toLowerCase() === targetCode.toLowerCase())
      );

      let newQueue = queue;
      if (!existingInQueue) {
        const queueEntry = normalizeQueueItem({
          token: targetToken,
          token_number: targetToken,
          tokenCode: targetCode,
          token_code: targetCode,
          name: matchedApt.patientName,
          status: 'Waiting',
          waitTime: `${(queue.length + 1) * 8}m`,
          type: 'Scheduled',
          priority: matchedApt.priority || 'NORMAL',
          dept: matchedApt.dept,
          doctor: matchedApt.doctor,
          roomNumber: matchedApt.roomNumber || 'OPD Room 102',
          bookingReference: matchedApt.bookingReference
        }, queue.length);
        newQueue = [...queue, queueEntry];
        setQueue(newQueue);
        saveStored('queue', newQueue);
      }

      broadcastSync('QUEUE_ADVANCED', {
        currentServing,
        queue: newQueue,
        completedCount
      });

      try {
        await api.checkInPatient(matchedApt.bookingReference, matchedApt.patientName, {
          token_number: targetToken,
          token_code: targetCode,
          department: matchedApt.dept,
          doctor_name: matchedApt.doctor
        });
      } catch { }

      return { success: true, message: `Arrival checked in: ${matchedApt.tokenCode || `#${matchedApt.token}`}` };
    }

    // Direct check-in via API
    try {
      const res = await api.checkInPatient(bookingReference, patientName);
      return res;
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  // 2. Call Next Patient with Priority Resolution
  const callNextPatient = (roomNumber = 'OPD Room 102', doctorName = 'Dr. Sarah Jenkins') => {
    if (queue.length === 0) return false;

    // Priority sorting: EMERGENCY -> SENIOR -> NORMAL
    const sortedQueue = [...queue].sort((a, b) => {
      const pMap = { EMERGENCY: 0, SENIOR: 1, NORMAL: 2 };
      const diff = (pMap[a.priority] || 2) - (pMap[b.priority] || 2);
      if (diff !== 0) return diff;
      return a.token - b.token;
    });

    const nextPatient = sortedQueue[0];
    const newQueue = sortedQueue.slice(1);

    const newServing = {
      token: nextPatient.token,
      tokenCode: nextPatient.tokenCode || `#${nextPatient.token}`,
      name: nextPatient.name,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dept: nextPatient.dept || 'Cardiology',
      doctor: doctorName || nextPatient.doctor || 'Dr. Sarah Jenkins',
      roomNumber: roomNumber || nextPatient.roomNumber || 'OPD Room 102'
    };
    const newCompleted = completedCount + 1;
    const newLog = [
      { time: new Date().toLocaleTimeString(), action: `Called ${nextPatient.tokenCode || `#${nextPatient.token}`} (${nextPatient.name}) to ${newServing.roomNumber}` },
      ...auditLog.slice(0, 19)
    ];

    const newActiveRooms = {
      ...activeRooms,
      [newServing.roomNumber]: {
        room_number: newServing.roomNumber,
        doctor_name: newServing.doctor,
        dept: newServing.dept,
        token_code: newServing.tokenCode,
        token_number: newServing.token,
        patient_name: newServing.name,
        status: 'IN_CONSULTATION',
        started_at: newServing.startedAt
      }
    };

    setCurrentServing(newServing);
    setActiveRooms(newActiveRooms);
    setQueue(newQueue);
    setCompletedCount(newCompleted);
    setAuditLog(newLog);

    saveStored('currentServing', newServing);
    saveStored('activeRooms', newActiveRooms);
    saveStored('queue', newQueue);
    saveStored('completedCount', newCompleted);
    saveStored('auditLog', newLog);

    // Play hospital audio chime & voice announcement
    hospitalAudio.announceToken({
      tokenCode: newServing.tokenCode,
      patientName: newServing.name,
      roomNumber: newServing.roomNumber
    });

    broadcastSync('QUEUE_ADVANCED', {
      currentServing: newServing,
      activeRooms: newActiveRooms,
      queue: newQueue,
      skippedQueue,
      completedCount: newCompleted,
      doctorDelays
    });

    try {
      api.callNext(newServing.roomNumber, newServing.doctor);
    } catch { }

    return true;
  };

  // 2b. Call Specific Patient Directly (Doctor selection or triage jump)
  const callSpecificPatient = (tokenIdentifier, roomNumber = 'OPD Room 102', doctorName = 'Dr. Sarah Jenkins') => {
    const strId = String(tokenIdentifier).trim().toLowerCase();
    const numId = Number(tokenIdentifier);

    const idx = queue.findIndex(p =>
      (p.tokenCode && p.tokenCode.toLowerCase() === strId) ||
      (!isNaN(numId) && p.token === numId)
    );

    if (idx === -1) return false;

    const targetPatient = queue[idx];
    const newQueue = queue.filter((_, i) => i !== idx);

    const newServing = {
      token: targetPatient.token,
      tokenCode: targetPatient.tokenCode || `#${targetPatient.token}`,
      name: targetPatient.name,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dept: targetPatient.dept || 'Cardiology',
      doctor: doctorName || targetPatient.doctor || 'Dr. Sarah Jenkins',
      roomNumber: roomNumber || targetPatient.roomNumber || 'OPD Room 102'
    };
    const newCompleted = completedCount + 1;
    const newLog = [
      { time: new Date().toLocaleTimeString(), action: `Priority Called ${targetPatient.tokenCode || `#${targetPatient.token}`} (${targetPatient.name}) to ${newServing.roomNumber}` },
      ...auditLog.slice(0, 19)
    ];

    const newActiveRooms = {
      ...activeRooms,
      [newServing.roomNumber]: {
        room_number: newServing.roomNumber,
        doctor_name: newServing.doctor,
        dept: newServing.dept,
        token_code: newServing.tokenCode,
        token_number: newServing.token,
        patient_name: newServing.name,
        status: 'IN_CONSULTATION',
        started_at: newServing.startedAt
      }
    };

    setCurrentServing(newServing);
    setActiveRooms(newActiveRooms);
    setQueue(newQueue);
    setCompletedCount(newCompleted);
    setAuditLog(newLog);

    saveStored('currentServing', newServing);
    saveStored('activeRooms', newActiveRooms);
    saveStored('queue', newQueue);
    saveStored('completedCount', newCompleted);
    saveStored('auditLog', newLog);

    hospitalAudio.announceToken({
      tokenCode: newServing.tokenCode,
      patientName: newServing.name,
      roomNumber: newServing.roomNumber
    });

    broadcastSync('QUEUE_ADVANCED', {
      currentServing: newServing,
      activeRooms: newActiveRooms,
      queue: newQueue,
      skippedQueue,
      completedCount: newCompleted,
      doctorDelays
    });

    try {
      api.callSpecificToken(targetPatient.tokenCode || targetPatient.token, newServing.roomNumber, newServing.doctor);
    } catch { }

    return true;
  };

  // 2c. Complete Consultation for Room
  const completeCurrentConsultation = (roomNumber = 'OPD Room 102') => {
    const newCompleted = completedCount + 1;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetRoom = activeRooms[roomNumber];
    const prevPatient = targetRoom?.patient_name || 'Patient';

    const newActiveRooms = {
      ...activeRooms,
      [roomNumber]: {
        ...(targetRoom || {}),
        room_number: roomNumber,
        status: 'AVAILABLE',
        patient_name: 'Room Available',
        token_code: '—',
        started_at: timeNow
      }
    };

    const newLog = [
      { time: timeNow, action: `Consultation completed for ${prevPatient} in ${roomNumber}` },
      ...auditLog.slice(0, 19)
    ];

    setActiveRooms(newActiveRooms);
    setCompletedCount(newCompleted);
    setAuditLog(newLog);

    saveStored('activeRooms', newActiveRooms);
    saveStored('completedCount', newCompleted);
    saveStored('auditLog', newLog);

    broadcastSync('CONSULTATION_COMPLETED', {
      activeRooms: newActiveRooms,
      completedCount: newCompleted
    });

    try {
      api.completeConsultation(roomNumber);
    } catch { }

    return true;
  };

  // 3. Skip Current Patient
  const skipCurrentPatient = (reason = 'Patient Not Present When Called') => {
    if (queue.length === 0) return;
    const skipped = queue[0];
    const newQueue = queue.slice(1);
    const newSkippedList = [{ ...skipped, skipReason: reason, skippedAt: new Date().toLocaleTimeString() }, ...skippedQueue];

    const newLog = [
      { time: new Date().toLocaleTimeString(), action: `Skipped ${skipped.tokenCode || `#${skipped.token}`} - ${reason}` },
      ...auditLog.slice(0, 19)
    ];

    setQueue(newQueue);
    setSkippedQueue(newSkippedList);
    setAuditLog(newLog);

    saveStored('queue', newQueue);
    saveStored('skippedQueue', newSkippedList);
    saveStored('auditLog', newLog);

    broadcastSync('QUEUE_ADVANCED', {
      currentServing,
      queue: newQueue,
      skippedQueue: newSkippedList,
      completedCount,
      doctorDelays
    });

    try {
      api.skipPatient(reason);
    } catch { }
  };

  // 4. Recall Skipped Patient
  const recallPatient = (tokenNumber) => {
    const idx = skippedQueue.findIndex(s => s.token === Number(tokenNumber));
    if (idx === -1) return false;

    const recalled = skippedQueue[idx];
    const newSkipped = skippedQueue.filter(s => s.token !== Number(tokenNumber));
    const newQueue = [recalled, ...queue]; // Place at head of queue

    setSkippedQueue(newSkipped);
    setQueue(newQueue);
    saveStored('skippedQueue', newSkipped);
    saveStored('queue', newQueue);

    broadcastSync('QUEUE_ADVANCED', {
      currentServing,
      queue: newQueue,
      skippedQueue: newSkipped,
      completedCount,
      doctorDelays
    });

    try {
      api.recallPatient(tokenNumber);
    } catch { }

    return true;
  };

  // 5. Report Doctor Consultation Delay
  const reportDoctorDelay = (doctorName, delayMinutes, reason = 'Complex Procedure') => {
    const mins = Number(delayMinutes) || 15;
    const newDelays = {
      ...doctorDelays,
      [doctorName]: {
        minutes: mins,
        reason,
        reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };

    setDoctorDelays(newDelays);
    saveStored('doctorDelays', newDelays);

    // Update queue estimated wait times
    const updatedQueue = queue.map(q => {
      if (q.doctor === doctorName) {
        return {
          ...q,
          waitTime: `+${mins}m Delayed`,
          delayNote: `Dr. ${doctorName} running +${mins}m behind`
        };
      }
      return q;
    });

    setQueue(updatedQueue);
    saveStored('queue', updatedQueue);

    broadcastSync('QUEUE_ADVANCED', {
      currentServing,
      queue: updatedQueue,
      skippedQueue,
      completedCount,
      doctorDelays: newDelays
    });

    try {
      api.reportDelay(doctorName, delayMinutes, reason);
    } catch { }

    return true;
  };

  // 6. Register Walk-In
  const registerWalkIn = (patientName, dept = 'Cardiology', type = 'Walk-in', priority = 'NORMAL') => {
    const highestToken = Math.max(
      currentServing.token,
      ...queue.map(q => q.token),
      420
    );
    const newToken = highestToken + 1;
    const prefix = dept.substring(0, 1).toUpperCase();
    const tokenCode = `${prefix}-${newToken}`;

    const newPatient = {
      token: newToken,
      tokenCode,
      name: patientName || `Walk-in Patient #${newToken}`,
      status: 'Waiting',
      waitTime: `${(queue.length + 1) * 8}m`,
      type,
      priority,
      dept,
      doctor: 'Dr. Sarah Jenkins',
      roomNumber: 'OPD Room 102'
    };

    let newQueue;
    if (priority === 'EMERGENCY') {
      newQueue = [newPatient, ...queue];
    } else {
      newQueue = [...queue, newPatient];
    }

    setQueue(newQueue);
    saveStored('queue', newQueue);
    broadcastSync('QUEUE_ADVANCED', {
      currentServing,
      queue: newQueue,
      skippedQueue,
      completedCount,
      doctorDelays
    });

    try {
      api.registerWalkIn(patientName, dept, type, priority);
    } catch { }

    return { token: newToken, tokenCode };
  };

  // 7. Appointment Booking
  const bookAppointment = ({ doctor, date, slot, dept, notes }) => {
    const isSlotTaken = appointments.some(
      a => a.doctor === doctor.name && a.date === date && a.timeSlot === slot && a.status !== 'Cancelled'
    );
    if (isSlotTaken) {
      throw new Error(`Slot ${slot} on ${date} for ${doctor.name} has already been reserved.`);
    }

    // Safely extract highest valid numeric token from all available queues without NaN
    const validTokens = [
      Number(currentServing?.token || currentServing?.token_number) || 420,
      ...queue.map(q => Number(q.token || q.token_number)).filter(n => !isNaN(n) && n > 0),
      ...appointments.map(a => Number(a.token || a.token_number)).filter(n => !isNaN(n) && n > 0),
      430
    ];
    const assignedToken = Math.max(...validTokens) + 1;

    const deptPrefix = ((dept || doctor.dept || 'OPD').substring(0, 2)).toUpperCase();
    const tokenCode = `${deptPrefix}-${assignedToken}`;
    const bookingRef = `CL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAppointment = {
      id: `apt-${Date.now()}`,
      bookingReference: bookingRef,
      patientId: currentUser?.id || 'pat-101',
      patientName: currentUser?.name || 'Alex Robertson',
      doctor: doctor.name,
      dept: dept || doctor.dept,
      hospitalId: activeHospital.id,
      hospitalName: activeHospital.name,
      date,
      timeSlot: slot,
      expectedCheckin: '15 mins prior',
      fee: doctor.consultation_fee || '$150.00',
      status: 'Confirmed',
      checkedIn: true,
      token: assignedToken,
      token_number: assignedToken,
      tokenCode,
      token_code: tokenCode,
      notes: notes || ''
    };

    // Automatically add patient token to active OPD queue so they are in line immediately
    const queueEntry = normalizeQueueItem({
      token: assignedToken,
      token_number: assignedToken,
      tokenCode,
      token_code: tokenCode,
      name: currentUser?.name || 'Alex Robertson',
      status: 'Waiting',
      waitTime: `${(queue.length + 1) * 8}m`,
      type: 'Scheduled',
      priority: 'NORMAL',
      dept: dept || doctor.dept,
      doctor: doctor.name,
      roomNumber: doctor.room_number || 'OPD Room 102',
      bookingReference: bookingRef
    }, queue.length);

    const updatedQueue = [...queue, queueEntry];
    const updatedAppointments = [newAppointment, ...appointments];

    setAppointments(updatedAppointments);
    setQueue(updatedQueue);
    saveStored('appointments', updatedAppointments);
    saveStored('queue', updatedQueue);

    broadcastSync('APPOINTMENT_BOOKED', {
      appointments: updatedAppointments,
      queue: updatedQueue
    });

    try {
      api.bookAppointment({
        doctor_name: doctor.name,
        dept: dept || doctor.dept,
        appointment_date: date,
        time_slot: slot,
        patient_name: currentUser?.name || 'Alex Robertson',
        token: assignedToken,
        token_number: assignedToken,
        tokenCode,
        token_code: tokenCode,
        notes
      });
    } catch { }

    return newAppointment;
  };

  const cancelAppointment = (appointmentId, reason = 'Patient Requested') => {
    const targetApt = appointments.find(a => a.id === appointmentId);
    if (!targetApt) return false;

    const updatedAppointments = appointments.map(a =>
      a.id === appointmentId ? {
        ...a,
        status: 'Cancelled',
        cancelReason: reason,
        cancelledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } : a
    );

    // Remove from both active queue and skipped queue immediately
    const updatedQueue = queue.filter(q => q.token !== targetApt.token && q.tokenCode !== targetApt.tokenCode);
    const updatedSkipped = skippedQueue.filter(s => s.token !== targetApt.token && s.tokenCode !== targetApt.tokenCode);

    setAppointments(updatedAppointments);
    setQueue(updatedQueue);
    setSkippedQueue(updatedSkipped);
    saveStored('appointments', updatedAppointments);
    saveStored('queue', updatedQueue);
    saveStored('skippedQueue', updatedSkipped);

    broadcastSync('APPOINTMENT_UPDATED', {
      appointments: updatedAppointments,
      queue: updatedQueue
    });

    try {
      api.cancelAppointment(appointmentId, reason);
    } catch { }

    return true;
  };

  const rescheduleAppointment = (appointmentId, newDate, newSlot) => {
    const targetApt = appointments.find(a => a.id === appointmentId);
    if (!targetApt) throw new Error('Appointment not found.');

    const isSlotTaken = appointments.some(
      a => a.id !== appointmentId &&
        a.doctor === targetApt.doctor &&
        a.date === newDate &&
        a.timeSlot === newSlot &&
        a.status !== 'Cancelled'
    );
    if (isSlotTaken) {
      throw new Error(`Slot ${newSlot} on ${newDate} is already reserved for ${targetApt.doctor}.`);
    }

    const updatedAppointments = appointments.map(a => {
      if (a.id === appointmentId) {
        return {
          ...a,
          date: newDate,
          timeSlot: newSlot,
          status: 'Confirmed',
          rescheduledAt: new Date().toLocaleTimeString()
        };
      }
      return a;
    });

    setAppointments(updatedAppointments);
    saveStored('appointments', updatedAppointments);

    broadcastSync('APPOINTMENT_UPDATED', {
      appointments: updatedAppointments,
      queue
    });

    try {
      api.rescheduleAppointment(appointmentId, newDate, newSlot);
    } catch { }

    return true;
  };

  // Computed Patient Metrics (Personalized specifically to Logged-in Patient)
  const userAppointments = appointments.filter(a => {
    if (currentUser?.role !== 'patient') return true;
    return a.patientId === currentUser?.id ||
      (currentUser?.name && a.patientName?.toLowerCase() === currentUser?.name?.toLowerCase());
  });

  const activeBooking = userAppointments.find(a => a.status === 'Confirmed' || a.status === 'CheckedIn');
  const patientToken = activeBooking ? (Number(activeBooking.token || activeBooking.token_number) || 430) : null;
  const patientTokenCode = activeBooking ? (activeBooking.tokenCode || activeBooking.token_code || `#${patientToken}`) : null;

  const patientQueueIndex = activeBooking
    ? queue.findIndex(q => {
      const qToken = Number(q.token || q.token_number);
      const bToken = Number(activeBooking.token || activeBooking.token_number);
      const qCode = String(q.tokenCode || q.token_code || '').trim().toLowerCase();
      const bCode = String(activeBooking.tokenCode || activeBooking.token_code || '').trim().toLowerCase();
      const qRef = String(q.bookingReference || q.booking_reference || '').trim().toLowerCase();
      const bRef = String(activeBooking.bookingReference || activeBooking.booking_reference || '').trim().toLowerCase();
      const qName = String(q.name || q.patient_name || '').trim().toLowerCase();
      const bName = String(activeBooking.patientName || '').trim().toLowerCase();

      return (bToken && qToken === bToken) ||
        (bCode && qCode && qCode === bCode) ||
        (bRef && qRef && qRef === bRef) ||
        (bName && qName && qName === bName);
    })
    : -1;

  const isMyTurn = Boolean(
    currentServing &&
    activeBooking &&
    (
      (Number(currentServing.token || currentServing.token_number) === Number(activeBooking.token || activeBooking.token_number)) ||
      (currentServing.tokenCode && activeBooking.tokenCode && currentServing.tokenCode.toLowerCase() === activeBooking.tokenCode.toLowerCase()) ||
      (currentServing.token_code && activeBooking.tokenCode && currentServing.token_code.toLowerCase() === activeBooking.tokenCode.toLowerCase()) ||
      (currentServing.tokenCode && activeBooking.token_code && currentServing.tokenCode.toLowerCase() === activeBooking.token_code.toLowerCase()) ||
      (currentServing.name && activeBooking.patientName && currentServing.name.toLowerCase() === activeBooking.patientName.toLowerCase()) ||
      (currentServing.patient_name && activeBooking.patientName && currentServing.patient_name.toLowerCase() === activeBooking.patientName.toLowerCase())
    )
  );

  const queuePosition = isMyTurn
    ? 'NOW SERVING'
    : patientQueueIndex >= 0
      ? `Queue #${patientQueueIndex + 1}`
      : (activeBooking?.checkedIn ? 'Queue #1 (Next in line)' : (activeBooking ? 'Check-In Required' : null));

  const estimatedWaitMins = patientQueueIndex >= 0
    ? (patientQueueIndex + 1) * 8
    : (activeBooking?.checkedIn ? 8 : 0);



  return (
    <CareLinkContext.Provider value={{
      currentUser,
      patientProfiles: PATIENT_PROFILES,
      login,
      loginAsPatient,
      logout,
      organizations,
      hospitals,
      activeHospital,
      activeOrganization,
      activeBranch,
      selectHospital,
      updateHospital,
      updateBranchConfig,
      addDepartment,
      removeDepartment,
      addDoctor,
      updateDoctorSchedule,
      currentServing,
      queue,
      skippedQueue,
      doctorDelays,
      callNextPatient,
      callSpecificPatient,
      completeCurrentConsultation,
      skipCurrentPatient,
      recallPatient,
      reportDoctorDelay,
      checkInPatient,
      registerWalkIn,
      completedCount,
      auditLog,
      appointments,
      userAppointments,
      activeBooking,
      bookAppointment,
      cancelAppointment,
      rescheduleAppointment,
      patientToken,
      patientTokenCode,
      isMyTurn,
      queuePosition,
      estimatedWaitMins,
      activeRooms,
      hospitalAudio
    }}>
      {children}
    </CareLinkContext.Provider>
  );
}

export function useCareLink() {
  const context = useContext(CareLinkContext);
  if (!context) {
    throw new Error('useCareLink must be used within a CareLinkProvider');
  }
  return context;
}
