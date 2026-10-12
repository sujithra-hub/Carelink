import React, { useState } from 'react';
import { MapPin, Phone, Activity, Star, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCareLink } from '../context/CareLinkContext';

export default function HospitalSelection() {
  const { hospitals, activeHospital, selectHospital, queue } = useCareLink();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSelect = (hospitalId) => {
    selectHospital(hospitalId);
    navigate('/');
  };

  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.departments.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gap: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem', padding: '1.5rem 0' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>
          Select Medical <span className="gradient-text">Facility</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '620px', margin: '0 auto' }}>
          Choose a hospital to browse doctor schedules, reserve appointments, and monitor real-time OPD smart queue tokens.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: 'white', 
          padding: '0.6rem 1.2rem', 
          borderRadius: 'var(--radius-full)', 
          boxShadow: 'var(--shadow-sm)',
          width: '100%',
          maxWidth: '520px',
          border: '1px solid var(--border-color)'
        }}>
          <Activity size={20} color="var(--primary-light)" style={{ marginRight: '0.6rem' }} />
          <input 
            type="text" 
            placeholder="Search by facility name, address, or medical department..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              border: 'none', 
              outline: 'none', 
              width: '100%', 
              fontSize: '0.95rem',
              color: 'var(--text-main)',
              background: 'transparent'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {filteredHospitals.map((hospital) => {
          const isCurrent = activeHospital?.id === hospital.id;

          return (
            <div 
              key={hospital.id} 
              className="card interactive" 
              style={{ 
                padding: 0, 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column',
                border: isCurrent ? '2px solid var(--primary-light)' : '1px solid var(--border-color)',
                boxShadow: isCurrent ? '0 10px 25px -5px rgba(59, 130, 246, 0.2)' : 'var(--shadow-md)'
              }}
            >
              <div style={{ height: '190px', width: '100%', position: 'relative' }}>
                <img src={hospital.image} alt={hospital.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                <div style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem', 
                  background: 'rgba(255,255,255,0.95)', 
                  padding: '0.3rem 0.6rem', 
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--warning)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <Star size={14} fill="currentColor" /> {hospital.rating}
                </div>

                {isCurrent && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'var(--primary-color)',
                    color: 'white',
                    padding: '0.3rem 0.7rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <Check size={14} /> ACTIVE FACILITY
                  </div>
                )}
              </div>
              
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ marginBottom: '0.4rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{hospital.name}</h3>
                  <span style={{ color: 'var(--primary-light)', fontSize: '0.85rem', fontWeight: 600 }}>
                    {hospital.type}
                  </span>
                </div>

                <div style={{ display: 'grid', gap: '0.4rem', margin: '0.8rem 0 1.2rem 0' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={15} color="var(--primary-light)" /> {hospital.address}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={15} color="var(--primary-light)" /> {hospital.phone}
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>Key Specialties:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {hospital.departments.map(dept => (
                      <span key={dept} style={{ 
                        background: 'var(--bg-light)', 
                        padding: '0.2rem 0.55rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)'
                      }}>{dept}</span>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <strong>{isCurrent ? queue.length + 12 : hospital.activeTokens}</strong> active queue tokens
                    </span>
                  </div>
                  
                  <button 
                    className={`btn ${isCurrent ? 'btn-outline' : 'btn-primary'}`} 
                    onClick={() => handleSelect(hospital.id)} 
                    style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
                  >
                    {isCurrent ? 'Selected' : <>Select <ChevronRight size={15} /></>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
