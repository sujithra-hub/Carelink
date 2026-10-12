import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Shield, Stethoscope, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCareLink } from '../context/CareLinkContext';

export default function AuthLogin() {
  const { login, currentUser } = useCareLink();
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('demo@patient.carelink.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // If already authenticated, redirect
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') navigate('/admin');
      else if (currentUser.role === 'staff') navigate('/staff');
      else navigate('/');
    }
  }, [currentUser, navigate]);

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setEmail(`demo@${selectedRole}.carelink.com`);
    setErrorMsg('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    // Simulate authentication verification
    setTimeout(() => {
      setIsLoading(false);
      const user = login(role, email);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else navigate('/');
    }, 300);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
      
      <div className="card glass" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative Background Blur */}
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--primary-light)', filter: 'blur(100px)', opacity: 0.25, zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--accent-color)', filter: 'blur(100px)', opacity: 0.25, zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              padding: '0.4rem 0.8rem', 
              borderRadius: 'var(--radius-full)', 
              background: 'rgba(59, 130, 246, 0.1)', 
              color: 'var(--primary-light)', 
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '0.8rem' 
            }}>
              CareLink Health Identity
            </div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>Portal Sign In</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Select your account type to access OPD services</p>
          </div>

          {/* Role Preset Tabs */}
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Select Account Persona:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-light)', padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}>
              {[
                { id: 'patient', label: 'Patient', icon: <User size={15}/> },
                { id: 'staff', label: 'Doctor/Staff', icon: <Stethoscope size={15}/> },
                { id: 'admin', label: 'Admin', icon: <Shield size={15}/> }
              ].map(r => (
                <button 
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleChange(r.id)}
                  style={{
                    flex: 1, padding: '0.6rem 0.4rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    fontWeight: 600, fontSize: '0.85rem',
                    background: role === r.id ? 'white' : 'transparent',
                    color: role === r.id ? 'var(--primary-color)' : 'var(--text-muted)',
                    boxShadow: role === r.id ? 'var(--shadow-sm)' : 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {r.icon} {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Patient Switcher Card if Patient role is active */}
          {role === 'patient' && (
            <div style={{ marginBottom: '1.5rem', background: 'rgba(59, 130, 246, 0.04)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
                Quick Login as Patient Account:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                {[
                  { id: 'pat-101', name: 'Alex Robertson', email: 'alex@patient.carelink.com', desc: 'Cardiology (Token C-428)', badge: 'In Queue' },
                  { id: 'pat-102', name: 'Maria Garcia', email: 'maria@patient.carelink.com', desc: 'Gen Medicine (GM-431)', badge: 'In Queue' },
                  { id: 'pat-103', name: 'David Kim', email: 'david@patient.carelink.com', desc: 'Orthopedics (O-435)', badge: 'Needs Check-In' },
                  { id: 'pat-104', name: 'Sarah Connor', email: 'sarah@patient.carelink.com', desc: 'New Patient (No active token)', badge: 'Fresh Booking' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setEmail(p.email);
                      login('patient', p.email, p.id);
                      navigate('/');
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '0.65rem 0.8rem',
                      background: email === p.email ? 'rgba(59, 130, 246, 0.12)' : 'white',
                      border: email === p.email ? '1.5px solid var(--primary-color)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{p.name}</strong>
                      <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: p.id === 'pat-104' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: p.id === 'pat-104' ? 'var(--accent-color)' : 'var(--success)', fontWeight: 700 }}>
                        {p.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {p.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{ padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.88rem' }}>Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-light)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <User size={18} color="var(--text-muted)" style={{ marginRight: '0.8rem' }} />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.88rem' }}>Password</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-light)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <Lock size={18} color="var(--text-muted)" style={{ marginRight: '0.8rem' }} />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--text-main)', fontSize: '0.95rem' }} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading}
              style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
            >
              {isLoading ? 'Authenticating...' : <>Sign In as {role.toUpperCase()} <ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', padding: '0.8rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} color="var(--success)" />
            <span>Session persistence active. State synchronizes across open tabs.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
