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
    { id: 1, camera_code: "CAM-BBSR-01", location_name: "Rasulgarh Chowk Flyover", latitude: 20.2961, longitude: 85.8645, status: "ACTIVE", supported_types: ["YOLO_FLOOD", "YOLO_TRAFFIC", "ACCIDENT_DETECTION"], active_detections: [{ type: "WATERLOGGING", severity: "HIGH", confidence: 0.94, bbox: [120, 340, 480, 720] }], last_heartbeat: new Date().toISOString() },
    { id: 2, camera_code: "CAM-BBSR-02", location_name: "Vani Vihar Junction", latitude: 20.3015, longitude: 85.8452, status: "ACTIVE", supported_types: ["TRAFFIC_DENSITY", "SPEED_VIOLATION"], active_detections: [], last_heartbeat: new Date().toISOString() },
    { id: 3, camera_code: "CAM-BBSR-03", location_name: "Master Canteen Square", latitude: 20.2642, longitude: 85.8398, status: "ACTIVE", supported_types: ["CROWD_DENSITY", "ILLEGAL_PARKING"], active_detections: [], last_heartbeat: new Date().toISOString() },
    { id: 4, camera_code: "CAM-BBSR-04", location_name: "Jayadev Vihar Chowk", latitude: 20.3081, longitude: 85.8274, status: "ACTIVE", supported_types: ["TRAFFIC_CONGESTION"], active_detections: [], last_heartbeat: new Date().toISOString() },
    { id: 5, camera_code: "CAM-PURI-01", location_name: "Grand Road Jagannath Temple Approach", latitude: 19.8047, longitude: 85.8180, status: "ACTIVE", supported_types: ["TOURIST_CROWD", "HERITAGE_SAFETY"], active_detections: [], last_heartbeat: new Date().toISOString() },
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
      assigned_to_worker_id: 2,
      supervisor_id: 4,
      title: "Deploy Dewatering Pump at Rasulgarh Underpass",
      instructions: "Deploy 300 HP dewatering suction pump to drain 40cm waterlogging at NH-16 underpass immediately.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      started_at: new Date().toISOString(),
      worker_notes: "Sluice gate unblocked. Dewatering pump operating at 120 L/min capacity.",
      completion_proof_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
      created_at: new Date().toISOString()
    }
  ];

  const emergencyCases: EmergencyCase[] = [];
  const roadRestrictions: RoadRestriction[] = [];

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
    flagshipStep: 2,
  };
}

export const dbStore = createInitialDb();
