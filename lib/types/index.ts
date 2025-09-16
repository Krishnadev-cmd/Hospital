// Application Types for FHIR-based EHR System

// API Response wrapper
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Core Entity Types
export interface UIPatient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  status: PatientStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface UIAppointment {
  id: string;
  patientId: string;
  patientName?: string;
  practitionerId?: string;
  practitionerName?: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UIInvoice {
  id: string;
  patient_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  items: InvoiceItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  id?: string;
  service_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
}

export interface UIClinicalNote {
  id: string;
  patient_id: string;
  note_type: 'progress_note' | 'consultation' | 'discharge_summary' | 'admission_note' | 'procedure_note' | 'other';
  subject: string;
  content: string;
  is_confidential: boolean;
  author_id: string;
  created_at?: string;
  updated_at?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Search and Filter Types
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Application Status Types
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
export type PatientStatus = 'active' | 'inactive';

// Form Types
export interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export interface AppointmentFormData {
  patientId: string;
  practitionerId?: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  notes?: string;
  status: AppointmentStatus;
}

// Dashboard Statistics
export interface DashboardStats {
  totalPatients: number;
  todaysAppointments: number;
  weekAppointments: number;
  pendingLabs: number;
}

// Error Types
export interface FormError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
}

// Chart and Analytics Types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

// Component Props Types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ListComponentProps<T> extends ComponentProps {
  data: T[];
  loading?: boolean;
  onItemClick?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}