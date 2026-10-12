import { queueService } from '../services/queueService.js';

export async function getQueue(req, res) {
  try {
    const data = await queueService.getQueue();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function checkInPatient(req, res) {
  try {
    const { bookingReference, patientName } = req.body;
    const result = await queueService.checkInPatient({ bookingReference, patientName });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function callNext(req, res) {
  try {
    const { roomNumber, doctorName } = req.body || {};
    const result = await queueService.callNext(roomNumber, doctorName);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function callSpecificToken(req, res) {
  try {
    const { tokenIdentifier, roomNumber, doctorName } = req.body || {};
    const result = await queueService.callSpecificToken(tokenIdentifier, roomNumber, doctorName);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function completeConsultation(req, res) {
  try {
    const { roomNumber } = req.body || {};
    const result = await queueService.completeConsultation(roomNumber);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function skipPatient(req, res) {
  try {
    const { reason = 'Patient Not Present When Called' } = req.body;
    const result = await queueService.skipPatient(reason);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function recallPatient(req, res) {
  try {
    const { tokenNumber } = req.body;
    const result = await queueService.recallPatient(tokenNumber);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function reportDelay(req, res) {
  try {
    const { doctorName, delayMinutes, reason } = req.body;
    const result = await queueService.reportDelay(doctorName, delayMinutes, reason);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function registerWalkIn(req, res) {
  try {
    const { patient_name, department, visit_type, priority, doctor_name } = req.body;
    const result = await queueService.registerWalkIn({ patient_name, department, visit_type, priority, doctor_name });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getWaitingRoomDisplay(req, res) {
  try {
    const data = await queueService.getDisplayData();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getAuditLogs(req, res) {
  try {
    const data = await queueService.getAuditLogs();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export function streamQueue(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'CareLink Live SSE Stream Connected' })}\n\n`);
  queueService.addSSEClient(res);
}
