import { supabase, isSupabaseConfigured } from '../supabaseClient.js';

const USERS = {
  patient: {
    id: 'pat-101',
    name: 'Alex Robertson',
    email: 'demo@patient.carelink.com',
    role: 'patient',
    gender: 'Male',
    age: 32,
    blood_group: 'O+',
    height: '180 cm',
    weight: '75 kg',
    location: 'Metro City, NY',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
  },
  staff: {
    id: 'stf-201',
    name: 'Dr. Sarah Jenkins',
    email: 'demo@staff.carelink.com',
    role: 'staff',
    dept: 'Cardiology',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  admin: {
    id: 'adm-301',
    name: 'Hospital Administrator',
    email: 'demo@admin.carelink.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  }
};

export async function login(req, res) {
  try {
    const { email, role = 'patient' } = req.body;

    if (isSupabaseConfigured && email) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (user) {
        return res.json({ success: true, data: user });
      }
    }

    const matched = USERS[role] || {
      id: `usr-${Date.now()}`,
      name: email ? email.split('@')[0] : 'User',
      email: email || `demo@${role}.carelink.com`,
      role
    };

    return res.json({ success: true, data: matched });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getProfile(req, res) {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured && id) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) return res.json({ success: true, data });
    }
    return res.json({ success: true, data: USERS.patient });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
