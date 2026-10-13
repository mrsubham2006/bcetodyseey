import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { dbStore, createInitialDb } from './src/server/mockDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const HOST = '0.0.0.0';

// Gemini AI Helper
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper to log audit events
function addAuditLog(email: string, action: string, resource: string, details: string) {
  dbStore.auditLogs.unshift({
    id: dbStore.auditLogs.length + 1,
    user_email: email,
    action,
    resource,
    details,
    timestamp: new Date().toISOString()
  });
}

// ==========================================
// 1. AUTHENTICATION & USER MANAGEMENT
// ==========================================
app.post('/api/v1/auth/token', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = dbStore.users.find(u => u.email === email) || dbStore.users[0];
  res.json({
    access_token: `mock_jwt_token_${user.id}_${user.role}`,
    token_type: 'bearer',
    user
  });
});

app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = dbStore.users.find(u => u.email === email) || dbStore.users[0];
  addAuditLog(user.email, 'USER_LOGIN', 'AUTH', `Logged in as ${user.role}`);
  res.json({
    access_token: `mock_jwt_token_${user.id}_${user.role}`,
    token_type: 'bearer',
    user
  });
});

app.get('/api/v1/auth/me', (req: Request, res: Response) => {
  res.json(dbStore.users[9]); // City Commander as default
});

app.post('/api/v1/auth/switch-role/:role_name', (req: Request, res: Response) => {
  const { role_name } = req.params;
  const user = dbStore.users.find(u => u.role === role_name) || {
    id: 99,
    email: `${role_name.toLowerCase()}@civicnexus.gov.in`,
    full_name: `${role_name.replace(/_/g, ' ')} Operator`,
    phone: '+91 94370 00000',
    role: role_name,
    is_active: true,
    created_at: new Date().toISOString()
  };
  addAuditLog(user.email, 'SWITCH_ROLE', 'DEMO', `Switched role to ${role_name}`);
  res.json({
    access_token: `mock_jwt_${user.id}_${role_name}`,
    token_type: 'bearer',
    user
  });
});

app.get('/api/v1/users', (req: Request, res: Response) => {
  res.json(dbStore.users);
});

app.get('/api/v1/departments', (req: Request, res: Response) => {
  res.json(dbStore.departments);
});

// ==========================================
// 2. CITIZEN AUTH & PROFILE
// ==========================================
app.post('/api/v1/citizen/register', (req: Request, res: Response) => {
  const { full_name, email, mobile } = req.body;
  res.json({
    message: 'OTP sent to mobile number for verification',
    requires_otp: true,
    email,
    mobile: mobile || '+91 94370 12345'
  });
});

app.post('/api/v1/citizen/login', (req: Request, res: Response) => {
  const { identifier } = req.body;
  res.json({
    access_token: 'mock_citizen_token_123',
    token_type: 'bearer',
    citizen: {
      id: 1,
      full_name: 'Debabrata Mohanty',
      email: identifier || 'citizen@civicnexus.gov.in',
      mobile: '+91 94370 12345',
      address: 'Rasulgarh, Bhubaneswar'
    }
  });
});

app.post('/api/v1/citizen/verify-otp', (req: Request, res: Response) => {
  res.json({
    verified: true,
    access_token: 'mock_citizen_verified_token',
    citizen: {
      id: 1,
      full_name: 'Debabrata Mohanty',
      email: 'citizen@civicnexus.gov.in',
      mobile: '+91 94370 12345'
    }
  });
});

app.get('/api/v1/citizen/resend-otp', (req: Request, res: Response) => {
  res.json({ message: 'New OTP sent successfully' });
});

app.post('/api/v1/citizen/forgot-password', (req: Request, res: Response) => {
  res.json({ message: 'Password reset link sent to your registered email' });
});

app.post('/api/v1/citizen/reset-password', (req: Request, res: Response) => {
  res.json({ message: 'Password reset successful' });
});

app.get(['/api/v1/citizen/profile', '/api/citizen/profile'], (req: Request, res: Response) => {
  res.json({
    id: 1,
    full_name: 'Debabrata Mohanty',
    email: 'citizen@civicnexus.gov.in',
    mobile: '+91 94370 12345',
    address: 'Rasulgarh Chowk, Bhubaneswar, Odisha',
    created_at: new Date().toISOString()
  });
});

app.patch('/api/citizen/profile', (req: Request, res: Response) => {
  res.json({
    id: 1,
    full_name: req.body.full_name || 'Debabrata Mohanty',
    email: 'citizen@civicnexus.gov.in',
    mobile: req.body.mobile || '+91 94370 12345',
    address: req.body.address || 'Rasulgarh Chowk, Bhubaneswar, Odisha'
  });
});

app.get(['/api/v1/citizen/my-reports', '/api/v1/reports'], (req: Request, res: Response) => {
  res.json(dbStore.reports);
});

// ==========================================
// 3. REPORT CENTER & CASE TRACKING
// ==========================================
app.get('/api/v1/report-center/categories', (req: Request, res: Response) => {
  res.json([
    { id: 'waterlogging', name: 'Waterlogging & Flood Risk', icon: 'Droplets', description: 'Underpass flooding, blocked stormwater drains' },
    { id: 'pothole', name: 'Pothole & Infrastructure', icon: 'HardHat', description: 'Road damage, cave-ins, open manholes' },
    { id: 'traffic', name: 'Traffic & Corridor Congestion', icon: 'Navigation', description: 'Signal breakdown, illegal parking blockage' },
    { id: 'sanitation', name: 'Sanitation & Garbage', icon: 'Trash2', description: 'Garbage dump, uncleared municipal waste' },
    { id: 'lighting', name: 'Street Lighting & Electrical', icon: 'Lightbulb', description: 'Dark road stretches, transformer fault' },
  ]);
});

app.post('/api/v1/report-center/ai-assist', async (req: Request, res: Response) => {
  const { title, description, category } = req.body;
  if (ai) {
    try {
      const prompt = `Analyze this civic complaint for Odisha municipal response:
Title: ${title}
Description: ${description}
Category: ${category}

Return JSON with:
{
  "incident_type": "Waterlogging / Pothole / Traffic",
  "recommended_department": "Drainage and Flood Management",
  "summary": "Brief 1-sentence summary",
  "confidence": 0.95,
  "potential_risks": ["Risk 1", "Risk 2"],
  "recommended_actions": ["Action 1", "Action 2"],
  "model_version": "Gemini 2.0 Flash"
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch (e) {
      console.warn('Gemini fallback:', e);
    }
  }
  res.json({
    incident_type: category || 'Waterlogging',
    recommended_department: 'Drainage and Flood Management',
    summary: 'Automated AI classification routed complaint to Municipal Drainage team.',
    confidence: 0.92,
    potential_risks: ['Arterial road bottleneck', 'Submerged vehicles'],
    recommended_actions: ['Deploy mobile suction pump', 'Alert traffic escort'],
    model_version: 'Rule Engine / AI'
  });
});

app.post('/api/v1/report-center/duplicate-check', (req: Request, res: Response) => {
  const { latitude, longitude } = req.body;
  const nearbyReports = dbStore.reports.map(r => ({
    id: r.id,
    report_code: r.report_code,
    title: r.title,
    distance_meters: Math.round(Math.random() * 200 + 20),
    similarity_score: 0.89,
    status: r.status,
    created_at: r.created_at
  }));
  res.json(nearbyReports);
});

app.post('/api/v1/report-center/drafts', (req: Request, res: Response) => {
  res.json({ id: 'draft_101', saved_at: new Date().toISOString() });
});

app.get('/api/v1/report-center/drafts', (req: Request, res: Response) => {
  res.json([]);
});

app.post('/api/v1/report-center/evidence/upload', (req: Request, res: Response) => {
  res.json({ url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800' });
});

app.post('/api/v1/report-center/cases', (req: Request, res: Response) => {
  const { title, category, description, address, latitude, longitude, citizen_name, citizen_phone } = req.body;
  const code = `REP-OD-${new Date().getFullYear()}-${String(dbStore.reports.length + 1).padStart(3, '0')}`;
  
  // Find or create incident
  let inc = dbStore.incidents[0];
  const newReport = {
    id: dbStore.reports.length + 1,
    report_code: code,
    incident_id: inc.id,
    citizen_name: citizen_name || 'Debabrata Mohanty',
    citizen_phone: citizen_phone || '+91 94370 12345',
    title: title || 'Waterlogging Complaint',
    category: category || 'Waterlogging',
    description: description || 'Civic issue report',
    address: address || 'Rasulgarh Chowk, Bhubaneswar',
    latitude: latitude || 20.2961,
    longitude: longitude || 85.8645,
    media_urls: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'],
    status: 'SUBMITTED' as const,
    ai_processed: true,
    created_at: new Date().toISOString()
  };
  dbStore.reports.unshift(newReport);
  addAuditLog(newReport.citizen_name, 'SUBMIT_REPORT', 'REPORTS', `Report ${code} submitted.`);
  
  res.status(201).json({
    ticket_id: code,
    report_code: code,
    incident_code: inc.incident_code,
    status: 'SUBMITTED',
    estimated_sla: '12 Hours',
    created_at: newReport.created_at
  });
});

app.get('/api/v1/report-center/cases/:ticket_id/receipt', (req: Request, res: Response) => {
  const r = dbStore.reports.find(x => x.report_code === req.params.ticket_id) || dbStore.reports[0];
  res.json({
    ticket_id: r.report_code,
    report_code: r.report_code,
    title: r.title,
    status: r.status,
    citizen_name: r.citizen_name,
    address: r.address,
    created_at: r.created_at
  });
});

app.get('/api/v1/report-center/cases/:ticket_id/timeline', (req: Request, res: Response) => {
  res.json([
    { stage: 'SUBMITTED', timestamp: new Date().toISOString(), details: 'Complaint registered by citizen.' },
    { stage: 'AI_CLASSIFIED', timestamp: new Date().toISOString(), details: 'AI routed report to Drainage department.' },
    { stage: 'UNDER_REVIEW', timestamp: new Date().toISOString(), details: 'Department officer reviewing priority.' }
  ]);
});

app.get('/api/v1/cases/metrics', (req: Request, res: Response) => {
  res.json({
    total_cases: dbStore.reports.length,
    resolved_cases: dbStore.reports.filter(r => r.status === 'RESOLVED').length,
    active_cases: dbStore.reports.filter(r => r.status !== 'RESOLVED').length,
    avg_resolution_hours: 4.2
  });
});

// ==========================================
// 4. INCIDENTS & COMMAND CENTER
// ==========================================
app.get('/api/v1/incidents', (req: Request, res: Response) => {
  res.json(dbStore.incidents);
});

app.get('/api/v1/incidents/:id', (req: Request, res: Response) => {
  const inc = dbStore.incidents.find(i => i.id === Number(req.params.id) || i.incident_code === req.params.id) || dbStore.incidents[0];
  res.json(inc);
});

app.post('/api/v1/incidents/:id/verify', (req: Request, res: Response) => {
  const inc = dbStore.incidents.find(i => i.id === Number(req.params.id)) || dbStore.incidents[0];
  inc.is_verified = true;
  inc.status = 'VERIFIED';
  addAuditLog('commander@civicnexus.gov.in', 'VERIFY_INCIDENT', 'INCIDENTS', `Verified incident ${inc.incident_code}`);
  res.json(inc);
});

app.post('/api/v1/incidents/:id/assign', (req: Request, res: Response) => {
  const { department_id } = req.body;
  const inc = dbStore.incidents.find(i => i.id === Number(req.params.id)) || dbStore.incidents[0];
  inc.assigned_department_id = department_id || 1;
  inc.status = 'ASSIGNED';
  
  // Create task for department
  const newTask = {
    id: dbStore.tasks.length + 1,
    incident_id: inc.id,
    department_id: department_id || inc.assigned_department_id || 1,
    assigned_to_worker_id: 2,
    supervisor_id: 4,
    title: `Resolve ${inc.title}`,
    instructions: 'Deploy mobile dewatering suction pumps to clear underpass.',
    priority: inc.severity,
    status: 'ASSIGNED' as const,
    created_at: new Date().toISOString()
  };
  dbStore.tasks.unshift(newTask);
  addAuditLog('commander@civicnexus.gov.in', 'ASSIGN_INCIDENT', 'INCIDENTS', `Assigned ${inc.incident_code} to dept ${department_id}`);
  res.json({ incident: inc, task: newTask });
});

// ==========================================
// 5. TASKS & MUNICIPAL OPERATIONS
// ==========================================
app.get('/api/v1/tasks', (req: Request, res: Response) => {
  res.json(dbStore.tasks);
});

app.patch('/api/v1/tasks/:id/status', (req: Request, res: Response) => {
  const { status, worker_notes, completion_proof_url } = req.body;
  const task = dbStore.tasks.find(t => t.id === Number(req.params.id)) || dbStore.tasks[0];
  if (task) {
    task.status = status || task.status;
    if (worker_notes) task.worker_notes = worker_notes;
    if (completion_proof_url) task.completion_proof_url = completion_proof_url;
  }
  res.json(task || { id: Number(req.params.id), status: 'IN_PROGRESS' });
});

app.post('/api/v1/tasks/:id/verify', (req: Request, res: Response) => {
  const task = dbStore.tasks.find(t => t.id === Number(req.params.id)) || dbStore.tasks[0];
  if (task) {
    task.status = 'COMPLETED';
    const inc = dbStore.incidents.find(i => i.id === task.incident_id);
    if (inc) inc.status = 'RESOLVED';
  }
  res.json({ message: 'Task verified and marked completed', task });
});

// ==========================================
// 6. EMERGENCY & HOSPITALS
// ==========================================
app.get('/api/v1/emergency-cases', (req: Request, res: Response) => {
  res.json(dbStore.emergencyCases);
});

app.post('/api/v1/emergency-cases', (req: Request, res: Response) => {
  const { emergency_type, destination_hospital_name } = req.body;
  const newCase = {
    id: dbStore.emergencyCases.length + 1,
    incident_id: 1,
    emergency_type: emergency_type || 'AMBULANCE_DISPATCH',
    severity: 'CRITICAL',
    ambulance_id: '108-OD-BBSR-09',
    hospital_id: 1,
    destination_hospital_name: destination_hospital_name || 'AIIMS Bhubaneswar',
    eta_minutes: 14,
    route_status: 'CLEAR_VIA_VANI_VIHAR_BYPASS',
    route_waypoints: [
      { lat: 20.2961, lng: 85.8645, name: 'Rasulgarh Chowk' },
      { lat: 20.3015, lng: 85.8452, name: 'Vani Vihar Bypass' },
      { lat: 20.2294, lng: 85.7766, name: 'AIIMS Trauma Care' }
    ],
    status: 'EN_ROUTE',
    created_at: new Date().toISOString()
  };
  dbStore.emergencyCases.unshift(newCase);
  addAuditLog('emergency@civicnexus.gov.in', 'CREATE_EMERGENCY_CASE', 'EMERGENCY', `Dispatched ${newCase.ambulance_id}`);
  res.status(201).json(newCase);
});

app.get('/api/v1/hospitals', (req: Request, res: Response) => {
  res.json(dbStore.hospitals);
});

// ==========================================
// 7. TRAFFIC & ROADS
// ==========================================
app.get('/api/v1/road-restrictions', (req: Request, res: Response) => {
  res.json(dbStore.roadRestrictions);
});

app.post('/api/v1/road-restrictions', (req: Request, res: Response) => {
  const { road_name, segment_description, restriction_type } = req.body;
  const newRes = {
    id: dbStore.roadRestrictions.length + 1,
    incident_id: 1,
    road_name: road_name || 'NH-16 Rasulgarh Underpass',
    segment_description: segment_description || 'Submerged underpass segment closed for traffic',
    restriction_type: restriction_type || 'ROAD_CLOSED',
    status: 'ACTIVE' as const,
    lat_start: 20.2950,
    lng_start: 85.8640,
    lat_end: 20.2975,
    lng_end: 85.8655,
    created_at: new Date().toISOString()
  };
  dbStore.roadRestrictions.unshift(newRes);
  addAuditLog('traffic@civicnexus.gov.in', 'ADD_ROAD_RESTRICTION', 'TRAFFIC', `Closed ${road_name}`);
  res.status(201).json(newRes);
});

app.delete('/api/v1/road-restrictions/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const idx = dbStore.roadRestrictions.findIndex(r => r.id === id);
  if (idx !== -1) dbStore.roadRestrictions.splice(idx, 1);
  res.json({ message: 'Road restriction cleared' });
});

// ==========================================
// 8. CAMERAS, WEATHER, TOURISM, NOTIFS, ANALYTICS
// ==========================================
app.get('/api/v1/cameras', (req: Request, res: Response) => {
  res.json(dbStore.cameras);
});

app.get('/api/v1/weather', (req: Request, res: Response) => {
  res.json({
    stations: [
      { station_name: 'Bhubaneswar IMD Center', rainfall_mm: 82.4, wind_speed_kmh: 34.0, drainage_level_percent: 88, flood_risk_level: 'HIGH', advisory: 'Heavy rainfall alert in urban catchment' },
      { station_name: 'Cuttack Ring Road Station', rainfall_mm: 64.2, wind_speed_kmh: 28.5, drainage_level_percent: 62, flood_risk_level: 'MODERATE', advisory: 'Mahanadi sluice gates under monitoring' },
      { station_name: 'Puri Grand Road Station', rainfall_mm: 42.0, wind_speed_kmh: 40.2, drainage_level_percent: 45, flood_risk_level: 'LOW', advisory: 'Coastal high wind warning' }
    ],
    predictive_risk: {
      risk_score: 78.5,
      flood_risk_level: 'HIGH',
      advisory: 'Sluice pump auto-activation recommended at Rasulgarh and Bomikhal underpasses.'
    },
    last_synced: new Date().toISOString()
  });
});

app.get('/api/v1/tourism', (req: Request, res: Response) => {
  res.json(dbStore.tourismPlaces);
});

app.get('/api/v1/notifications', (req: Request, res: Response) => {
  res.json(dbStore.notifications);
});

app.post('/api/v1/notifications/:id/read', (req: Request, res: Response) => {
  const notif = dbStore.notifications.find(n => n.id === Number(req.params.id));
  if (notif) notif.is_read = true;
  res.json({ success: true });
});

app.get('/api/v1/audit-logs', (req: Request, res: Response) => {
  res.json(dbStore.auditLogs);
});

app.get('/api/v1/analytics/overview', (req: Request, res: Response) => {
  res.json({
    kpis: {
      total_incidents: dbStore.incidents.length + 14,
      active_incidents: dbStore.incidents.filter(i => i.status !== 'RESOLVED').length + 2,
      resolved_incidents: 12,
      critical_incidents: 1,
      total_reports: dbStore.reports.length + 28,
      active_road_restrictions: dbStore.roadRestrictions.length,
      median_assignment_min: 4.5,
      median_resolution_min: 38.0
    },
    by_category: [
      { category: 'Waterlogging', count: 18 },
      { category: 'Pothole & Roads', count: 12 },
      { category: 'Street Lighting', count: 8 },
      { category: 'Traffic Congestion', count: 6 },
      { category: 'Sanitation', count: 5 }
    ],
    by_department: [
      { name: 'Drainage & Flood', code: 'MUNICIPAL_DRAINAGE', incidents: 18 },
      { name: 'Roads & Infra', code: 'MUNICIPAL_ROADS', incidents: 12 },
      { name: 'Traffic Police', code: 'TRAFFIC_OPERATIONS', incidents: 6 },
      { name: 'Emergency Health', code: 'HEALTH_SERVICES', incidents: 3 }
    ],
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 9. FLAGSHIP DEMO 18-STEP WALKTHROUGH
// ==========================================
app.get('/api/v1/flagship/state', (req: Request, res: Response) => {
  res.json({
    current_step: dbStore.flagshipStep,
    total_steps: 18,
    status: dbStore.flagshipStep > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
    incident: dbStore.incidents[0],
    reports_count: dbStore.reports.length,
    tasks_count: dbStore.tasks.length,
    road_restrictions_count: dbStore.roadRestrictions.length,
    emergency_cases_count: dbStore.emergencyCases.length
  });
});

app.post('/api/v1/flagship/step/:step_id', (req: Request, res: Response) => {
  const step = Number(req.params.step_id);
  dbStore.flagshipStep = step;
  
  // Apply state modifications corresponding to step
  if (step === 1 || step === 2) {
    if (dbStore.reports.length === 0) {
      dbStore.reports.push({
        id: 1,
        report_code: 'REP-OD-2026-001',
        incident_id: 1,
        citizen_name: 'Debabrata Mohanty',
        citizen_phone: '+91 94370 12345',
        title: 'Severe Waterlogging at Rasulgarh Overbridge Underpass',
        category: 'Waterlogging',
        description: 'Deep waterlogging after heavy rain. Vehicles cannot cross.',
        address: 'Rasulgarh Junction Underpass, NH-16, Bhubaneswar',
        latitude: 20.2961,
        longitude: 85.8645,
        media_urls: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800'],
        status: 'SUBMITTED',
        ai_processed: true,
        created_at: new Date().toISOString()
      });
    }
  } else if (step === 6) {
    // Commander verifies incident
    dbStore.incidents[0].is_verified = true;
    dbStore.incidents[0].status = 'VERIFIED';
  } else if (step === 7) {
    // Assign to drainage
    dbStore.incidents[0].assigned_department_id = 1;
    dbStore.incidents[0].status = 'ASSIGNED';
    if (dbStore.tasks.length === 0) {
      dbStore.tasks.push({
        id: 1,
        incident_id: 1,
        department_id: 1,
        assigned_to_worker_id: 2,
        supervisor_id: 4,
        title: 'Deploy Dewatering Pump at Rasulgarh',
        instructions: 'Clear 40cm waterlogging at NH-16 underpass immediately.',
        priority: 'HIGH',
        status: 'ASSIGNED',
        created_at: new Date().toISOString()
      });
    }
  } else if (step === 9) {
    // Field worker accepts task
    if (dbStore.tasks[0]) dbStore.tasks[0].status = 'ACCEPTED';
  } else if (step === 10) {
    // Road restriction added
    if (dbStore.roadRestrictions.length === 0) {
      dbStore.roadRestrictions.push({
        id: 1,
        incident_id: 1,
        road_name: 'NH-16 Rasulgarh Underpass',
        segment_description: 'Rasulgarh Flyover Underpass flooded',
        restriction_type: 'ROAD_CLOSED',
        status: 'ACTIVE',
        lat_start: 20.2950,
        lng_start: 85.8640,
        lat_end: 20.2975,
        lng_end: 85.8655,
        created_at: new Date().toISOString()
      });
    }
  } else if (step === 11) {
    // Emergency ambulance dispatched
    if (dbStore.emergencyCases.length === 0) {
      dbStore.emergencyCases.push({
        id: 1,
        incident_id: 1,
        emergency_type: 'CRITICAL_TRAUMA_AMBULANCE',
        severity: 'CRITICAL',
        ambulance_id: '108-OD-BBSR-09',
        hospital_id: 1,
        destination_hospital_name: 'AIIMS Bhubaneswar',
        eta_minutes: 12,
        route_status: 'REROUTED_VIA_VANI_VIHAR_BYPASS',
        status: 'EN_ROUTE',
        created_at: new Date().toISOString()
      });
    }
  } else if (step === 16) {
    // Task completed
    if (dbStore.tasks[0]) {
      dbStore.tasks[0].status = 'COMPLETED';
      dbStore.tasks[0].completion_proof_url = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800';
    }
    dbStore.incidents[0].status = 'RESOLVED';
  }

  res.json({
    step,
    message: `Step ${step} executed successfully.`,
    state: {
      incident: dbStore.incidents[0],
      tasks: dbStore.tasks,
      emergency: dbStore.emergencyCases[0],
      restrictions: dbStore.roadRestrictions
    }
  });
});

app.post(['/api/v1/flagship/reset', '/api/v1/demo/reset'], (req: Request, res: Response) => {
  const fresh = createInitialDb();
  Object.assign(dbStore, fresh);
  addAuditLog('admin@civicnexus.gov.in', 'RESET_SYSTEM', 'DEMO', 'Full database reset performed.');
  res.json({ message: 'System state reset to baseline default.', success: true });
});

// ==========================================
// 10. SMART TOURISM MODULE
// ==========================================
app.get('/api/tourism/destinations', (req: Request, res: Response) => {
  res.json(dbStore.tourismPlaces);
});

app.get('/api/tourism/destinations/:id', (req: Request, res: Response) => {
  const dest = dbStore.tourismPlaces.find(t => t.id === Number(req.params.id)) || dbStore.tourismPlaces[0];
  res.json(dest);
});

app.get('/api/tourism/events', (req: Request, res: Response) => {
  res.json([
    { id: 1, title: 'Konark Dance Festival', location: 'Konark Sun Temple Open Air Auditorium', date: 'Dec 1 - Dec 5', category: 'Classical Dance & Cultural Heritage' },
    { id: 2, title: 'Ratha Yatra Puri', location: 'Grand Road, Puri', date: 'July Annual Celebration', category: 'Global Pilgrimage & Chariot Festival' },
    { id: 3, title: 'Toshali National Crafts Mela', location: 'Janpath, Bhubaneswar', date: 'Dec 15 - Dec 27', category: 'Handloom & Handicrafts Exposition' }
  ]);
});

app.get('/api/tourism/advisories', (req: Request, res: Response) => {
  res.json([
    { id: 1, level: 'INFO', title: 'High Tide Warning at Blue Flag Beach Puri', message: 'Lifeguard stations active. Red flags posted near lighthouse zone.' },
    { id: 2, level: 'CLEAR', title: 'Heritage Corridor Smooth Traffic', message: 'Ekamra Kshetra electric golf carts operating normally.' }
  ]);
});

app.get('/api/tourism/heritage-trails', (req: Request, res: Response) => {
  res.json([
    { id: 1, name: 'Ekamra Kshetra 1,000-Year Temple Trail', duration: '3 Hours', stops: ['Lingaraj Temple', 'Mukteshwar Temple', 'Ananta Vasudeva', 'Bindusagar Lake'] },
    { id: 2, name: 'Ashokan Peace & Rock Edicts Circuit', duration: '2.5 Hours', stops: ['Dhauli Peace Pagoda', 'Rock Edict Inscription', 'Daya River Memorial'] },
    { id: 3, name: 'Puri Golden Beach & Jagannath Corridor', duration: '4 Hours', stops: ['Jagannath Temple Heritage Corridor', 'Raghurajpur Crafts Village', 'Blue Flag Beach'] }
  ]);
});

app.get('/api/tourism/itineraries', (req: Request, res: Response) => {
  res.json([]);
});

app.post('/api/tourism/itineraries', (req: Request, res: Response) => {
  res.status(201).json({ id: 101, message: 'Custom Odisha Heritage Itinerary created and saved' });
});

app.post('/api/tourism/saved-destinations', (req: Request, res: Response) => {
  res.status(201).json({ message: 'Destination saved to citizen profile' });
});

app.get('/api/tourism/saved-destinations', (req: Request, res: Response) => {
  res.json(dbStore.tourismPlaces.slice(0, 2));
});

app.delete('/api/tourism/saved-destinations/:id', (req: Request, res: Response) => {
  res.json({ message: 'Removed from saved destinations' });
});

app.post('/api/tourism/content-corrections', (req: Request, res: Response) => {
  res.status(201).json({ message: 'Tourism correction submitted for moderation' });
});

app.post('/api/tourism/ai-planner', async (req: Request, res: Response) => {
  const { duration_days, interests } = req.body;
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a customized ${duration_days || 2}-day tourism itinerary for Odisha focusing on ${interests || 'Culture, Temples, Heritage, Nature'}. Return structured JSON.`
      });
      return res.json({ itinerary: response.text });
    } catch (e) {
      console.warn('AI planner fallback:', e);
    }
  }
  res.json({
    title: `${duration_days || 2}-Day Smart Heritage Odisha Tour`,
    days: [
      { day: 1, title: 'Bhubaneswar Temple City & Dhauli Peace Stupa', spots: ['Lingaraj Temple', 'Mukteshwar', 'Dhauli Hill'] },
      { day: 2, title: 'Puri Jagannath Shrine & Konark Sun Wheel', spots: ['Puri Jagannath Corridor', 'Konark Sun Temple', 'Chandrabhaga Beach'] }
    ]
  });
});

// ==========================================
// 11. CITIZEN INBOX & THREADS
// ==========================================
app.get('/api/citizen/inbox/stats', (req: Request, res: Response) => {
  res.json({ unread_count: 2, total_notifications: 5, active_threads: 1 });
});

app.get('/api/citizen/inbox/notifications', (req: Request, res: Response) => {
  res.json(dbStore.notifications);
});

app.get('/api/citizen/inbox/threads', (req: Request, res: Response) => {
  res.json([
    {
      id: 1,
      ticket_code: 'REP-OD-2026-001',
      subject: 'Update on Rasulgarh Waterlogging Complaint',
      department: 'Drainage & Flood Management',
      last_message: 'Sluice pumps deployed at underpass. Water receding.',
      updated_at: new Date().toISOString()
    }
  ]);
});

app.get('/api/citizen/inbox/threads/:id', (req: Request, res: Response) => {
  res.json({
    id: Number(req.params.id),
    ticket_code: 'REP-OD-2026-001',
    subject: 'Update on Rasulgarh Waterlogging Complaint',
    messages: [
      { sender: 'AI Assistant', text: 'Complaint registered and routed to Drainage Dept.', timestamp: new Date().toISOString() },
      { sender: 'Department Officer', text: 'Sluice pump team dispatched.', timestamp: new Date().toISOString() }
    ]
  });
});

app.post('/api/citizen/inbox/threads/:id/messages', (req: Request, res: Response) => {
  res.status(201).json({
    sender: 'Debabrata Mohanty',
    text: req.body.text || 'Thank you for prompt update',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/citizen/inbox/preferences', (req: Request, res: Response) => {
  res.json({ sms_alerts: true, whatsapp_updates: true, email_summaries: false });
});

app.put('/api/citizen/inbox/preferences', (req: Request, res: Response) => {
  res.json({ message: 'Preferences updated' });
});

app.post('/api/citizen/inbox/mark-all-read', (req: Request, res: Response) => {
  dbStore.notifications.forEach(n => n.is_read = true);
  res.json({ message: 'All notifications marked read' });
});

// ==========================================
// 12. COMMUNITY HUB & CONSULTATIONS
// ==========================================
app.get('/api/community/proposals', (req: Request, res: Response) => {
  res.json([
    { id: 1, title: 'Solar Powered Smart Streetlights along Janpath', votes: 342, category: 'Energy Efficiency', status: 'UNDER_CIVIC_REVIEW' },
    { id: 2, title: 'Ekamra Kshetra Pedestrianization & Green Corridor', votes: 512, category: 'Urban Heritage', status: 'APPROVED' }
  ]);
});

app.get('/api/community/consultations', (req: Request, res: Response) => {
  res.json([
    { id: 1, title: 'Bhubaneswar Vision 2030 Flood Resilience Blueprint', responses: 128, status: 'OPEN' }
  ]);
});

app.get('/api/community/projects', (req: Request, res: Response) => {
  res.json([
    { id: 1, name: 'Daya Riverfront Ecological Restoration', status: 'IN_PROGRESS', progress: 65 }
  ]);
});

app.get('/api/community/events', (req: Request, res: Response) => {
  res.json([
    { id: 1, title: 'Odisha Civic Hackathon & Smart City Volunteering', location: 'Kalinga Stadium Auditorium', date: 'Next Saturday' }
  ]);
});

app.get('/api/community/stats', (req: Request, res: Response) => {
  res.json({ active_proposals: 12, total_votes: 4200, active_consultations: 3 });
});

// ==========================================
// 13. EXPLORE CITY MAP LAYERS
// ==========================================
app.get('/api/explore/map-layers', (req: Request, res: Response) => {
  res.json([
    { id: 'waterlogging', name: 'Waterlogging & Flood Prone Drains', count: dbStore.incidents.length },
    { id: 'hospitals', name: 'Trauma Centers & Hospitals', count: dbStore.hospitals.length },
    { id: 'cameras', name: 'Smart CCTV Camera Feeds', count: dbStore.cameras.length },
    { id: 'tourism', name: 'Heritage Sites & Cultural Spots', count: dbStore.tourismPlaces.length }
  ]);
});

app.get('/api/explore/area-snapshot', (req: Request, res: Response) => {
  res.json({
    zone: 'Rasulgarh Chowk Sector 4',
    live_risk_score: 'HIGH',
    active_incidents: 1,
    nearest_hospital: 'Capital Hospital (3.2 km)',
    nearest_shelter: 'Rasulgarh Kalyan Mandap'
  });
});

app.get('/api/explore/civic-issues', (req: Request, res: Response) => {
  res.json(dbStore.incidents);
});

app.get('/api/explore/public-facilities', (req: Request, res: Response) => {
  res.json(dbStore.hospitals);
});

app.get('/api/explore/road-mobility', (req: Request, res: Response) => {
  res.json(dbStore.roadRestrictions);
});

app.get('/api/explore/heritage-tourism', (req: Request, res: Response) => {
  res.json(dbStore.tourismPlaces);
});

app.get('/api/explore/community-improvements', (req: Request, res: Response) => {
  res.json([]);
});

// ==========================================
// 14. HELP & SUPPORT TICKETS
// ==========================================
app.get('/api/citizen/support-tickets', (req: Request, res: Response) => {
  res.json([
    { id: 1, ticket_code: 'SUP-OD-01', subject: 'Inquiry regarding citizen portal OTP', status: 'CLOSED' }
  ]);
});

app.post('/api/help/assistant/chat', async (req: Request, res: Response) => {
  const { message } = req.body;
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are the AI Help Assistant for CIVIC NEXUS AI Odisha Smart City platform. User asks: "${message}". Give a clear 2-3 sentence helpful guidance.`
      });
      return res.json({ response: response.text });
    } catch (e) {
      console.warn('Help chat AI fallback:', e);
    }
  }
  res.json({
    response: 'Welcome to CIVIC NEXUS AI Help Desk. You can submit waterlogging and civic complaints via Citizen Portal, track emergency 108 ambulances, or view city command center updates.'
  });
});

// ==========================================
// VITE MIDDLEWARE OR STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`🏛️ CIVIC NEXUS AI Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
