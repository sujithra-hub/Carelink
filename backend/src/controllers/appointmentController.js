import { supabase, isSupabaseConfigured } from '../supabaseClient.js';
import { queueService } from '../services/queueService.js';

let fallbackAppointments = [
  {
    id: 'apt-001',
    booking_reference: 'CL-2026-8910',
    patient_name: 'Alex Robertson',
    doctor_name: 'Dr. Sarah Jenkins',
    dept: 'Cardiology',
    hospital_id: 1,
    appointment_date: '2026-10-14',
    time_slot: '10:30 AM',
    fee: '$180.00',
    status: 'Confirmed',
    token_number: 428,
    token_code: 'C-428'
  },
  {
    id: 'apt-002',
    booking_reference: 'CL-2026-4421',
    patient_name: 'Maria Garcia',
    doctor_name: 'Dr. Michael Chen',
    dept: 'General Medicine',
    hospital_id: 1,
    appointment_date: '2026-10-14',
    time_slot: '11:00 AM',
    fee: '$120.00',
    status: 'Confirmed',
    token_number: 431,
    token_code: 'GM-431'
  },
  {
    id: 'apt-003',
    booking_reference: 'CL-2026-7890',
    patient_name: 'David Kim',
    doctor_name: 'Dr. Robert Hayes',
    dept: 'Orthopedics',
    hospital_id: 1,
    appointment_date: '2026-10-15',
    time_slot: '02:00 PM',
    fee: '$160.00',
    status: 'Confirmed',
    token_number: 435,
    token_code: 'O-435'
  }
];

export async function getAppointments(req, res) {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true });
      if (error) throw error;
      return res.json({ success: true, data });
    }
    return res.json({ success: true, data: fallbackAppointments });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createAppointment(req, res) {
  try {
    const { doctor_name, dept, appointment_date, time_slot, patient_name = 'Alex Robertson', notes = '' } = req.body;

    if (!doctor_name || !appointment_date || !time_slot) {
      return res.status(400).json({ success: false, error: 'Doctor, date, and time slot are required.' });
    }

    if (isSupabaseConfigured) {
      // 1. Concurrency / Conflict Check
      const { data: existing, error: checkErr } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_name', doctor_name)
        .eq('appointment_date', appointment_date)
        .eq('time_slot', time_slot)
        .neq('status', 'Cancelled')
        .maybeSingle();

      if (checkErr) throw checkErr;
      if (existing) {
        return res.status(409).json({
          success: false,
          error: `Slot ${time_slot} on ${appointment_date} with ${doctor_name} is already booked.`
        });
      }

      // 2. Compute Next Available Queue Token Number
      const { data: maxTokenData } = await supabase
        .from('queue_tokens')
        .select('token_number')
        .order('token_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const assignedToken = (maxTokenData?.token_number || 430) + 1;

      // 3. Insert Appointment
      const { data: appointment, error: insertErr } = await supabase
        .from('appointments')
        .insert({
          patient_name,
          doctor_name,
          dept: dept || 'Cardiology',
          hospital_id: 1,
          appointment_date,
          time_slot,
          token_number: assignedToken,
          status: 'Confirmed',
          notes
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      // 4. Also register into live queue
      await supabase.from('queue_tokens').insert({
        token_number: assignedToken,
        hospital_id: 1,
        patient_name,
        department: dept || 'Cardiology',
        doctor_name,
        visit_type: 'Scheduled Appointment',
        status: 'WAITING',
        wait_time: '25m'
      });

      return res.status(201).json({ success: true, data: appointment });
    }

    // In-Memory Fallback Check
    const isTaken = fallbackAppointments.some(
      a => a.doctor_name === doctor_name && 
           a.appointment_date === appointment_date && 
           a.time_slot === time_slot && 
           a.status !== 'Cancelled'
    );

    if (isTaken) {
      return res.status(409).json({
        success: false,
        error: `Slot ${time_slot} on ${appointment_date} with ${doctor_name} is already booked.`
      });
    }

    const assignedToken = 430 + fallbackAppointments.length + 1;
    const prefix = (dept || 'G').substring(0, 1).toUpperCase();
    const tokenCode = `${prefix}-${assignedToken}`;
    const bookingRef = `CL-${new Date().getFullYear()}-${assignedToken}`;
    const newAppointment = {
      id: `apt-${Date.now()}`,
      booking_reference: bookingRef,
      patient_name,
      doctor_name,
      dept: dept || 'Cardiology',
      hospital_id: 1,
      appointment_date,
      time_slot,
      token_number: assignedToken,
      token_code: tokenCode,
      status: 'Confirmed',
      notes,
      created_at: new Date().toISOString()
    };
    fallbackAppointments.unshift(newAppointment);

    // Sync into in-memory queue service
    try {
      queueService.bookPatient({
        bookingReference: bookingRef,
        patientName: patient_name,
        department: dept || 'Cardiology',
        doctor_name,
        visit_type: 'Scheduled Appointment',
        token_number: assignedToken,
        token_code: tokenCode,
        room_number: 'OPD Room 102'
      });
    } catch (e) {
      console.warn('Queue booking sync warning:', e.message);
    }

    return res.status(201).json({ success: true, data: newAppointment });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function rescheduleAppointment(req, res) {
  try {
    const { id } = req.params;
    const { appointment_date, time_slot } = req.body;

    if (!appointment_date || !time_slot) {
      return res.status(400).json({ success: false, error: 'New appointment date and time slot required.' });
    }

    if (isSupabaseConfigured) {
      // Find appointment to know the doctor
      const { data: targetApt, error: targetErr } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (targetErr || !targetApt) {
        return res.status(404).json({ success: false, error: 'Appointment not found.' });
      }

      // Check slot availability
      const { data: conflict } = await supabase
        .from('appointments')
        .select('id')
        .neq('id', id)
        .eq('doctor_name', targetApt.doctor_name)
        .eq('appointment_date', appointment_date)
        .eq('time_slot', time_slot)
        .neq('status', 'Cancelled')
        .maybeSingle();

      if (conflict) {
        return res.status(409).json({
          success: false,
          error: `Slot ${time_slot} on ${appointment_date} is already booked for ${targetApt.doctor_name}.`
        });
      }

      const { data: updated, error: updateErr } = await supabase
        .from('appointments')
        .update({
          appointment_date,
          time_slot,
          status: 'Confirmed'
        })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      return res.json({ success: true, data: updated });
    }

    const apt = fallbackAppointments.find(a => a.id === id);
    if (!apt) return res.status(404).json({ success: false, error: 'Appointment not found.' });

    const isConflict = fallbackAppointments.some(
      a => a.id !== id && 
           a.doctor_name === apt.doctor_name && 
           a.appointment_date === appointment_date && 
           a.time_slot === time_slot && 
           a.status !== 'Cancelled'
    );
    if (isConflict) {
      return res.status(409).json({ success: false, error: 'Requested slot is already reserved.' });
    }

    apt.appointment_date = appointment_date;
    apt.time_slot = time_slot;
    apt.status = 'Confirmed';

    return res.json({ success: true, data: apt });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    const { reason = 'Patient Requested' } = req.body;

    if (isSupabaseConfigured) {
      const { data: updated, error } = await supabase
        .from('appointments')
        .update({
          status: 'Cancelled',
          cancel_reason: reason
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Remove from live queue
      if (updated?.token_number) {
        await supabase
          .from('queue_tokens')
          .delete()
          .eq('token_number', updated.token_number);
      }

      return res.json({ success: true, message: 'Appointment cancelled and slot released.', data: updated });
    }

    const apt = fallbackAppointments.find(a => a.id === id);
    if (!apt) return res.status(404).json({ success: false, error: 'Appointment not found.' });

    apt.status = 'Cancelled';
    apt.cancel_reason = reason;

    // Remove from in-memory queue service
    try {
      queueService.cancelPatient(apt.token_code || apt.token_number || apt.patient_name);
    } catch (e) {
      console.warn('Queue cancel sync warning:', e.message);
    }

    return res.json({ success: true, message: 'Appointment cancelled and slot released.', data: apt });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
