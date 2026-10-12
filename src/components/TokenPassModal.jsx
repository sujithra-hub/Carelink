import React from 'react';
import { Ticket, X, Printer, CheckCircle, Clock, MapPin, User, Stethoscope, AlertTriangle } from 'lucide-react';

export default function TokenPassModal({ tokenData, onClose }) {
  if (!tokenData) return null;

  const handlePrint = () => {
    window.print();
  };

  const isEmergency = tokenData.priority === 'EMERGENCY';
  const isSenior = tokenData.priority === 'SENIOR';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '1rem'
    }}>
      <div className="card" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '2rem',
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'var(--primary-color)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              +
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>CareLink OPD Token Pass</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Outpatient Access Slip</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Big Token Display Box */}
        <div style={{
          background: isEmergency ? '#fef2f2' : 'linear-gradient(135deg, #eff6ff, #f8fafc)',
          border: isEmergency ? '2px dashed var(--danger)' : '2px dashed var(--primary-light)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem 1rem',
          textAlign: 'center',
          marginBottom: '1.4rem'
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Assigned Queue Token
          </span>
          <h1 style={{
            fontSize: '3.8rem',
            margin: '0.2rem 0',
            fontWeight: 900,
            color: isEmergency ? 'var(--danger)' : 'var(--primary-color)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}>
            {tokenData.tokenCode || `#${tokenData.token || tokenData.token_number}`}
          </h1>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
            <span style={{
              background: isEmergency ? 'rgba(239, 68, 68, 0.15)' : isSenior ? 'rgba(234, 179, 8, 0.15)' : 'rgba(59, 130, 246, 0.1)',
              color: isEmergency ? 'var(--danger)' : isSenior ? '#b45309' : 'var(--primary-color)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {tokenData.priority || 'ROUTINE'}
            </span>
            <span style={{ background: '#f1f5f9', color: 'var(--text-main)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
              Ref: {tokenData.bookingReference || tokenData.booking_reference || 'CL-2026-OPD'}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gap: '0.7rem', fontSize: '0.88rem', marginBottom: '1.5rem', background: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Patient Name:</span>
            <strong>{tokenData.patientName || tokenData.patient_name || tokenData.name}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Department:</span>
            <strong>{tokenData.dept || tokenData.department || 'Cardiology'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Consultant:</span>
            <strong>{tokenData.doctor || tokenData.doctor_name || 'Dr. Sarah Jenkins'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Assigned Room:</span>
            <strong style={{ color: 'var(--accent-color)' }}>{tokenData.roomNumber || tokenData.room_number || 'OPD Room 102'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Issued Time:</span>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Barcode Graphic Simulation */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', opacity: 0.85 }}>
          <div style={{ letterSpacing: '4px', fontFamily: 'monospace', fontWeight: 900, fontSize: '1.2rem', color: '#1e293b' }}>
            ||| | |||| | |||||| || | || ||||
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            SCAN FOR LIVE QUEUE POSITION UPDATES
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1, fontSize: '0.88rem' }}>
            Close
          </button>
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Printer size={16} /> Print Token Slip
          </button>
        </div>
      </div>
    </div>
  );
}
