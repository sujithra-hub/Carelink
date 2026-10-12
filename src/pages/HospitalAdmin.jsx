import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Activity, 
  Users, 
  Settings, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle, 
  Calendar, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Sliders, 
  Edit3, 
  Check, 
  Stethoscope,
  X
} from 'lucide-react';
import { useCareLink } from '../context/CareLinkContext';

export default function HospitalAdmin() {
  const { 
    organizations,
    hospitals, 
    activeHospital, 
    selectHospital, 
    updateBranchConfig,
    addDepartment,
    removeDepartment,
    addDoctor,
    updateDoctorSchedule
  } = useCareLink();

  const [activeTab, setActiveTab] = useState('profile');
  const [savedNotice, setSavedNotice] = useState('');

  // Find active organization & branches
  const activeOrg = organizations.find(o => (o.branches || []).some(b => b.id === activeHospital.id)) || organizations[0];
  const activeBranch = activeOrg?.branches?.find(b => b.id === activeHospital.id) || activeOrg?.branches?.[0];

  // Tab 1: Profile & Operating Policies Form
  const [branchName, setBranchName] = useState(activeBranch?.name || '');
  const [address, setAddress] = useState(activeBranch?.address || '');
  const [phone, setPhone] = useState(activeBranch?.phone || '');
  const [emergencyPhone, setEmergencyPhone] = useState(activeBranch?.emergency_phone || '911');
  const [operatingHours, setOperatingHours] = useState(activeBranch?.operating_hours || '08:00 AM - 08:00 PM');
  const [checkinCutoff, setCheckinCutoff] = useState(activeBranch?.checkin_cutoff_mins || 15);
  const [tokenPrefix, setTokenPrefix] = useState(activeBranch?.token_prefix || 'CC');
  const [walkinPolicy, setWalkinPolicy] = useState(activeBranch?.walkin_policy || 'ACCEPT_ALL');

  // Tab 2: Department Form
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptPrefix, setNewDeptPrefix] = useState('');

  // Tab 3: Doctor Add Form Modal
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docDept, setDocDept] = useState('Cardiology');
  const [docSpecialization, setDocSpecialization] = useState('');
  const [docFee, setDocFee] = useState('$150.00');
  const [docRoom, setDocRoom] = useState('OPD Room 101');
  const [docSlotDuration, setDocSlotDuration] = useState(30);

  // Doctor Schedule Edit State
  const [editingScheduleDoc, setEditingScheduleDoc] = useState(null);
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]);
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('17:00');

  // Tab 4: Queue Rules
  const [seniorPriority, setSeniorPriority] = useState(true);
  const [emergencyBypass, setEmergencyBypass] = useState(true);
  const [delayThreshold, setDelayThreshold] = useState(15);

  // Sync state whenever activeHospital changes
  useEffect(() => {
    if (activeBranch) {
      setBranchName(activeBranch.name || '');
      setAddress(activeBranch.address || '');
      setPhone(activeBranch.phone || '');
      setEmergencyPhone(activeBranch.emergency_phone || '911');
      setOperatingHours(activeBranch.operating_hours || '08:00 AM - 08:00 PM');
      setCheckinCutoff(activeBranch.checkin_cutoff_mins || 15);
      setTokenPrefix(activeBranch.token_prefix || 'CC');
      setWalkinPolicy(activeBranch.walkin_policy || 'ACCEPT_ALL');
    }
  }, [activeBranch]);

  const triggerToast = (msg) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(''), 3800);
  };

  const handleSaveBranchProfile = async (e) => {
    e.preventDefault();
    await updateBranchConfig(activeBranch.id, {
      name: branchName,
      address,
      phone,
      emergency_phone: emergencyPhone,
      operating_hours: operatingHours,
      checkin_cutoff_mins: Number(checkinCutoff),
      token_prefix: tokenPrefix,
      walkin_policy: walkinPolicy
    });
    triggerToast(`Branch configuration saved for ${branchName}!`);
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    await addDepartment(activeBranch.id, {
      name: newDeptName.trim(),
      code: newDeptCode.trim() || newDeptName.substring(0, 4).toUpperCase(),
      prefix: newDeptPrefix.trim() || newDeptName.substring(0, 1).toUpperCase()
    });
    setNewDeptName('');
    setNewDeptCode('');
    setNewDeptPrefix('');
    triggerToast(`Department "${newDeptName}" added to ${activeBranch.name}!`);
  };

  const handleRemoveDepartment = async (deptId, name) => {
    await removeDepartment(activeBranch.id, deptId);
    triggerToast(`Department "${name}" removed from this branch.`);
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    if (!docName.trim()) return;
    await addDoctor(activeBranch.id, {
      name: docName.trim(),
      dept: docDept,
      specialization: docSpecialization.trim() || 'Consultant Specialist',
      consultation_fee: docFee,
      room_number: docRoom,
      slot_duration_mins: Number(docSlotDuration)
    });
    setDocName('');
    setDocSpecialization('');
    setShowAddDoctorModal(false);
    triggerToast(`Dr. ${docName} added to ${activeBranch.name} roster!`);
  };

  const handleSaveDoctorSchedule = async () => {
    if (!editingScheduleDoc) return;
    await updateDoctorSchedule(editingScheduleDoc.id, {
      workingDays: selectedDays,
      startTime: shiftStart,
      endTime: shiftEnd,
      slotDurationMins: Number(docSlotDuration),
      consultationFee: docFee,
      roomNumber: docRoom
    });
    setEditingScheduleDoc(null);
    triggerToast(`Updated schedule & shift hours for ${editingScheduleDoc.name}!`);
  };

  const toggleDay = (dayNum) => {
    if (selectedDays.includes(dayNum)) {
      setSelectedDays(selectedDays.filter(d => d !== dayNum));
    } else {
      setSelectedDays([...selectedDays, dayNum].sort());
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const tabs = [
    { id: 'profile', label: 'Branch Profile & Hours', icon: <Building2 size={18} /> },
    { id: 'departments', label: 'Clinical Departments', icon: <Activity size={18} /> },
    { id: 'doctors', label: 'Doctor Roster & Shifts', icon: <Users size={18} /> },
    { id: 'queue', label: 'Queue Policies & Cutoffs', icon: <Sliders size={18} /> },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gap: '1.8rem' }}>
      
      {/* Toast Notice */}
      {savedNotice && (
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
          {savedNotice}
        </div>
      )}

      {/* Doctor Schedule Modal */}
      {editingScheduleDoc && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '520px', width: '92%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Configure Doctor Schedule</h3>
                <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {editingScheduleDoc.name} • {editingScheduleDoc.dept}
                </p>
              </div>
              <button onClick={() => setEditingScheduleDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Working Days
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {dayNames.map((day, idx) => {
                    const isSelected = selectedDays.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        style={{
                          padding: '0.45rem 0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                          background: isSelected ? 'var(--primary-color)' : 'var(--bg-light)',
                          color: isSelected ? 'white' : 'var(--text-main)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Shift Start</label>
                  <input 
                    type="time" 
                    value={shiftStart} 
                    onChange={(e) => setShiftStart(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Shift End</label>
                  <input 
                    type="time" 
                    value={shiftEnd} 
                    onChange={(e) => setShiftEnd(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Consultation Slot (mins)</label>
                  <select
                    value={docSlotDuration}
                    onChange={(e) => setDocSlotDuration(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'white' }}
                  >
                    <option value={15}>15 Minutes (Express)</option>
                    <option value={20}>20 Minutes (Standard)</option>
                    <option value={30}>30 Minutes (Comprehensive)</option>
                    <option value={45}>45 Minutes (Specialty)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Assigned OPD Room</label>
                  <input 
                    type="text"
                    value={docRoom}
                    onChange={(e) => setDocRoom(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Consultation Fee</label>
                <input 
                  type="text"
                  value={docFee}
                  onChange={(e) => setDocFee(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEditingScheduleDoc(null)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="button" onClick={handleSaveDoctorSchedule} className="btn btn-primary" style={{ flex: 1 }}>
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '92%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Stethoscope color="var(--primary-color)" /> Add Doctor to Roster
              </h3>
              <button onClick={() => setShowAddDoctorModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} style={{ display: 'grid', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Doctor Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Dr. Julian Croft"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Department</label>
                  <select 
                    value={docDept}
                    onChange={(e) => setDocDept(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'white' }}
                  >
                    {(activeBranch?.departments || []).map(d => (
                      <option key={d.id || d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Room Number</label>
                  <input 
                    type="text"
                    value={docRoom}
                    onChange={(e) => setDocRoom(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Specialization / Sub-specialty</label>
                <input 
                  type="text"
                  placeholder="e.g. Pediatric Pulmonologist"
                  value={docSpecialization}
                  onChange={(e) => setDocSpecialization(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Consultation Fee</label>
                  <input 
                    type="text"
                    value={docFee}
                    onChange={(e) => setDocFee(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Slot Duration</label>
                  <select
                    value={docSlotDuration}
                    onChange={(e) => setDocSlotDuration(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'white' }}
                  >
                    <option value={15}>15 Mins</option>
                    <option value={20}>20 Mins</option>
                    <option value={30}>30 Mins</option>
                    <option value={45}>45 Mins</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddDoctorModal(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hospital Organization & Multi-Branch Switcher Header */}
      <div className="card" style={{ padding: '1.4rem 1.8rem', background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.04) 0%, rgba(59, 130, 246, 0.08) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--primary-color)', background: 'rgba(59, 130, 246, 0.1)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                Multi-Tenant Hospital Workspace
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Org: <strong>{activeOrg?.name}</strong> ({activeOrg?.code})
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.9rem' }}>
              Facility Administration: {activeBranch?.name}
            </h1>
          </div>

          {/* Branch Selector Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Facility:</span>
            {hospitals.map(h => (
              <button
                key={h.id}
                onClick={() => selectHospital(h.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: h.id === activeHospital.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  background: h.id === activeHospital.id ? 'var(--primary-color)' : 'white',
                  color: h.id === activeHospital.id ? 'white' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s'
                }}
              >
                <Building2 size={14} />
                {h.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Admin Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.8rem', alignItems: 'start' }}>
        
        {/* Navigation Tabs */}
        <div className="card" style={{ padding: '0.8rem' }}>
          <h4 style={{ padding: '0.6rem 0.8rem', margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Configuration Wizard
          </h4>
          <nav style={{ display: 'grid', gap: '0.3rem', marginTop: '0.6rem' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  padding: '0.8rem 1rem',
                  border: 'none',
                  background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-main)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  transition: 'all 0.2s'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          <div style={{ margin: '1.5rem 0.8rem 0.5rem 0.8rem', padding: '0.9rem', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <p style={{ margin: '0 0 0.3rem 0', fontWeight: 700, color: 'var(--text-main)' }}>Tenant Isolation Active</p>
            Settings adjusted here apply exclusively to <strong>{activeBranch?.name}</strong>.
          </div>
        </div>

        {/* Tab 1: Branch Profile & Policies */}
        {activeTab === 'profile' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Branch Profile & Operating Policies</h2>
                <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Define physical facility parameters and operating windows
                </p>
              </div>
              <button className="btn btn-primary" onClick={handleSaveBranchProfile} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Save size={16} /> Save Branch Profile
              </button>
            </div>

            <form onSubmit={handleSaveBranchProfile} style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>Branch Campus Name</label>
                  <input 
                    type="text" 
                    value={branchName} 
                    onChange={(e) => setBranchName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>Emergency Hotline Phone</label>
                  <input 
                    type="text" 
                    value={emergencyPhone} 
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--danger)', color: 'var(--danger)', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>Reception Phone</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>Daily Operating Hours</label>
                  <input 
                    type="text" 
                    value={operatingHours} 
                    onChange={(e) => setOperatingHours(e.target.value)}
                    placeholder="e.g. 07:30 AM - 09:00 PM"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>Physical Campus Address</label>
                <textarea 
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ padding: '1.2rem', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.82rem' }}>Check-in Arrival Cutoff</label>
                  <select
                    value={checkinCutoff}
                    onChange={(e) => setCheckinCutoff(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'white' }}
                  >
                    <option value={10}>10 Mins Before Slot</option>
                    <option value={15}>15 Mins Before Slot</option>
                    <option value={20}>20 Mins Before Slot</option>
                    <option value={30}>30 Mins Before Slot</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.82rem' }}>Token Branch Prefix</label>
                  <input 
                    type="text"
                    value={tokenPrefix}
                    onChange={(e) => setTokenPrefix(e.target.value)}
                    placeholder="e.g. CC or GV"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.82rem' }}>Walk-in Acceptance Policy</label>
                  <select
                    value={walkinPolicy}
                    onChange={(e) => setWalkinPolicy(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'white' }}
                  >
                    <option value="ACCEPT_ALL">Accept All Walk-ins</option>
                    <option value="LIMITED_SLOTS">Limited Slots (Max 15/day)</option>
                    <option value="EMERGENCY_ONLY">Emergency Only</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Clinical Departments */}
        {activeTab === 'departments' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Clinical Departments ({activeBranch?.departments?.length || 0})</h2>
                <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Manage medical services and token prefixes for {activeBranch?.name}
                </p>
              </div>
            </div>

            {/* Add Department Form */}
            <form onSubmit={handleAddDepartment} style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <input 
                type="text"
                placeholder="Department Name (e.g. Neurology, ENT)..."
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                style={{ flex: 2, minWidth: '220px', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
              />
              <input 
                type="text"
                placeholder="Code (e.g. NEUR)"
                value={newDeptCode}
                onChange={(e) => setNewDeptCode(e.target.value)}
                style={{ flex: 1, minWidth: '100px', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
              />
              <input 
                type="text"
                placeholder="Prefix (e.g. N)"
                value={newDeptPrefix}
                onChange={(e) => setNewDeptPrefix(e.target.value)}
                style={{ width: '90px', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
              />
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Plus size={16} /> Add Department
              </button>
            </form>

            {/* Department List */}
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              {(activeBranch?.departments || []).map((dept) => {
                const assignedDocs = (activeBranch?.doctors || []).filter(doc => doc.dept === dept.name);
                return (
                  <div key={dept.id || dept.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.2rem', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', background: 'white', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary-color)' }}>
                        {dept.prefix || dept.code?.substring(0, 2) || 'OP'}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.98rem' }}>{dept.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Service Code: <strong>{dept.code || 'N/A'}</strong> • {assignedDocs.length} Active Doctor{assignedDocs.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                        Live in OPD Queue
                      </span>
                      <button 
                        onClick={() => handleRemoveDepartment(dept.id, dept.name)}
                        className="btn" 
                        style={{ background: 'white', border: '1px solid var(--border-color)', color: 'var(--danger)', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                        title="Remove Department"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Doctor Roster & Shift Schedules */}
        {activeTab === 'doctors' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Doctor Roster & Shifts ({activeBranch?.doctors?.length || 0})</h2>
                <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Assign consultation shifts, OPD room allocations, and slot durations
                </p>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowAddDoctorModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={16} /> Add Doctor
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {(activeBranch?.doctors || []).map((doc) => {
                const duration = doc.slot_duration_mins || doc.schedule?.slotDuration || 30;
                const days = doc.schedule?.days || [1, 2, 3, 4, 5];
                return (
                  <div 
                    key={doc.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '56px 1fr auto auto',
                      gap: '1.2rem',
                      alignItems: 'center',
                      padding: '1.1rem 1.3rem',
                      background: 'var(--bg-light)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', background: 'white', border: '1px solid var(--border-color)' }}>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name.replace(' ', '')}`} alt={doc.name} style={{ width: '100%', height: '100%' }} />
                    </div>

                    <div>
                      <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.05rem' }}>{doc.name}</h4>
                      <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                        {doc.dept} • {doc.specialization}
                      </p>
                      <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>Room: <strong>{doc.room_number || 'OPD 1'}</strong></span>
                        <span>•</span>
                        <span>Fee: <strong>{doc.consultation_fee || '$150.00'}</strong></span>
                        <span>•</span>
                        <span>Slot: <strong>{duration} mins</strong></span>
                        <span>•</span>
                        <span>Working: <strong>{days.map(d => dayNames[d]).join(', ')}</strong></span>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                        On Active Schedule
                      </span>
                    </div>

                    <div>
                      <button 
                        className="btn btn-outline"
                        onClick={() => {
                          setEditingScheduleDoc(doc);
                          setSelectedDays(doc.schedule?.days || [1, 2, 3, 4, 5]);
                          setShiftStart(doc.schedule?.start || '09:00');
                          setShiftEnd(doc.schedule?.end || '17:00');
                          setDocSlotDuration(duration);
                          setDocRoom(doc.room_number || 'OPD Room 101');
                          setDocFee(doc.consultation_fee || '$150.00');
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.45rem 0.8rem' }}
                      >
                        <Edit3 size={14} /> Edit Shifts
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Queue Policies & Cutoffs */}
        {activeTab === 'queue' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>OPD Queue & Prioritization Policies</h2>
                <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Operational rules for live patient flow, check-ins, and emergency bypass
                </p>
              </div>
              <button className="btn btn-primary" onClick={handleSaveBranchProfile} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Save size={16} /> Save Policies
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ padding: '1.2rem', background: 'var(--bg-light)', borderRadius: 'var(--radius-md)', display: 'grid', gap: '1.2rem' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem' }}>Senior Citizen Queue Priority</h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Automatically advances patients aged 65+ ahead of standard routine consultations.
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={seniorPriority} 
                    onChange={(e) => setSeniorPriority(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                  />
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem' }}>Emergency Triage Bypass</h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Allows desk nurses to inject critical emergencies straight to the head of the OPD queue with audit log.
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emergencyBypass} 
                    onChange={(e) => setEmergencyBypass(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--danger)', cursor: 'pointer' }}
                  />
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem' }}>Doctor Delay Notification Threshold</h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Minutes of doctor consultation delay before patient ETA trackers broadcast a delay warning.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="number" 
                      min="5" 
                      max="60" 
                      value={delayThreshold}
                      onChange={(e) => setDelayThreshold(Number(e.target.value))}
                      style={{ width: '70px', padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>mins</span>
                  </div>
                </div>

              </div>

              <div style={{ padding: '1rem', border: '1px solid rgba(234, 179, 8, 0.3)', background: 'rgba(234, 179, 8, 0.05)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <ShieldAlert size={24} color="var(--warning)" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  <strong>Check-in Requirement:</strong> Patients must check in within <strong>{checkinCutoff} minutes</strong> of their reserved slot. Unchecked bookings will be tagged as <em>No-Show</em> to protect clinic flow.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
