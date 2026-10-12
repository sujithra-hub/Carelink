import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Search, Stethoscope, MapPin, CheckCircle, AlertTriangle, ShieldCheck, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCareLink } from '../context/CareLinkContext';
import { api } from '../services/api';

const DEFAULT_DOCTORS = [
  { id: 1, name: 'Dr. Sarah Jenkins', dept: 'Cardiology', exp: '12 Years', rating: 4.9, slots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM'], consultation_fee: '$180.00' },
  { id: 2, name: 'Dr. Michael Chen', dept: 'General Medicine', exp: '8 Years', rating: 4.7, slots: ['09:30 AM', '11:00 AM', '01:30 PM', '03:15 PM'], consultation_fee: '$120.00' },
  { id: 3, name: 'Dr. Emily Blunt', dept: 'Pediatrics', exp: '15 Years', rating: 4.9, slots: ['09:30 AM', '01:00 PM', '02:30 PM', '04:30 PM'], consultation_fee: '$150.00' },
  { id: 4, name: 'Dr. Robert Hayes', dept: 'Orthopedics', exp: '11 Years', rating: 4.8, slots: ['10:00 AM', '11:30 AM', '03:00 PM'], consultation_fee: '$160.00' }
];

export default function AppointmentBooking() {
  const { activeHospital, appointments, bookAppointment } = useCareLink();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Available doctors for the active hospital facility
  const hospitalDoctors = (activeHospital?.doctors && activeHospital.doctors.length > 0) 
    ? activeHospital.doctors 
    : DEFAULT_DOCTORS;

  const [selectedDoc, setSelectedDoc] = useState(hospitalDoctors[0] || DEFAULT_DOCTORS[0]);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [dynamicSlots, setDynamicSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [notes, setNotes] = useState('');

  // Update selected doctor when hospital branch changes
  useEffect(() => {
    if (hospitalDoctors.length > 0) {
      setSelectedDoc(hospitalDoctors[0]);
      setSelectedSlot('');
    }
  }, [activeHospital]);

  // Load dynamic slots from server scheduling engine
  useEffect(() => {
    if (!selectedDoc) return;
    let isCurrent = true;
    setLoadingSlots(true);

    api.getDoctorSlots(selectedDoc.id, selectedDate)
      .then(res => {
        if (isCurrent && res.success && res.data?.slots) {
          setDynamicSlots(res.data.slots);
        } else if (isCurrent) {
          // Fallback to doctor's configured slots
          setDynamicSlots((selectedDoc.slots || []).map(s => ({ slot: s, available: true })));
        }
      })
      .catch(() => {
        if (isCurrent) {
          setDynamicSlots((selectedDoc.slots || []).map(s => ({ slot: s, available: true })));
        }
      })
      .finally(() => {
        if (isCurrent) setLoadingSlots(false);
      });

    return () => { isCurrent = false; };
  }, [selectedDoc, selectedDate]);

  // Check if slot is already reserved in state
  const isSlotBooked = (docName, slot) => {
    return appointments.some(
      a => a.doctor === docName && a.date === selectedDate && a.timeSlot === slot && a.status !== 'Cancelled'
    );
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    setBookingError('');

    if (!selectedDoc || !selectedSlot || !selectedDate) {
      setBookingError('Please choose a doctor, date, and time slot.');
      return;
    }

    try {
      const booked = bookAppointment({
        doctor: selectedDoc,
        date: selectedDate,
        slot: selectedSlot,
        dept: selectedDoc.dept,
        notes
      });
      setConfirmedBooking(booked);
    } catch (err) {
      setBookingError(err.message || 'Error reserving this appointment slot.');
    }
  };

  const filteredDocs = hospitalDoctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.dept.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All Departments' || doc.dept === deptFilter;
    return matchesSearch && matchesDept;
  });

  const availableDepts = ['All Departments', ...(activeHospital?.departments || ['Cardiology', 'General Medicine', 'Pediatrics', 'Orthopedics'])];

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gap: '2rem' }}>
      
      {/* Confirmation Success Modal */}
      {confirmedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '520px', width: '92%', padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
              <CheckCircle size={36} />
            </div>
            
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>Appointment Confirmed!</h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1.2rem' }}>
              <Ticket size={14} /> Booking Ref: {confirmedBooking.bookingReference || 'CL-2026-8910'}
            </div>

            <div style={{ background: 'var(--bg-light)', padding: '1.4rem', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '1.4rem', display: 'grid', gap: '0.8rem', fontSize: '0.9rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Token:</span>
                <strong style={{ color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                  {confirmedBooking.tokenCode || `#${confirmedBooking.token}`}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Scheduled Time:</span>
                <strong>{confirmedBooking.date} at {confirmedBooking.timeSlot}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Expected Check-In:</span>
                <strong style={{ color: 'var(--warning)' }}>15 mins prior (Cutoff)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Doctor & Specialty:</span>
                <strong>{confirmedBooking.doctor} ({confirmedBooking.dept})</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Hospital Facility:</span>
                <strong style={{ textAlign: 'right' }}>{confirmedBooking.hospitalName}</strong>
              </div>
            </div>

            <div style={{ padding: '0.8rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-main)' }}>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} color="var(--success)" />
                <strong>Arrival Guidance:</strong> Present this booking reference at the reception kiosk to activate your live OPD consultation queue place.
              </p>
            </div>

            <div style={{ display: 'grid', gap: '0.8rem' }}>
              <button className="btn btn-primary" onClick={() => navigate('/')} style={{ width: '100%', padding: '0.85rem' }}>
                Track Live OPD Queue Status
              </button>
              <button className="btn btn-outline" onClick={() => setConfirmedBooking(null)}>
                Book Another Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Main Selection Area */}
        <div style={{ display: 'grid', gap: '1.8rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>Book an Appointment</h1>
            <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} color="var(--primary-light)" />
              {activeHospital?.name || 'CareLink Facility'} • Verified doctor shift schedule
            </p>
          </div>

          {/* Search & Filter */}
          <div className="card" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-light)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
              <input 
                type="text" 
                placeholder="Search doctors by name or clinical specialty..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--text-main)' }} 
              />
            </div>
            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none', background: 'white' }}
            >
              {availableDepts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Doctor List */}
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredDocs.map(doc => {
              const isSelected = selectedDoc?.id === doc.id;
              const duration = doc.slot_duration_mins || doc.schedule?.slotDuration || 30;
              return (
                <div 
                  key={doc.id} 
                  className={`card interactive ${isSelected ? 'selected' : ''}`}
                  onClick={() => { setSelectedDoc(doc); setSelectedSlot(''); }}
                  style={{ 
                    padding: '1.3rem', 
                    cursor: 'pointer', 
                    border: isSelected ? '2px solid var(--primary-light)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(59, 130, 246, 0.03)' : 'var(--bg-card)',
                    display: 'grid',
                    gridTemplateColumns: '70px 1fr auto',
                    gap: '1.2rem',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-light)' }}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name.replace(' ', '')}`} alt={doc.name} style={{ width: '100%', height: '100%' }} />
                  </div>
                  
                  <div>
                    <h3 style={{ margin: '0 0 0.2rem 0', color: 'var(--text-main)', fontSize: '1.15rem' }}>{doc.name}</h3>
                    <p style={{ color: 'var(--primary-light)', fontWeight: 600, margin: '0 0 0.4rem 0', fontSize: '0.88rem' }}>
                      {doc.dept} • {doc.specialization || 'Consultant Specialist'}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Stethoscope size={13}/> {doc.experience || '8 Years'} Exp</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--warning)' }}>★ {doc.rating || 4.8}</span>
                      <span>Room: <strong>{doc.room_number || 'OPD 1'}</strong></span>
                      <span>Slot: <strong>{duration}m</strong></span>
                    </div>
                  </div>

                  <div>
                    <button 
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`} 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', pointerEvents: 'none' }}
                    >
                      {isSelected ? 'Selected' : 'Select Doctor'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="card glass" style={{ position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
            Consultation Booking
          </h3>
          
          {bookingError && (
            <div style={{ padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={16} /> {bookingError}
            </div>
          )}

          {!selectedDoc ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              <CalendarIcon size={44} style={{ opacity: 0.3, marginBottom: '0.8rem' }} />
              <p>Please select a doctor to view availability.</p>
            </div>
          ) : (
            <form onSubmit={handleConfirm} className="animate-fade-in" style={{ display: 'grid', gap: '1.2rem' }}>
              
              {/* Date Selection */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem' }}>Select Consultation Date</label>
                <input 
                  type="date" 
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}
                />
              </div>

              {/* Dynamic Time Slots */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    Available Time Slots
                  </label>
                  {loadingSlots && <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>Checking availability...</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {dynamicSlots.map(item => {
                    const slotString = typeof item === 'string' ? item : item.slot;
                    const isTaken = isSlotBooked(selectedDoc.name, slotString) || (item.available === false);
                    const isSelected = selectedSlot === slotString;
                    
                    return (
                      <button 
                        key={slotString}
                        type="button"
                        disabled={isTaken}
                        onClick={() => setSelectedSlot(slotString)}
                        style={{
                          padding: '0.7rem 0.5rem',
                          background: isSelected 
                            ? 'var(--primary-color)' 
                            : isTaken 
                              ? '#f1f5f9' 
                              : 'var(--bg-light)',
                          color: isSelected 
                            ? 'white' 
                            : isTaken 
                              ? '#94a3b8' 
                              : 'var(--text-main)',
                          border: isSelected ? 'none' : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: isTaken ? 'not-allowed' : 'pointer',
                          fontWeight: 500,
                          fontSize: '0.82rem',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem',
                          textDecoration: isTaken ? 'line-through' : 'none'
                        }}
                      >
                        <Clock size={13} /> {slotString}
                        {isTaken && <span style={{ fontSize: '0.65rem' }}>(Reserved)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem' }}>Symptoms / Notes (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Chest tightness, routine cardiology checkup"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ padding: '0.9rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 'var(--radius-sm)', display: 'grid', gap: '0.4rem' }}>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Consultation Fee:</span> <strong>{selectedDoc.consultation_fee || '$150.00'}</strong>
                </p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Facility:</span> <strong>{activeHospital?.name}</strong>
                </p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Room:</span> <strong>{selectedDoc.room_number || 'OPD Room 102'}</strong>
                </p>
              </div>

              <button 
                type="submit"
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.9rem' }}
                disabled={!selectedSlot}
              >
                Confirm Reservation
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
