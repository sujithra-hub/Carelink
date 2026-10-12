import { supabase, isSupabaseConfigured } from '../supabaseClient.js';

// Fallback Organizations & Multi-Branch Hierarchy
let fallbackOrganizations = [
  {
    id: 1,
    name: 'City Central Health System',
    code: 'CCHS',
    tagline: 'Excellence in Tertiary & Emergency Care',
    logo_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=200&q=80',
    contact_email: 'admin@citycentral.org',
    phone: '+1 234-567-8900',
    branches: [
      {
        id: 1,
        org_id: 1,
        name: 'Downtown Main Campus',
        code: 'CCHS-DT',
        address: '124 Downtown Ave, Metro City, NY 10001',
        city: 'Metro City',
        phone: '+1 234-567-8900',
        emergency_phone: '911 / +1 800-EMERGENCY',
        operating_hours: '07:30 AM - 09:00 PM',
        timezone: 'America/New_York',
        checkin_cutoff_mins: 15,
        token_prefix: 'CC',
        walkin_policy: 'ACCEPT_ALL',
        rating: 4.8,
        image_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80',
        departments: [
          { id: 1, name: 'Cardiology', code: 'CARD', prefix: 'C', active: true },
          { id: 2, name: 'General Medicine', code: 'GMED', prefix: 'GM', active: true },
          { id: 3, name: 'Pediatrics', code: 'PED', prefix: 'P', active: true },
          { id: 4, name: 'Orthopedics', code: 'ORTH', prefix: 'O', active: true }
        ],
        doctors: [
          {
            id: 1,
            name: 'Dr. Sarah Jenkins',
            dept: 'Cardiology',
            specialization: 'Senior Interventional Cardiologist',
            experience: '12 Years',
            rating: 4.9,
            consultation_fee: '$180.00',
            room_number: 'OPD Room 102',
            slot_duration_mins: 30,
            slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '04:00 PM'],
            schedule: { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00', slotDuration: 30 }
          },
          {
            id: 2,
            name: 'Dr. Michael Chen',
            dept: 'General Medicine',
            specialization: 'Chief Internal Medicine Consultant',
            experience: '8 Years',
            rating: 4.7,
            consultation_fee: '$120.00',
            room_number: 'OPD Room 104',
            slot_duration_mins: 20,
            slots: ['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '01:30 PM', '02:00 PM', '03:15 PM'],
            schedule: { days: [1, 2, 3, 4, 5], start: '09:00', end: '16:00', slotDuration: 20 }
          },
          {
            id: 3,
            name: 'Dr. Emily Blunt',
            dept: 'Pediatrics',
            specialization: 'Senior Pediatrician & Neonatologist',
            experience: '15 Years',
            rating: 4.9,
            consultation_fee: '$150.00',
            room_number: 'Pediatrics Wing B',
            slot_duration_mins: 30,
            slots: ['09:30 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'],
            schedule: { days: [1, 2, 3, 4, 5], start: '09:30', end: '17:00', slotDuration: 30 }
          },
          {
            id: 4,
            name: 'Dr. Robert Hayes',
            dept: 'Orthopedics',
            specialization: 'Consultant Orthopedic Surgeon',
            experience: '11 Years',
            rating: 4.8,
            consultation_fee: '$160.00',
            room_number: 'OPD Room 108',
            slot_duration_mins: 30,
            slots: ['10:00 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:00 PM'],
            schedule: { days: [1, 2, 3, 4], start: '10:00', end: '16:00', slotDuration: 30 }
          }
        ]
      },
      {
        id: 2,
        org_id: 1,
        name: 'Westside Ambulatory Pavilion',
        code: 'CCHS-WS',
        address: '880 Westside Pkwy, Metro City, NY 10024',
        city: 'Metro City',
        phone: '+1 234-567-8905',
        emergency_phone: '+1 800-CC-WEST',
        operating_hours: '08:00 AM - 06:00 PM',
        timezone: 'America/New_York',
        checkin_cutoff_mins: 20,
        token_prefix: 'CCW',
        walkin_policy: 'LIMITED_SLOTS',
        rating: 4.7,
        image_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
        departments: [
          { id: 5, name: 'General Medicine', code: 'GMED', prefix: 'GW', active: true },
          { id: 6, name: 'Pediatrics', code: 'PED', prefix: 'PW', active: true },
          { id: 7, name: 'Urgent Care', code: 'URG', prefix: 'UC', active: true }
        ],
        doctors: [
          {
            id: 5,
            name: 'Dr. Nathan Drake',
            dept: 'General Medicine',
            specialization: 'Attending Physician',
            experience: '7 Years',
            rating: 4.6,
            consultation_fee: '$110.00',
            room_number: 'Pavilion Suite A',
            slot_duration_mins: 20,
            slots: ['08:30 AM', '09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM'],
            schedule: { days: [1, 2, 3, 4, 5], start: '08:30', end: '16:00', slotDuration: 20 }
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Green Valley Medical Care',
    code: 'GVMC',
    tagline: 'Community-First Family & Preventive Medicine',
    logo_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=200&q=80',
    contact_email: 'care@greenvalley.org',
    phone: '+1 234-567-8901',
    branches: [
      {
        id: 3,
        org_id: 2,
        name: 'North Hills Wellness Center',
        code: 'GVMC-NH',
        address: '88 Oakwood Blvd, Westside, NY 10032',
        city: 'Westside',
        phone: '+1 234-567-8901',
        emergency_phone: '+1 800-GREEN-VALLEY',
        operating_hours: '08:00 AM - 07:00 PM',
        timezone: 'America/New_York',
        checkin_cutoff_mins: 10,
        token_prefix: 'GV',
        walkin_policy: 'ACCEPT_ALL',
        rating: 4.6,
        image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
        departments: [
          { id: 8, name: 'General Medicine', code: 'GMED', prefix: 'GV', active: true },
          { id: 9, name: 'ENT & Allergy', code: 'ENT', prefix: 'E', active: true },
          { id: 10, name: 'Dermatology', code: 'DERM', prefix: 'D', active: true }
        ],
        doctors: [
          {
            id: 6,
            name: 'Dr. Alistair Vance',
            dept: 'General Medicine',
            specialization: 'Preventive Family Physician',
            experience: '14 Years',
            rating: 4.8,
            consultation_fee: '$130.00',
            room_number: 'Wellness Suite 12',
            slot_duration_mins: 30,
            slots: ['08:30 AM', '10:00 AM', '01:00 PM', '03:30 PM'],
            schedule: { days: [1, 2, 3, 4, 5], start: '08:30', end: '17:00', slotDuration: 30 }
          },
          {
            id: 7,
            name: 'Dr. Sophia Morales',
            dept: 'Dermatology',
            specialization: 'Consultant Dermatologist & Laser Specialist',
            experience: '9 Years',
            rating: 4.9,
            consultation_fee: '$140.00',
            room_number: 'Derm Suite 4',
            slot_duration_mins: 30,
            slots: ['09:00 AM', '10:30 AM', '11:30 AM', '02:00 PM'],
            schedule: { days: [1, 3, 5], start: '09:00', end: '15:00', slotDuration: 30 }
          }
        ]
      }
    ]
  }
];

// Helper to flatten branches for backward-compatible hospital listings
export function getFlatHospitals() {
  const result = [];
  fallbackOrganizations.forEach(org => {
    org.branches.forEach(branch => {
      result.push({
        id: branch.id,
        orgId: org.id,
        orgName: org.name,
        name: `${org.name} - ${branch.name}`,
        branchName: branch.name,
        code: branch.code,
        type: 'Multi-Specialty Facility',
        rating: branch.rating,
        address: branch.address,
        phone: branch.phone,
        emergency_phone: branch.emergency_phone,
        operating_hours: branch.operating_hours,
        checkin_cutoff_mins: branch.checkin_cutoff_mins,
        token_prefix: branch.token_prefix,
        walkin_policy: branch.walkin_policy,
        departments: branch.departments.map(d => d.name),
        departmentList: branch.departments,
        doctors: branch.doctors,
        image_url: branch.image_url,
        active_tokens: 42 + (branch.id * 18)
      });
    });
  });
  return result;
}

// 1. Get all Organizations with their Branches
export async function getOrganizations(req, res) {
  try {
    if (isSupabaseConfigured) {
      const { data: orgs, error: orgErr } = await supabase
        .from('hospital_organizations')
        .select('*, hospital_branches(*)')
        .order('id', { ascending: true });

      if (!orgErr && orgs && orgs.length > 0) {
        return res.json({ success: true, data: orgs });
      }
    }
    return res.json({ success: true, data: fallbackOrganizations });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 2. Get Hospital Facilities List (Enriched with Branch Configuration)
export async function getHospitals(req, res) {
  try {
    if (isSupabaseConfigured) {
      // Try to read hospital_branches joined with organization
      const { data: branches, error: bErr } = await supabase
        .from('hospital_branches')
        .select('*, hospital_organizations(*)')
        .order('id', { ascending: true });

      if (!bErr && branches && branches.length > 0) {
        const mapped = branches.map(b => ({
          id: b.id,
          orgId: b.org_id,
          orgName: b.hospital_organizations?.name || 'CareLink Health',
          name: `${b.hospital_organizations?.name || ''} - ${b.name}`,
          branchName: b.name,
          code: b.code,
          type: 'Multi-Specialty Facility',
          rating: b.rating || 4.8,
          address: b.address,
          phone: b.phone,
          emergency_phone: b.emergency_phone,
          operating_hours: b.operating_hours,
          checkin_cutoff_mins: b.checkin_cutoff_mins,
          token_prefix: b.token_prefix,
          walkin_policy: b.walkin_policy,
          departments: ['Cardiology', 'General Medicine', 'Pediatrics', 'Orthopedics'],
          image_url: b.image_url,
          active_tokens: 38 + b.id * 12
        }));
        return res.json({ success: true, data: mapped });
      }

      // Fallback to legacy hospitals table if present
      const { data: legacyHosp, error: legacyErr } = await supabase.from('hospitals').select('*').order('id', { ascending: true });
      if (!legacyErr && legacyHosp && legacyHosp.length > 0) {
        return res.json({ success: true, data: legacyHosp });
      }
    }

    return res.json({ success: true, data: getFlatHospitals() });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 3. Get Single Facility Details
export async function getHospitalById(req, res) {
  try {
    const { id } = req.params;
    const all = getFlatHospitals();
    const found = all.find(h => h.id === Number(id));
    if (!found) {
      return res.status(404).json({ success: false, error: 'Hospital branch not found' });
    }
    return res.json({ success: true, data: found });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 4. Update Hospital Facility Info (Admin)
export async function updateHospital(req, res) {
  try {
    const { id } = req.params;
    const { name, emergency_phone, address, departments, operating_hours, checkin_cutoff_mins, token_prefix, walkin_policy } = req.body;

    let targetBranch = null;
    fallbackOrganizations.forEach(org => {
      const b = org.branches.find(br => br.id === Number(id));
      if (b) {
        targetBranch = b;
        if (name) b.name = name;
        if (emergency_phone) b.emergency_phone = emergency_phone;
        if (address) b.address = address;
        if (operating_hours) b.operating_hours = operating_hours;
        if (checkin_cutoff_mins !== undefined) b.checkin_cutoff_mins = checkin_cutoff_mins;
        if (token_prefix) b.token_prefix = token_prefix;
        if (walkin_policy) b.walkin_policy = walkin_policy;
        if (departments) {
          b.departments = departments.map((d, idx) => typeof d === 'string' ? { id: idx + 10, name: d, code: d.substring(0, 4).toUpperCase(), active: true } : d);
        }
      }
    });

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('hospital_branches')
          .update({
            name,
            emergency_phone,
            address,
            operating_hours,
            checkin_cutoff_mins,
            token_prefix,
            walkin_policy
          })
          .eq('id', id);
      } catch (e) {
        console.warn('Database branch update notice:', e.message);
      }
    }

    return res.json({ success: true, data: targetBranch || { id, name, address } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 5. Get Comprehensive Branch Configuration
export async function getBranchConfig(req, res) {
  try {
    const { branchId } = req.params;
    const bId = Number(branchId);

    let branchFound = null;
    let orgFound = null;

    fallbackOrganizations.forEach(org => {
      const b = org.branches.find(br => br.id === bId);
      if (b) {
        branchFound = b;
        orgFound = org;
      }
    });

    if (!branchFound) {
      return res.status(404).json({ success: false, error: `Branch #${branchId} not found.` });
    }

    return res.json({
      success: true,
      data: {
        organization: orgFound,
        branch: branchFound,
        departments: branchFound.departments,
        doctors: branchFound.doctors,
        queuePolicy: {
          checkinCutoffMins: branchFound.checkin_cutoff_mins,
          tokenPrefix: branchFound.token_prefix,
          walkinPolicy: branchFound.walkin_policy,
          dailyTokenResetHour: '00:00 AM'
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 6. Update Branch Configuration (Operating policies, Queue rules)
export async function updateBranchConfig(req, res) {
  try {
    const { branchId } = req.params;
    const { 
      name, 
      address, 
      phone, 
      emergency_phone, 
      operating_hours, 
      checkin_cutoff_mins, 
      token_prefix, 
      walkin_policy 
    } = req.body;

    const bId = Number(branchId);
    let updatedBranch = null;

    fallbackOrganizations.forEach(org => {
      const b = org.branches.find(br => br.id === bId);
      if (b) {
        if (name) b.name = name;
        if (address) b.address = address;
        if (phone) b.phone = phone;
        if (emergency_phone) b.emergency_phone = emergency_phone;
        if (operating_hours) b.operating_hours = operating_hours;
        if (checkin_cutoff_mins !== undefined) b.checkin_cutoff_mins = Number(checkin_cutoff_mins);
        if (token_prefix) b.token_prefix = token_prefix;
        if (walkin_policy) b.walkin_policy = walkin_policy;
        updatedBranch = b;
      }
    });

    if (isSupabaseConfigured) {
      try {
        const cleanUpdates = {};
        if (name) cleanUpdates.name = name;
        if (address) cleanUpdates.address = address;
        if (phone) cleanUpdates.phone = phone;
        if (emergency_phone) cleanUpdates.emergency_phone = emergency_phone;
        if (operating_hours) cleanUpdates.operating_hours = operating_hours;
        if (checkin_cutoff_mins !== undefined) cleanUpdates.checkin_cutoff_mins = Number(checkin_cutoff_mins);
        if (token_prefix) cleanUpdates.token_prefix = token_prefix;
        if (walkin_policy) cleanUpdates.walkin_policy = walkin_policy;

        if (Object.keys(cleanUpdates).length > 0) {
          await supabase
            .from('hospital_branches')
            .update(cleanUpdates)
            .eq('id', bId);
        }
      } catch (err) {
        console.warn('DB Branch Config Update:', err.message);
      }
    }

    return res.json({ success: true, data: updatedBranch });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 7. Add Clinical Department to Branch
export async function addDepartment(req, res) {
  try {
    const { branchId } = req.params;
    const { name, code, prefix } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Department name is required.' });
    }

    const bId = Number(branchId);
    let newDept = null;

    fallbackOrganizations.forEach(org => {
      const b = org.branches.find(br => br.id === bId);
      if (b) {
        const id = Date.now();
        const deptCode = code || name.substring(0, 4).toUpperCase();
        const tokenPrefix = prefix || name.substring(0, 1).toUpperCase();
        newDept = { id, name: name.trim(), code: deptCode, prefix: tokenPrefix, active: true };
        b.departments.push(newDept);
      }
    });

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('departments')
          .insert({
            branch_id: bId,
            name: name.trim(),
            code: code || name.substring(0, 4).toUpperCase(),
            token_prefix: prefix || name.substring(0, 1).toUpperCase()
          })
          .select()
          .single();
        if (!error && data) newDept = data;
      } catch (e) {
        console.warn('DB Department Insert:', e.message);
      }
    }

    return res.status(201).json({ success: true, data: newDept });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 8. Remove Clinical Department from Branch
export async function removeDepartment(req, res) {
  try {
    const { branchId, deptId } = req.params;
    const bId = Number(branchId);
    const dId = Number(deptId);

    fallbackOrganizations.forEach(org => {
      const b = org.branches.find(br => br.id === bId);
      if (b) {
        b.departments = b.departments.filter(d => d.id !== dId && d.name !== deptId);
      }
    });

    if (isSupabaseConfigured) {
      try {
        await supabase.from('departments').delete().eq('id', dId);
      } catch (e) {
        console.warn('DB Department Delete:', e.message);
      }
    }

    return res.json({ success: true, message: 'Department removed from branch.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 9. Add Doctor to Branch Roster
export async function addDoctor(req, res) {
  try {
    const { branchId } = req.params;
    const { name, dept, specialization, experience, consultation_fee, room_number, slot_duration_mins } = req.body;

    if (!name || !dept) {
      return res.status(400).json({ success: false, error: 'Doctor name and department are required.' });
    }

    const bId = Number(branchId);
    let newDoc = null;

    fallbackOrganizations.forEach(org => {
      const b = org.branches.find(br => br.id === bId);
      if (b) {
        const id = Date.now();
        const duration = Number(slot_duration_mins) || 30;
        newDoc = {
          id,
          name: name.trim(),
          dept: dept.trim(),
          specialization: specialization || 'Consultant Specialist',
          experience: experience || '5 Years',
          rating: 4.8,
          consultation_fee: consultation_fee || '$150.00',
          room_number: room_number || 'OPD Room 1',
          slot_duration_mins: duration,
          slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:30 PM'],
          schedule: { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00', slotDuration: duration }
        };
        b.doctors.push(newDoc);
      }
    });

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .insert({
            branch_id: bId,
            name: name.trim(),
            dept: dept.trim(),
            specialization: specialization || 'Consultant Specialist',
            experience: experience || '5 Years',
            consultation_fee: consultation_fee || '$150.00',
            room_number: room_number || 'OPD Room 1',
            slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:30 PM']
          })
          .select()
          .single();
        if (!error && data) newDoc = data;
      } catch (e) {
        console.warn('DB Doctor Insert:', e.message);
      }
    }

    return res.status(201).json({ success: true, data: newDoc });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 10. Update Doctor Schedule / Weekly Shifts
export async function updateDoctorSchedule(req, res) {
  try {
    const { doctorId } = req.params;
    const { workingDays, startTime, endTime, slotDurationMins, consultationFee, roomNumber } = req.body;
    const docId = Number(doctorId);

    let updatedDoctor = null;

    fallbackOrganizations.forEach(org => {
      org.branches.forEach(b => {
        const d = b.doctors.find(doc => doc.id === docId);
        if (d) {
          if (workingDays) d.schedule.days = workingDays;
          if (startTime) d.schedule.start = startTime;
          if (endTime) d.schedule.end = endTime;
          if (slotDurationMins) {
            d.schedule.slotDuration = Number(slotDurationMins);
            d.slot_duration_mins = Number(slotDurationMins);
          }
          if (consultationFee) d.consultation_fee = consultationFee;
          if (roomNumber) d.room_number = roomNumber;
          updatedDoctor = d;
        }
      });
    });

    return res.json({ success: true, data: updatedDoctor });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 11. Dynamic Doctor Slot Generation Engine
export async function getDoctorSlots(req, res) {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // YYYY-MM-DD
    const docId = Number(doctorId);

    let doctor = null;
    fallbackOrganizations.forEach(org => {
      org.branches.forEach(b => {
        const d = b.doctors.find(doc => doc.id === docId);
        if (d) doctor = d;
      });
    });

    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found.' });
    }

    // Default time slots generator (e.g. 09:00 to 17:00 with 30m steps)
    const slotDuration = doctor.slot_duration_mins || doctor.schedule?.slotDuration || 30;
    const slots = [];
    const startHour = 9;
    const endHour = 17;

    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += slotDuration) {
        if (h === 13) continue; // Lunch break hour
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const displayM = m < 10 ? `0${m}` : m;
        const timeString = `${displayH < 10 ? '0' : ''}${displayH}:${displayM} ${period}`;
        slots.push(timeString);
      }
    }

    // Fetch existing booked appointments on that date to flag reserved slots
    let bookedSlots = [];
    if (isSupabaseConfigured && date) {
      try {
        const { data: booked } = await supabase
          .from('appointments')
          .select('time_slot')
          .eq('doctor_name', doctor.name)
          .eq('appointment_date', date)
          .neq('status', 'Cancelled');
        if (booked) bookedSlots = booked.map(b => b.time_slot);
      } catch {}
    }

    const resultSlots = slots.map(slot => ({
      slot,
      available: !bookedSlots.includes(slot),
      durationMins: slotDuration
    }));

    return res.json({
      success: true,
      data: {
        doctor: {
          id: doctor.id,
          name: doctor.name,
          dept: doctor.dept,
          room: doctor.room_number,
          fee: doctor.consultation_fee
        },
        date: date || new Date().toISOString().split('T')[0],
        slotDurationMins: slotDuration,
        slots: resultSlots
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
