// Stateful in-memory database seeded with Odisha Smart City default data

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  sla_hours: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  department_id?: number;
  is_active: boolean;
  created_at: string;
}

export interface Incident {
  id: number;
  incident_code: string;
  title: string;
  category: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'REPORTED' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
  address: string;
  latitude: number;
  longitude: number;
  assigned_department_id?: number;
  is_verified: boolean;
  priority_score: number;
  priority_factors?: any;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: number;
  report_code: string;
  incident_id?: number;
  citizen_name?: string;
  citizen_phone?: string;
  title: string;
  category: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  media_urls?: string[];
  voice_url?: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ATTACHED_TO_INCIDENT' | 'RESOLVED';
  ai_processed: boolean;
  created_at: string;
}

export interface TaskProgressUpdate {
  id: number;
  task_id: number;
  status: string;
  notes: string;
  blocker_reported?: boolean;
  photo_url?: string;
  created_at: string;
}

export interface TaskHistoryEvent {
  id: number;
  task_id: number;
  event_type: string;
  actor_role: string;
  actor_name: string;
  message: string;
  created_at: string;
}

export interface Task {
  id: number;
  incident_id: number;
  department_id: number;
  department_name?: string;
  assigned_to_worker_id?: number;
  worker_name?: string;
  worker_phone?: string;
  worker_code?: string;
  supervisor_id?: number;
  supervisor_name?: string;
  title: string;
  category?: string;
  description?: string;
  instructions?: string;
  priority: string;
  status: 'CREATED' | 'ASSIGNED' | 'ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'COMPLETED' | 'REJECTED' | 'RETURNED' | 'CANCELLED';
  rejection_reason?: string;
  rejection_notes?: string;
  deadline?: string;
  started_at?: string;
  accepted_at?: string;
  on_the_way_at?: string;
  arrived_at?: string;
  completed_at?: string;
  submitted_at?: string;
  verified_at?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  checkin_latitude?: number;
  checkin_longitude?: number;
  checkin_distance_meters?: number;
  checkin_within_radius?: boolean;
  before_photo_url?: string;
  before_photo_desc?: string;
  after_photo_url?: string;
  after_photo_desc?: string;
  worker_notes?: string;
  completion_summary?: string;
  materials_used?: string;
  equipment_required?: string;
  completion_proof_url?: string;
  supervisor_feedback?: string;
  progress_updates?: TaskProgressUpdate[];
  history?: TaskHistoryEvent[];
  created_at: string;
  updated_at?: string;
}

export interface EmergencyCase {
  id: number;
  incident_id: number;
  emergency_type: string;
  severity: string;
  coordinator_id?: number;
  assigned_units?: string[];
  ambulance_id?: string;
  hospital_id?: number;
  destination_hospital_name?: string;
  eta_minutes: number;
  route_status: string;
  route_waypoints?: { lat: number; lng: number; name?: string }[];
  status: string;
  created_at: string;
}

export interface Hospital {
  id: number;
  name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  total_beds: number;
  available_beds: number;
  icu_beds: number;
  available_icu: number;
  blood_bank_status: string;
  trauma_level: string;
  contact_phone?: string;
}

export interface RoadRestriction {
  id: number;
  incident_id?: number;
  road_name: string;
  segment_description: string;
  restriction_type: string;
  status: 'ACTIVE' | 'CLEARED';
  lat_start: number;
  lng_start: number;
  lat_end: number;
  lng_end: number;
  created_at: string;
  cleared_at?: string;
}

export interface CameraSource {
  id: number;
  camera_code: string;
  location_name: string;
  latitude: number;
  longitude: number;
  status: string;
  stream_status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  stream_url?: string;
  fps: number;
  frame_sampling_fps: number;
  supported_types: string[];
  active_detections: any[];
  current_model: string;
  last_successful_frame_at: string;
  last_heartbeat: string;
}

export interface BoundingBoxDetection {
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  trackId?: string;
}

export interface AIDetectionEvent {
  candidateId: string;
  cameraId: number;
  cameraCode: string;
  locationName: string;
  latitude: number;
  longitude: number;
  detectionType: string;
  confidenceScore: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  evidenceReferences: string[];
  locationReference: string;
  verificationStatus: 'AI-DETECTED' | 'AWAITING-VERIFICATION' | 'VERIFIED' | 'FALSE-ALARM' | 'RESOLVED';
  modelVersion: string;
  processingStatus: 'STREAMING' | 'ANALYZING' | 'STABLE' | 'DEGRADED';
  incidentId?: number;
  boundingBoxes: BoundingBoxDetection[];
  estimatedVehicleCount?: number;
  notes?: string;
}

export interface EmergencyAlert {
  alertId: string;
  incidentId: number;
  candidateId?: string;
  emergencyType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  alertStatus: 'NEW' | 'ACKNOWLEDGED' | 'ESCALATED' | 'DISPATCHED' | 'RESOLVED' | 'FALSE_ALARM';
  verificationStatus: 'AI-DETECTED' | 'AWAITING-VERIFICATION' | 'VERIFIED' | 'FALSE-ALARM' | 'RESOLVED';
  createdAt: string;
  acknowledgementDeadline: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  escalated: boolean;
  escalationLevel: number;
  escalationLog?: { level: number; notifiedRole: string; timestamp: string; reason: string }[];
  cameraCode?: string;
  location: string;
  latitude: number;
  longitude: number;
  confidenceScore: number;
  recommendedAction: string;
  soundTriggered: boolean;
  assignedUnitId?: string;
  assignedDepartmentName?: string;
  summaryAi?: string;
}

export interface EmergencyVehicle {
  id: string;
  vehicleType: 'AMBULANCE_108' | 'FIRE_ENGINE' | 'POLICE_PATROL' | 'DISASTER_RESCUE';
  callSign: string;
  licensePlate: string;
  baseStationName: string;
  driverName: string;
  contactNumber: string;
  currentStatus: 'ON_PATROL' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'RETURNING' | 'AVAILABLE';
  latitude: number;
  longitude: number;
  speedKmh: number;
  heading: number;
  fuelPercent: number;
  assignedIncidentId?: number;
  destinationHospitalName?: string;
  etaMinutes?: number;
  lastGpsUpdate: string;
  isDemo: boolean;
}

export interface EmergencyResponseDispatch {
  responseId: string;
  incidentId: number;
  alertId?: string;
  responseType: 'AMBULANCE' | 'FIRE_BRIGADE' | 'POLICE_ESCORT' | 'MUNICIPAL_DISASTER_CREW';
  assignedUnitId: string;
  assignedUnitName: string;
  dispatchedBy: string;
  dispatchedAt: string;
  responseStatus: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'PATIENT_LOADED' | 'COMPLETED' | 'CANCELLED';
  arrivedAt?: string;
  resolvedAt?: string;
  etaMinutes: number;
  responderNotes?: string;
  isDemo: boolean;
}

export interface AlertDeliveryLog {
  deliveryId: string;
  alertId: string;
  recipientRole: string;
  recipientEmail: string;
  channel: 'IN_APP' | 'SSE_STREAM' | 'WEBHOOK' | 'SMS_SIMULATED';
  deliveryStatus: 'DELIVERED' | 'PENDING' | 'FAILED';
  attemptedAt: string;
}

export interface AlertEscalationRecord {
  escalationId: string;
  alertId: string;
  level: number;
  escalatedToRole: string;
  reason: string;
  timestamp: string;
  status: 'ACTIVE' | 'RESOLVED';
}

export interface VideoAnalysisEvent {
  eventId: string;
  videoAnalysisId: string;
  eventType: string;
  videoTimestamp: string;
  videoTimestampSeconds: number;
  confidenceScore: number;
  evidenceThumbnail: string;
  boundingBoxes: { label: string; confidence: number; x: number; y: number; width: number; height: number; color: string }[];
  trackingId?: string;
  trackingStatus?: string;
  description: string;
  verificationStatus: 'AI_CANDIDATE' | 'AWAITING_VERIFICATION' | 'VERIFIED' | 'FALSE_ALARM' | 'RESOLVED';
  recommendedAction: string;
  incidentId?: number;
  alertId?: string;
}

export interface VideoAnalysis {
  videoAnalysisId: string;
  uploadedBy: string;
  storageReference: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  durationSeconds: number;
  resolution: string;
  framesAnalyzed: number;
  analysisStatus: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  processingStartedAt: string;
  processingCompletedAt?: string;
  pipelineVersion: string;
  locationName: string;
  cameraCode?: string;
  recordedAt?: string;
  description?: string;
  summaryNarrative: string;
  detectedEmergency: boolean;
  events: VideoAnalysisEvent[];
  routeVerificationStatus?: 'UNVERIFIED' | 'VERIFIED' | 'NOT_APPLICABLE';
  routeClearanceRequestId?: string;
  errorDetail?: string;
}

export interface RouteClearanceRequest {
  requestId: string;
  incidentId: number;
  alertId?: string;
  videoAnalysisId?: string;
  vehicleType: 'AMBULANCE' | 'FIRE_ENGINE' | 'POLICE_ESCORT' | 'DISASTER_RESCUE';
  vehicleCallSign?: string;
  routeReference: string;
  requestedBy: string;
  requestStatus: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'CLEARED' | 'REJECTED';
  originLocation: string;
  destinationHospital: string;
  corridorSegments: { segmentName: string; roadName: string; status: 'CLEAR' | 'CONGESTED' | 'PREEMPTED'; etaMinutes: number }[];
  preemptionSignals: string[];
  trafficClearanceNotice: string;
  createdAt: string;
  updatedAt: string;
}

export interface TourismPlace {
  id: number;
  name: string;
  odia_name: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  cultural_significance?: string;
  timings: string;
  accessibility_notes: string;
  current_safety_status: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: 'INFO' | 'ALERT' | 'CRITICAL' | 'SUCCESS';
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_email: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
}

export interface MunicipalAsset {
  id: number;
  asset_code: string;
  name: string;
  category: string;
  ward: string;
  condition: 'GOOD' | 'FAIR' | 'NEEDS_MAINTENANCE' | 'CRITICAL_FAULT';
  last_inspected: string;
  location: string;
}

export interface InventoryItem {
  id: number;
  item_code: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_reorder_level: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'CRITICAL_REORDER';
}

export interface StaffRegistration {
  id: number;
  ref_code: string;
  full_name: string;
  email: string;
  phone: string;
  employee_id: string;
  department_id: number;
  department_name: string;
  designation: string;
  zone_or_office: string;
  password_hash?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'INFO_REQUESTED';
  role: string;
  rejection_reason?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface IncidentEvent {
  eventId: string;
  eventType: string;
  incidentId?: number;
  assignmentId?: number;
  actorUserId?: string | number;
  eventPayload?: any;
  eventVersion: number;
  createdAt: string;
}

export function createInitialDb() {
  const departments: Department[] = [
    { id: 1, name: "Drainage and Flood Management", code: "MUNICIPAL_DRAINAGE", description: "Stormwater drains, sluice pumps, culverts, and urban waterlogging relief.", contact_email: "drainage@civicnexus.gov.in", contact_phone: "+91 674 2431001", sla_hours: 12 },
    { id: 2, name: "Roads and Infrastructure", code: "MUNICIPAL_ROADS", description: "Municipal road repair, pothole restoration, flyover integrity.", contact_email: "roads@civicnexus.gov.in", contact_phone: "+91 674 2431002", sla_hours: 24 },
    { id: 3, name: "Traffic Management & Corridor Safety", code: "TRAFFIC_OPERATIONS", description: "Traffic control, signal timing, arterial diversions, and green corridors.", contact_email: "traffic@civicnexus.gov.in", contact_phone: "+91 674 2431003", sla_hours: 6 },
    { id: 4, name: "Fire and Rescue Services", code: "FIRE_RESCUE", description: "Odisha Fire & Emergency Services, disaster response, and boat deployment.", contact_email: "fire@civicnexus.gov.in", contact_phone: "+91 674 2431101", sla_hours: 4 },
    { id: 5, name: "Sanitation and Waste Management", code: "SANITATION_WASTE", description: "Solid waste collection, bio-medical waste compliance, drain desilting.", contact_email: "sanitation@civicnexus.gov.in", contact_phone: "+91 674 2431004", sla_hours: 24 },
    { id: 6, name: "Street Lighting and Electrical", code: "STREET_LIGHTING", description: "Smart LED streetlights, transformer safety, high-mast illumination.", contact_email: "lighting@civicnexus.gov.in", contact_phone: "+91 674 2431005", sla_hours: 18 },
    { id: 7, name: "Emergency Healthcare Coordination", code: "HEALTH_SERVICES", description: "108 Ambulance dispatch and trauma bed coordination.", contact_email: "health@civicnexus.gov.in", contact_phone: "+91 674 2431006", sla_hours: 2 },
    { id: 8, name: "Smart Tourism & Cultural Heritage", code: "TOURISM_CULTURE", description: "Odisha Tourism visitor safety, heritage corridor monitoring.", contact_email: "tourism@civicnexus.gov.in", contact_phone: "+91 674 2431007", sla_hours: 48 },
  ];

  const users: User[] = [
    { id: 1, email: "citizen@civicnexus.gov.in", full_name: "Debabrata Mohanty", phone: "+91 94370 12345", role: "CITIZEN", is_active: true, created_at: new Date().toISOString() },
    { id: 2, email: "worker@civicnexus.gov.in", full_name: "Bikash Mohapatra", phone: "+91 94371 23456", role: "FIELD_WORKER", department_id: 1, is_active: true, created_at: new Date().toISOString() },
    { id: 3, email: "officer@civicnexus.gov.in", full_name: "Ananya Patnaik", phone: "+91 94372 34567", role: "DEPARTMENT_OFFICER", department_id: 1, is_active: true, created_at: new Date().toISOString() },
    { id: 4, email: "supervisor@civicnexus.gov.in", full_name: "Sanjay Tripathy", phone: "+91 94373 45678", role: "DEPARTMENT_SUPERVISOR", department_id: 1, is_active: true, created_at: new Date().toISOString() },
    { id: 5, email: "traffic@civicnexus.gov.in", full_name: "Rakesh Behera", phone: "+91 94374 56789", role: "TRAFFIC_OPERATOR", department_id: 3, is_active: true, created_at: new Date().toISOString() },
    { id: 6, email: "hospital@civicnexus.gov.in", full_name: "Dr. Subhasree Nayak", phone: "+91 94375 67890", role: "HOSPITAL_COORDINATOR", department_id: 7, is_active: true, created_at: new Date().toISOString() },
    { id: 7, email: "fire@civicnexus.gov.in", full_name: "Pradeep Jena", phone: "+91 94376 78901", role: "FIRE_RESCUE_OPERATOR", department_id: 4, is_active: true, created_at: new Date().toISOString() },
    { id: 8, email: "emergency@civicnexus.gov.in", full_name: "Manoj Das", phone: "+91 94377 89012", role: "EMERGENCY_COORDINATOR", is_active: true, created_at: new Date().toISOString() },
    { id: 9, email: "tourism@civicnexus.gov.in", full_name: "Swagatika Mishra", phone: "+91 94378 90123", role: "TOURISM_ADMIN", department_id: 8, is_active: true, created_at: new Date().toISOString() },
    { id: 10, email: "commander@civicnexus.gov.in", full_name: "Asit Kumar Rath", phone: "+91 94379 01234", role: "CITY_COMMANDER", is_active: true, created_at: new Date().toISOString() },
    { id: 11, email: "admin@civicnexus.gov.in", full_name: "Administrator Code Blaze", phone: "+91 94380 12345", role: "SUPER_ADMIN", is_active: true, created_at: new Date().toISOString() },
  ];

  const hospitals: Hospital[] = [
    { id: 1, name: "AIIMS Bhubaneswar", location_name: "Sijua, Patrapada, Bhubaneswar", latitude: 20.2294, longitude: 85.7766, total_beds: 1200, available_beds: 142, icu_beds: 150, available_icu: 18, blood_bank_status: "A+ O+ B- Highly Available", trauma_level: "Level I Trauma Center", contact_phone: "+91 674 2476789" },
    { id: 2, name: "Capital Hospital", location_name: "Unit-6, Bhubaneswar", latitude: 20.2608, longitude: 85.8286, total_beds: 750, available_beds: 88, icu_beds: 60, available_icu: 7, blood_bank_status: "All Major Groups Available", trauma_level: "Level II Trauma Center", contact_phone: "+91 674 2391983" },
    { id: 3, name: "SCB Medical College", location_name: "Mangalabag, Cuttack", latitude: 20.4789, longitude: 85.8821, total_beds: 2100, available_beds: 215, icu_beds: 200, available_icu: 22, blood_bank_status: "Apex Regional Blood Bank", trauma_level: "Level I Apex Trauma", contact_phone: "+91 671 2414080" },
    { id: 4, name: "KIMS Hospital", location_name: "KIIT Campus, Patia, Bhubaneswar", latitude: 20.3541, longitude: 85.8188, total_beds: 1500, available_beds: 310, icu_beds: 180, available_icu: 34, blood_bank_status: "Full Stock", trauma_level: "Level I Multispecialty", contact_phone: "+91 674 2725182" },
    { id: 5, name: "District Headquarter Hospital Puri", location_name: "Grand Road, Puri", latitude: 19.8083, longitude: 85.8267, total_beds: 400, available_beds: 52, icu_beds: 30, available_icu: 4, blood_bank_status: "O+ B+ A+ Stocked", trauma_level: "Level II Emergency Care", contact_phone: "+91 6752 222022" },
  ];

  const cameras: CameraSource[] = [
    {
      id: 1,
      camera_code: "CCTV-OD-101",
      location_name: "Rasulgarh Junction Flyover NH-16",
      latitude: 20.2961,
      longitude: 85.8645,
      status: "ACTIVE",
      stream_status: "ONLINE",
      stream_url: "/streams/cctv-od-101-live.m3u8",
      fps: 30,
      frame_sampling_fps: 2.5,
      supported_types: ["POSSIBLE_ROAD_ACCIDENT", "POSSIBLE_FIRE_OR_SMOKE", "YOLO_TRAFFIC"],
      active_detections: [
        { type: "POSSIBLE_ROAD_ACCIDENT", severity: "CRITICAL", confidence: 0.92, bbox: [140, 220, 360, 480], label: "COLLISION_IMPACT_ZONE" }
      ],
      current_model: "NexusVision-OD-v2.4-YOLO11",
      last_successful_frame_at: new Date().toISOString(),
      last_heartbeat: new Date().toISOString()
    },
    {
      id: 2,
      camera_code: "CCTV-OD-102",
      location_name: "Vani Vihar Corridor & Utkal University Gate",
      latitude: 20.3015,
      longitude: 85.8452,
      status: "ACTIVE",
      stream_status: "ONLINE",
      stream_url: "/streams/cctv-od-102-live.m3u8",
      fps: 30,
      frame_sampling_fps: 2.5,
      supported_types: ["AMBULANCE_108_IN_TRANSIT", "POSSIBLE_ROAD_ACCIDENT"],
      active_detections: [
        { type: "AMBULANCE_108_IN_TRANSIT", severity: "HIGH", confidence: 0.97, bbox: [110, 180, 290, 410], label: "108_LIFELINE_AMBULANCE" }
      ],
      current_model: "NexusVision-OD-v2.4-YOLO11",
      last_successful_frame_at: new Date().toISOString(),
      last_heartbeat: new Date().toISOString()
    },
    {
      id: 3,
      camera_code: "CCTV-OD-103",
      location_name: "Bomikhal Canal Underpass Sluice",
      latitude: 20.2831,
      longitude: 85.8512,
      status: "ACTIVE",
      stream_status: "ONLINE",
      stream_url: "/streams/cctv-od-103-live.m3u8",
      fps: 25,
      frame_sampling_fps: 2.0,
      supported_types: ["POSSIBLE_FIRE_OR_SMOKE", "ROADWAY_OBSTRUCTION"],
      active_detections: [
        { type: "POSSIBLE_FIRE_OR_SMOKE", severity: "HIGH", confidence: 0.88, bbox: [210, 120, 480, 390], label: "THERMAL_SMOKE_PLUME" }
      ],
      current_model: "NexusVision-OD-v2.4-ThermalSmoke",
      last_successful_frame_at: new Date().toISOString(),
      last_heartbeat: new Date().toISOString()
    },
    {
      id: 4,
      camera_code: "CCTV-OD-104",
      location_name: "AIIMS Lifeline Trauma Access Corridor",
      latitude: 20.2294,
      longitude: 85.7766,
      status: "ACTIVE",
      stream_status: "ONLINE",
      stream_url: "/streams/cctv-od-104-live.m3u8",
      fps: 30,
      frame_sampling_fps: 2.5,
      supported_types: ["AMBULANCE_108_IN_TRANSIT", "GREEN_CORRIDOR_CLEARANCE"],
      active_detections: [],
      current_model: "NexusVision-OD-v2.4-FleetTracker",
      last_successful_frame_at: new Date().toISOString(),
      last_heartbeat: new Date().toISOString()
    },
    {
      id: 5,
      camera_code: "CCTV-OD-105",
      location_name: "Master Canteen Smart City Transit Plaza",
      latitude: 20.2642,
      longitude: 85.8398,
      status: "ACTIVE",
      stream_status: "ONLINE",
      stream_url: "/streams/cctv-od-105-live.m3u8",
      fps: 30,
      frame_sampling_fps: 2.5,
      supported_types: ["CROWD_CONGESTION", "POTENTIAL_CROWD_SAFETY_RISK"],
      active_detections: [
        { type: "CROWD_CONGESTION", severity: "MEDIUM", confidence: 0.85, bbox: [90, 140, 520, 680], label: "PEDESTRIAN_DENSITY_HIGH" }
      ],
      current_model: "NexusVision-OD-v2.4-CrowdDensity",
      last_successful_frame_at: new Date().toISOString(),
      last_heartbeat: new Date().toISOString()
    },
    {
      id: 6,
      camera_code: "CCTV-OD-106",
      location_name: "Khandagiri Ancient Cave Approach Bypass",
      latitude: 20.2588,
      longitude: 85.7865,
      status: "DEGRADED",
      stream_status: "DEGRADED",
      stream_url: "/streams/cctv-od-106-live.m3u8",
      fps: 12,
      frame_sampling_fps: 1.0,
      supported_types: ["HERITAGE_SAFETY", "VEHICLE_COLLISION"],
      active_detections: [],
      current_model: "NexusVision-OD-v2.4-YOLO11",
      last_successful_frame_at: new Date(Date.now() - 45000).toISOString(),
      last_heartbeat: new Date(Date.now() - 45000).toISOString()
    }
  ];

  // AI Detection Candidate Events (Structured Candidate Events)
  const aiDetectionEvents: AIDetectionEvent[] = [
    {
      candidateId: "CAND-OD-2026-01",
      cameraId: 1,
      cameraCode: "CCTV-OD-101",
      locationName: "Rasulgarh Junction Flyover NH-16",
      latitude: 20.2961,
      longitude: 85.8645,
      detectionType: "POSSIBLE_ROAD_ACCIDENT",
      confidenceScore: 0.92,
      firstDetectedAt: new Date(Date.now() - 240000).toISOString(),
      lastDetectedAt: new Date(Date.now() - 30000).toISOString(),
      evidenceReferences: [
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
        "/evidence/cctv-101-frame-0824.jpg",
        "/evidence/cctv-101-frame-0825.jpg"
      ],
      locationReference: "NH-16 Overbridge Rasulgarh East Approach Lane 2",
      verificationStatus: "AWAITING-VERIFICATION",
      modelVersion: "NexusVision-OD-v2.4-YOLO11",
      processingStatus: "STREAMING",
      incidentId: 1,
      boundingBoxes: [
        { label: "VEHICLE_COLLISION", confidence: 0.92, x: 28, y: 35, width: 38, height: 42, color: "#EF4444", trackId: "TRK-CAR-88" },
        { label: "STOPPED_VEHICLE_OBSTRUCTION", confidence: 0.89, x: 62, y: 44, width: 22, height: 28, color: "#F59E0B", trackId: "TRK-CAR-91" }
      ],
      estimatedVehicleCount: 2,
      notes: "Abrupt deceleration followed by rotational collision detected across frames 0820-0835. Traffic slowdown in progress."
    },
    {
      candidateId: "CAND-OD-2026-02",
      cameraId: 3,
      cameraCode: "CCTV-OD-103",
      locationName: "Bomikhal Canal Underpass Sluice",
      latitude: 20.2831,
      longitude: 85.8512,
      detectionType: "POSSIBLE_FIRE_OR_SMOKE",
      confidenceScore: 0.88,
      firstDetectedAt: new Date(Date.now() - 360000).toISOString(),
      lastDetectedAt: new Date(Date.now() - 60000).toISOString(),
      evidenceReferences: [
        "/evidence/cctv-103-thermal-frame-0112.jpg",
        "/evidence/cctv-103-thermal-frame-0113.jpg"
      ],
      locationReference: "Bomikhal Canal Service Road Near Electrical Transformer Hub",
      verificationStatus: "AI-DETECTED",
      modelVersion: "NexusVision-OD-v2.4-ThermalSmoke",
      processingStatus: "STREAMING",
      boundingBoxes: [
        { label: "POSSIBLE_SMOKE_PLUME", confidence: 0.88, x: 38, y: 18, width: 44, height: 50, color: "#F97316", trackId: "TRK-SMK-04" }
      ],
      notes: "Expanding dense grey plume with upward thermal convection detected near roadside transformer bank."
    },
    {
      candidateId: "CAND-OD-2026-03",
      cameraId: 2,
      cameraCode: "CCTV-OD-102",
      locationName: "Vani Vihar Corridor & Utkal University Gate",
      latitude: 20.3015,
      longitude: 85.8452,
      detectionType: "AMBULANCE_108_IN_TRANSIT",
      confidenceScore: 0.97,
      firstDetectedAt: new Date(Date.now() - 120000).toISOString(),
      lastDetectedAt: new Date(Date.now() - 15000).toISOString(),
      evidenceReferences: [
        "/evidence/cctv-102-ambulance-lifeline-frame.jpg"
      ],
      locationReference: "Vani Vihar Janpath Overpass Green Corridor",
      verificationStatus: "VERIFIED",
      modelVersion: "NexusVision-OD-v2.4-FleetTracker",
      processingStatus: "STREAMING",
      boundingBoxes: [
        { label: "108_LIFELINE_AMBULANCE", confidence: 0.97, x: 22, y: 40, width: 34, height: 38, color: "#10B981", trackId: "VEH-108-01" }
      ],
      notes: "Emergency 108 Lifeline unit detected moving westbound towards AIIMS. Corridor transit speeds nominal at 58 km/h."
    },
    {
      candidateId: "CAND-OD-2026-04",
      cameraId: 5,
      cameraCode: "CCTV-OD-105",
      locationName: "Master Canteen Smart City Transit Plaza",
      latitude: 20.2642,
      longitude: 85.8398,
      detectionType: "CROWD_CONGESTION",
      confidenceScore: 0.85,
      firstDetectedAt: new Date(Date.now() - 600000).toISOString(),
      lastDetectedAt: new Date(Date.now() - 120000).toISOString(),
      evidenceReferences: [
        "/evidence/cctv-105-crowd-density.jpg"
      ],
      locationReference: "Master Canteen Bus Concourse South Gate",
      verificationStatus: "AWAITING-VERIFICATION",
      modelVersion: "NexusVision-OD-v2.4-CrowdDensity",
      processingStatus: "STREAMING",
      boundingBoxes: [
        { label: "CROWD_COMPRESSION_AREA", confidence: 0.85, x: 15, y: 25, width: 70, height: 55, color: "#F59E0B", trackId: "CROWD-ZONE-B" }
      ],
      notes: "Pedestrian density peak measured at 4.2 persons/m² during peak railway connection arrival. Non-conflict gathering."
    }
  ];

  // Automatic High-Priority Emergency Alerts
  const emergencyAlerts: EmergencyAlert[] = [
    {
      alertId: "ALT-CRIT-901",
      incidentId: 1,
      candidateId: "CAND-OD-2026-01",
      emergencyType: "POSSIBLE_ROAD_ACCIDENT",
      severity: "CRITICAL",
      alertStatus: "NEW",
      verificationStatus: "AWAITING-VERIFICATION",
      createdAt: new Date(Date.now() - 35000).toISOString(),
      acknowledgementDeadline: new Date(Date.now() + 55000).toISOString(),
      escalated: false,
      escalationLevel: 0,
      cameraCode: "CCTV-OD-101",
      location: "Rasulgarh Junction Flyover NH-16 (Westbound Carriageway)",
      latitude: 20.2961,
      longitude: 85.8645,
      confidenceScore: 0.92,
      recommendedAction: "Review live CCTV evidence, confirm lane blockage, and dispatch nearest Traffic Police & 108 Ambulance Unit.",
      soundTriggered: true,
      summaryAi: "AI Vision detected high-velocity vehicle impact at 20.2961°N followed by lane 2 obstruction. 2 passenger vehicles involved."
    },
    {
      alertId: "ALT-HIGH-902",
      incidentId: 1,
      candidateId: "CAND-OD-2026-02",
      emergencyType: "POSSIBLE_FIRE_OR_SMOKE",
      severity: "HIGH",
      alertStatus: "ACKNOWLEDGED",
      verificationStatus: "AI-DETECTED",
      createdAt: new Date(Date.now() - 300000).toISOString(),
      acknowledgementDeadline: new Date(Date.now() - 180000).toISOString(),
      acknowledgedBy: "operator.emergency@civicnexus.gov.in",
      acknowledgedAt: new Date(Date.now() - 250000).toISOString(),
      escalated: false,
      escalationLevel: 1,
      cameraCode: "CCTV-OD-103",
      location: "Bomikhal Canal Underpass Sluice Near Transformer Bank",
      latitude: 20.2831,
      longitude: 85.8512,
      confidenceScore: 0.88,
      recommendedAction: "Notify Odisha Fire Services (Kalpana Station) and inspect roadside dry-waste accumulation near transformer.",
      soundTriggered: true,
      assignedDepartmentName: "Fire and Rescue Services",
      summaryAi: "Thermal optical analysis detected smoke column expanding at 1.2m/s near electrical distribution infrastructure."
    }
  ];

  // Emergency Vehicles (Fleet GPS Telemetry)
  const emergencyVehicles: EmergencyVehicle[] = [
    {
      id: "OD-02-AMB-108-01",
      vehicleType: "AMBULANCE_108",
      callSign: "LIFELINE-ONE",
      licensePlate: "OD-02-AZ-1081",
      baseStationName: "AIIMS Bhubaneswar Trauma Hub",
      driverName: "Santosh Kumar Pradhan",
      contactNumber: "+91 94370 88101",
      currentStatus: "EN_ROUTE",
      latitude: 20.2785,
      longitude: 85.8210,
      speedKmh: 54,
      heading: 260,
      fuelPercent: 88,
      assignedIncidentId: 1,
      destinationHospitalName: "AIIMS Bhubaneswar",
      etaMinutes: 8,
      lastGpsUpdate: new Date().toISOString(),
      isDemo: true
    },
    {
      id: "OD-02-AMB-108-02",
      vehicleType: "AMBULANCE_108",
      callSign: "CAPITAL-TWO",
      licensePlate: "OD-02-BX-1082",
      baseStationName: "Capital Hospital Dispatch Station",
      driverName: "Bishnu Charan Jena",
      contactNumber: "+91 94370 88102",
      currentStatus: "ON_PATROL",
      latitude: 20.2650,
      longitude: 85.8340,
      speedKmh: 38,
      heading: 90,
      fuelPercent: 76,
      lastGpsUpdate: new Date().toISOString(),
      isDemo: true
    },
    {
      id: "OD-02-FIRE-101-01",
      vehicleType: "FIRE_ENGINE",
      callSign: "KALPANA-WATER-TENDER",
      licensePlate: "OD-02-FT-1011",
      baseStationName: "Kalpana Square Fire Station",
      driverName: "Chief Officer Rabindra Swain",
      contactNumber: "+91 674 2431101",
      currentStatus: "AVAILABLE",
      latitude: 20.2550,
      longitude: 85.8420,
      speedKmh: 0,
      heading: 0,
      fuelPercent: 95,
      lastGpsUpdate: new Date().toISOString(),
      isDemo: true
    },
    {
      id: "OD-02-POL-PCR-04",
      vehicleType: "POLICE_PATROL",
      callSign: "TRAFFIC-FLYING-SQUAD-4",
      licensePlate: "OD-02-TS-9904",
      baseStationName: "Saheed Nagar Police Station",
      driverName: "ASI N. C. Mohanty",
      contactNumber: "+91 94374 99004",
      currentStatus: "DISPATCHED",
      latitude: 20.2910,
      longitude: 85.8580,
      speedKmh: 46,
      heading: 330,
      fuelPercent: 82,
      assignedIncidentId: 1,
      etaMinutes: 4,
      lastGpsUpdate: new Date().toISOString(),
      isDemo: true
    },
    {
      id: "OD-02-MUNI-DIS-02",
      vehicleType: "DISASTER_RESCUE",
      callSign: "BMC-DEWATER-STRIKE-UNIT",
      licensePlate: "OD-02-DS-8802",
      baseStationName: "BMC Central Engineering Yard",
      driverName: "Pradeep Rout",
      contactNumber: "+91 94371 44002",
      currentStatus: "ON_SCENE",
      latitude: 20.2961,
      longitude: 85.8645,
      speedKmh: 0,
      heading: 0,
      fuelPercent: 91,
      assignedIncidentId: 1,
      lastGpsUpdate: new Date().toISOString(),
      isDemo: true
    }
  ];

  // Emergency Response Dispatches
  const emergencyResponses: EmergencyResponseDispatch[] = [
    {
      responseId: "DSP-EM-2026-101",
      incidentId: 1,
      alertId: "ALT-CRIT-901",
      responseType: "AMBULANCE",
      assignedUnitId: "OD-02-AMB-108-01",
      assignedUnitName: "108 Lifeline Trauma Unit #01",
      dispatchedBy: "emergency@civicnexus.gov.in",
      dispatchedAt: new Date(Date.now() - 300000).toISOString(),
      responseStatus: "EN_ROUTE",
      etaMinutes: 8,
      responderNotes: "Patient stabilization unit proceeding on green corridor bypass.",
      isDemo: true
    },
    {
      responseId: "DSP-EM-2026-102",
      incidentId: 1,
      alertId: "ALT-CRIT-901",
      responseType: "POLICE_ESCORT",
      assignedUnitId: "OD-02-POL-PCR-04",
      assignedUnitName: "Traffic PCR Squad #04",
      dispatchedBy: "emergency@civicnexus.gov.in",
      dispatchedAt: new Date(Date.now() - 280000).toISOString(),
      responseStatus: "EN_ROUTE",
      etaMinutes: 4,
      responderNotes: "Clearing lane 1 & 2 for ambulance ingress.",
      isDemo: true
    }
  ];

  const alertDeliveryLogs: AlertDeliveryLog[] = [
    {
      deliveryId: "DLV-001",
      alertId: "ALT-CRIT-901",
      recipientRole: "SUPER_ADMIN",
      recipientEmail: "admin@civicnexus.gov.in",
      channel: "IN_APP",
      deliveryStatus: "DELIVERED",
      attemptedAt: new Date(Date.now() - 34000).toISOString()
    },
    {
      deliveryId: "DLV-002",
      alertId: "ALT-CRIT-901",
      recipientRole: "DEPARTMENT_OFFICER",
      recipientEmail: "officer@civicnexus.gov.in",
      channel: "SSE_STREAM",
      deliveryStatus: "DELIVERED",
      attemptedAt: new Date(Date.now() - 33000).toISOString()
    }
  ];

  const alertEscalations: AlertEscalationRecord[] = [];

  const videoAnalyses: VideoAnalysis[] = [
    {
      videoAnalysisId: "VID-ANALYSIS-2026-001",
      uploadedBy: "emergency.operator@civicnexus.gov.in",
      storageReference: "/evidence/videos/sample-cctv-rasulgarh.mp4",
      fileName: "Rasulgarh_Flyover_Traffic_108Amb.mp4",
      fileSizeBytes: 14850000,
      mimeType: "video/mp4",
      durationSeconds: 38,
      resolution: "1920x1080",
      framesAnalyzed: 19,
      analysisStatus: "COMPLETED",
      processingStartedAt: new Date(Date.now() - 180000).toISOString(),
      processingCompletedAt: new Date(Date.now() - 172000).toISOString(),
      pipelineVersion: "NexusVision-MultiCategory-v3.2",
      locationName: "Rasulgarh Junction Flyover NH-16",
      cameraCode: "CCTV-OD-101",
      recordedAt: new Date(Date.now() - 240000).toISOString(),
      description: "108 Lifeline Trauma Ambulance traversing through congested bottleneck lane",
      summaryNarrative: "AI Vision analysis verified 108 Lifeline Ambulance vehicle in transit at 00:00:18 with siren illuminator active. Route clearance preemption recommended along NH-16 corridor to AIIMS.",
      detectedEmergency: true,
      events: [
        {
          eventId: "EVT-VID-01",
          videoAnalysisId: "VID-ANALYSIS-2026-001",
          eventType: "AMBULANCE_IN_TRANSIT",
          videoTimestamp: "00:00:18",
          videoTimestampSeconds: 18,
          confidenceScore: 0.94,
          evidenceThumbnail: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=640",
          boundingBoxes: [
            { label: "108 Ambulance", confidence: 0.94, x: 22, y: 35, width: 34, height: 28, color: "#10B981" }
          ],
          trackingId: "TRK-AMB-108",
          trackingStatus: "Tracked across frames t=14s to t=24s",
          description: "An ambulance-like vehicle with active medical livery was detected moving westbound through the corridor.",
          verificationStatus: "VERIFIED",
          recommendedAction: "Activate Green Corridor Signal Preemption to AIIMS Bhubaneswar Hospital.",
          incidentId: 1,
          alertId: "ALT-CRIT-901"
        }
      ],
      routeVerificationStatus: "VERIFIED",
      routeClearanceRequestId: "CLR-REQ-2026-101"
    }
  ];

  const routeClearanceRequests: RouteClearanceRequest[] = [
    {
      requestId: "CLR-REQ-2026-101",
      incidentId: 1,
      alertId: "ALT-CRIT-901",
      videoAnalysisId: "VID-ANALYSIS-2026-001",
      vehicleType: "AMBULANCE",
      vehicleCallSign: "OD-02-AMB-108-01",
      routeReference: "Rasulgarh Flyover -> Vani Vihar -> Master Canteen -> AIIMS Bhubaneswar",
      requestedBy: "emergency.operator@civicnexus.gov.in",
      requestStatus: "ACTIVE",
      originLocation: "Rasulgarh Junction Flyover NH-16",
      destinationHospital: "AIIMS Bhubaneswar Super Specialty Trauma Center",
      corridorSegments: [
        { segmentName: "NH-16 Rasulgarh Flyover Ingress", roadName: "National Highway 16", status: "PREEMPTED", etaMinutes: 2 },
        { segmentName: "Vani Vihar Square Underpass", roadName: "Cuttack-Puri Road Bypass", status: "CLEAR", etaMinutes: 4 },
        { segmentName: "Sishu Bhawan Chowk Junction", roadName: "Rajpath Arterial", status: "CLEAR", etaMinutes: 3 },
        { segmentName: "AIIMS Expressway Terminal Approach", roadName: "AIIMS Access Boulevard", status: "CLEAR", etaMinutes: 3 }
      ],
      preemptionSignals: ["SIG-RASULGARH-01", "SIG-VANIVIHAR-03", "SIG-SISHUBHAWAN-02"],
      trafficClearanceNotice: "Green Corridor Activated by Traffic Control Room. All 3 intersections switched to emergency preemption override.",
      createdAt: new Date(Date.now() - 170000).toISOString(),
      updatedAt: new Date(Date.now() - 60000).toISOString()
    }
  ];

  const tourismPlaces: TourismPlace[] = [
    { id: 1, name: "Konark Sun Temple", odia_name: "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର", category: "UNESCO World Heritage Site", description: "13th century architectural marvel built as a giant stone chariot with 24 carved wheels.", latitude: 19.8876, longitude: 86.0945, image_url: "https://images.unsplash.com/photo-1627894006066-b457863ca898?w=800", cultural_significance: "Kalinga Architecture Golden Era", timings: "06:00 AM - 08:00 PM", accessibility_notes: "Wheelchair ramps available at main entrance", current_safety_status: "ALL_CLEAR" },
    { id: 2, name: "Shree Jagannath Temple Puri", odia_name: "ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର ପୁରୀ", category: "Sacred Shrine & Pilgrimage", description: "12th century sacred temple dedicated to Lord Jagannath, Balabhadra and Subhadra.", latitude: 19.8047, longitude: 85.8180, image_url: "https://images.unsplash.com/photo-1609946782782-720610f63b6a?w=800", cultural_significance: "Char Dham Pilgrimage", timings: "05:00 AM - 11:00 PM", accessibility_notes: "Special assistance queues available", current_safety_status: "ALL_CLEAR" },
    { id: 3, name: "Lingaraj Temple", odia_name: "ଲିଙ୍ଗରାଜ ମନ୍ଦିର", category: "Kalinga Temple Architecture", description: "11th century masterpiece towering 180 feet over the ancient Ekamra Kshetra.", latitude: 20.2382, longitude: 85.8336, image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800", cultural_significance: "Heart of Old Bhubaneswar Ekamra Kshetra", timings: "06:00 AM - 09:00 PM", accessibility_notes: "Cobblestone courtyard walking required", current_safety_status: "ALL_CLEAR" },
    { id: 4, name: "Chilika Lake & Nalabana Sanctuary", odia_name: "ଚିଲିକା ହ୍ରଦ", category: "Ramsar Wetland & Ecotourism", description: "Asia's largest brackish water lagoon, home to Irrawaddy dolphins and migratory birds.", latitude: 19.7000, longitude: 85.3167, image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", cultural_significance: "Odisha Maritime Trade Heritage", timings: "07:00 AM - 05:00 PM (Boating)", accessibility_notes: "Life jackets mandatory for all jetty boardings", current_safety_status: "ALL_CLEAR" },
    { id: 5, name: "Dhauli Shanti Stupa", odia_name: "ଧଉଳି ଶାନ୍ତି ସ୍ତୂପ", category: "Peace Pagoda & Ashokan Rock Edicts", description: "Historic hill where Emperor Ashoka renounced violence after the Kalinga War.", latitude: 20.1923, longitude: 85.8394, image_url: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800", cultural_significance: "Birthplace of Global Buddhist Peace Heritage", timings: "06:00 AM - 07:00 PM", accessibility_notes: "Gentle paved slopes up the hill", current_safety_status: "ALL_CLEAR" },
  ];

  const notifications: NotificationItem[] = [
    { id: 1, title: "Urgent Drain Cleared", message: "Drainage team deployed sluice pump at Rasulgarh chowk.", notification_type: "CRITICAL", is_read: false, created_at: new Date().toISOString() },
    { id: 2, title: "Green Corridor Activated", message: "Traffic clearance for 108 Ambulance en route to AIIMS.", notification_type: "ALERT", is_read: false, created_at: new Date().toISOString() },
    { id: 3, title: "Weather Advisory", message: "IMD predicts heavy rain over coastal districts next 12 hours.", notification_type: "INFO", is_read: true, created_at: new Date().toISOString() },
  ];

  const auditLogs: AuditLog[] = [
    { id: 1, user_email: "commander@civicnexus.gov.in", action: "SYSTEM_INITIALIZED", resource: "CORE_PLATFORM", details: "CIVIC NEXUS AI operational nervous system started.", timestamp: new Date().toISOString() },
  ];

  const municipalAssets: MunicipalAsset[] = [
    { id: 1, asset_code: "PUMP-BMC-09", name: "Heavy Dewatering Sluice Pump (300 HP)", category: "Drainage Infrastructure", ward: "BMC Ward 28 (North-Central)", condition: "GOOD", last_inspected: new Date().toISOString(), location: "Rasulgarh Underpass Sluice Gate" },
    { id: 2, asset_code: "CULVERT-BMC-14", name: "Concrete Box Stormwater Culvert 2.5m", category: "Drainage Infrastructure", ward: "BMC Ward 28 (North-Central)", condition: "NEEDS_MAINTENANCE", last_inspected: new Date().toISOString(), location: "NH-16 Service Channel" },
    { id: 3, asset_code: "LIGHT-BMC-102", name: "High-Mast 250W LED Transformer Unit", category: "Street Lighting", ward: "BMC Ward 14 (Old Town)", condition: "GOOD", last_inspected: new Date().toISOString(), location: "Lingaraj Temple Approach Road" },
    { id: 4, asset_code: "ROAD-BMC-204", name: "Arterial Flyover Expansion Joint", category: "Road Infrastructure", ward: "BMC Ward 42 (Patia)", condition: "FAIR", last_inspected: new Date().toISOString(), location: "Jayadev Vihar Flyover Span 4" },
  ];

  const inventoryItems: InventoryItem[] = [
    { id: 1, item_code: "MAT-ASP-50", name: "Cold-Mix Asphalt Patching Compound", category: "Road Repair", quantity: 450, unit: "Bags (25kg)", min_reorder_level: 100, status: "IN_STOCK" },
    { id: 2, item_code: "MAT-PVC-300", name: "Reinforced 300mm PVC Drain Conduit", category: "Drainage", quantity: 18, unit: "Pipes (6m)", min_reorder_level: 25, status: "LOW_STOCK" },
    { id: 3, item_code: "MAT-LED-150", name: "Smart Photocell 150W LED Fixture", category: "Lighting", quantity: 85, unit: "Units", min_reorder_level: 30, status: "IN_STOCK" },
    { id: 4, item_code: "MAT-DESILT-01", name: "Heavy Duty Hydraulic Drain Desilting Rake", category: "Sanitation", quantity: 4, unit: "Sets", min_reorder_level: 5, status: "CRITICAL_REORDER" },
  ];

  const incidents: Incident[] = [
    {
      id: 1,
      incident_code: "INC-OD-FLAGSHIP-01",
      title: "Severe Waterlogging at Rasulgarh Overbridge Underpass",
      category: "Waterlogging",
      description: "Water accumulation exceeding 40cm. Multiple light vehicles stalled. Heavy traffic bottleneck forming near Rasulgarh Chowk.",
      severity: "HIGH",
      status: "REPORTED",
      address: "Rasulgarh Junction Underpass, National Highway 16, Bhubaneswar, Odisha",
      latitude: 20.2961,
      longitude: 85.8645,
      priority_score: 68.0,
      priority_factors: { factor: "Arterial Corridor Waterlogging", points: 68.0 },
      is_verified: true,
      assigned_department_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const reports: Report[] = [
    {
      id: 1,
      report_code: "REP-OD-2026-001",
      incident_id: 1,
      citizen_name: "Debabrata Mohanty",
      citizen_phone: "+91 94370 12345",
      title: "Severe Waterlogging at Rasulgarh Overbridge Underpass",
      category: "Waterlogging",
      description: "Deep waterlogging after heavy rain. Vehicles cannot cross. Water level rising rapidly.",
      address: "Rasulgarh Junction Underpass, NH-16, Bhubaneswar",
      latitude: 20.2961,
      longitude: 85.8645,
      media_urls: ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"],
      status: "SUBMITTED",
      ai_processed: true,
      created_at: new Date().toISOString()
    }
  ];

  const tasks: Task[] = [
    {
      id: 1,
      incident_id: 1,
      department_id: 1,
      department_name: "Drainage and Flood Management",
      assigned_to_worker_id: 2,
      worker_name: "Bikash Mohapatra",
      worker_phone: "+91 94371 23456",
      worker_code: "FW-1024",
      supervisor_id: 4,
      supervisor_name: "Sanjay Tripathy (BMC Asst Engineer)",
      title: "Deploy Dewatering Pump at Rasulgarh Underpass",
      category: "Waterlogging",
      description: "Severe water accumulation exceeding 40cm at NH-16 underpass blocking traffic.",
      instructions: "Deploy 300 HP dewatering suction pump to drain 40cm waterlogging at NH-16 underpass immediately.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      address: "Rasulgarh Junction Underpass, NH-16, Bhubaneswar",
      latitude: 20.2961,
      longitude: 85.8645,
      accepted_at: new Date(Date.now() - 3600000).toISOString(),
      on_the_way_at: new Date(Date.now() - 2700000).toISOString(),
      arrived_at: new Date(Date.now() - 1800000).toISOString(),
      started_at: new Date(Date.now() - 1200000).toISOString(),
      checkin_latitude: 20.2962,
      checkin_longitude: 85.8644,
      checkin_distance_meters: 15,
      checkin_within_radius: true,
      before_photo_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      before_photo_desc: "Flooded underpass segment before pump deployment",
      worker_notes: "Sluice gate unblocked. Dewatering pump operating at 120 L/min capacity.",
      equipment_required: "300 HP Sluice Dewatering Pump, Safety Jackets, Traffic Cones",
      deadline: new Date(Date.now() + 14400000).toISOString(),
      created_at: new Date(Date.now() - 7200000).toISOString(),
      history: [
        { id: 1, task_id: 1, event_type: "COMPLAINT_SUBMITTED", actor_role: "CITIZEN", actor_name: "Debabrata Mohanty", message: "Complaint filed via Citizen Portal", created_at: new Date(Date.now() - 7200000).toISOString() },
        { id: 2, task_id: 1, event_type: "TASK_ASSIGNED", actor_role: "DEPARTMENT_OFFICER", actor_name: "Ananya Patnaik", message: "Assigned to Drainage Crew #4 (Bikash Mohapatra)", created_at: new Date(Date.now() - 5400000).toISOString() },
        { id: 3, task_id: 1, event_type: "TASK_ACCEPTED", actor_role: "FIELD_WORKER", actor_name: "Bikash Mohapatra", message: "Worker accepted assignment", created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 4, task_id: 1, event_type: "ON_THE_WAY", actor_role: "FIELD_WORKER", actor_name: "Bikash Mohapatra", message: "Worker dispatched to site", created_at: new Date(Date.now() - 2700000).toISOString() },
        { id: 5, task_id: 1, event_type: "WORKER_ARRIVED", actor_role: "FIELD_WORKER", actor_name: "Bikash Mohapatra", message: "Arrived on site. Verified within 15m radius.", created_at: new Date(Date.now() - 1800000).toISOString() },
        { id: 6, task_id: 1, event_type: "WORK_STARTED", actor_role: "FIELD_WORKER", actor_name: "Bikash Mohapatra", message: "Dewatering pump started", created_at: new Date(Date.now() - 1200000).toISOString() }
      ]
    },
    {
      id: 2,
      incident_id: 1,
      department_id: 2,
      department_name: "Roads and Infrastructure",
      assigned_to_worker_id: 2,
      worker_name: "Bikash Mohapatra",
      worker_phone: "+91 94371 23456",
      worker_code: "FW-1024",
      supervisor_id: 4,
      supervisor_name: "Sanjay Tripathy",
      title: "Pothole Patching at Vani Vihar Flyover Approach",
      category: "Pothole & Roads",
      description: "Deep pothole 1.2m wide causing severe motorcycle hazard near university gate.",
      instructions: "Apply cold-mix asphalt compound and compact with roller.",
      priority: "MEDIUM",
      status: "ASSIGNED",
      address: "Vani Vihar Junction, Janpath, Bhubaneswar",
      latitude: 20.3015,
      longitude: 85.8452,
      equipment_required: "Cold-Mix Asphalt Compound (4 Bags), Plate Compactor, Safety Signs",
      deadline: new Date(Date.now() + 28800000).toISOString(),
      created_at: new Date(Date.now() - 1800000).toISOString(),
      history: [
        { id: 1, task_id: 2, event_type: "TASK_ASSIGNED", actor_role: "DEPARTMENT_OFFICER", actor_name: "Ananya Patnaik", message: "Assigned to Bikash Mohapatra", created_at: new Date(Date.now() - 1800000).toISOString() }
      ]
    },
    {
      id: 3,
      incident_id: 1,
      department_id: 1,
      department_name: "Drainage and Flood Management",
      assigned_to_worker_id: 2,
      worker_name: "Bikash Mohapatra",
      worker_phone: "+91 94371 23456",
      worker_code: "FW-1024",
      supervisor_id: 4,
      supervisor_name: "Sanjay Tripathy",
      title: "Drain Desilting at Bomikhal Canal Grate",
      category: "Drainage",
      description: "Plastic waste accumulation blocking stormwater culvert flow into Gangua Nallah.",
      instructions: "Deploy hydraulic desilting rake to remove 2 cubic meters of plastic waste.",
      priority: "CRITICAL",
      status: "PENDING_VERIFICATION",
      address: "Bomikhal Canal Sluice Gate, Puri Road, Bhubaneswar",
      latitude: 20.2831,
      longitude: 85.8512,
      started_at: new Date(Date.now() - 14400000).toISOString(),
      submitted_at: new Date(Date.now() - 1800000).toISOString(),
      checkin_latitude: 20.2830,
      checkin_longitude: 85.8513,
      checkin_distance_meters: 8,
      checkin_within_radius: true,
      before_photo_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800",
      before_photo_desc: "Blocked culvert grate with plastic waste accumulation",
      after_photo_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      after_photo_desc: "Culvert cleared and stormwater flowing freely",
      worker_notes: "Hydraulic desilting complete. Removed 18 bags of plastic waste.",
      completion_summary: "Desilted 2.5 cubic meters of solid waste. Flow restored.",
      materials_used: "Desilting rake, 20 heavy duty bags",
      completion_proof_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      deadline: new Date(Date.now() + 7200000).toISOString(),
      created_at: new Date(Date.now() - 21600000).toISOString(),
      history: [
        { id: 1, task_id: 3, event_type: "COMPLAINT_SUBMITTED", actor_role: "CITIZEN", actor_name: "Prasant Sahoo", message: "Reported blocked canal grate", created_at: new Date(Date.now() - 21600000).toISOString() },
        { id: 2, task_id: 3, event_type: "TASK_ASSIGNED", actor_role: "DEPARTMENT_OFFICER", actor_name: "Ananya Patnaik", message: "Assigned work order TSK-3", created_at: new Date(Date.now() - 18000000).toISOString() },
        { id: 3, task_id: 3, event_type: "COMPLETION_SUBMITTED", actor_role: "FIELD_WORKER", actor_name: "Bikash Mohapatra", message: "Work completed & evidence uploaded. Awaiting supervisor sign-off.", created_at: new Date(Date.now() - 1800000).toISOString() }
      ]
    },
    {
      id: 4,
      incident_id: 1,
      department_id: 6,
      department_name: "Street Lighting and Electrical",
      assigned_to_worker_id: 2,
      worker_name: "Bikash Mohapatra",
      worker_phone: "+91 94371 23456",
      worker_code: "FW-1024",
      supervisor_id: 4,
      supervisor_name: "Sanjay Tripathy",
      title: "High-Mast LED Fixture Replacement at Lingaraj Temple Road",
      category: "Street Lighting",
      description: "Transformer photocell trip causing 200m dark stretch near Old Town.",
      instructions: "Replace photocell sensor and reset 250W high-mast breaker.",
      priority: "HIGH",
      status: "ACCEPTED",
      address: "Lingaraj Temple Approach Road, Old Town, Bhubaneswar",
      latitude: 20.2382,
      longitude: 85.8336,
      accepted_at: new Date(Date.now() - 900000).toISOString(),
      equipment_required: "150W Photocell Sensor, Insulation Gloves, Ladder Truck",
      deadline: new Date(Date.now() + 18000000).toISOString(),
      created_at: new Date(Date.now() - 3600000).toISOString(),
      history: [
        { id: 1, task_id: 4, event_type: "TASK_ASSIGNED", actor_role: "DEPARTMENT_OFFICER", actor_name: "Ananya Patnaik", message: "Assigned to Bikash Mohapatra", created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, task_id: 4, event_type: "TASK_ACCEPTED", actor_role: "FIELD_WORKER", actor_name: "Bikash Mohapatra", message: "Worker accepted task", created_at: new Date(Date.now() - 900000).toISOString() }
      ]
    },
    {
      id: 5,
      incident_id: 1,
      department_id: 5,
      department_name: "Sanitation and Waste Management",
      assigned_to_worker_id: 2,
      worker_name: "Bikash Mohapatra",
      worker_phone: "+91 94371 23456",
      worker_code: "FW-1024",
      supervisor_id: 4,
      supervisor_name: "Sanjay Tripathy",
      title: "Fallen Tree Branch Removal at Jayadev Vihar",
      category: "Sanitation",
      description: "Heavy rain caused banyan branch fall on footpath near Mayfair lagoon.",
      instructions: "Cut branch into segments and haul away using Tipper truck.",
      priority: "MEDIUM",
      status: "COMPLETED",
      address: "Jayadev Vihar Chowk, Bhubaneswar",
      latitude: 20.3081,
      longitude: 85.8274,
      started_at: new Date(Date.now() - 86400000).toISOString(),
      completed_at: new Date(Date.now() - 43200000).toISOString(),
      before_photo_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      after_photo_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      worker_notes: "Branch cut and loaded into BMC Tipper Truck #08. Footpath open.",
      completion_summary: "Footpath cleared and obstacle removed.",
      supervisor_feedback: "Prompt execution. Verified on site.",
      created_at: new Date(Date.now() - 90000000).toISOString(),
      history: [
        { id: 1, task_id: 5, event_type: "TASK_ASSIGNED", actor_role: "DEPARTMENT_OFFICER", actor_name: "Ananya Patnaik", message: "Assigned task", created_at: new Date(Date.now() - 90000000).toISOString() },
        { id: 2, task_id: 5, event_type: "SUPERVISOR_APPROVED", actor_role: "DEPARTMENT_SUPERVISOR", actor_name: "Sanjay Tripathy", message: "Supervisor approved completion report.", created_at: new Date(Date.now() - 43200000).toISOString() }
      ]
    }
  ];

  const emergencyCases: EmergencyCase[] = [];
  const roadRestrictions: RoadRestriction[] = [];

  const staffRegistrations: StaffRegistration[] = [
    {
      id: 1,
      ref_code: 'MUNI-REG-2026-1001',
      full_name: 'Er. Soumya Ranjan Mohanty',
      email: 'soumya.mohanty@bmc.gov.in',
      phone: '+91 98612 34567',
      employee_id: 'BMC-EMP-8821',
      department_id: 1,
      department_name: 'Drainage and Flood Management',
      designation: 'Assistant Executive Engineer',
      zone_or_office: 'BMC Zone-2 North Headquarters',
      status: 'PENDING_APPROVAL',
      role: 'MUNICIPAL_OFFICER',
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 2,
      ref_code: 'MUNI-REG-2026-1002',
      full_name: 'Priyanka Priyadarshini',
      email: 'priyanka.p@bmc.gov.in',
      phone: '+91 94378 11223',
      employee_id: 'BMC-EMP-9043',
      department_id: 5,
      department_name: 'Sanitation and Waste Management',
      designation: 'Senior Sanitation Inspector',
      zone_or_office: 'Saheed Nagar Ward 28 Office',
      status: 'PENDING_APPROVAL',
      role: 'SUPERVISOR',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      ref_code: 'MUNI-REG-2026-1000',
      full_name: 'Ananya Patnaik',
      email: 'officer@civicnexus.gov.in',
      phone: '+91 94372 34567',
      employee_id: 'BMC-EMP-1001',
      department_id: 1,
      department_name: 'Drainage and Flood Management',
      designation: 'Executive Officer',
      zone_or_office: 'CMC Central Office',
      status: 'APPROVED',
      role: 'MUNICIPAL_OFFICER',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      approved_at: new Date(Date.now() - 43200000).toISOString(),
      approved_by: 'admin@civicnexus.gov.in'
    }
  ];

  return {
    departments,
    users,
    hospitals,
    cameras,
    tourismPlaces,
    notifications,
    auditLogs,
    municipalAssets,
    inventoryItems,
    incidents,
    reports,
    tasks,
    emergencyCases,
    roadRestrictions,
    staffRegistrations,
    aiDetectionEvents,
    emergencyAlerts,
    emergencyVehicles,
    emergencyResponses,
    alertDeliveryLogs,
    alertEscalations,
    videoAnalyses,
    routeClearanceRequests,
    incidentEvents: [
      {
        eventId: 'EVT-INIT-101',
        eventType: 'incident.created',
        incidentId: 1,
        actorUserId: 'cit-101',
        eventPayload: { title: 'Severe Waterlogging at Rasulgarh Overbridge Underpass', status: 'REPORTED' },
        eventVersion: 1,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        eventId: 'EVT-INIT-102',
        eventType: 'assignment.created',
        incidentId: 1,
        assignmentId: 1,
        actorUserId: 'muni-204',
        eventPayload: { assigned_to_worker_id: 2, status: 'ASSIGNED' },
        eventVersion: 1,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ] as IncidentEvent[],
    flagshipStep: 2,
  };
}

export const dbStore = createInitialDb();
