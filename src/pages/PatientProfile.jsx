import React, { useState } from 'react';
import { User, Activity, FileText, Calendar, MapPin, Droplet, Ruler, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { useCareLink } from '../context/CareLinkContext';

export default function PatientProfile() {
  const { currentUser, userAppointments = [] } = useCareLink();
  const [downloadModal, setDownloadModal] = useState(null);
  const [downloadNotice, setDownloadNotice] = useState('');

  const patient = currentUser || {
    name: 'Alex Robertson',
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
      { id: 1, title: 'Complete Blood Count (CBC)', date: 'Oct 10, 2023', doctor: 'Dr. Sarah Jenkins' },
      { id: 2, title: 'Chest X-Ray', date: 'Jun 15, 2023', doctor: 'Dr. Michael Chen' }
    ],
    pastVisits: [
      { id: 1, date: 'Oct 10, 2023', hosp: 'City Central Hospital', dept: 'Cardiology', doc: 'Dr. Sarah Jenkins', status: 'Completed' },
      { id: 2, date: 'Aug 22, 2023', hosp: 'Green Valley Medical', dept: 'General Medicine', doc: 'Dr. Emily Blunt', status: 'Completed' }
    ]
  };

  const handleDownload = (report) => {
    setDownloadModal(report);
  };

  const confirmDownload = () => {
    setDownloadModal(null);
    setDownloadNotice(`Secure PDF generated for ${downloadModal.title}. Download verified.`);
    setTimeout(() => setDownloadNotice(''), 4000);
  };

  // Combine past visits with newly booked appointments for this patient
  const combinedVisits = [
    ...(userAppointments || []).map(a => ({
      date: a.date,
      hosp: a.hospitalName,
      dept: a.dept,
      doc: a.doctor,
      status: a.status
    })),
    ...(patient.pastVisits || [])
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gap: '2rem' }}>
      
      {/* Toast Notification */}
      {downloadNotice && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'var(--text-main)',
          color: 'white',
          padding: '0.8rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.9rem'
        }}>
          <CheckCircle size={18} color="var(--success)" />
          {downloadNotice}
        </div>
      )}

      {/* Secure Report Verification Modal */}
      {downloadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <ShieldCheck size={32} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Secure Diagnostic Record Access</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.2rem' }}>
              Confirm retrieval of <strong>{downloadModal.title}</strong> issued by <strong>{downloadModal.doctor}</strong>.
            </p>
            <div style={{ padding: '0.8rem', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'left' }}>
              🔒 Authenticated Patient Access Token: <code>{currentUser?.id || 'pat-101'}-VALID</code>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button className="btn btn-outline" onClick={() => setDownloadModal(null)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={confirmDownload} style={{ flex: 1 }}>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Profile Section */}
      <div className="card glass" style={{ display: 'flex', gap: '2rem', alignItems: 'center', background: 'linear-gradient(to right, var(--bg-card), rgba(59, 130, 246, 0.05))', flexWrap: 'wrap' }}>
        <div style={{ width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden', border: '4px solid white', boxShadow: 'var(--shadow-md)' }}>
          <img src={patient.avatar || "https://images.unsplash.com/photo-1502767089025-6572583495b8?auto=format&fit=crop&w=200&q=80"} alt={patient.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem' }}>
            <h1 style={{ fontSize: '2.2rem', margin: 0 }}>{patient.name}</h1>
            <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600 }}>
              Verified Patient
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem 0', display: 'flex', gap: '1.2rem', fontSize: '0.9rem' }}>
            <span><User size={15} style={{ verticalAlign: 'text-bottom', marginRight: '0.3rem' }} /> {patient.gender || 'Male'}, {patient.age || 32} years</span>
            <span><MapPin size={15} style={{ verticalAlign: 'text-bottom', marginRight: '0.3rem' }} /> {patient.location || 'Metro City, NY'}</span>
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <span className="btn" style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-light)', color: 'var(--text-main)', fontSize: '0.85rem' }}>
              <Droplet size={15} color="var(--danger)" /> {patient.bloodGroup || 'O+'} Blood Group
            </span>
            <span className="btn" style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-light)', color: 'var(--text-main)', fontSize: '0.85rem' }}>
              <Ruler size={15} color="var(--primary-light)" /> {patient.height || '180cm'}, {patient.weight || '75kg'}
            </span>
          </div>
        </div>
        <div>
          <button className="btn btn-outline" onClick={() => alert('Profile editing is enabled for demographic fields.')}>
            Edit Profile
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Medical History Section */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
            <Activity color="var(--primary-color)" /> Medical History & Conditions
          </h3>
          
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {(patient.conditions || []).map(cond => (
              <div 
                key={cond.id} 
                style={{ 
                  padding: '1rem', 
                  background: cond.severity === 'warning' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)', 
                  borderRadius: 'var(--radius-sm)', 
                  borderLeft: `4px solid ${cond.severity === 'warning' ? 'var(--warning)' : 'var(--success)'}` 
                }}
              >
                <h4 style={{ margin: '0 0 0.2rem 0', color: 'var(--text-main)', fontSize: '0.95rem' }}>{cond.title}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{cond.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Medical Reports */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
            <FileText color="var(--accent-color)" /> Diagnostic Reports & Lab Results
          </h3>
          
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {(patient.reports || []).map((report) => (
              <div key={report.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.92rem' }}>{report.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{report.date} • Attending: {report.doctor}</p>
                </div>
                <button 
                  className="btn" 
                  onClick={() => handleDownload(report)}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem', background: 'white', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Download size={13} /> View PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Consultation History */}
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
          <Calendar color="var(--info)" /> Patient Consultations & History
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.8rem 0.5rem' }}>Date</th>
                <th style={{ padding: '0.8rem 0.5rem' }}>Hospital Facility</th>
                <th style={{ padding: '0.8rem 0.5rem' }}>Department</th>
                <th style={{ padding: '0.8rem 0.5rem' }}>Doctor</th>
                <th style={{ padding: '0.8rem 0.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {combinedVisits.map((visit, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.8rem 0.5rem', fontWeight: 600 }}>{visit.date}</td>
                  <td style={{ padding: '0.8rem 0.5rem' }}>{visit.hosp}</td>
                  <td style={{ padding: '0.8rem 0.5rem', color: 'var(--text-muted)' }}>{visit.dept}</td>
                  <td style={{ padding: '0.8rem 0.5rem' }}>{visit.doc}</td>
                  <td style={{ padding: '0.8rem 0.5rem' }}>
                    <span style={{ 
                      background: visit.status === 'Confirmed' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                      color: visit.status === 'Confirmed' ? 'var(--primary-light)' : 'var(--success)', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: 'var(--radius-full)', 
                      fontSize: '0.78rem', 
                      fontWeight: 600 
                    }}>
                      {visit.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
