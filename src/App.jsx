import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { CareLinkProvider, useCareLink } from './context/CareLinkContext';
import HomeDashboard from './pages/HomeDashboard';
import HospitalSelection from './pages/HospitalSelection';
import StaffDashboard from './pages/StaffDashboard';
import PatientProfile from './pages/PatientProfile';
import HospitalAdmin from './pages/HospitalAdmin';
import AppointmentBooking from './pages/AppointmentBooking';
import AuthLogin from './pages/AuthLogin';

function NavigationBar() {
  const location = useLocation();
  const { currentUser, logout, activeHospital, patientProfiles, loginAsPatient } = useCareLink();

  return (
    <nav className="glass nav-bar-responsive">
      <div className="nav-top-row">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            boxShadow: 'var(--shadow-sm)',
            flexShrink: 0
          }}>
            +
          </div>
          <div>
            <h2 className="gradient-text" style={{ margin: 0, fontSize: '1.35rem', lineHeight: 1.1 }}>CareLink</h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{activeHospital?.name || 'Smart OPD'}</span>
          </div>
        </Link>
      </div>
      
      <div className="nav-links-container">
        {currentUser && (
          <>
            <Link to="/" style={{ color: location.pathname === '/' ? 'var(--primary-color)' : 'var(--text-main)', fontWeight: 600 }}>
              Dashboard
            </Link>
            <Link to="/appointments" style={{ color: location.pathname === '/appointments' ? 'var(--primary-color)' : 'var(--text-main)', fontWeight: 600 }}>
              Book Appointment
            </Link>
            <Link to="/hospitals" style={{ color: location.pathname === '/hospitals' ? 'var(--primary-color)' : 'var(--text-main)', fontWeight: 600 }}>
              Facilities
            </Link>
            
            {(currentUser.role === 'staff' || currentUser.role === 'admin') && (
              <Link to="/staff" style={{ 
                color: location.pathname === '/staff' ? 'var(--accent-color)' : 'var(--text-main)', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
                Staff Console
              </Link>
            )}
            
            {currentUser.role === 'admin' && (
              <Link to="/admin" style={{ color: location.pathname === '/admin' ? 'var(--danger)' : 'var(--text-main)', fontWeight: 600 }}>
                Admin Setup
              </Link>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
              <Link to="/profile" title="Patient Health Records">
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--border-color)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: location.pathname === '/profile' ? '2px solid var(--primary-color)' : '2px solid transparent',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <img src={currentUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} alt="User Avatar" style={{ width: '100%', height: '100%' }} />
                </div>
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{currentUser.name}</span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.04em',
                  color: currentUser.role === 'admin' ? 'var(--danger)' : currentUser.role === 'staff' ? 'var(--accent-color)' : 'var(--primary-light)',
                  fontWeight: 700 
                }}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            {currentUser.role === 'patient' && patientProfiles && (
              <select
                value={currentUser.id}
                onChange={(e) => loginAsPatient(e.target.value)}
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.78rem',
                  background: 'white',
                  fontWeight: 600,
                  color: 'var(--primary-color)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
                title="Switch Active Patient Persona"
              >
                {patientProfiles.map(p => (
                  <option key={p.id} value={p.id}>Switch: {p.name}</option>
                ))}
              </select>
            )}
            
            <button onClick={logout} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}>
              Logout
            </button>
          </>
        )}
        
        {!currentUser && (
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem' }}>
            Login to CareLink
          </Link>
        )}
      </div>
    </nav>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useCareLink();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Your current account role (<strong>{currentUser.role}</strong>) does not have authorization to view this module.
          </p>
          <Link to="/" className="btn btn-primary">Return to Patient Dashboard</Link>
        </div>
      </div>
    );
  }

  return children;
}

function MainApp() {
  return (
    <div className="app-container">
      <NavigationBar />

      <main className="main-content">
        <Routes>
          <Route path="/login" element={<AuthLogin />} />
          
          <Route path="/" element={<ProtectedRoute allowedRoles={['patient', 'staff', 'admin']}><HomeDashboard /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute allowedRoles={['patient', 'staff', 'admin']}><AppointmentBooking /></ProtectedRoute>} />
          <Route path="/hospitals" element={<ProtectedRoute allowedRoles={['patient', 'staff', 'admin']}><HospitalSelection /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['patient', 'staff', 'admin']}><PatientProfile /></ProtectedRoute>} />
          
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><HospitalAdmin /></ProtectedRoute>} />
          
          <Route path="*" element={<div style={{ textAlign: 'center', padding: '4rem' }}><h2>Page Not Found</h2></div>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CareLinkProvider>
      <MainApp />
    </CareLinkProvider>
  );
}
