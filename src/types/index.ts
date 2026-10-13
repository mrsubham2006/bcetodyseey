export type UserRole =
  | 'CITIZEN'
  | 'FIELD_WORKER'
  | 'DEPARTMENT_OFFICER'
  | 'DEPARTMENT_SUPERVISOR'
  | 'TRAFFIC_OPERATOR'
  | 'HOSPITAL_COORDINATOR'
  | 'FIRE_RESCUE_OPERATOR'
  | 'EMERGENCY_COORDINATOR'
  | 'TOURISM_ADMIN'
  | 'CITY_COMMANDER'
  | 'SUPER_ADMIN';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  department_id?: number;
  is_active: boolean;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  sla_hours: number;
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

export interface AIAnalysis {
  id?: number;
  incident_type: string;
  recommended_department: string;
  summary: string;
  confidence: number;
  potential_risks: string[];
  recommended_actions: string[];
  requires_human_review: boolean;
  model_version?: string;
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
  supported_types: string[];
  active_detections: any[];
  last_heartbeat: string;
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

export interface WeatherData {
  stations: {
    station_name: string;
    rainfall_mm: number;
    wind_speed_kmh: number;
    drainage_level_percent: number;
    flood_risk_level: string;
    advisory: string;
  }[];
  predictive_risk: {
    risk_score: number;
    flood_risk_level: string;
    advisory: string;
  };
  last_synced: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: 'INFO' | 'ALERT' | 'CRITICAL' | 'SUCCESS';
  is_read: boolean;
  created_at: string;
}

export interface AnalyticsData {
  kpis: {
    total_incidents: number;
    active_incidents: number;
    resolved_incidents: number;
    critical_incidents: number;
    total_reports: number;
    active_road_restrictions: number;
    median_assignment_min: number;
    median_resolution_min: number;
  };
  by_category: { category: string; count: number }[];
  by_department: { name: string; code: string; incidents: number }[];
  timestamp: string;
}

export interface AuditLog {
  id: number;
  action: string;
  actor: string;
  user_email?: string;
  details: string;
  timestamp: string;
}

// ==========================================
// AI EMERGENCY COMMAND CENTER TYPES
// ==========================================

export type DetectionType =
  | 'POSSIBLE_FIRE_OR_SMOKE'
  | 'POSSIBLE_ROAD_ACCIDENT'
  | 'CROWD_CONGESTION'
  | 'POTENTIAL_CROWD_SAFETY_RISK'
  | 'AMBULANCE_108_IN_TRANSIT'
  | 'FIRE_ENGINE_IN_TRANSIT'
  | 'ROADWAY_OBSTRUCTION';

export type VerificationStatus =
  | 'AI-DETECTED'
  | 'AWAITING-VERIFICATION'
  | 'VERIFIED'
  | 'FALSE-ALARM'
  | 'RESOLVED';

export type EmergencySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export interface BoundingBoxDetection {
  label: string;
  confidence: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
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
  detectionType: DetectionType;
  confidenceScore: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  evidenceReferences: string[];
  locationReference: string;
  verificationStatus: VerificationStatus;
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
  severity: EmergencySeverity;
  alertStatus: 'NEW' | 'ACKNOWLEDGED' | 'ESCALATED' | 'DISPATCHED' | 'RESOLVED' | 'FALSE_ALARM';
  verificationStatus: VerificationStatus;
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

export interface EmergencyOverviewStats {
  activeCriticalEmergencies: number;
  highPriorityIncidents: number;
  fireAndSmokeAlerts: number;
  roadAccidentAlerts: number;
  crowdSafetyAlerts: number;
  ambulancesEnRoute: number;
  fireBrigadesDispatched: number;
  awaitingAcknowledgement: number;
  totalCamerasOnline: number;
  totalCamerasOffline: number;
  backendConnected: boolean;
  sseSyncActive: boolean;
  audioAlertsEnabled: boolean;
}

