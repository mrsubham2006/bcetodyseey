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
  status: 'REPORTED' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'RESOLVED' | 'CLOSED';
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

export interface Task {
  id: number;
  incident_id: number;
  department_id: number;
  assigned_to_worker_id?: number;
  supervisor_id?: number;
  title: string;
  instructions?: string;
  priority: string;
  status: 'CREATED' | 'ASSIGNED' | 'ACCEPTED' | 'IN_PROGRESS' | 'PENDING_VERIFICATION' | 'COMPLETED' | 'REJECTED';
  deadline?: string;
  started_at?: string;
  completed_at?: string;
  worker_notes?: string;
  completion_proof_url?: string;
  supervisor_feedback?: string;
  created_at: string;
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

