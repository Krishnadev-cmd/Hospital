// API Response Types and Application Types

import { 
  Patient, 
  Appointment, 
  Practitioner, 
  Observation, 
  MedicationRequest, 
  AllergyIntolerance, 
  Coverage, 
  Encounter,
  DiagnosticReport,
  Bundle
} from './fhir';

// API Configuration
export interface EHRConfig {
  baseUrl: string;
  clientId: string;
  clientSecret?: string;
  apiKey?: string;
  tenantId?: string;
}

// API Response wrapper
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Search Parameters
export interface SearchParams {
  [key: string]: string | number | boolean | undefined;
  _count?: number;
  _offset?: number;
  _sort?: string;
  _include?: string;
  _revinclude?: string;
}

export interface PatientSearchParams extends SearchParams {
  name?: string;
  family?: string;
  given?: string;
  identifier?: string;
  birthdate?: string;
  gender?: string;
  active?: boolean;
  phone?: string;
  email?: string;
}

export interface AppointmentSearchParams extends SearchParams {
  patient?: string;
  practitioner?: string;
  date?: string;
  status?: string;
  'service-type'?: string;
  specialty?: string;
}

export interface ObservationSearchParams extends SearchParams {
  patient?: string;
  category?: string;
  code?: string;
  date?: string;
  status?: string;
  'combo-code'?: string;
}

// Dashboard Analytics Types
export interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  todaysAppointments: number;
  upcomingAppointments: number;
  pendingLabResults: number;
  activeMedications: number;
  recentEncounters: number;
}

export interface AppointmentStats {
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
  rescheduled: number;
}

export interface PatientDemographics {
  totalPatients: number;
  ageGroups: {
    range: string;
    count: number;
  }[];
  genderDistribution: {
    gender: string;
    count: number;
  }[];
}

// Form Types
export interface PatientFormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  phone?: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
}

export interface AppointmentFormData {
  patientId: string;
  practitionerId: string;
  appointmentType: string;
  date: string;
  time: string;
  duration: number;
  reason?: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'arrived' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
}

export interface VitalSignsData {
  patientId: string;
  encounterId?: string;
  recordedDate: string;
  height?: {
    value: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    unit: string;
  };
  temperature?: {
    value: number;
    unit: string;
  };
  heartRate?: {
    value: number;
    unit: string;
  };
  respiratoryRate?: {
    value: number;
    unit: string;
  };
  oxygenSaturation?: {
    value: number;
    unit: string;
  };
  bmi?: {
    value: number;
    unit: string;
  };
}

export interface AllergyData {
  patientId: string;
  allergen: string;
  category: 'food' | 'medication' | 'environment' | 'biologic';
  severity: 'mild' | 'moderate' | 'severe';
  reactions: string[];
  notes?: string;
  onsetDate?: string;
}

export interface MedicationData {
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  prescriberId: string;
  instructions?: string;
  refills?: number;
  quantity?: string;
}

// UI Component Props Types
export interface TableColumn<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
  badge?: number;
  children?: NavigationItem[];
}

// Error Types
export interface EHRError {
  code: string;
  message: string;
  details?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Audit and Logging
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  timestamp: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Extended Resource Types with Helper Methods
export interface PatientWithMethods extends Patient {
  getDisplayName(): string;
  getAge(): number | null;
  getPrimaryPhone(): string | null;
  getPrimaryEmail(): string | null;
  getFormattedAddress(): string | null;
}

export interface AppointmentWithMethods extends Appointment {
  getPatientName(): string;
  getPractitionerName(): string;
  getDuration(): string;
  isToday(): boolean;
  isUpcoming(): boolean;
  canCancel(): boolean;
  canReschedule(): boolean;
}

// Chart and Analytics Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
}

// Notification Types
export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

// Export commonly used bundle types
export type PatientBundle = Bundle<Patient>;
export type AppointmentBundle = Bundle<Appointment>;
export type ObservationBundle = Bundle<Observation>;
export type MedicationBundle = Bundle<MedicationRequest>;
export type AllergyBundle = Bundle<AllergyIntolerance>;
export type CoverageBundle = Bundle<Coverage>;
export type EncounterBundle = Bundle<Encounter>;
export type DiagnosticReportBundle = Bundle<DiagnosticReport>;