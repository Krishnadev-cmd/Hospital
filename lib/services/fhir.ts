// UI-compatible service layer for FHIR integration
// This service provides FHIR-compliant interfaces for healthcare data operations

export interface UIPatient {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  phone?: string;
  email?: string;
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_group_number?: string;
  mrn?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UIAppointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  appointment_type: string;
  reason_for_visit?: string;
  notes?: string;
  practitioner_name?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface UIMedication {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  route: string;
  start_date: string;
  end_date?: string;
  prescribed_by: string;
  status: 'active' | 'inactive' | 'stopped';
  instructions?: string;
  refills_remaining?: number;
  created_at: string;
  updated_at: string;
}

export interface UIVitalSign {
  id: string;
  patient_id: string;
  recorded_by: string;
  recorded_date: string;
  temperature?: number;
  temperature_unit?: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  height?: number;
  height_unit?: string;
  weight?: number;
  weight_unit?: string;
  notes?: string;
  created_at: string;
}

export interface UIClinicalNote {
  id: string;
  patient_id: string;
  authored_by: string;
  authored_date: string;
  note_type: 'progress_note' | 'assessment' | 'plan' | 'history' | 'physical_exam';
  title: string;
  content: string;
  tags?: string[];
  is_confidential: boolean;
  created_at: string;
  updated_at: string;
}

export interface UICondition {
  id: string;
  patient_id: string;
  condition_name: string;
  condition_code?: string;
  clinical_status: 'active' | 'inactive' | 'resolved';
  verification_status: 'confirmed' | 'provisional' | 'differential';
  severity?: string;
  onset_date?: string;
  recorded_date: string;
  recorded_by: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UIInvoice {
  id: string;
  patient_id: string;
  patient_name?: string;
  amount: number;
  status: 'pending' | 'paid' | 'partial' | 'cancelled';
  due_date: string;
  service_date: string;
  services: string[];
  invoice_items?: {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
  insurance_provider?: string;
  claim_number?: string;
  paid_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface UICoverage {
  id: string;
  patient_id: string;
  insurance_provider: string;
  policy_number: string;
  group_number?: string;
  member_id: string;
  status: 'active' | 'inactive' | 'suspended';
  effective_date: string;
  termination_date?: string;
  copay_amount?: number;
  deductible_amount?: number;
  out_of_pocket_max?: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

interface SearchParams {
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  date?: string;
  status?: string;
}

interface PatientStats {
  totalPatients: number;
  newPatientsThisWeek: number;
  newPatientsThisMonth: number;
}

interface AppointmentStats {
  today: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  week: {
    total: number;
    completed: number;
    upcoming: number;
  };
}

class FHIRPatientService {
  private async fetchWithFHIRHeaders(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers from options
    if (options.headers) {
      const existingHeaders = options.headers as Record<string, string>;
      Object.assign(headers, existingHeaders);
    }

    // Add FHIR credentials from environment or allow them to be passed via headers
    if (typeof window === 'undefined') {
      // Server-side: use environment variables
      if (process.env.FHIR_BASE_URL) headers['x-fhir-base-url'] = process.env.FHIR_BASE_URL;
      if (process.env.FHIR_CLIENT_ID) headers['x-fhir-client-id'] = process.env.FHIR_CLIENT_ID;
      if (process.env.FHIR_CLIENT_SECRET) headers['x-fhir-client-secret'] = process.env.FHIR_CLIENT_SECRET;
      if (process.env.FHIR_ACCESS_TOKEN) headers['x-fhir-access-token'] = process.env.FHIR_ACCESS_TOKEN;
    }

    return fetch(url, {
      ...options,
      headers
    });
  }

  async getPatients(params: SearchParams = {}): Promise<ServiceResponse<UIPatient[]>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.search) searchParams.append('name', params.search);
      if (params.limit) searchParams.append('_count', params.limit.toString());

      const response = await this.fetchWithFHIRHeaders(
        `/api/fhir/patients?${searchParams.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to fetch patients',
          statusCode: data.statusCode || 500
        };
      }

      // Transform FHIR UIPatient data to UI format
      const transformedPatients: UIPatient[] = (data.data || []).map((patient: any) => ({
        id: patient.id,
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        middle_name: patient.middle_name || '',
        date_of_birth: patient.date_of_birth || '',
        gender: patient.gender || 'unknown',
        phone: patient.phone || '',
        email: patient.email || '',
        street_address: patient.street_address || '',
        city: patient.city || '',
        state: patient.state || '',
        postal_code: patient.postal_code || '',
        country: patient.country || 'US',
        emergency_contact_name: '',
        emergency_contact_relationship: '',
        emergency_contact_phone: '',
        insurance_provider: '',
        insurance_policy_number: '',
        insurance_group_number: '',
        mrn: patient.mrn || '',
        active: patient.active ?? true,
        created_at: patient.created_at || new Date().toISOString(),
        updated_at: patient.updated_at || new Date().toISOString()
      }));

      return {
        success: true,
        data: transformedPatients
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getPatient(id: string): Promise<ServiceResponse<UIPatient>> {
    try {
      const response = await this.fetchWithFHIRHeaders(`/api/fhir/patients/${id}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to fetch patient',
          statusCode: data.statusCode || 500
        };
      }

      // Transform FHIR patient data to UI format
      const patient = data.data;
      const transformedPatient: UIPatient = {
        id: patient.id,
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        middle_name: patient.middle_name || '',
        date_of_birth: patient.date_of_birth || '',
        gender: patient.gender || 'unknown',
        phone: patient.phone || '',
        email: patient.email || '',
        street_address: patient.street_address || '',
        city: patient.city || '',
        state: patient.state || '',
        postal_code: patient.postal_code || '',
        country: patient.country || 'US',
        emergency_contact_name: '',
        emergency_contact_relationship: '',
        emergency_contact_phone: '',
        insurance_provider: '',
        insurance_policy_number: '',
        insurance_group_number: '',
        mrn: patient.mrn || '',
        active: patient.active ?? true,
        created_at: patient.lastUpdated || new Date().toISOString(),
        updated_at: patient.lastUpdated || new Date().toISOString()
      };

      return {
        success: true,
        data: transformedPatient
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async createPatient(patientData: Partial<UIPatient>): Promise<ServiceResponse<UIPatient>> {
    try {
      // Pass UI patient data as-is - the FHIRService will handle the FHIR transformation
      const fhirData = {
        first_name: patientData.first_name || '',
        last_name: patientData.last_name || '',
        middle_name: patientData.middle_name || '',
        date_of_birth: patientData.date_of_birth || '',
        gender: patientData.gender || 'unknown',
        phone: patientData.phone || '',
        email: patientData.email || '',
        street_address: patientData.street_address || '',
        city: patientData.city || '',
        state: patientData.state || '',
        postal_code: patientData.postal_code || '',
        country: patientData.country || 'US'
      };

      const response = await this.fetchWithFHIRHeaders('/api/fhir/patients', {
        method: 'POST',
        body: JSON.stringify(fhirData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to create patient',
          statusCode: data.statusCode || 500
        };
      }

      // Transform response back to UI format
      const patient = data.data;
      const transformedPatient: UIPatient = {
        id: patient.id,
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        middle_name: patient.middle_name || '',
        date_of_birth: patient.date_of_birth || '',
        gender: patient.gender || 'unknown',
        phone: patient.phone || '',
        email: patient.email || '',
        street_address: patient.street_address || '',
        city: patient.city || '',
        state: patient.state || '',
        postal_code: patient.postal_code || '',
        country: patient.country || 'US',
        emergency_contact_name: '',
        emergency_contact_relationship: '',
        emergency_contact_phone: '',
        insurance_provider: '',
        insurance_policy_number: '',
        insurance_group_number: '',
        mrn: patient.mrn || '',
        active: patient.active ?? true,
        created_at: patient.created_at || new Date().toISOString(),
        updated_at: patient.updated_at || new Date().toISOString()
      };

      return {
        success: true,
        data: transformedPatient
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async updatePatient(id: string, patientData: Partial<UIPatient>): Promise<ServiceResponse<UIPatient>> {
    try {
      // Pass UI patient data as-is - the FHIRService will handle the FHIR transformation
      const fhirData = {
        first_name: patientData.first_name || '',
        last_name: patientData.last_name || '',
        middle_name: patientData.middle_name || '',
        date_of_birth: patientData.date_of_birth || '',
        gender: patientData.gender || 'unknown',
        phone: patientData.phone || '',
        email: patientData.email || '',
        street_address: patientData.street_address || '',
        city: patientData.city || '',
        state: patientData.state || '',
        postal_code: patientData.postal_code || '',
        country: patientData.country || 'US'
      };

      const response = await this.fetchWithFHIRHeaders(`/api/fhir/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(fhirData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to update patient',
          statusCode: data.statusCode || 500
        };
      }

      // Transform response back to UI format
      const patient = data.data;
      const transformedPatient: UIPatient = {
        id: patient.id,
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        middle_name: patient.middle_name || '',
        date_of_birth: patient.date_of_birth || '',
        gender: patient.gender || 'unknown',
        phone: patient.phone || '',
        email: patient.email || '',
        street_address: patient.street_address || '',
        city: patient.city || '',
        state: patient.state || '',
        postal_code: patient.postal_code || '',
        country: patient.country || 'US',
        emergency_contact_name: '',
        emergency_contact_relationship: '',
        emergency_contact_phone: '',
        insurance_provider: '',
        insurance_policy_number: '',
        insurance_group_number: '',
        mrn: patient.mrn || '',
        active: patient.active ?? true,
        created_at: patient.created_at || new Date().toISOString(),
        updated_at: patient.updated_at || new Date().toISOString()
      };

      return {
        success: true,
        data: transformedPatient
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async deletePatient(id: string): Promise<ServiceResponse<void>> {
    try {
      const response = await this.fetchWithFHIRHeaders(`/api/fhir/patients/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getPatientStats(): Promise<ServiceResponse<PatientStats>> {
    try {
      // For now, return mock stats since FHIR doesn't have aggregation endpoints
      // In a real implementation, you might need to call multiple FHIR endpoints
      const response = await this.fetchWithFHIRHeaders('/api/fhir/patients?_count=1000');
      
      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to fetch patient statistics'
        };
      }

      const data = await response.json();
      const totalPatients = data.count || 0;

      return {
        success: true,
        data: {
          totalPatients,
          newPatientsThisWeek: Math.floor(totalPatients * 0.05), // Mock calculation
          newPatientsThisMonth: Math.floor(totalPatients * 0.15)  // Mock calculation
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

class FHIRAppointmentService {
  private async fetchWithFHIRHeaders(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers from options
    if (options.headers) {
      const existingHeaders = options.headers as Record<string, string>;
      Object.assign(headers, existingHeaders);
    }

    // Add FHIR credentials from environment
    if (typeof window === 'undefined') {
      if (process.env.FHIR_BASE_URL) headers['x-fhir-base-url'] = process.env.FHIR_BASE_URL;
      if (process.env.FHIR_CLIENT_ID) headers['x-fhir-client-id'] = process.env.FHIR_CLIENT_ID;
      if (process.env.FHIR_CLIENT_SECRET) headers['x-fhir-client-secret'] = process.env.FHIR_CLIENT_SECRET;
      if (process.env.FHIR_ACCESS_TOKEN) headers['x-fhir-access-token'] = process.env.FHIR_ACCESS_TOKEN;
    }

    return fetch(url, {
      ...options,
      headers
    });
  }

  async getAppointments(params: SearchParams = {}): Promise<ServiceResponse<UIAppointment[]>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.limit) searchParams.append('_count', params.limit.toString());
      if (params.date) searchParams.append('date', `ge${params.date}`);
      if (params.status) searchParams.append('status', params.status);

      const response = await this.fetchWithFHIRHeaders(
        `/api/fhir/encounters?${searchParams.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to fetch appointments',
          statusCode: data.statusCode || 500
        };
      }

      // Transform FHIR encounters to appointments
      const transformedAppointments: UIAppointment[] = (data.data || []).map((encounter: any) => ({
        id: encounter.id,
        patient_id: encounter.patientId,
        appointment_date: encounter.date ? encounter.date.split('T')[0] : '',
        appointment_time: encounter.date ? encounter.date.split('T')[1]?.split('Z')[0] || '' : '',
        duration_minutes: 30, // Default duration
        status: this.mapEncounterStatusToAppointmentStatus(encounter.status),
        appointment_type: encounter.type || 'consultation',
        reason_for_visit: encounter.reason || '',
        notes: '',
        practitioner_name: encounter.practitioner || '',
        location: encounter.location || '',
        created_at: encounter.date || new Date().toISOString(),
        updated_at: encounter.date || new Date().toISOString()
      }));

      return {
        success: true,
        data: transformedAppointments
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private mapEncounterStatusToAppointmentStatus(encounterStatus: string): UIAppointment['status'] {
    const statusMap: Record<string, UIAppointment['status']> = {
      'planned': 'scheduled',
      'arrived': 'confirmed',
      'in-progress': 'in_progress',
      'finished': 'completed',
      'cancelled': 'cancelled',
      'entered-in-error': 'cancelled'
    };
    return statusMap[encounterStatus] || 'scheduled';
  }

  async cancelAppointment(id: string, reason?: string): Promise<ServiceResponse<void>> {
    try {
      // In FHIR, we would update the encounter status to 'cancelled'
      const response = await this.fetchWithFHIRHeaders(`/api/fhir/encounters/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status: 'cancelled',
          statusReason: reason 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async createAppointment(appointmentData: Partial<UIAppointment>): Promise<ServiceResponse<UIAppointment>> {
    try {
      // Transform UI appointment data to FHIR format
      const fhirData = {
        patientId: appointmentData.patient_id,
        date: appointmentData.appointment_date && appointmentData.appointment_time ? 
          `${appointmentData.appointment_date}T${appointmentData.appointment_time}` : '',
        type: appointmentData.appointment_type || 'consultation',
        reason: appointmentData.reason_for_visit || '',
        status: 'planned'
      };

      const response = await this.fetchWithFHIRHeaders('/api/fhir/encounters', {
        method: 'POST',
        body: JSON.stringify(fhirData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to create appointment',
          statusCode: data.statusCode || 500
        };
      }

      // Transform response back to UI format
      const encounter = data.data;
      const transformedAppointment: UIAppointment = {
        id: encounter.id,
        patient_id: encounter.patientId,
        appointment_date: encounter.date ? encounter.date.split('T')[0] : '',
        appointment_time: encounter.date ? encounter.date.split('T')[1]?.split('Z')[0] || '' : '',
        duration_minutes: 30,
        status: 'scheduled',
        appointment_type: encounter.type || 'consultation',
        reason_for_visit: encounter.reason || '',
        notes: '',
        practitioner_name: encounter.practitioner || '',
        location: encounter.location || '',
        created_at: encounter.date || new Date().toISOString(),
        updated_at: encounter.date || new Date().toISOString()
      };

      return {
        success: true,
        data: transformedAppointment
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async updateAppointment(id: string, appointmentData: Partial<UIAppointment>): Promise<ServiceResponse<UIAppointment>> {
    try {
      // Transform UI appointment data to FHIR format
      const fhirData = {
        patientId: appointmentData.patient_id,
        date: appointmentData.appointment_date && appointmentData.appointment_time ? 
          `${appointmentData.appointment_date}T${appointmentData.appointment_time}` : '',
        type: appointmentData.appointment_type || 'consultation',
        reason: appointmentData.reason_for_visit || '',
        status: this.mapAppointmentStatusToEncounterStatus(appointmentData.status || 'scheduled')
      };

      const response = await this.fetchWithFHIRHeaders(`/api/fhir/encounters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(fhirData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to update appointment',
          statusCode: data.statusCode || 500
        };
      }

      // Transform response back to UI format
      const encounter = data.data;
      const transformedAppointment: UIAppointment = {
        id: encounter.id,
        patient_id: encounter.patientId,
        appointment_date: encounter.date ? encounter.date.split('T')[0] : '',
        appointment_time: encounter.date ? encounter.date.split('T')[1]?.split('Z')[0] || '' : '',
        duration_minutes: 30,
        status: this.mapEncounterStatusToAppointmentStatus(encounter.status),
        appointment_type: encounter.type || 'consultation',
        reason_for_visit: encounter.reason || '',
        notes: '',
        practitioner_name: encounter.practitioner || '',
        location: encounter.location || '',
        created_at: encounter.date || new Date().toISOString(),
        updated_at: encounter.date || new Date().toISOString()
      };

      return {
        success: true,
        data: transformedAppointment
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private mapAppointmentStatusToEncounterStatus(appointmentStatus: UIAppointment['status']): string {
    const statusMap: Record<UIAppointment['status'], string> = {
      'scheduled': 'planned',
      'confirmed': 'arrived',
      'in_progress': 'in-progress',
      'completed': 'finished',
      'cancelled': 'cancelled',
      'no_show': 'cancelled'
    };
    return statusMap[appointmentStatus] || 'planned';
  }

  async getAppointmentStats(): Promise<ServiceResponse<AppointmentStats>> {
    try {
      // Mock implementation - in real scenario, you'd query FHIR Encounter resources
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const response = await this.fetchWithFHIRHeaders(
        `/api/fhir/encounters?date=ge${startOfDay.split('T')[0]}&_count=100`
      );
      
      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to fetch appointment statistics'
        };
      }

      const data = await response.json();
      const encounters = data.data || [];

      return {
        success: true,
        data: {
          today: {
            total: encounters.length,
            confirmed: Math.floor(encounters.length * 0.7),
            pending: Math.floor(encounters.length * 0.2),
            cancelled: Math.floor(encounters.length * 0.1)
          },
          week: {
            total: encounters.length * 5, // Mock weekly data
            completed: encounters.length * 3,
            upcoming: encounters.length * 2
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

class FHIRClinicalService {
  private async fetchWithFHIRHeaders(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers from options
    if (options.headers) {
      const existingHeaders = options.headers as Record<string, string>;
      Object.assign(headers, existingHeaders);
    }

    // Add FHIR credentials from environment
    if (typeof window === 'undefined') {
      if (process.env.FHIR_BASE_URL) headers['x-fhir-base-url'] = process.env.FHIR_BASE_URL;
      if (process.env.FHIR_CLIENT_ID) headers['x-fhir-client-id'] = process.env.FHIR_CLIENT_ID;
      if (process.env.FHIR_CLIENT_SECRET) headers['x-fhir-client-secret'] = process.env.FHIR_CLIENT_SECRET;
      if (process.env.FHIR_ACCESS_TOKEN) headers['x-fhir-access-token'] = process.env.FHIR_ACCESS_TOKEN;
    }

    return fetch(url, {
      ...options,
      headers
    });
  }

  async getMedications(patientId: string): Promise<ServiceResponse<UIMedication[]>> {
    try {
      const response = await this.fetchWithFHIRHeaders(
        `/api/fhir/medications?patient=${patientId}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to fetch medications',
          statusCode: data.statusCode || 500
        };
      }

      // Transform FHIR medication data to UI format
      const transformedMedications: UIMedication[] = (data.data || []).map((med: any) => ({
        id: med.id,
        patient_id: patientId,
        medication_name: med.medicationName || '',
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        route: med.route || 'oral',
        start_date: med.effectiveDateTime || new Date().toISOString().split('T')[0],
        end_date: med.effectiveEndDate || undefined,
        prescribed_by: med.prescriber || 'Unknown',
        status: med.status === 'active' ? 'active' : 'inactive',
        instructions: med.instructions || '',
        refills_remaining: med.refillsRemaining || 0,
        created_at: med.authoredOn || new Date().toISOString(),
        updated_at: med.authoredOn || new Date().toISOString()
      }));

      return {
        success: true,
        data: transformedMedications
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async createMedication(medicationData: Partial<UIMedication>): Promise<ServiceResponse<UIMedication>> {
    try {
      const fhirData = {
        patientId: medicationData.patient_id,
        medicationName: medicationData.medication_name,
        dosage: medicationData.dosage,
        frequency: medicationData.frequency,
        route: medicationData.route || 'oral',
        effectiveDateTime: medicationData.start_date,
        effectiveEndDate: medicationData.end_date,
        prescriber: medicationData.prescribed_by,
        status: medicationData.status || 'active',
        instructions: medicationData.instructions
      };

      const response = await this.fetchWithFHIRHeaders('/api/fhir/medications', {
        method: 'POST',
        body: JSON.stringify(fhirData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to create medication',
          statusCode: data.statusCode || 500
        };
      }

      const med = data.data;
      const transformedMedication: UIMedication = {
        id: med.id,
        patient_id: med.patientId,
        medication_name: med.medicationName || '',
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        route: med.route || 'oral',
        start_date: med.effectiveDateTime || new Date().toISOString().split('T')[0],
        end_date: med.effectiveEndDate || undefined,
        prescribed_by: med.prescriber || 'Unknown',
        status: med.status === 'active' ? 'active' : 'inactive',
        instructions: med.instructions || '',
        refills_remaining: med.refillsRemaining || 0,
        created_at: med.authoredOn || new Date().toISOString(),
        updated_at: med.authoredOn || new Date().toISOString()
      };

      return {
        success: true,
        data: transformedMedication
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getVitalSigns(patientId: string): Promise<ServiceResponse<UIVitalSign[]>> {
    try {
      const response = await this.fetchWithFHIRHeaders(
        `/api/fhir/observations?patient=${patientId}&category=vital-signs`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to fetch vital signs',
          statusCode: data.statusCode || 500
        };
      }

      // Transform FHIR observation data to UI format
      const transformedVitals: UIVitalSign[] = (data.data || []).map((obs: any) => ({
        id: obs.id,
        patient_id: patientId,
        recorded_by: obs.performer || 'Unknown',
        recorded_date: obs.effectiveDateTime || new Date().toISOString(),
        temperature: obs.temperature?.value || undefined,
        temperature_unit: obs.temperature?.unit || 'C',
        blood_pressure_systolic: obs.bloodPressure?.systolic || undefined,
        blood_pressure_diastolic: obs.bloodPressure?.diastolic || undefined,
        heart_rate: obs.heartRate?.value || undefined,
        respiratory_rate: obs.respiratoryRate?.value || undefined,
        oxygen_saturation: obs.oxygenSaturation?.value || undefined,
        height: obs.height?.value || undefined,
        height_unit: obs.height?.unit || 'cm',
        weight: obs.weight?.value || undefined,
        weight_unit: obs.weight?.unit || 'kg',
        notes: obs.note || '',
        created_at: obs.effectiveDateTime || new Date().toISOString()
      }));

      return {
        success: true,
        data: transformedVitals
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async recordVitalSigns(vitalData: Partial<UIVitalSign>): Promise<ServiceResponse<UIVitalSign>> {
    try {
      const fhirData = {
        patientId: vitalData.patient_id,
        effectiveDateTime: vitalData.recorded_date || new Date().toISOString(),
        performer: vitalData.recorded_by,
        vitals: {
          temperature: vitalData.temperature ? {
            value: vitalData.temperature,
            unit: vitalData.temperature_unit || 'C'
          } : undefined,
          bloodPressure: (vitalData.blood_pressure_systolic && vitalData.blood_pressure_diastolic) ? {
            systolic: vitalData.blood_pressure_systolic,
            diastolic: vitalData.blood_pressure_diastolic
          } : undefined,
          heartRate: vitalData.heart_rate ? {
            value: vitalData.heart_rate,
            unit: 'bpm'
          } : undefined,
          respiratoryRate: vitalData.respiratory_rate ? {
            value: vitalData.respiratory_rate,
            unit: '/min'
          } : undefined,
          oxygenSaturation: vitalData.oxygen_saturation ? {
            value: vitalData.oxygen_saturation,
            unit: '%'
          } : undefined,
          height: vitalData.height ? {
            value: vitalData.height,
            unit: vitalData.height_unit || 'cm'
          } : undefined,
          weight: vitalData.weight ? {
            value: vitalData.weight,
            unit: vitalData.weight_unit || 'kg'
          } : undefined
        },
        note: vitalData.notes
      };

      const response = await this.fetchWithFHIRHeaders('/api/fhir/observations', {
        method: 'POST',
        body: JSON.stringify(fhirData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to record vital signs',
          statusCode: data.statusCode || 500
        };
      }

      const obs = data.data;
      const transformedVital: UIVitalSign = {
        id: obs.id,
        patient_id: obs.patientId,
        recorded_by: obs.performer || 'Unknown',
        recorded_date: obs.effectiveDateTime || new Date().toISOString(),
        temperature: obs.temperature?.value || undefined,
        temperature_unit: obs.temperature?.unit || 'C',
        blood_pressure_systolic: obs.bloodPressure?.systolic || undefined,
        blood_pressure_diastolic: obs.bloodPressure?.diastolic || undefined,
        heart_rate: obs.heartRate?.value || undefined,
        respiratory_rate: obs.respiratoryRate?.value || undefined,
        oxygen_saturation: obs.oxygenSaturation?.value || undefined,
        height: obs.height?.value || undefined,
        height_unit: obs.height?.unit || 'cm',
        weight: obs.weight?.value || undefined,
        weight_unit: obs.weight?.unit || 'kg',
        notes: obs.note || '',
        created_at: obs.effectiveDateTime || new Date().toISOString()
      };

      return {
        success: true,
        data: transformedVital
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getClinicalNotes(patientId: string): Promise<ServiceResponse<UIClinicalNote[]>> {
    try {
      const response = await this.fetchWithFHIRHeaders(
        `/api/fhir/observations?patient=${patientId}&category=clinical-note`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to fetch clinical notes',
          statusCode: data.statusCode || 500
        };
      }

      // Transform FHIR observation data to UI format
      const transformedNotes: UIClinicalNote[] = (data.data || []).map((obs: any) => ({
        id: obs.id,
        patient_id: patientId,
        authored_by: obs.performer || 'Unknown',
        authored_date: obs.effectiveDateTime || new Date().toISOString(),
        note_type: obs.code?.display?.toLowerCase().replace(/\s+/g, '_') || 'progress_note',
        title: obs.code?.display || 'Clinical Note',
        content: obs.valueString || obs.note || '',
        tags: obs.category ? [obs.category] : [],
        is_confidential: obs.meta?.security?.some((s: any) => s.code === 'R') || false,
        created_at: obs.effectiveDateTime || new Date().toISOString(),
        updated_at: obs.effectiveDateTime || new Date().toISOString()
      }));

      return {
        success: true,
        data: transformedNotes
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async createClinicalNote(noteData: Partial<UIClinicalNote>): Promise<ServiceResponse<UIClinicalNote>> {
    try {
      const fhirData = {
        patientId: noteData.patient_id,
        effectiveDateTime: noteData.authored_date || new Date().toISOString(),
        performer: noteData.authored_by,
        code: {
          display: noteData.title || 'Clinical Note',
          text: noteData.title || 'Clinical Note'
        },
        valueString: noteData.content,
        note: noteData.content,
        category: noteData.note_type || 'progress_note',
        confidential: noteData.is_confidential || false
      };

      const response = await this.fetchWithFHIRHeaders('/api/fhir/observations', {
        method: 'POST',
        body: JSON.stringify(fhirData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to create clinical note',
          statusCode: data.statusCode || 500
        };
      }

      const obs = data.data;
      const transformedNote: UIClinicalNote = {
        id: obs.id,
        patient_id: obs.patientId,
        authored_by: obs.performer || 'Unknown',
        authored_date: obs.effectiveDateTime || new Date().toISOString(),
        note_type: obs.category || 'progress_note',
        title: obs.code?.display || 'Clinical Note',
        content: obs.valueString || obs.note || '',
        tags: obs.category ? [obs.category] : [],
        is_confidential: obs.confidential || false,
        created_at: obs.effectiveDateTime || new Date().toISOString(),
        updated_at: obs.effectiveDateTime || new Date().toISOString()
      };

      return {
        success: true,
        data: transformedNote
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getConditions(patientId: string): Promise<ServiceResponse<UICondition[]>> {
    try {
      const response = await this.fetchWithFHIRHeaders(
        `/api/fhir/conditions?patient=${patientId}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to fetch conditions',
          statusCode: data.statusCode || 500
        };
      }

      // Transform FHIR condition data to UI format
      const transformedConditions: UICondition[] = (data.data || []).map((condition: any) => ({
        id: condition.id,
        patient_id: patientId,
        condition_name: condition.code?.text || condition.code?.display || 'Unknown Condition',
        condition_code: condition.code?.coding?.[0]?.code || '',
        clinical_status: condition.clinicalStatus?.coding?.[0]?.code || 'active',
        verification_status: condition.verificationStatus?.coding?.[0]?.code || 'confirmed',
        severity: condition.severity?.coding?.[0]?.display || '',
        onset_date: condition.onsetDateTime || '',
        recorded_date: condition.recordedDate || new Date().toISOString(),
        recorded_by: condition.recorder || 'Unknown',
        notes: condition.note?.[0]?.text || '',
        created_at: condition.recordedDate || new Date().toISOString(),
        updated_at: condition.recordedDate || new Date().toISOString()
      }));

      return {
        success: true,
        data: transformedConditions
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async createCondition(conditionData: Partial<UICondition>): Promise<ServiceResponse<UICondition>> {
    try {
      const fhirData = {
        patientId: conditionData.patient_id,
        code: {
          text: conditionData.condition_name,
          coding: conditionData.condition_code ? [{
            code: conditionData.condition_code,
            display: conditionData.condition_name
          }] : []
        },
        clinicalStatus: {
          coding: [{
            code: conditionData.clinical_status || 'active'
          }]
        },
        verificationStatus: {
          coding: [{
            code: conditionData.verification_status || 'confirmed'
          }]
        },
        severity: conditionData.severity ? {
          coding: [{
            display: conditionData.severity
          }]
        } : undefined,
        onsetDateTime: conditionData.onset_date,
        recordedDate: conditionData.recorded_date || new Date().toISOString(),
        recorder: conditionData.recorded_by,
        note: conditionData.notes ? [{
          text: conditionData.notes
        }] : []
      };

      const response = await this.fetchWithFHIRHeaders('/api/fhir/conditions', {
        method: 'POST',
        body: JSON.stringify(fhirData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to create condition',
          statusCode: data.statusCode || 500
        };
      }

      const condition = data.data;
      const transformedCondition: UICondition = {
        id: condition.id,
        patient_id: condition.patientId,
        condition_name: condition.code?.text || condition.code?.display || 'Unknown Condition',
        condition_code: condition.code?.coding?.[0]?.code || '',
        clinical_status: condition.clinicalStatus?.coding?.[0]?.code || 'active',
        verification_status: condition.verificationStatus?.coding?.[0]?.code || 'confirmed',
        severity: condition.severity?.coding?.[0]?.display || '',
        onset_date: condition.onsetDateTime || '',
        recorded_date: condition.recordedDate || new Date().toISOString(),
        recorded_by: condition.recorder || 'Unknown',
        notes: condition.note?.[0]?.text || '',
        created_at: condition.recordedDate || new Date().toISOString(),
        updated_at: condition.recordedDate || new Date().toISOString()
      };

      return {
        success: true,
        data: transformedCondition
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// In-memory storage for demo purposes
const inMemoryInvoices: UIInvoice[] = [
  {
    id: '1',
    patient_id: '1',
    patient_name: 'John Doe',
    amount: 450.00,
    status: 'paid',
    due_date: '2024-02-15',
    service_date: '2024-01-15',
    services: ['Consultation', 'Lab Work', 'X-Ray'],
    insurance_provider: 'Blue Cross Blue Shield',
    claim_number: 'BC-2024-001',
    paid_amount: 450.00,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  }
];

class FHIRBillingService {
  private async fetchWithFHIRHeaders(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers from options
    if (options.headers) {
      const existingHeaders = options.headers as Record<string, string>;
      Object.assign(headers, existingHeaders);
    }

    // Add FHIR credentials from environment
    if (typeof window === 'undefined') {
      if (process.env.FHIR_BASE_URL) headers['x-fhir-base-url'] = process.env.FHIR_BASE_URL;
      if (process.env.FHIR_CLIENT_ID) headers['x-fhir-client-id'] = process.env.FHIR_CLIENT_ID;
      if (process.env.FHIR_CLIENT_SECRET) headers['x-fhir-client-secret'] = process.env.FHIR_CLIENT_SECRET;
      if (process.env.FHIR_ACCESS_TOKEN) headers['x-fhir-access-token'] = process.env.FHIR_ACCESS_TOKEN;
    }

    return fetch(url, {
      ...options,
      headers
    });
  }

  async getInvoices(params: { patientId?: string } = {}): Promise<ServiceResponse<UIInvoice[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.patientId) queryParams.append('patient', params.patientId);

      const response = await this.fetchWithFHIRHeaders(
        `/api/fhir/billing/invoices?${queryParams.toString()}`
      );

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch invoices: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const data = await response.json();
      
      // For demo purposes, return in-memory invoices
      const filteredInvoices = params.patientId 
        ? inMemoryInvoices.filter(inv => inv.patient_id === params.patientId)
        : inMemoryInvoices;

      return {
        success: true,
        data: filteredInvoices
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async createInvoice(invoiceData: Partial<UIInvoice>): Promise<ServiceResponse<UIInvoice>> {
    try {
      const response = await this.fetchWithFHIRHeaders('/api/fhir/billing/invoices', {
        method: 'POST',
        body: JSON.stringify({
          patientId: invoiceData.patient_id,
          amount: invoiceData.amount,
          services: invoiceData.services,
          dueDate: invoiceData.due_date,
          serviceDate: invoiceData.service_date
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `Failed to create invoice: ${response.statusText}`,
          statusCode: response.status
        };
      }

      // Mock successful creation - add to in-memory storage
      const createdInvoice: UIInvoice = {
        id: `inv-${Date.now()}`,
        patient_id: invoiceData.patient_id || '',
        patient_name: invoiceData.patient_name,
        amount: invoiceData.amount || 0,
        status: 'pending',
        due_date: invoiceData.due_date || '',
        service_date: invoiceData.service_date || '',
        services: invoiceData.services || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to in-memory storage
      inMemoryInvoices.push(createdInvoice);

      return {
        success: true,
        data: createdInvoice
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getCoverage(patientId: string): Promise<ServiceResponse<UICoverage[]>> {
    try {
      const response = await this.fetchWithFHIRHeaders(
        `/api/fhir/coverage?patient=${patientId}`
      );

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch coverage: ${response.statusText}`,
          statusCode: response.status
        };
      }

      // Mock coverage data - in real implementation, transform FHIR Coverage resources
      const mockCoverage: UICoverage[] = [
        {
          id: 'cov-1',
          patient_id: patientId,
          insurance_provider: 'Blue Cross Blue Shield',
          policy_number: 'BCBS-123456789',
          group_number: 'GRP-001',
          member_id: 'MEM-' + patientId,
          status: 'active',
          effective_date: '2024-01-01',
          copay_amount: 25,
          deductible_amount: 500,
          out_of_pocket_max: 2500,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      return {
        success: true,
        data: mockCoverage
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async checkEligibility(patientId: string, serviceType: string): Promise<ServiceResponse<{
    eligible: boolean;
    coverage_percentage: number;
    copay_amount: number;
    deductible_remaining: number;
    message: string;
  }>> {
    try {
      const response = await this.fetchWithFHIRHeaders('/api/fhir/coverage/eligibility', {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          serviceType
        })
      });

      // Mock eligibility check
      const eligibilityResult = {
        eligible: true,
        coverage_percentage: 80,
        copay_amount: 25,
        deductible_remaining: 250,
        message: 'Patient is eligible for covered services'
      };

      return {
        success: true,
        data: eligibilityResult
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Export FHIR services
export const patientService = new FHIRPatientService();
export const appointmentService = new FHIRAppointmentService();
export const clinicalService = new FHIRClinicalService();
export const billingService = new FHIRBillingService();