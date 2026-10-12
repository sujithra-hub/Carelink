import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  SkipForward, 
  Megaphone, 
  Activity, 
  Clock, 
  Search, 
  FileText, 
  History, 
  AlertTriangle, 
  RotateCcw, 
  Tv, 
  Stethoscope, 
  BadgeCheck, 
  Ticket, 
  X, 
  Volume2, 
  VolumeX, 
  Play, 
  Printer, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';
import { useCareLink } from '../context/CareLinkContext';
import TokenPassModal from '../components/TokenPassModal';

export default function StaffDashboard() {
  const { 
    currentUser,
    activeHospital,
    currentServing, 
    queue, 
    skippedQueue, 
    doctorDelays, 
    callNextPatient, 
    callSpecificPatient, 
    completeCurrentConsultation, 
    activeRooms, 
    hospitalAudio, 
    skipCurrentPatient, 
    recallPatient, 
    reportDoctorDelay, 
    checkInPatient, 
    registerWalkIn, 
    completedCount, 
    auditLog, 
    appointments 
  } = useCareLink();

  // Mode: 'doctor' (Doctor Station), 'reception' (Arrival Kiosk), 'display' (Waiting Room Screen)
  const [activeConsole, setActiveConsole] = useState('doctor');
  const [selectedTokenSlip, setSelectedTokenSlip] = useState(null);
  const [isSoundMuted, setIsSoundMuted] = useState(false);

  // Consultation Timer
  const [consultationSeconds, setConsultationSeconds] = useState(140);
  useEffect(() => {
    const timer = setInterval(() => {
      setConsultationSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentServing]);

  // Reception States
  const [searchBookingRef, setSearchBookingRef] = useState('');
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInDept, setWalkInDept] = useState('Cardiology');
  const [walkInType, setWalkInType] = useState('Walk-in Consultation');
  const [walkInPriority, setWalkInPriority] = useState('NORMAL');

  // Delay Reporting Modal
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [delayReason, setDelayReason] = useState('Complex Diagnostic Case');

  // Selected OPD Room & Doctor in Station
  const [stationRoom, setStationRoom] = useState('OPD Room 102');
  const [stationDoctor, setStationDoctor] = useState('Dr. Sarah Jenkins');

  const [notification, setNotification] = useState('');

  const triggerNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const handleNext = () => {
    const success = callNextPatient(stationRoom, stationDoctor);
    if (success) {
      setConsultationSeconds(0);
      triggerNotice(`Advanced queue! Called next patient to ${stationRoom}.`);
    } else {
      triggerNotice('Waiting queue is currently empty.');
    }
  };

  const handleCallSpecific = (patient) => {
    const success = callSpecificPatient(patient.tokenCode || patient.token, stationRoom, stationDoctor);
    if (success) {
      setConsultationSeconds(0);
      triggerNotice(`Priority called ${patient.tokenCode || `#${patient.token}`} (${patient.name}) to ${stationRoom}!`);
    } else {
      triggerNotice('Failed to call patient.');
    }
  };

  const handleCompleteCurrent = () => {
    completeCurrentConsultation(stationRoom);
    setConsultationSeconds(0);
    triggerNotice(`Consultation marked complete for ${stationRoom}. Room is ready.`);
  };

  const handleTestAudio = () => {
    hospitalAudio.announceToken({
      tokenCode: currentServing?.tokenCode || currentServing?.token_code || `#${currentServing?.token || 420}`,
      patientName: currentServing?.name || currentServing?.patient_name || 'Next Patient',
      roomNumber: stationRoom
    });
    triggerNotice('Broadcasted hospital chime tone & synthesized announcement!');
  };

  const handleSkip = () => {
    if (queue.length > 0) {
      skipCurrentPatient('Patient Did Not Respond When Called');
      triggerNotice(`Skipped ${queue[0]?.tokenCode || `#${queue[0]?.token}`}. Moved to skipped list.`);
    }
  };

  const handleRecall = (tokenNumber) => {
    recallPatient(tokenNumber);
    triggerNotice(`Recalled Token #${tokenNumber} back to head of queue.`);
  };

  const handleReportDelay = (e) => {
    e.preventDefault();
    reportDoctorDelay(stationDoctor, delayMinutes, delayReason);
    setShowDelayModal(false);
    triggerNotice(`Delay alert recorded (+${delayMinutes}m). Estimated patient times updated.`);
  };

  const handleDirectCheckin = async (bookingRef, name, aptId) => {
    const res = await checkInPatient({ bookingReference: bookingRef, patientName: name, appointmentId: aptId });
    triggerNotice(res.message || `Checked in ${name}! Token added to active queue.`);
  };

  const handleAddWalkIn = (e) => {
    e.preventDefault();
    if (!walkInName.trim()) return;
    const res = registerWalkIn(walkInName, walkInDept, walkInType, walkInPriority);
    const assignedCode = typeof res === 'object' ? res.tokenCode : `#${res}`;
    setWalkInName('');
    setShowWalkInModal(false);
    triggerNotice(`Walk-in registered! Assigned Token ${assignedCode}`);
  };
    // Trigger search based on current input; UI updates automatically via filteredAppointments.
    const handleSearch = () => {
      triggerNotice(`Searching for "${searchBookingRef}"`);
    };
  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const departmentsList = activeHospital?.departments || ['Cardiology', 'General Medicine', 'Pediatrics', 'Orthopedics'];
  const filteredAppointments = appointments.filter(a => 
    !searchBookingRef || 
    (a.bookingReference && a.bookingReference.toLowerCase().includes(searchBookingRef.toLowerCase())) ||
    (a.patientName && a.patientName.toLowerCase().includes(searchBookingRef.toLowerCase()))
  );

  const displayServingCode = currentServing?.tokenCode || currentServing?.token_code || (currentServing?.token ? `#${currentServing.token}` : '#420');

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gap: '1.8rem' }}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: '#0f172a',
          color: 'white',
          padding: '0.85rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.92rem'
        }}>
          <CheckCircle size={18} color="var(--success)" />
          {notification}
        </div>
      )}

      {/* Delay Reporting Modal */}
      {showDelayModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '92%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock color="var(--warning)" /> Broadcast Consultation Delay
              </h3>
              <button onClick={() => setShowDelayModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReportDelay} style={{ display: 'grid', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Doctor</label>
                <input 
                  type="text" 
                  disabled 
                  value={stationDoctor} 
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Estimated Delay Duration</label>
                <select 
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'white' }}
                >
                  <option value={10}>+10 Minutes Behind</option>
                  <option value={15}>+15 Minutes Behind</option>
                  <option value={25}>+25 Minutes Behind</option>
                  <option value={40}>+40 Minutes Behind</option>
                  <option value={60}>+60 Minutes (High Procedure)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Delay Reason</label>
                <input 
                  type="text" 
                  value={delayReason} 
                  onChange={(e) => setDelayReason(e.target.value)}
                  placeholder="e.g. Complex emergency case..."
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowDelayModal(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Broadcast Delay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Walk-In Registration Modal */}
      {showWalkInModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '92%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus color="var(--primary-color)" /> Rapid OPD Walk-In Registration
              </h3>
              <button onClick={() => setShowWalkInModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddWalkIn} style={{ display: 'grid', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Patient Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Thomas Wayne"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Department</label>
                  <select 
                    value={walkInDept}
                    onChange={(e) => setWalkInDept(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'white' }}
                  >
                    {departmentsList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Triage Priority</label>
                  <select 
                    value={walkInPriority}
                    onChange={(e) => setWalkInPriority(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'white' }}
                  >
                    <option value="NORMAL">Normal / Routine</option>
                    <option value="SENIOR">Senior Citizen Priority</option>
                    <option value="EMERGENCY">Emergency (Jump to Head)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Visit Type</label>
                <input 
                  type="text" 
                  value={walkInType}
                  onChange={(e) => setWalkInType(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowWalkInModal(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Issue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Console Navigation & Branch Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: '0 0 0.3rem 0' }}>Clinical Staff Command Center</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>
            {activeHospital?.name} • Live Outpatient Department Management
          </p>
        </div>

        {/* Console Switcher */}
        <div style={{ display: 'flex', gap: '0.6rem', background: 'var(--bg-light)', padding: '0.3rem', borderRadius: 'var(--radius-md)' }}>
          <button 
            onClick={() => setActiveConsole('doctor')}
            className={`btn ${activeConsole === 'doctor' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', border: 'none' }}
          >
            <Stethoscope size={15} /> Doctor Workstation
          </button>
          <button 
            onClick={() => setActiveConsole('reception')}
            className={`btn ${activeConsole === 'reception' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', border: 'none' }}
          >
            <Search size={15} /> Reception Check-In
          </button>
          <button 
            onClick={() => setActiveConsole('display')}
            className={`btn ${activeConsole === 'display' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', border: 'none' }}
          >
            <Tv size={15} /> TV Digital Signage
          </button>
          <button 
            onClick={() => setShowWalkInModal(true)}
            className="btn btn-primary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', backgroundColor: 'var(--success)' }}
          >
            <UserPlus size={15} /> Quick Walk-In
          </button>
        </div>
      </div>

      {/* VIEW 1: DOCTOR WORKSTATION */}
      {activeConsole === 'doctor' && (
        <div style={{ display: 'grid', gap: '1.8rem' }}>
          
          {/* Top Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem' }}>
            <div className="card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', borderRadius: 'var(--radius-sm)' }}>
                <Clock size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Consultation</p>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent-color)' }}>{formatTimer(consultationSeconds)}</h3>
              </div>
            </div>

            <div className="card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-sm)' }}>
                <CheckCircle size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed Today</p>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{completedCount}</h3>
              </div>
            </div>

            <div className="card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(234, 179, 8, 0.1)', color: '#b45309', borderRadius: 'var(--radius-sm)' }}>
                <Users size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Waiting in OPD Queue</p>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{queue.length}</h3>
              </div>
            </div>

            <div className="card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)' }}>
                <RotateCcw size={20} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Skipped Patients</p>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{skippedQueue.length}</h3>
              </div>
            </div>
          </div>

          {/* Active Doctor Consultation Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1.85fr', gap: '1.8rem' }}>
            
            {/* Active Examination Room Card */}
            <div className="card" style={{ border: '2px solid var(--accent-color)', padding: '1.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                  <Megaphone size={18} color="var(--accent-color)" /> In Examination Room
                </h3>
                
                {/* Station Room Selector */}
                <select 
                  value={stationRoom} 
                  onChange={(e) => setStationRoom(e.target.value)}
                  style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 700, 
                    color: 'var(--accent-color)', 
                    background: 'rgba(139, 92, 246, 0.1)', 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--accent-color)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="OPD Room 102">OPD Room 102 (Cardiology)</option>
                  <option value="OPD Room 104">OPD Room 104 (Gen Medicine)</option>
                  <option value="OPD Room 106">OPD Room 106 (Pediatrics)</option>
                  <option value="OPD Room 108">OPD Room 108 (Orthopedics)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.3rem' }}>Consultant on Duty</label>
                <select 
                  value={stationDoctor} 
                  onChange={(e) => setStationDoctor(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.85rem', background: 'white' }}
                >
                  <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins (Cardiology)</option>
                  <option value="Dr. Michael Chen">Dr. Michael Chen (General Medicine)</option>
                  <option value="Dr. Emily Blunt">Dr. Emily Blunt (Pediatrics)</option>
                  <option value="Dr. Robert Hayes">Dr. Robert Hayes (Orthopedics)</option>
                </select>
              </div>

              <div style={{ textAlign: 'center', padding: '1.6rem 1rem', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)', marginBottom: '1.2rem' }}>
                <p style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.82rem' }}>Currently Consulting</p>
                <h1 style={{ fontSize: '3.4rem', color: 'var(--accent-color)', margin: '0 0 0.3rem 0', fontWeight: 800 }}>
                  {displayServingCode}
                </h1>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{currentServing?.name || currentServing?.patient_name || 'Patient'}</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem', fontSize: '0.82rem' }}>
                  Started at {currentServing?.startedAt || currentServing?.started_at || '10:15 AM'} • Duration: <strong>{formatTimer(consultationSeconds)}</strong>
                </p>
              </div>

              <div style={{ display: 'grid', gap: '0.7rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleNext} 
                  style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 600 }}
                >
                  Complete & Call Next Patient
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={handleCompleteCurrent}
                    style={{ fontSize: '0.82rem', color: 'var(--success)', borderColor: 'var(--success)' }}
                    title="Mark consultation done and free room"
                  >
                    <CheckCircle size={14} /> Free Room
                  </button>
                  <button 
                    className="btn btn-outline" 
                    onClick={handleTestAudio}
                    style={{ fontSize: '0.82rem', color: 'var(--primary-color)' }}
                    title="Play chime and announce token through hospital speaker"
                  >
                    <Volume2 size={14} /> Re-Announce
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={handleSkip}
                    style={{ color: 'var(--warning)', borderColor: 'var(--warning)', fontSize: '0.82rem' }}
                  >
                    <SkipForward size={14} /> Skip Patient
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => setShowDelayModal(true)}
                    style={{ fontSize: '0.82rem' }}
                  >
                    <Clock size={14} /> Report Delay
                  </button>
                </div>
              </div>

              {/* Skipped Patients Recall Box */}
              {skippedQueue.length > 0 && (
                <div style={{ marginTop: '1.2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.82rem', fontWeight: 700, color: 'var(--warning)' }}>
                    Skipped Patients ({skippedQueue.length})
                  </p>
                  <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto' }}>
                    {skippedQueue.map(s => (
                      <div key={s.token} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-light)', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                        <span><strong>{s.tokenCode || `#${s.token}`}</strong> {s.name}</span>
                        <button 
                          onClick={() => handleRecall(s.token)}
                          className="btn btn-outline" 
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <RotateCcw size={12} /> Recall
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Waiting Queue List */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Waiting Queue ({queue.length} patients)</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                    Prioritized: Emergency $\rightarrow$ Seniors $\rightarrow$ General. Doctors can call any patient directly.
                  </p>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>Live Sync Active</span>
              </div>

              <div style={{ background: 'var(--bg-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 2.4fr 1.6fr 1.5fr 1.4fr', padding: '0.8rem 1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  <div>Token</div>
                  <div>Patient Name</div>
                  <div>Priority</div>
                  <div>Wait Time</div>
                  <div style={{ textAlign: 'right' }}>Call</div>
                </div>
                
                {queue.map((patient, idx) => (
                  <div key={patient.token} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1.1fr 2.4fr 1.6fr 1.5fr 1.4fr', 
                    padding: '0.85rem 1rem', 
                    borderBottom: idx !== queue.length - 1 ? '1px solid var(--border-color)' : 'none',
                    alignItems: 'center',
                    background: patient.priority === 'EMERGENCY' ? 'rgba(239, 68, 68, 0.08)' : idx === 0 ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
                    fontSize: '0.88rem'
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                      {patient.tokenCode || `#${patient.token}`}
                    </div>
                    <div>
                      {patient.name}
                      {idx === 0 && <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', color: 'var(--primary-light)', fontWeight: 700 }}>[UP NEXT]</span>}
                      {currentUser?.name && patient.name?.toLowerCase().includes(currentUser.name.toLowerCase()) && (
                        <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.12)', padding: '0.12rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                          [YOUR TOKEN]
                        </span>
                      )}
                    </div>
                    <div>
                      <span style={{ 
                        background: patient.priority === 'EMERGENCY' ? 'rgba(239, 68, 68, 0.15)' : patient.priority === 'SENIOR' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                        color: patient.priority === 'EMERGENCY' ? 'var(--danger)' : patient.priority === 'SENIOR' ? '#b45309' : 'var(--primary-color)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {patient.priority === 'EMERGENCY' ? 'EMERGENCY' : patient.priority === 'SENIOR' ? 'SENIOR' : patient.type}
                      </span>
                    </div>
                    <div style={{ color: patient.waitTime?.includes('Delayed') ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 }}>
                      {patient.waitTime}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleCallSpecific(patient)}
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', color: 'var(--primary-color)', borderColor: 'var(--primary-light)' }}
                        title={`Call ${patient.name} immediately`}
                      >
                        Call Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 2: RECEPTION ARRIVAL KIOSK */}
      {activeConsole === 'reception' && (
        <div style={{ display: 'grid', gap: '1.8rem' }}>
          
          <div className="card">
            <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={20} color="var(--primary-color)" /> Patient Arrival & Check-In Desk
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              Search scheduled patient by Booking Reference (e.g. <code>CL-2026-8910</code>) or patient name to confirm check-in arrival.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                placeholder="Enter Booking Reference (e.g. CL-2026-8910) or patient name..."
                value={searchBookingRef}
                onChange={(e) => setSearchBookingRef(e.target.value)}
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}
              />
              <button className="btn btn-primary" onClick={() => triggerNotice('Looking up appointment database...')}>
                Search Record
              </button>
            </div>

            <div style={{ background: 'var(--bg-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.6fr 2fr 1.6fr 1.4fr 1.2fr 1.4fr', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                <div>Token</div>
                <div>Booking Ref</div>
                <div>Patient Name</div>
                <div>Doctor & Dept</div>
                <div>Scheduled Time</div>
                <div>Status</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
              </div>

              {filteredAppointments.map((apt) => (
                <div key={apt.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.6fr 2fr 1.6fr 1.4fr 1.2fr 1.4fr', padding: '0.9rem 1rem', borderBottom: '1px solid var(--border-color)', alignItems: 'center', fontSize: '0.88rem' }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary-color)' }}>
                    {apt.tokenCode || apt.token_code || `#${apt.token || 430}`}
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {apt.bookingReference || `CL-2026-00${apt.id}`}
                  </div>
                  <div>
                    <strong>{apt.patientName}</strong>
                    {currentUser?.name && apt.patientName?.toLowerCase().includes(currentUser.name.toLowerCase()) && (
                      <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.12)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                        [YOU]
                      </span>
                    )}
                  </div>
                  <div>{apt.doctor} ({apt.dept})</div>
                  <div>{apt.date} • {apt.timeSlot}</div>
                  <div>
                    {apt.checkedIn ? (
                      <span style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                        <BadgeCheck size={14} /> Checked-In
                      </span>
                    ) : (
                      <span style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.8rem' }}>
                        Pending Arrival
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                    {!apt.checkedIn && (
                      <button 
                        onClick={() => handleDirectCheckin(apt.bookingReference, apt.patientName, apt.id)}
                        className="btn btn-primary" 
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                      >
                        Check In
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedTokenSlip(apt)}
                      className="btn btn-outline" 
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      title="Print Token Slip"
                    >
                      <Printer size={12} /> Slip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 3: WAITING ROOM DIGITAL SIGNAGE (TV DISPLAY) */}
      {activeConsole === 'display' && (
        <div className="card" style={{ background: '#090d16', color: 'white', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          
          {/* Signage Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '52px', height: '52px', background: 'var(--primary-color)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.6rem', boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}>
                +
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.9rem', letterSpacing: '-0.02em', fontWeight: 800 }}>{activeHospital?.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem' }}>
                  <span style={{ color: '#38bdf8', fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.04em' }}>OUTPATIENT CLINIC LIVE DISPLAY</span>
                  <span style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }}></span>
                  <span style={{ color: 'var(--success)', fontSize: '0.78rem', fontWeight: 700 }}>SYNCHRONIZED</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* Sound Announcement Controls */}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button 
                  onClick={handleTestAudio} 
                  className="btn btn-outline" 
                  style={{ color: '#38bdf8', borderColor: '#38bdf8', padding: '0.45rem 0.9rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  title="Test Sound Chime & Voice"
                >
                  <Play size={14} /> Chime Broadcast
                </button>
                <button 
                  onClick={() => setIsSoundMuted(!isSoundMuted)} 
                  className="btn btn-outline" 
                  style={{ color: isSoundMuted ? '#ef4444' : '#10b981', borderColor: isSoundMuted ? '#ef4444' : '#10b981', padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                  title={isSoundMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isSoundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>

              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0, fontSize: '2.2rem', fontFamily: 'monospace', color: 'var(--success)', fontWeight: 800, letterSpacing: '0.04em' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </h2>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Live Stream Broadcasting</span>
              </div>
            </div>
          </div>

          {/* Main Display Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '2.5rem' }}>
            
            {/* Now Serving Spotlight Card */}
            <div style={{ 
              background: 'linear-gradient(145deg, #0f172a, #131c31)', 
              border: '2px solid #3b82f6', 
              borderRadius: 'var(--radius-lg)', 
              padding: '2.8rem 2rem', 
              textAlign: 'center', 
              boxShadow: '0 0 45px rgba(59, 130, 246, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1.2rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.7rem', borderRadius: 'var(--radius-full)' }}>
                CALLING NOW
              </div>

              <p style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 0.8rem 0' }}>
                TOKEN CALLED TO CONSULTATION
              </p>
              
              <h1 style={{ 
                fontSize: '6.5rem', 
                margin: '0.2rem 0', 
                color: '#60a5fa', 
                fontWeight: 900, 
                lineHeight: 1, 
                textShadow: '0 0 35px rgba(96, 165, 250, 0.5)',
                letterSpacing: '-0.02em'
              }}>
                {displayServingCode}
              </h1>

              <h2 style={{ fontSize: '2.2rem', margin: '0 0 1.2rem 0', fontWeight: 700 }}>
                {currentServing?.name || currentServing?.patient_name || 'Patient'}
              </h2>

              <div style={{ 
                display: 'inline-block', 
                background: 'rgba(59, 130, 246, 0.25)', 
                color: '#bfdbfe', 
                padding: '0.9rem 2.2rem', 
                borderRadius: 'var(--radius-full)', 
                fontSize: '1.35rem', 
                fontWeight: 800, 
                border: '1px solid rgba(59, 130, 246, 0.5)',
                letterSpacing: '0.04em'
              }}>
                PROCEED TO: {currentServing?.roomNumber || currentServing?.room_number || 'OPD ROOM 102'}
              </div>

              <p style={{ color: '#94a3b8', marginTop: '1.4rem', fontSize: '1rem', marginBottom: 0 }}>
                Attending Physician: <strong style={{ color: 'white' }}>{currentServing?.doctor || currentServing?.doctor_name || 'Consultant'}</strong> ({currentServing?.dept || currentServing?.department || 'OPD'})
              </p>
            </div>

            {/* Upcoming Queue Schedule */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={20} color="var(--primary-color)" /> NEXT TOKENS IN LINE
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Est. Waiting Duration</span>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {queue.slice(0, 5).map((q, i) => (
                  <div key={q.token} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: '#0f172a', 
                    padding: '1rem 1.3rem', 
                    borderRadius: 'var(--radius-md)', 
                    border: i === 0 ? '1px solid #3b82f6' : '1px solid #1e293b' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.45rem', fontWeight: 900, color: q.priority === 'EMERGENCY' ? '#f87171' : '#38bdf8' }}>
                        {q.tokenCode || `#${q.token}`}
                      </span>
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                          {q.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {q.dept} • {q.priority === 'EMERGENCY' ? 'PRIORITY TRIAGE' : q.priority === 'SENIOR' ? 'SENIOR CITIZEN' : 'ROUTINE'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--warning)', fontWeight: 800, fontSize: '0.95rem' }}>
                        {q.waitTime}
                      </div>
                      <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Queue #{i + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Multi-Room Digital Signage Consultation Matrix */}
          <div style={{ marginTop: '2.5rem', borderTop: '1px solid #1e293b', paddingTop: '1.8rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#cbd5e1', letterSpacing: '0.04em' }}>
              ALL OPD CONSULTATION ROOMS ACTIVE STATUS
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {activeRooms && Object.values(activeRooms).map((room) => (
                <div key={room.room_number} style={{ 
                  background: '#0f172a', 
                  border: '1px solid #1e293b', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1.1rem 1.3rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: '#60a5fa', display: 'block' }}>{room.room_number}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 500 }}>{room.doctor_name}</span>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{room.dept}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: room.token_code === '—' ? '#64748b' : '#38bdf8' }}>
                      {room.token_code || '—'}
                    </div>
                    <span style={{ 
                      fontSize: '0.68rem', 
                      fontWeight: 700, 
                      color: room.status === 'AVAILABLE' ? 'var(--success)' : 'var(--warning)',
                      textTransform: 'uppercase'
                    }}>
                      {room.status === 'AVAILABLE' ? 'ROOM READY' : 'IN SESSION'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hospital Ticker Footer */}
          <div style={{ marginTop: '2rem', background: '#0f172a', padding: '0.85rem 1.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.9rem', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Volume2 color="var(--success)" size={18} />
              <span>Two-Tone Web Audio chime and synthesized voice announcements broadcasted for every token call.</span>
            </div>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>Emergency Triage Priority Protocol Enforced</span>
          </div>

        </div>
      )}

      {/* Printable Digital Token Slip Modal */}
      {selectedTokenSlip && (
        <TokenPassModal 
          tokenData={selectedTokenSlip} 
          onClose={() => setSelectedTokenSlip(null)} 
        />
      )}

    </div>
  );
}
