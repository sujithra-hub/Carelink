import { Router } from 'express';
import { login, getProfile } from '../controllers/authController.js';
import { 
  getOrganizations,
  getHospitals, 
  getHospitalById, 
  updateHospital,
  getBranchConfig,
  updateBranchConfig,
  addDepartment,
  removeDepartment,
  addDoctor,
  updateDoctorSchedule,
  getDoctorSlots
} from '../controllers/hospitalController.js';
import { 
  getQueue, 
  checkInPatient,
  callNext, 
  callSpecificToken,
  completeConsultation,
  skipPatient, 
  recallPatient,
  reportDelay,
  registerWalkIn, 
  getWaitingRoomDisplay,
  getAuditLogs,
  streamQueue
} from '../controllers/queueController.js';
import { getAppointments, createAppointment, rescheduleAppointment, cancelAppointment } from '../controllers/appointmentController.js';

const router = Router();

// Authentication Routes
router.post('/auth/login', login);
router.get('/auth/profile/:id', getProfile);

// Multi-Hospital & Organization Routes
router.get('/organizations', getOrganizations);
router.get('/hospitals', getHospitals);
router.get('/hospitals/:id', getHospitalById);
router.patch('/hospitals/:id', updateHospital);

// Branch Configuration & Operations
router.get('/branches/:branchId/config', getBranchConfig);
router.patch('/branches/:branchId/config', updateBranchConfig);
router.post('/branches/:branchId/departments', addDepartment);
router.delete('/branches/:branchId/departments/:deptId', removeDepartment);

// Doctors & Schedule Engine
router.post('/branches/:branchId/doctors', addDoctor);
router.patch('/doctors/:doctorId/schedule', updateDoctorSchedule);
router.get('/doctors/:doctorId/slots', getDoctorSlots);

// Live OPD Queue Engine Routes (Real-Time SSE Stream + REST)
router.get('/queue', getQueue);
router.get('/queue/stream', streamQueue);
router.post('/queue/checkin', checkInPatient);
router.post('/queue/call-next', callNext);
router.post('/queue/call-token', callSpecificToken);
router.post('/queue/complete-consultation', completeConsultation);
router.post('/queue/skip', skipPatient);
router.post('/queue/recall', recallPatient);
router.post('/queue/report-delay', reportDelay);
router.post('/queue/walk-in', registerWalkIn);
router.get('/queue/display', getWaitingRoomDisplay);
router.get('/queue/audit-logs', getAuditLogs);

// Appointments Routes
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);
router.patch('/appointments/:id/reschedule', rescheduleAppointment);
router.patch('/appointments/:id/cancel', cancelAppointment);

export default router;
