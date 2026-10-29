const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Authentication
  login: async (email, role) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    return res.json();
  },

  // Multi-Hospital Organizations & Branches
  getOrganizations: async () => {
    const res = await fetch(`${API_BASE_URL}/organizations`);
    return res.json();
  },

  getHospitals: async () => {
    const res = await fetch(`${API_BASE_URL}/hospitals`);
    return res.json();
  },

  getHospitalById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/hospitals/${id}`);
    return res.json();
  },

  updatePatient: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Branch Operations & Setup Wizard
  getBranchConfig: async (branchId) => {
    const res = await fetch(`${API_BASE_URL}/branches/${branchId}/config`);
    return res.json();
  },

  updateBranchConfig: async (branchId, config) => {
    const res = await fetch(`${API_BASE_URL}/branches/${branchId}/config`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },

  addDepartment: async (branchId, deptData) => {
    const res = await fetch(`${API_BASE_URL}/branches/${branchId}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deptData)
    });
    return res.json();
  },

  removeDepartment: async (branchId, deptId) => {
    const res = await fetch(`${API_BASE_URL}/branches/${branchId}/departments/${deptId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  addDoctor: async (branchId, docData) => {
    const res = await fetch(`${API_BASE_URL}/branches/${branchId}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docData)
    });
    return res.json();
  },

  updateDoctorSchedule: async (doctorId, scheduleData) => {
    const res = await fetch(`${API_BASE_URL}/doctors/${doctorId}/schedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData)
    });
    return res.json();
  },

  getDoctorSlots: async (doctorId, date) => {
    const url = date 
      ? `${API_BASE_URL}/doctors/${doctorId}/slots?date=${encodeURIComponent(date)}`
      : `${API_BASE_URL}/doctors/${doctorId}/slots`;
    const res = await fetch(url);
    return res.json();
  },

  // Live OPD Queue Engine
  getQueue: async () => {
    const res = await fetch(`${API_BASE_URL}/queue`);
    return res.json();
  },

  checkInPatient: async (bookingReference, patientName, extra = {}) => {
    const res = await fetch(`${API_BASE_URL}/queue/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingReference, patientName, ...extra })
    });
    return res.json();
  },

  callNext: async (roomNumber, doctorName) => {
    const res = await fetch(`${API_BASE_URL}/queue/call-next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomNumber, doctorName })
    });
    return res.json();
  },

  callSpecificToken: async (tokenIdentifier, roomNumber, doctorName) => {
    const res = await fetch(`${API_BASE_URL}/queue/call-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenIdentifier, roomNumber, doctorName })
    });
    return res.json();
  },

  completeConsultation: async (roomNumber) => {
    const res = await fetch(`${API_BASE_URL}/queue/complete-consultation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomNumber })
    });
    return res.json();
  },

  skipPatient: async (reason) => {
    const res = await fetch(`${API_BASE_URL}/queue/skip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  recallPatient: async (tokenNumber) => {
    const res = await fetch(`${API_BASE_URL}/queue/recall`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenNumber })
    });
    return res.json();
  },

  reportDelay: async (doctorName, delayMinutes, reason) => {
    const res = await fetch(`${API_BASE_URL}/queue/report-delay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorName, delayMinutes, reason })
    });
    return res.json();
  },

  registerWalkIn: async (patientName, department, visitType, priority, doctorName) => {
    const res = await fetch(`${API_BASE_URL}/queue/walk-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_name: patientName,
        department,
        visit_type: visitType,
        priority: priority || 'NORMAL',
        doctor_name: doctorName || 'Dr. Sarah Jenkins'
      })
    });
    return res.json();
  },

  getWaitingRoomDisplay: async () => {
    const res = await fetch(`${API_BASE_URL}/queue/display`);
    return res.json();
  },

  // Appointments
  getAppointments: async () => {
    const res = await fetch(`${API_BASE_URL}/appointments`);
    return res.json();
  },

  bookAppointment: async (appointmentData) => {
    const res = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });
    return res.json();
  },

  rescheduleAppointment: async (id, newDate, newSlot) => {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}/reschedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointment_date: newDate,
        time_slot: newSlot
      })
    });
    return res.json();
  },

  cancelAppointment: async (id, reason) => {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return res.json();
  }, // end of cancelAppointment
  // Map related API methods
  getHospitalMap: async (hospitalId) => {
    const res = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/map`);
    return res.json();
  },
  upsertHospitalLocations: async (hospitalId, locations) => {
    const res = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locations),
    });
    return res.json();
  },
  upsertHospitalRoutes: async (hospitalId, routes) => {
    const res = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(routes),
    });
    return res.json();
  },
  getShortestRoute: async (hospitalId, fromId, toId) => {
    const res = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/route?from=${fromId}&to=${toId}`);
    return res.json();
  },
};
