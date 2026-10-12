import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Calendar, 
  Clock, 
  Activity, 
  Stethoscope, 
  Bell, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  PhoneCall,
  RotateCcw,
  XCircle,
  X,
  AlertTriangle,
  BadgeCheck,
  Ticket,
  Printer,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useCareLink } from '../context/CareLinkContext';
import { hospitalAudio } from '../utils/hospitalAudio';
import TokenPassModal from '../components/TokenPassModal';

const STANDARD_SLOTS = ['09:00 AM', '10:30 AM', '01:30 PM', '03:15 PM', '04:30 PM'];

function HomeDashboard() {
  const { 
    currentUser, 
    activeHospital, 
    currentServing, 
    patientToken, 
    patientTokenCode,
    isMyTurn,
    queuePosition, 
    estimatedWaitMins, 
    doctorDelays,
    appointments,
    userAppointments,
    activeBooking,
    activeRooms,
    checkInPatient,
    cancelAppointment,
    rescheduleAppointment
  } = useCareLink();

  const todayStr = new Date().toISOString().split('T')[0];
  const navigate = useNavigate();

  // Modals & Feedback States
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showTurnAlertModal, setShowTurnAlertModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [selectedTokenPass, setSelectedTokenPass] = useState(null);
  const [newDate, setNewDate] = useState(todayStr);
  const [newSlot, setNewSlot] = useState('');
  const [cancelReason, setCancelReason] = useState('Schedule Conflict');
  const [modalError, setModalError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const prevTurnRef = useRef(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Safe display tokens
  const displayServingCode = currentServing?.tokenCode || currentServing?.token_code || (currentServing?.token ? `#${currentServing.token}` : '#420');
  const displayPatientCode = activeBooking?.tokenCode || activeBooking?.token_code || (patientToken ? `#${patientToken}` : '#430');

  // Real-Time Audio & Notification Alerts when doctor calls this patient
  useEffect(() => {
    if (isMyTurn && !prevTurnRef.current) {
      setShowTurnAlertModal(true);

      // Play official 2-tone hospital chime & clear TTS speech announcement
      hospitalAudio.announceToken({
        tokenCode: displayPatientCode,
        patientName: currentUser?.name || activeBooking?.patientName || 'Patient',
        roomNumber: currentServing?.roomNumber || currentServing?.room_number || 'OPD Room 102'
      });

      // Trigger Desktop/Mobile OS Push Notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          try {
            new Notification("🔔 IT'S YOUR TURN - CareLink OPD", {
              body: `Token ${displayPatientCode}: Please proceed to ${currentServing?.roomNumber || 'OPD Room 102'} immediately!`,
              icon: '/favicon.ico'
            });
          } catch { }
        } else if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    }
    prevTurnRef.current = Boolean(isMyTurn);
  }, [isMyTurn, displayPatientCode, currentUser, activeBooking, currentServing]);

  const requestNotificationAccess = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          triggerToast('Notifications enabled! You will receive loud alerts when called.');
        } else {
          triggerToast('Push notifications not enabled. Audio alerts remain active.');
        }
      });
    } else {
      triggerToast('Audio chime alerts are active for your device.');
    }
  };

  const isCheckedIn = activeBooking?.checkedIn || activeBooking?.status === 'CheckedIn';
  const delayInfo = doctorDelays[currentServing?.doctor || currentServing?.doctor_name];

  const handleSelfCheckin = async () => {
    if (!activeBooking) return;
    const res = await checkInPatient({ 
      bookingReference: activeBooking.bookingReference, 
      patientName: activeBooking.patientName,
      appointmentId: activeBooking.id 
    });
    triggerToast(res.message || 'Self Check-in successful! You are now active in the OPD queue.');
  };

  const isSlotBookedForReschedule = (docName, slot, currentAptId) => {
    return appointments.some(
      a => a.id !== currentAptId && 
           a.doctor === docName && 
           a.date === newDate && 
           a.timeSlot === slot && 
           a.status !== 'Cancelled'
    );
  };

  const handleOpenReschedule = (apt) => {
    setRescheduleTarget(apt);
    setNewDate(apt.date || todayStr);
    setNewSlot('');
    setModalError('');
  };

  const handleConfirmReschedule = (e) => {
    e.preventDefault();
    if (!newSlot) {
      setModalError('Please select an available time slot.');
      return;
    }

    try {
      rescheduleAppointment(rescheduleTarget.id, newDate, newSlot);
      triggerToast(`Appointment with ${rescheduleTarget.doctor} rescheduled to ${newDate} at ${newSlot}!`);
      setRescheduleTarget(null);
    } catch (err) {
      setModalError(err.message || 'Slot conflict or rescheduling error.');
    }
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    cancelAppointment(cancelTarget.id, cancelReason);
    triggerToast(`Appointment cancelled. Slot freed up and queue token released.`);
    setCancelTarget(null);
  };


  return (
    <div className="animate-fade-in" style={{ display: 'grid', gap: '2rem' }}>
      
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: '#0f172a',
          color: 'white',
          padding: '0.85rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.9rem'
        }}>
          <CheckCircle size={18} color="var(--success)" />
          {toastMessage}
        </div>
      )}

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', padding: '2rem', border: '2px solid var(--danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--danger)', marginBottom: '1rem' }}>
              <AlertCircle size={32} />
              <h2 style={{ margin: 0, color: 'var(--danger)' }}>Emergency SOS Triggered</h2>
            </div>
            <p style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }}>
              Hospital Emergency Team at <strong>{activeHospital?.name}</strong> has been notified.
            </p>
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Emergency Hotline:</p>
              <a href={`tel:${activeHospital?.emergencyPhone || '911'}`} style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PhoneCall size={20} /> {activeHospital?.emergencyPhone || '911'}
              </a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setShowEmergencyModal(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => { alert('Emergency dispatch initiated.'); setShowEmergencyModal(false); }} style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}>
                Request Immediate Ambulance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '90%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar color="var(--primary-color)" /> Reschedule Consultation
              </h3>
              <button onClick={() => setRescheduleTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleConfirmReschedule} style={{ display: 'grid', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Consultant</label>
                <input 
                  type="text" 
                  disabled 
                  value={`${rescheduleTarget.doctor} (${rescheduleTarget.dept})`}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Select New Date</label>
                <input 
                  type="date" 
                  min={todayStr}
                  value={newDate} 
                  onChange={(e) => { setNewDate(e.target.value); setNewSlot(''); setModalError(''); }}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Select Available Slot</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {STANDARD_SLOTS.map((slot) => {
                    const booked = isSlotBookedForReschedule(rescheduleTarget.doctor, slot, rescheduleTarget.id);
                    const selected = newSlot === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={booked}
                        onClick={() => { setNewSlot(slot); setModalError(''); }}
                        style={{
                          padding: '0.6rem 0.3rem',
                          borderRadius: 'var(--radius-sm)',
                          border: selected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                          background: booked ? '#f1f5f9' : selected ? 'rgba(59, 130, 246, 0.12)' : 'white',
                          color: booked ? 'var(--text-muted)' : selected ? 'var(--primary-color)' : 'var(--text-main)',
                          cursor: booked ? 'not-allowed' : 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: 500,
                          textDecoration: booked ? 'line-through' : 'none'
                        }}
                      >
                        {slot} {booked && <span style={{ fontSize: '0.68rem' }}>(Reserved)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setRescheduleTarget(null)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelTarget && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <XCircle size={32} />
            </div>
            
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>Cancel Appointment?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.2rem' }}>
              Are you sure you want to cancel your consultation with <strong>{cancelTarget.doctor}</strong> on <strong>{cancelTarget.date}</strong> at <strong>{cancelTarget.timeSlot}</strong>?
            </p>

            <div style={{ textAlign: 'left', marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>Reason</label>
              <select 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none', background: 'white', fontSize: '0.85rem' }}
              >
                <option>Schedule Conflict</option>
                <option>Visiting Different Facility</option>
                <option>Symptoms Resolved</option>
                <option>Personal Emergency</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button className="btn btn-outline" onClick={() => setCancelTarget(null)} style={{ flex: 1 }}>
                Keep Booking
              </button>
              <button className="btn btn-primary" onClick={handleConfirmCancel} style={{ flex: 1, backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Good Day, <span className="gradient-text">{currentUser?.name || 'Alex'}!</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <MapPin size={18} color="var(--primary-light)" />
            Currently viewing: <strong>{activeHospital?.name || 'CareLink Facility'}</strong>
            <button 
              onClick={() => navigate('/hospitals')}
              style={{ 
                fontSize: '0.8rem', 
                padding: '0.2rem 0.7rem', 
                background: 'rgba(59, 130, 246, 0.1)', 
                color: 'var(--primary-light)', 
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                border: 'none',
                fontWeight: 600
              }}>
              Change Facility
            </button>
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => {
              if (isMyTurn) {
                setShowTurnAlertModal(true);
              } else {
                requestNotificationAccess();
              }
            }}
            style={{ 
              borderRadius: '50%', 
              padding: '0.75rem', 
              width: '45px', 
              height: '45px', 
              position: 'relative',
              borderColor: isMyTurn ? 'var(--success)' : 'var(--border-color)',
              color: isMyTurn ? 'var(--success)' : 'var(--text-main)'
            }} 
            title={isMyTurn ? "It's your turn! Click to view details" : "Queue Audio & Turn Notifications"}
          >
            <Bell size={20} />
            {isMyTurn && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '12px',
                height: '12px',
                background: 'var(--success)',
                borderRadius: '50%',
                border: '2px solid white'
              }}></span>
            )}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowEmergencyModal(true)}
            style={{ backgroundColor: 'var(--danger)', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
          >
            <AlertCircle size={20} />
            Emergency SOS
          </button>
        </div>
      </div>

      {/* Doctor Delay Alert Banner */}
      {delayInfo && (
        <div style={{ padding: '1rem 1.4rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem', color: '#92400e' }}>
          <AlertTriangle size={24} style={{ flexShrink: 0 }} />
          <div>
            <strong>Doctor Schedule Notice:</strong> {currentServing?.doctor} is running approx. <strong>+{delayInfo.minutes} minutes</strong> behind schedule due to <em>"{delayInfo.reason}"</em>. Your estimated call time has been automatically calibrated.
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="dashboard-main-grid">
        
        {/* Left Column: Smart Queue Tracker & Quick Actions */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          
          {/* Smart Live Queue Tracker */}
          {activeBooking ? (
            <div className="card interactive" style={{ 
              background: isMyTurn 
                ? 'linear-gradient(135deg, #ecfdf5, #ffffff)' 
                : 'linear-gradient(135deg, var(--bg-card), #f8fafc)', 
              border: isMyTurn ? '2px solid var(--success)' : '2px solid var(--primary-light)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Activity color={isMyTurn ? 'var(--success)' : 'var(--primary-light)'} />
                  <h2 style={{ margin: 0 }}>Live OPD Queue Tracker</h2>
                  <span style={{ 
                    background: 'rgba(16, 185, 129, 0.12)', 
                    color: 'var(--success)', 
                    fontSize: '0.72rem', 
                    padding: '0.2rem 0.55rem', 
                    borderRadius: 'var(--radius-full)', 
                    fontWeight: 700 
                  }}>
                    LIVE STREAM ACTIVE
                  </span>
                </div>

                {/* Quick Action Ribbon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setSelectedTokenPass({
                      ...activeBooking,
                      patientName: currentUser?.name || activeBooking.patientName,
                      roomNumber: activeBooking.roomNumber || 'OPD Room 102'
                    })}
                    className="btn btn-outline"
                    style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-color)' }}
                  >
                    <Ticket size={14} /> View Token Slip
                  </button>

                  {isCheckedIn ? (
                    <span style={{ 
                      background: 'rgba(16, 185, 129, 0.15)', 
                      color: 'var(--success)', 
                      padding: '0.35rem 0.9rem', 
                      borderRadius: 'var(--radius-full)', 
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      <BadgeCheck size={14} /> Checked-In
                    </span>
                  ) : (
                    <button 
                      onClick={handleSelfCheckin}
                      className="btn btn-primary"
                      style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      Self Check-In Now
                    </button>
                  )}

                  <button 
                    onClick={() => setCancelTarget(activeBooking)}
                    className="btn btn-outline"
                    style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    title="Cancel active appointment"
                  >
                    Release Turn
                  </button>
                </div>
              </div>

              {/* Turn alert banner */}
              {isMyTurn && (
                <div style={{ 
                  padding: '1rem 1.2rem', 
                  background: 'linear-gradient(135deg, #10b981, #059669)', 
                  color: 'white', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '1.2rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.8rem', 
                  fontWeight: 700,
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  animation: 'pulse 2s infinite'
                }}>
                  <CheckCircle size={24} /> 
                  <div>
                    <div style={{ fontSize: '1.05rem' }}>It's your turn! Please proceed to OPD Room immediately.</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500, opacity: 0.9 }}>Your token is actively being examined in {currentServing?.roomNumber || currentServing?.room_number || 'Consultation Room 102'}</div>
                  </div>
                </div>
              )}

              {/* 4 Metric Boxes */}
              <div className="dashboard-metrics-grid">
                <div style={{ background: 'white', padding: '1.2rem 0.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, margin: '0 0 0.4rem 0' }}>Your Token</p>
                  <p className="metric-value-text" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {displayPatientCode}
                  </p>
                </div>

                <div style={{ background: 'white', padding: '1.2rem 0.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, margin: '0 0 0.4rem 0' }}>Now Serving</p>
                  <p className="metric-value-text" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-color)', margin: 0 }}>
                    {displayServingCode}
                  </p>
                </div>

                <div style={{ background: 'white', padding: '1.2rem 0.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, margin: '0 0 0.4rem 0' }}>Queue Position</p>
                  <p className="metric-value-text" style={{ fontSize: '2rem', fontWeight: 800, color: isMyTurn ? 'var(--success)' : 'var(--primary-color)', margin: 0 }}>
                    {isMyTurn ? 'NOW' : isCheckedIn ? (queuePosition || 'Queue #1') : 'Check-In First'}
                  </p>
                </div>

                <div style={{ background: 'white', padding: '1.2rem 0.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, margin: '0 0 0.4rem 0' }}>Est. Call Time</p>
                  <p className="metric-value-text" style={{ fontSize: '2rem', fontWeight: 800, color: isMyTurn ? 'var(--success)' : 'var(--warning)', margin: 0 }}>
                    {isMyTurn ? 'Now' : isCheckedIn ? `${estimatedWaitMins + (delayInfo?.minutes || 0)}m` : 'Pending Check-In'}
                  </p>
                </div>
              </div>
              
              <div style={{ marginTop: '1.2rem', padding: '0.9rem 1.1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span><strong>Consultant:</strong> {activeBooking.doctor} ({activeBooking.dept}) • Scheduled for {activeBooking.date} at {activeBooking.timeSlot}</span>
                  <span style={{ color: 'var(--text-muted)' }}>Status: <strong style={{ color: 'var(--primary-color)' }}>{isCheckedIn ? 'Active in OPD Queue' : 'Reserved - Check-in on Arrival'}</strong></span>
                </p>
              </div>

              {/* Multi-Room Live Consultation Matrix */}
              {activeRooms && Object.keys(activeRooms).length > 0 && (
                <div style={{ marginTop: '1.2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Hospital OPD Consultation Suites Live Status
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multi-Room Sync</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
                    {Object.values(activeRooms).map((room) => {
                      const isMyDoc = activeBooking?.doctor && room.doctor_name?.toLowerCase().includes(activeBooking.doctor.toLowerCase());
                      const isServingMyToken = (room.token_code && activeBooking?.tokenCode && room.token_code === activeBooking.tokenCode) ||
                                               (room.token_number && activeBooking?.token && room.token_number === activeBooking.token);

                      return (
                        <div 
                          key={room.room_number} 
                          style={{ 
                            background: isServingMyToken ? '#ecfdf5' : isMyDoc ? '#eff6ff' : '#f8fafc', 
                            border: isServingMyToken ? '2px solid var(--success)' : isMyDoc ? '1px solid var(--primary-light)' : '1px solid var(--border-color)', 
                            borderRadius: 'var(--radius-sm)', 
                            padding: '0.75rem 0.9rem',
                            fontSize: '0.82rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                            <strong style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{room.room_number}</strong>
                            <span style={{ 
                              background: room.token_code === '—' ? '#f1f5f9' : 'rgba(59, 130, 246, 0.15)', 
                              color: room.token_code === '—' ? 'var(--text-muted)' : 'var(--primary-color)', 
                              padding: '0.15rem 0.45rem', 
                              borderRadius: '4px', 
                              fontWeight: 800, 
                              fontSize: '0.78rem' 
                            }}>
                              {room.token_code || '—'}
                            </span>
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {room.doctor_name}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem', fontSize: '0.72rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{room.dept}</span>
                            {isMyDoc && <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>Your Doctor</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ 
              background: 'linear-gradient(135deg, var(--bg-card), #f8fafc)', 
              border: '2px dashed var(--border-color)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <Ticket size={30} />
              </div>
              <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.35rem' }}>No Active OPD Token</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 1.4rem auto' }}>
                You do not have an active waiting token in the OPD queue. Book an appointment slot below to receive your digital token and track your turn live!
              </p>
              <button onClick={() => navigate('/appointments')} className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
                Book OPD Consultation
              </button>
            </div>
          )}

          {/* Quick Actions / Hospital Services */}
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Hospital Services</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { icon: <Search size={24}/>, title: 'Find Doctor', desc: 'Browse clinical roster', link: '/appointments' },
                { icon: <Calendar size={24}/>, title: 'Book Appointment', desc: 'Verified shift slots', link: '/appointments' },
                { icon: <Building2 size={24}/>, title: 'Facilities', desc: 'Campus & branches', link: '/hospitals' },
              ].map((service, idx) => (
                <div 
                  key={idx} 
                  className="card interactive" 
                  onClick={() => navigate(service.link)}
                  style={{ textAlign: 'center', padding: '1.8rem 1rem', cursor: 'pointer' }}
                >
                  <div style={{ 
                    width: '54px', height: '54px', 
                    borderRadius: '50%', 
                    background: 'var(--bg-light)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    margin: '0 auto 1rem auto',
                    color: 'var(--primary-light)'
                  }}>
                    {service.icon}
                  </div>
                  <h4 style={{ marginBottom: '0.3rem' }}>{service.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Visits with Reschedule & Cancellation */}
        <div style={{ display: 'grid', gap: '2rem', alignContent: 'start' }}>
          
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>My Consultations</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Personal visits for {currentUser?.name}
                </span>
              </div>
              <button onClick={() => navigate('/appointments')} className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                + Book Visit
              </button>
            </div>

            {userAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <Calendar size={32} style={{ opacity: 0.4, marginBottom: '0.6rem' }} />
                <p style={{ margin: 0, fontSize: '0.88rem' }}>No consultation records found for this account.</p>
                <button 
                  onClick={() => navigate('/appointments')}
                  className="btn btn-outline"
                  style={{ marginTop: '0.8rem', fontSize: '0.8rem' }}
                >
                  Schedule First Appointment
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {userAppointments.map((apt) => {
                  const isCancelled = apt.status === 'Cancelled';
                  const isCheckedInApt = apt.checkedIn || apt.status === 'CheckedIn';
                  const displayCode = apt.tokenCode || (apt.token ? `#${apt.token}` : '#430');

                  return (
                    <div 
                      key={apt.id}
                      style={{ 
                        border: isCancelled ? '1px dashed #cbd5e1' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        background: isCancelled ? '#f8fafc' : 'white',
                        opacity: isCancelled ? 0.6 : 1
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem', display: 'block' }}>{apt.doctor}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{apt.dept}</span>
                        </div>
                        <span style={{ 
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          background: isCancelled ? '#fee2e2' : isCheckedInApt ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                          color: isCancelled ? 'var(--danger)' : isCheckedInApt ? 'var(--success)' : 'var(--primary-color)'
                        }}>
                          {isCancelled ? 'Cancelled' : isCheckedInApt ? 'In Queue' : 'Confirmed'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <Clock size={13} /> {apt.date} • {apt.timeSlot}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                        <span>Token: <strong style={{ color: 'var(--primary-color)' }}>{displayCode}</strong></span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Ref: {apt.bookingReference || 'CL-OPD'}</span>
                      </div>

                      {/* Action buttons for active bookings */}
                      {!isCancelled && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                          <button 
                            onClick={() => handleOpenReschedule(apt)}
                            className="btn btn-outline" 
                            style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                          >
                            Reschedule
                          </button>
                          <button 
                            onClick={() => setCancelTarget(apt)}
                            className="btn btn-outline" 
                            style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.78rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {isCancelled && apt.cancelReason && (
                        <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Reason: <em>{apt.cancelReason}</em>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* High-Priority Turn Alert Modal */}
      {isMyTurn && showTurnAlertModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '1rem',
          animation: 'fadeIn 0.25s ease'
        }}>
          <div className="card" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '2.2rem',
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 25px 60px -15px rgba(16, 185, 129, 0.4)',
            border: '3px solid var(--success)',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Blinking Call Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.2rem',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-full)',
              color: 'var(--success)',
              fontWeight: 800,
              fontSize: '0.85rem',
              marginBottom: '1.2rem',
              letterSpacing: '0.05em'
            }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
              DOCTOR IS CALLING YOU NOW
            </div>

            <h1 style={{ fontSize: '2.1rem', margin: '0 0 0.5rem 0', color: 'var(--text-main)', lineHeight: 1.2 }}>
              It's Your Turn!
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.6rem' }}>
              Please proceed immediately to your designated consultation room.
            </p>

            {/* Token & Room Highlight Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '1.6rem 1rem',
              marginBottom: '1.6rem',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)'
            }}>
              <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.9, fontWeight: 700, marginBottom: '0.3rem' }}>
                Assigned Token
              </div>
              <div style={{ fontSize: '3.4rem', fontWeight: 900, lineHeight: 1, letterSpacing: '0.02em', marginBottom: '0.8rem' }}>
                {displayPatientCode}
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '0.55rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '1.05rem',
                fontWeight: 700
              }}>
                <MapPin size={18} />
                {currentServing?.roomNumber || currentServing?.room_number || 'OPD Room 102'}
                <span style={{ opacity: 0.85, fontWeight: 500, fontSize: '0.9rem' }}>
                  ({currentServing?.doctor || currentServing?.doctor_name || 'Dr. Sarah Jenkins'})
                </span>
              </div>
            </div>

            {/* Interactive Audio & Confirmation Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <button
                onClick={() => {
                  hospitalAudio.announceToken({
                    tokenCode: displayPatientCode,
                    patientName: currentUser?.name || activeBooking?.patientName,
                    roomNumber: currentServing?.roomNumber || currentServing?.room_number || 'OPD Room 102'
                  });
                  triggerToast('Re-announcing token chime...');
                }}
                className="btn btn-outline"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  fontSize: '0.92rem',
                  color: 'var(--text-main)'
                }}
              >
                <Volume2 size={18} color="var(--primary-color)" /> Replay Voice Chime Announcement
              </button>

              <button
                onClick={() => {
                  setShowTurnAlertModal(false);
                  triggerToast('Proceeding to consultation room. Best wishes!');
                }}
                className="btn btn-primary"
                style={{
                  background: 'var(--success)',
                  borderColor: 'var(--success)',
                  padding: '0.85rem',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                I Am Proceeding to Room Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Digital Token Pass Slip Modal */}
      {selectedTokenPass && (
        <TokenPassModal 
          tokenData={selectedTokenPass} 
          onClose={() => setSelectedTokenPass(null)} 
        />
      )}
    </div>
  );
}

export default HomeDashboard;
