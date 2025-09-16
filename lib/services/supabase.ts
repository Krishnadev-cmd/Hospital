import supabase from '../supabase';

export interface SupabasePatient {
  id: string;
  created_at: string;
  updated_at: string;
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
  created_by?: string;
  updated_by?: string;
}

export interface SupabaseAppointment {
  id: string;
  created_at: string;
  updated_at: string;
  patient_id: string;
  practitioner_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'arrived' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  appointment_type?: string;
  reason?: string;
  notes?: string;
  scheduled_at?: string;
  confirmed_at?: string;
  checked_in_at?: string;
  completed_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface SupabaseVitalSign {
  id: string;
  created_at: string;
  updated_at: string;
  patient_id: string;
  appointment_id?: string;
  recorded_by: string;
  recorded_at: string;
  vital_type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'respiratory_rate' | 'oxygen_saturation' | 'weight' | 'height' | 'bmi' | 'pain_level' | 'glucose' | 'other';
  value: number;
  unit: string;
  systolic?: number;
  diastolic?: number;
  notes?: string;
  created_by?: string;
  updated_by?: string;
}

export interface SupabaseClinicalNote {
  id: string;
  created_at: string;
  updated_at: string;
  patient_id: string;
  appointment_id?: string;
  author_id: string;
  note_type: 'progress_note' | 'consultation' | 'discharge_summary' | 'admission_note' | 'procedure_note' | 'other';
  subject: string;
  content: string;
  is_confidential: boolean;
  signed_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface SupabaseMedication {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  generic_name?: string;
  brand_name?: string;
  drug_class?: string;
  strength?: string;
  form?: string;
  route?: string;
  manufacturer?: string;
  ndc_number?: string;
  active: boolean;
  created_by?: string;
  updated_by?: string;
}

export interface SupabasePrescription {
  id: string;
  created_at: string;
  updated_at: string;
  patient_id: string;
  medication_id: string;
  prescriber_id: string;
  appointment_id?: string;
  dosage: string;
  frequency: 'once_daily' | 'twice_daily' | 'three_times_daily' | 'four_times_daily' | 'every_4_hours' | 'every_6_hours' | 'every_8_hours' | 'every_12_hours' | 'as_needed' | 'weekly' | 'monthly' | 'other';
  frequency_detail?: string;
  route: string;
  quantity: number;
  quantity_unit: string;
  refills: number;
  days_supply?: number;
  instructions?: string;
  indication?: string;
  start_date: string;
  end_date?: string;
  status: 'pending' | 'sent' | 'filled' | 'cancelled';
  pharmacy_name?: string;
  pharmacy_phone?: string;
  sent_to_pharmacy_at?: string;
  filled_at?: string;
  notes?: string;
  created_by?: string;
  updated_by?: string;
}

export interface SupabasePractitioner {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  title?: string;
  phone?: string;
  email?: string;
  specialty?: string;
  license_number?: string;
  npi_number?: string;
  department?: string;
  active: boolean;
  created_by?: string;
  updated_by?: string;
}

// New interfaces for enhanced functionality
export interface SupabasePatientMedicalHistory {
  id: string;
  patient_id: string;
  condition_name: string;
  diagnosis_date?: string;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface SupabasePatientAllergy {
  id: string;
  patient_id: string;
  allergen: string;
  reaction?: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'inactive';
  created_at: string;
  created_by?: string;
}

export interface SupabasePatientImmunization {
  id: string;
  patient_id: string;
  vaccine_name: string;
  vaccination_date: string;
  lot_number?: string;
  expiration_date?: string;
  administered_by?: string;
  site?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface SupabaseLabResult {
  id: string;
  patient_id: string;
  appointment_id?: string;
  test_name: string;
  test_category?: string;
  result_value?: string;
  reference_range?: string;
  unit?: string;
  status: 'pending' | 'completed' | 'cancelled';
  abnormal_flag: boolean;
  collected_date?: string;
  reported_date?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface SupabasePatientDiagnosis {
  id: string;
  patient_id: string;
  appointment_id?: string;
  diagnosis_code?: string;
  diagnosis_name: string;
  type: 'primary' | 'secondary';
  status: 'active' | 'resolved' | 'chronic';
  onset_date?: string;
  resolved_date?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface SupabaseProviderSchedule {
  id: string;
  practitioner_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

export interface SupabasePaymentHistory {
  id: string;
  patient_id: string;
  invoice_id?: string;
  payment_date: string;
  amount: number;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface SupabasePatientInsurance {
  id: string;
  patient_id: string;
  insurance_provider: string;
  policy_number?: string;
  group_number?: string;
  subscriber_name?: string;
  relationship: string;
  effective_date?: string;
  expiration_date?: string;
  copay_amount?: number;
  deductible_amount?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class SupabasePatientService {
  
  /**
   * Get all patients with optional search and pagination
   */
  async getPatients(options?: {
    search?: string;
    limit?: number;
    offset?: number;
    orderBy?: string;
  }) {
    try {
      let query = supabase
        .from('patients')
        .select('*')
        .eq('active', true);

      // Apply search filter
      if (options?.search) {
        query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,email.ilike.%${options.search}%,phone.ilike.%${options.search}%,mrn.ilike.%${options.search}%`);
      }

      // Apply ordering
      const orderBy = options?.orderBy || 'last_name';
      query = query.order(orderBy);

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 20)) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
        count: count || 0
      };
    } catch (error) {
      console.error('Error fetching patients:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get a single patient by ID
   */
  async getPatient(id: string) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching patient:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Patient not found'
      };
    }
  }

  /**
   * Create a new patient
   */
  async createPatient(patientData: Partial<SupabasePatient>) {
    try {
      // Generate MRN if not provided
      if (!patientData.mrn) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        patientData.mrn = `MRN${timestamp}${random}`;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('patients')
        .insert([
          {
            ...patientData,
            created_by: user?.id,
            updated_by: user?.id
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error creating patient:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create patient'
      };
    }
  }

  /**
   * Update a patient
   */
  async updatePatient(id: string, patientData: Partial<SupabasePatient>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('patients')
        .update({
          ...patientData,
          updated_by: user?.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error updating patient:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update patient'
      };
    }
  }

  /**
   * Soft delete a patient (mark as inactive)
   */
  async deletePatient(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('patients')
        .update({
          active: false,
          updated_by: user?.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error deleting patient:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete patient'
      };
    }
  }

  /**
   * Get patient statistics
   */
  async getPatientStats() {
    try {
      // Total active patients
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      // Patients by gender
      const { data: genderData } = await supabase
        .from('patients')
        .select('gender')
        .eq('active', true);

      // Calculate age groups
      const { data: ageData } = await supabase
        .from('patients')
        .select('date_of_birth')
        .eq('active', true);

      const genderDistribution = genderData?.reduce((acc: any, patient: any) => {
        acc[patient.gender] = (acc[patient.gender] || 0) + 1;
        return acc;
      }, {}) || {};

      const ageGroups = ageData?.reduce((acc: any, patient: any) => {
        const age = Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        let ageGroup;
        
        if (age < 18) ageGroup = '0-17';
        else if (age < 35) ageGroup = '18-34';
        else if (age < 50) ageGroup = '35-49';
        else if (age < 65) ageGroup = '50-64';
        else ageGroup = '65+';
        
        acc[ageGroup] = (acc[ageGroup] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        success: true,
        data: {
          totalPatients: totalPatients || 0,
          genderDistribution: Object.entries(genderDistribution).map(([gender, count]) => ({
            gender,
            count
          })),
          ageGroups: Object.entries(ageGroups).map(([range, count]) => ({
            range,
            count
          }))
        }
      };
    } catch (error) {
      console.error('Error fetching patient stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics'
      };
    }
  }

  /**
   * Get patient medical history
   */
  async getPatientMedicalHistory(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('patient_medical_history')
        .select('*')
        .eq('patient_id', patientId)
        .order('diagnosis_date', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching medical history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch medical history'
      };
    }
  }

  /**
   * Add medical history record
   */
  async addMedicalHistory(historyData: Partial<SupabasePatientMedicalHistory>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('patient_medical_history')
        .insert([{
          ...historyData,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error adding medical history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add medical history'
      };
    }
  }

  /**
   * Get patient allergies
   */
  async getPatientAllergies(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('patient_allergies')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching allergies:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch allergies'
      };
    }
  }

  /**
   * Add patient allergy
   */
  async addPatientAllergy(allergyData: Partial<SupabasePatientAllergy>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('patient_allergies')
        .insert([{
          ...allergyData,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error adding allergy:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add allergy'
      };
    }
  }

  /**
   * Get patient immunizations
   */
  async getPatientImmunizations(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('patient_immunizations')
        .select('*')
        .eq('patient_id', patientId)
        .order('vaccination_date', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching immunizations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch immunizations'
      };
    }
  }

  /**
   * Add patient immunization
   */
  async addPatientImmunization(immunizationData: Partial<SupabasePatientImmunization>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('patient_immunizations')
        .insert([{
          ...immunizationData,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error adding immunization:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add immunization'
      };
    }
  }

  /**
   * Get patient insurance information
   */
  async getPatientInsurance(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('patient_insurance')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching insurance information:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch insurance information'
      };
    }
  }

  /**
   * Add patient insurance
   */
  async addPatientInsurance(insuranceData: Partial<SupabasePatientInsurance>) {
    try {
      const { data, error } = await supabase
        .from('patient_insurance')
        .insert([insuranceData])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error adding insurance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add insurance'
      };
    }
  }
}

export class SupabaseAppointmentService {
  
  /**
   * Get appointments with optional filters
   */
  async getAppointments(options?: {
    patientId?: string;
    practitionerId?: string;
    date?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patients(first_name, last_name, phone, email),
          practitioners(first_name, last_name, title, specialty)
        `);

      // Apply filters
      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }
      if (options?.practitionerId) {
        query = query.eq('practitioner_id', options.practitionerId);
      }
      if (options?.date) {
        query = query.eq('appointment_date', options.date);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }

      // Order by date and time
      query = query.order('appointment_date').order('appointment_time');

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 20)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch appointments'
      };
    }
  }

  /**
   * Create a new appointment
   */
  async createAppointment(appointmentData: Partial<SupabaseAppointment>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            ...appointmentData,
            created_by: user?.id,
            updated_by: user?.id
          }
        ])
        .select(`
          *,
          patients(first_name, last_name),
          practitioners(first_name, last_name)
        `)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create appointment'
      };
    }
  }

  /**
   * Update an appointment
   */
  async updateAppointment(id: string, appointmentData: Partial<SupabaseAppointment>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...appointmentData,
          updated_by: user?.id
        })
        .eq('id', id)
        .select(`
          *,
          patients!inner(first_name, last_name),
          practitioners!inner(first_name, last_name)
        `)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error updating appointment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update appointment'
      };
    }
  }

  /**
   * Get today's appointments
   */
  async getTodaysAppointments() {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointments({ date: today });
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Today's appointments
      const { data: todayAppointments } = await supabase
        .from('appointments')
        .select('status')
        .eq('appointment_date', today);

      // This week's appointments
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const { data: weekAppointments } = await supabase
        .from('appointments')
        .select('status')
        .gte('appointment_date', startOfWeek.toISOString().split('T')[0])
        .lte('appointment_date', endOfWeek.toISOString().split('T')[0]);

      const todayStats = todayAppointments?.reduce((acc: any, apt: any) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const weekStats = weekAppointments?.reduce((acc: any, apt: any) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        success: true,
        data: {
          today: {
            total: todayAppointments?.length || 0,
            byStatus: todayStats
          },
          week: {
            total: weekAppointments?.length || 0,
            byStatus: weekStats
          }
        }
      };
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics'
      };
    }
  }

  /**
   * Check provider availability for a specific date and time
   */
  async checkProviderAvailability(practitionerId: string, appointmentDate: string, appointmentTime: string, duration: number = 30) {
    try {
      // Check if practitioner has schedule for this day
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      const dayOfWeek = appointmentDateTime.getDay();

      const { data: schedules, error: scheduleError } = await supabase
        .from('provider_schedules')
        .select('*')
        .eq('practitioner_id', practitionerId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (scheduleError) throw scheduleError;

      if (!schedules || schedules.length === 0) {
        return {
          success: false,
          available: false,
          message: 'Provider not available on this day'
        };
      }

      // Check if requested time falls within provider's schedule
      const requestedTime = appointmentTime;
      const endTime = new Date(appointmentDateTime.getTime() + duration * 60000);
      const endTimeString = endTime.toTimeString().slice(0, 5);

      const isWithinSchedule = schedules.some(schedule => 
        requestedTime >= schedule.start_time && endTimeString <= schedule.end_time
      );

      if (!isWithinSchedule) {
        return {
          success: false,
          available: false,
          message: 'Requested time is outside provider schedule'
        };
      }

      // Check for conflicting appointments
      const { data: conflicts, error: conflictError } = await supabase
        .from('appointments')
        .select('*')
        .eq('practitioner_id', practitionerId)
        .eq('appointment_date', appointmentDate)
        .in('status', ['scheduled', 'confirmed', 'in-progress']);

      if (conflictError) throw conflictError;

      if (conflicts && conflicts.length > 0) {
        for (const appointment of conflicts) {
          const existingStart = new Date(`${appointmentDate}T${appointment.appointment_time}`);
          const existingEnd = new Date(existingStart.getTime() + (appointment.duration_minutes || 30) * 60000);
          const requestedStart = appointmentDateTime;
          const requestedEnd = endTime;

          // Check for time overlap
          if (requestedStart < existingEnd && requestedEnd > existingStart) {
            return {
              success: false,
              available: false,
              message: 'Time slot conflicts with existing appointment'
            };
          }
        }
      }

      return {
        success: true,
        available: true,
        message: 'Time slot is available'
      };
    } catch (error) {
      console.error('Error checking availability:', error);
      return {
        success: false,
        available: false,
        error: error instanceof Error ? error.message : 'Failed to check availability'
      };
    }
  }

  /**
   * Get available time slots for a provider on a specific date
   */
  async getAvailableTimeSlots(practitionerId: string, appointmentDate: string) {
    try {
      const appointmentDateTime = new Date(appointmentDate);
      const dayOfWeek = appointmentDateTime.getDay();

      // Get provider schedule for this day
      const { data: schedules, error: scheduleError } = await supabase
        .from('provider_schedules')
        .select('*')
        .eq('practitioner_id', practitionerId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (scheduleError) throw scheduleError;

      if (!schedules || schedules.length === 0) {
        return {
          success: true,
          data: [],
          message: 'Provider not available on this day'
        };
      }

      // Get existing appointments for this date
      const { data: appointments, error: appointmentError } = await supabase
        .from('appointments')
        .select('appointment_time, duration_minutes')
        .eq('practitioner_id', practitionerId)
        .eq('appointment_date', appointmentDate)
        .in('status', ['scheduled', 'confirmed', 'in-progress']);

      if (appointmentError) throw appointmentError;

      // Generate available time slots
      const availableSlots: string[] = [];
      const slotDuration = 30; // 30-minute slots

      for (const schedule of schedules) {
        let currentTime = new Date(`2000-01-01T${schedule.start_time}`);
        const endTime = new Date(`2000-01-01T${schedule.end_time}`);

        while (currentTime < endTime) {
          const timeString = currentTime.toTimeString().slice(0, 5);
          const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);

          // Check if this slot conflicts with existing appointments
          const hasConflict = appointments?.some(apt => {
            const aptStart = new Date(`2000-01-01T${apt.appointment_time}`);
            const aptEnd = new Date(aptStart.getTime() + (apt.duration_minutes || 30) * 60000);
            return currentTime < aptEnd && slotEnd > aptStart;
          });

          if (!hasConflict) {
            availableSlots.push(timeString);
          }

          currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
        }
      }

      return {
        success: true,
        data: availableSlots
      };
    } catch (error) {
      console.error('Error getting available slots:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get available slots'
      };
    }
  }

  /**
   * Edit appointment details
   */
  async editAppointment(id: string, updates: Partial<SupabaseAppointment>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // If updating appointment time/date, check availability
      if (updates.appointment_date || updates.appointment_time) {
        const { data: currentAppointment } = await supabase
          .from('appointments')
          .select('practitioner_id, appointment_date, appointment_time, duration_minutes')
          .eq('id', id)
          .single();

        if (currentAppointment) {
          const practitionerId = updates.practitioner_id || currentAppointment.practitioner_id;
          const appointmentDate = updates.appointment_date || currentAppointment.appointment_date;
          const appointmentTime = updates.appointment_time || currentAppointment.appointment_time;
          const duration = updates.duration_minutes || currentAppointment.duration_minutes || 30;

          // Check availability for the new time slot (excluding current appointment)
          const availabilityCheck = await this.checkProviderAvailability(
            practitionerId, 
            appointmentDate, 
            appointmentTime, 
            duration
          );

          if (!availabilityCheck.success || !availabilityCheck.available) {
            return {
              success: false,
              error: availabilityCheck.error || 'The selected time slot is not available'
            };
          }
        }
      }

      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...updates,
          updated_by: user?.id
        })
        .eq('id', id)
        .select(`
          *,
          patients!inner(first_name, last_name),
          practitioners!inner(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error editing appointment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to edit appointment'
      };
    }
  }

  /**
   * Reschedule appointment to a new date and time
   */
  async rescheduleAppointment(
    id: string, 
    newDate: string, 
    newTime: string, 
    reason?: string
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Get current appointment details
      const { data: currentAppointment, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!currentAppointment) {
        return {
          success: false,
          error: 'Appointment not found'
        };
      }

      // Check availability for the new time slot
      const availabilityCheck = await this.checkProviderAvailability(
        currentAppointment.practitioner_id,
        newDate,
        newTime,
        currentAppointment.duration_minutes || 30
      );

      if (!availabilityCheck.success || !availabilityCheck.available) {
        return {
          success: false,
          error: availabilityCheck.error || 'The selected time slot is not available'
        };
      }

      // Update the appointment with new date/time
      const { data, error } = await supabase
        .from('appointments')
        .update({
          appointment_date: newDate,
          appointment_time: newTime,
          status: 'scheduled', // Reset status when rescheduling
          notes: reason ? `${currentAppointment.notes ? currentAppointment.notes + '\n' : ''}Rescheduled: ${reason}` : currentAppointment.notes,
          updated_by: user?.id
        })
        .eq('id', id)
        .select(`
          *,
          patients!inner(first_name, last_name),
          practitioners!inner(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Appointment rescheduled successfully'
      };
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reschedule appointment'
      };
    }
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(id: string, reason?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
          updated_by: user?.id
        })
        .eq('id', id)
        .select(`
          *,
          patients!inner(first_name, last_name),
          practitioners!inner(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Appointment cancelled successfully'
      };
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel appointment'
      };
    }
  }

  /**
   * Get appointment by ID
   */
  async getAppointment(id: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!inner(first_name, last_name, phone, email),
          practitioners!inner(first_name, last_name, title, specialty)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching appointment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch appointment'
      };
    }
  }
}

/**
 * Practitioners Service
 */
export class SupabasePractitionerService {
  /**
   * Get all practitioners
   */
  async getPractitioners(options?: {
    search?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('practitioners')
        .select('*');

      // Apply filters
      if (options?.active !== undefined) {
        query = query.eq('active', options.active);
      } else {
        query = query.eq('active', true); // Default to active only
      }

      if (options?.search) {
        query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,specialty.ilike.%${options.search}%`);
      }

      // Order by name
      query = query.order('last_name').order('first_name');

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 20)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching practitioners:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch practitioners'
      };
    }
  }

  /**
   * Get a single practitioner by ID
   */
  async getPractitioner(id: string) {
    try {
      const { data, error } = await supabase
        .from('practitioners')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching practitioner:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Practitioner not found'
      };
    }
  }

  /**
   * Create a new practitioner
   */
  async createPractitioner(practitionerData: Partial<SupabasePractitioner>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('practitioners')
        .insert([
          {
            ...practitionerData,
            created_by: user?.id,
            updated_by: user?.id
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error creating practitioner:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create practitioner'
      };
    }
  }

  /**
   * Initialize default practitioners if none exist
   */
  async initializeDefaultPractitioners() {
    try {
      // Check if practitioners exist
      const result = await this.getPractitioners({ limit: 1 });
      if (result.success && result.data && result.data.length > 0) {
        return { success: true, message: 'Practitioners already exist' };
      }

      // Create default practitioners
      const defaultPractitioners = [
        {
          first_name: 'Sarah',
          last_name: 'Johnson',
          title: 'Dr.',
          specialty: 'Internal Medicine',
          active: true
        },
        {
          first_name: 'Michael',
          last_name: 'Chen',
          title: 'Dr.',
          specialty: 'Cardiology',
          active: true
        },
        {
          first_name: 'Emily',
          last_name: 'Davis',
          title: 'Dr.',
          specialty: 'Pediatrics',
          active: true
        },
        {
          first_name: 'Robert',
          last_name: 'Wilson',
          title: 'Dr.',
          specialty: 'Orthopedics',
          active: true
        },
        {
          first_name: 'Lisa',
          last_name: 'Anderson',
          title: 'Dr.',
          specialty: 'Family Medicine',
          active: true
        }
      ];

      const { data, error } = await supabase
        .from('practitioners')
        .insert(defaultPractitioners)
        .select();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: 'Default practitioners created successfully'
      };
    } catch (error) {
      console.error('Error initializing practitioners:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize practitioners'
      };
    }
  }
}

/**
 * Clinical Service for Lab Results and Diagnoses
 */
export class SupabaseClinicalService {
  /**
   * Get lab results for a patient
   */
  async getPatientLabResults(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('lab_results')
        .select('*')
        .eq('patient_id', patientId)
        .order('reported_date', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching lab results:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch lab results'
      };
    }
  }

  /**
   * Add lab result
   */
  async addLabResult(labData: Partial<SupabaseLabResult>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('lab_results')
        .insert([{
          ...labData,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error adding lab result:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add lab result'
      };
    }
  }

  /**
   * Get patient diagnoses
   */
  async getPatientDiagnoses(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('patient_diagnoses')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch diagnoses'
      };
    }
  }

  /**
   * Add patient diagnosis
   */
  async addPatientDiagnosis(diagnosisData: Partial<SupabasePatientDiagnosis>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('patient_diagnoses')
        .insert([{
          ...diagnosisData,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error adding diagnosis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add diagnosis'
      };
    }
  }

  /**
   * Get patient complete medical record
   */
  async getPatientMedicalRecord(patientId: string) {
    try {
      const [
        patientResult,
        medicalHistoryResult,
        allergiesResult,
        immunizationsResult,
        labResultsResult,
        diagnosesResult,
        vitalsResult,
        notesResult,
        prescriptionsResult
      ] = await Promise.all([
        supabase.from('patients').select('*').eq('id', patientId).single(),
        supabase.from('patient_medical_history').select('*').eq('patient_id', patientId),
        supabase.from('patient_allergies').select('*').eq('patient_id', patientId).eq('status', 'active'),
        supabase.from('patient_immunizations').select('*').eq('patient_id', patientId),
        supabase.from('lab_results').select('*').eq('patient_id', patientId),
        supabase.from('patient_diagnoses').select('*').eq('patient_id', patientId),
        supabase.from('vital_signs').select('*').eq('patient_id', patientId).limit(10),
        supabase.from('clinical_notes').select('*').eq('patient_id', patientId).limit(5),
        supabase.from('prescriptions').select('*, medications!inner(*)').eq('patient_id', patientId)
      ]);

      return {
        success: true,
        data: {
          patient: patientResult.data,
          medicalHistory: medicalHistoryResult.data || [],
          allergies: allergiesResult.data || [],
          immunizations: immunizationsResult.data || [],
          labResults: labResultsResult.data || [],
          diagnoses: diagnosesResult.data || [],
          recentVitals: vitalsResult.data || [],
          recentNotes: notesResult.data || [],
          currentPrescriptions: prescriptionsResult.data || []
        }
      };
    } catch (error) {
      console.error('Error fetching complete medical record:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch medical record'
      };
    }
  }
}

/**
 * Vital Signs Service
 */
export class SupabaseVitalSignsService {
  /**
   * Create a new vital sign record
   */
  async createVitalSign(vitalData: Partial<SupabaseVitalSign>) {
    try {
      const { data, error } = await supabase
        .from('vital_signs')
        .insert({
          ...vitalData,
          recorded_by: vitalData.recorded_by,
          created_by: vitalData.recorded_by
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error creating vital sign:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create vital sign'
      };
    }
  }

  /**
   * Get vital signs for a patient
   */
  async getVitalSigns(patientId: string, limit = 50) {
    try {
      // Validate UUID
      if (!patientId || patientId.trim() === '') {
        return {
          success: false,
          error: 'Patient ID is required'
        };
      }

      const { data, error } = await supabase
        .from('vital_signs')
        .select(`
          *,
          patients!inner(first_name, last_name)
        `)
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching vital signs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch vital signs'
      };
    }
  }

  /**
   * Get latest vitals for a patient
   */
  async getLatestVitals(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching latest vitals:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch latest vitals'
      };
    }
  }

  /**
   * Record multiple vital signs in one session
   */
  async recordVitalsSuite(patientId: string, vitals: {
    bloodPressure?: { systolic: number; diastolic: number; notes?: string };
    heartRate?: { value: number; notes?: string };
    temperature?: { value: number; unit?: 'F' | 'C'; notes?: string };
    respiratoryRate?: { value: number; notes?: string };
    oxygenSaturation?: { value: number; notes?: string };
    weight?: { value: number; unit?: 'lbs' | 'kg'; notes?: string };
    height?: { value: number; unit?: 'in' | 'cm'; notes?: string };
    painLevel?: { value: number; notes?: string };
  }, recordedBy: string, appointmentId?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const recordedAt = new Date().toISOString();
      const vitalRecords: Partial<SupabaseVitalSign>[] = [];

      // Blood Pressure
      if (vitals.bloodPressure) {
        vitalRecords.push({
          patient_id: patientId,
          appointment_id: appointmentId,
          vital_type: 'blood_pressure',
          systolic: vitals.bloodPressure.systolic,
          diastolic: vitals.bloodPressure.diastolic,
          value: vitals.bloodPressure.systolic, // Store systolic as primary value
          unit: 'mmHg',
          notes: vitals.bloodPressure.notes,
          recorded_by: recordedBy,
          recorded_at: recordedAt,
          created_by: user?.id
        });
      }

      // Heart Rate
      if (vitals.heartRate) {
        vitalRecords.push({
          patient_id: patientId,
          appointment_id: appointmentId,
          vital_type: 'heart_rate',
          value: vitals.heartRate.value,
          unit: 'bpm',
          notes: vitals.heartRate.notes,
          recorded_by: recordedBy,
          recorded_at: recordedAt,
          created_by: user?.id
        });
      }

      // Temperature
      if (vitals.temperature) {
        vitalRecords.push({
          patient_id: patientId,
          appointment_id: appointmentId,
          vital_type: 'temperature',
          value: vitals.temperature.value,
          unit: vitals.temperature.unit || 'F',
          notes: vitals.temperature.notes,
          recorded_by: recordedBy,
          recorded_at: recordedAt,
          created_by: user?.id
        });
      }

      // Respiratory Rate
      if (vitals.respiratoryRate) {
        vitalRecords.push({
          patient_id: patientId,
          appointment_id: appointmentId,
          vital_type: 'respiratory_rate',
          value: vitals.respiratoryRate.value,
          unit: 'breaths/min',
          notes: vitals.respiratoryRate.notes,
          recorded_by: recordedBy,
          recorded_at: recordedAt,
          created_by: user?.id
        });
      }

      // Oxygen Saturation
      if (vitals.oxygenSaturation) {
        vitalRecords.push({
          patient_id: patientId,
          appointment_id: appointmentId,
          vital_type: 'oxygen_saturation',
          value: vitals.oxygenSaturation.value,
          unit: '%',
          notes: vitals.oxygenSaturation.notes,
          recorded_by: recordedBy,
          recorded_at: recordedAt,
          created_by: user?.id
        });
      }

      // Weight
      if (vitals.weight) {
        vitalRecords.push({
          patient_id: patientId,
          appointment_id: appointmentId,
          vital_type: 'weight',
          value: vitals.weight.value,
          unit: vitals.weight.unit || 'lbs',
          notes: vitals.weight.notes,
          recorded_by: recordedBy,
          recorded_at: recordedAt,
          created_by: user?.id
        });
      }

      // Height
      if (vitals.height) {
        vitalRecords.push({
          patient_id: patientId,
          appointment_id: appointmentId,
          vital_type: 'height',
          value: vitals.height.value,
          unit: vitals.height.unit || 'in',
          notes: vitals.height.notes,
          recorded_by: recordedBy,
          recorded_at: recordedAt,
          created_by: user?.id
        });
      }

      // Pain Level
      if (vitals.painLevel) {
        vitalRecords.push({
          patient_id: patientId,
          appointment_id: appointmentId,
          vital_type: 'pain_level',
          value: vitals.painLevel.value,
          unit: '0-10 scale',
          notes: vitals.painLevel.notes,
          recorded_by: recordedBy,
          recorded_at: recordedAt,
          created_by: user?.id
        });
      }

      if (vitalRecords.length === 0) {
        return {
          success: false,
          error: 'No vital signs provided to record'
        };
      }

      // Insert all vital signs
      const { data, error } = await supabase
        .from('vital_signs')
        .insert(vitalRecords)
        .select();

      if (error) throw error;

      return {
        success: true,
        data,
        message: `Recorded ${vitalRecords.length} vital sign(s) successfully`
      };
    } catch (error) {
      console.error('Error recording vitals suite:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record vital signs'
      };
    }
  }

  /**
   * Update a vital sign record
   */
  async updateVitalSign(id: string, updates: Partial<SupabaseVitalSign>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('vital_signs')
        .update({
          ...updates,
          updated_by: user?.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error updating vital sign:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update vital sign'
      };
    }
  }

  /**
   * Delete a vital sign record
   */
  async deleteVitalSign(id: string) {
    try {
      const { data, error } = await supabase
        .from('vital_signs')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Vital sign deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting vital sign:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete vital sign'
      };
    }
  }

  /**
   * Get vital signs by appointment
   */
  async getVitalsByAppointment(appointmentId: string) {
    try {
      const { data, error } = await supabase
        .from('vital_signs')
        .select(`
          *,
          patients!inner(first_name, last_name)
        `)
        .eq('appointment_id', appointmentId)
        .order('recorded_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching vitals by appointment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch vitals by appointment'
      };
    }
  }
}

/**
 * Clinical Notes Service
 */
export class SupabaseClinicalNotesService {
  /**
   * Create a new clinical note
   */
  async createNote(noteData: Partial<SupabaseClinicalNote>) {
    try {
      const { data, error } = await supabase
        .from('clinical_notes')
        .insert({
          ...noteData,
          created_by: noteData.author_id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error creating clinical note:', error);
      // Better error logging to see what's actually wrong
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Supabase error details:', JSON.stringify(error, null, 2));
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create clinical note. Database tables may not exist yet.'
      };
    }
  }

  /**
   * Get clinical notes for a patient
   */
  async getNotes(patientId: string, limit = 50) {
    try {
      // Validate UUID
      if (!patientId || patientId.trim() === '') {
        return {
          success: false,
          error: 'Patient ID is required'
        };
      }

      const { data, error } = await supabase
        .from('clinical_notes')
        .select(`
          *,
          patients!inner(first_name, last_name)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching clinical notes:', error);
      // Better error logging to see what's actually wrong
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Supabase error details:', JSON.stringify(error, null, 2));
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch clinical notes. Database tables may not exist yet.'
      };
    }
  }

  /**
   * Update a clinical note
   */
  async updateNote(id: string, updates: Partial<SupabaseClinicalNote>) {
    try {
      const { data, error } = await supabase
        .from('clinical_notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error updating clinical note:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update clinical note'
      };
    }
  }

  /**
   * Add a new clinical note with enhanced functionality
   */
  async addClinicalNote(noteData: {
    patientId: string;
    appointmentId?: string;
    noteType: 'progress_note' | 'consultation' | 'discharge_summary' | 'admission_note' | 'procedure_note' | 'other';
    subject: string;
    content: string;
    isConfidential?: boolean;
    authorId: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('clinical_notes')
        .insert({
          patient_id: noteData.patientId,
          appointment_id: noteData.appointmentId,
          note_type: noteData.noteType,
          subject: noteData.subject,
          content: noteData.content,
          is_confidential: noteData.isConfidential || false,
          author_id: noteData.authorId,
          created_by: user?.id
        })
        .select(`
          *,
          patients!inner(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Clinical note added successfully'
      };
    } catch (error) {
      console.error('Error adding clinical note:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add clinical note'
      };
    }
  }

  /**
   * Get notes by appointment
   */
  async getNotesByAppointment(appointmentId: string) {
    try {
      const { data, error } = await supabase
        .from('clinical_notes')
        .select(`
          *,
          patients!inner(first_name, last_name)
        `)
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching notes by appointment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notes by appointment'
      };
    }
  }

  /**
   * Get notes by type
   */
  async getNotesByType(patientId: string, noteType: string) {
    try {
      const { data, error } = await supabase
        .from('clinical_notes')
        .select(`
          *,
          patients!inner(first_name, last_name)
        `)
        .eq('patient_id', patientId)
        .eq('note_type', noteType)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching notes by type:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notes by type'
      };
    }
  }

  /**
   * Sign a clinical note
   */
  async signNote(id: string) {
    try {
      const { data, error } = await supabase
        .from('clinical_notes')
        .update({
          signed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Clinical note signed successfully'
      };
    } catch (error) {
      console.error('Error signing clinical note:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sign clinical note'
      };
    }
  }

  /**
   * Delete a clinical note
   */
  async deleteNote(id: string) {
    try {
      const { data, error } = await supabase
        .from('clinical_notes')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Clinical note deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting clinical note:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete clinical note'
      };
    }
  }

  /**
   * Get recent notes for dashboard
   */
  async getRecentNotes(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('clinical_notes')
        .select(`
          *,
          patients!inner(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching recent notes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch recent notes'
      };
    }
  }
}

/**
 * Medications Service
 */
export class SupabaseMedicationsService {
  /**
   * Get all medications
   */
  async getMedications(search?: string) {
    try {
      let query = supabase
        .from('medications')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (search) {
        query = query.or(`name.ilike.%${search}%,generic_name.ilike.%${search}%,brand_name.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching medications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch medications'
      };
    }
  }

  /**
   * Create a new medication
   */
  async createMedication(medicationData: Partial<SupabaseMedication>) {
    try {
      const { data, error } = await supabase
        .from('medications')
        .insert(medicationData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error creating medication:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create medication'
      };
    }
  }
}

/**
 * Prescriptions Service
 */
export class SupabasePrescriptionsService {
  /**
   * Create a new prescription
   */
  async createPrescription(prescriptionData: Partial<SupabasePrescription>) {
    try {
      console.log('Creating prescription with data:', prescriptionData);
      
      const { data, error } = await supabase
        .from('prescriptions')
        .insert({
          ...prescriptionData,
          created_by: prescriptionData.prescriber_id,
          updated_by: prescriptionData.prescriber_id
        })
        .select(`
          *,
          medications!inner(*),
          patients!inner(first_name, last_name)
        `)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error creating prescription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create prescription'
      };
    }
  }

  /**
   * Get prescriptions for a patient
   */
  async getPatientPrescriptions(patientId: string) {
    try {
      // Validate UUID
      if (!patientId || patientId.trim() === '') {
        return {
          success: false,
          error: 'Patient ID is required'
        };
      }

      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          medications!inner(*),
          patients!inner(first_name, last_name)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch prescriptions'
      };
    }
  }

  /**
   * Update prescription status
   */
  async updatePrescriptionStatus(id: string, status: 'pending' | 'sent' | 'filled' | 'cancelled', notes?: string) {
    try {
      const updates: any = { status };
      
      if (status === 'sent') {
        updates.sent_to_pharmacy_at = new Date().toISOString();
      } else if (status === 'filled') {
        updates.filled_at = new Date().toISOString();
      }
      
      if (notes) {
        updates.notes = notes;
      }

      const { data, error } = await supabase
        .from('prescriptions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          medications!inner(*),
          patients!inner(first_name, last_name)
        `)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error updating prescription status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update prescription status'
      };
    }
  }

  /**
   * Get all prescriptions (for pharmacy/admin view)
   */
  async getAllPrescriptions(status?: string) {
    try {
      let query = supabase
        .from('prescriptions')
        .select(`
          *,
          medications!inner(*),
          patients!inner(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching all prescriptions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch prescriptions'
      };
    }
  }
}

// Billing-related interfaces
export interface SupabaseInvoice {
  id: string;
  created_at: string;
  updated_at: string;
  patient_id: string;
  appointment_id?: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  created_by?: string;
  updated_by?: string;
  // Relations
  patients?: SupabasePatient;
  invoice_items?: SupabaseInvoiceItem[];
  payments?: SupabasePayment[];
  insurance_claims?: SupabaseInsuranceClaim[];
}

export interface SupabaseInvoiceItem {
  id: string;
  created_at: string;
  invoice_id: string;
  service_code?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_by?: string;
}

export interface SupabasePayment {
  id: string;
  created_at: string;
  updated_at: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'check' | 'insurance' | 'other';
  reference_number?: string;
  notes?: string;
  processed_by?: string;
  created_by?: string;
  updated_by?: string;
}

export interface SupabaseInsuranceClaim {
  id: string;
  created_at: string;
  updated_at: string;
  invoice_id: string;
  patient_id: string;
  claim_number: string;
  insurance_provider: string;
  policy_number?: string;
  group_number?: string;
  submitted_date?: string;
  processed_date?: string;
  status: 'pending' | 'approved' | 'denied' | 'partial';
  approved_amount?: number;
  denied_amount?: number;
  reason_code?: string;
  reason_description?: string;
  notes?: string;
  created_by?: string;
  updated_by?: string;
}

export interface SupabaseServiceCode {
  id: string;
  created_at: string;
  code: string;
  description: string;
  category?: string;
  default_price?: number;
  active: boolean;
  created_by?: string;
}

/**
 * Billing Service
 */
export class SupabaseBillingService {
  /**
   * Get all invoices
   */
  async getInvoices() {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          patients!inner(first_name, last_name, mrn),
          invoice_items(*),
          payments(*),
          insurance_claims(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch invoices'
      };
    }
  }

  /**
   * Create a new invoice with items
   */
  async createInvoice(invoiceData: Partial<SupabaseInvoice>, items?: Array<{
    service_code: string;
    description: string;
    quantity: number;
    unit_price: number;
  }>) {
    try {
      // Validate required fields
      if (!invoiceData.patient_id || invoiceData.patient_id.trim() === '') {
        return {
          success: false,
          error: 'Patient ID is required for invoice creation'
        };
      }

      if (!invoiceData.created_by || invoiceData.created_by.trim() === '') {
        return {
          success: false,
          error: 'Created by user ID is required for invoice creation'
        };
      }

      // First create the invoice
      const { data: invoiceResult, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          invoice_number: invoiceData.invoice_number || `INV-${Date.now()}`,
          created_by: invoiceData.created_by,
          updated_by: invoiceData.created_by
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // If items are provided, create invoice items
      if (items && items.length > 0) {
        const invoiceItems = items.map(item => ({
          invoice_id: invoiceResult.id,
          service_code: item.service_code,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          created_by: invoiceData.created_by
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);

        if (itemsError) {
          console.error('Error creating invoice items:', itemsError);
          // Optionally, you might want to delete the invoice if items creation fails
          // For now, we'll just log the error and continue
        }
      }

      return { success: true, data: invoiceResult };
    } catch (error) {
      console.error('Error creating invoice:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoice'
      };
    }
  }

  /**
   * Add payment to an invoice
   */
  async addPayment(paymentData: Partial<SupabasePayment>) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...paymentData,
          created_by: paymentData.processed_by,
          updated_by: paymentData.processed_by
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error adding payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add payment'
      };
    }
  }

  /**
   * Get service codes
   */
  async getServiceCodes() {
    try {
      const { data, error } = await supabase
        .from('service_codes')
        .select('*')
        .eq('active', true)
        .order('code');

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching service codes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch service codes'
      };
    }
  }

  /**
   * Get payment history for a patient
   */
  async getPatientPaymentHistory(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select(`
          *,
          invoices(invoice_number, total_amount)
        `)
        .eq('patient_id', patientId)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment history'
      };
    }
  }

  /**
   * Add payment record
   */
//   async addPayment(paymentData: Partial<SupabasePaymentHistory>) {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
      
//       const { data, error } = await supabase
//         .from('payment_history')
//         .insert([{
//           ...paymentData,
//           created_by: user?.id
//         }])
//         .select()
//         .single();

//       if (error) throw error;

//       // Update invoice paid_amount if invoice_id is provided
//       if (paymentData.invoice_id) {
//         const { data: invoice } = await supabase
//           .from('invoices')
//           .select('paid_amount, total_amount')
//           .eq('id', paymentData.invoice_id)
//           .single();

//         if (invoice) {
//           const newPaidAmount = (invoice.paid_amount || 0) + (paymentData.amount || 0);
//           const newStatus = newPaidAmount >= invoice.total_amount ? 'paid' : 'sent';

//           await supabase
//             .from('invoices')
//             .update({
//               paid_amount: newPaidAmount,
//               status: newStatus
//             })
//             .eq('id', paymentData.invoice_id);
//         }
//       }

//       return { success: true, data };
//     } catch (error) {
//       console.error('Error adding payment:', error);
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : 'Failed to add payment'
//       };
//     }
//   }

  /**
   * Check insurance eligibility (mock implementation)
   */
  async checkInsuranceEligibility(patientId: string) {
    try {
      const { data: insurance, error } = await supabase
        .from('patient_insurance')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!insurance) {
        return {
          success: true,
          data: {
            eligible: false,
            message: 'No active insurance found',
            coverage: null
          }
        };
      }

      // Mock eligibility check
      const today = new Date();
      const effectiveDate = new Date(insurance.effective_date || '1900-01-01');
      const expirationDate = new Date(insurance.expiration_date || '2099-12-31');

      const eligible = today >= effectiveDate && today <= expirationDate;

      return {
        success: true,
        data: {
          eligible,
          message: eligible ? 'Coverage active' : 'Coverage expired or not yet effective',
          coverage: {
            provider: insurance.insurance_provider,
            policyNumber: insurance.policy_number,
            groupNumber: insurance.group_number,
            copay: insurance.copay_amount,
            deductible: insurance.deductible_amount,
            effectiveDate: insurance.effective_date,
            expirationDate: insurance.expiration_date
          }
        }
      };
    } catch (error) {
      console.error('Error checking insurance eligibility:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check insurance eligibility'
      };
    }
  }

  /**
   * Get patient balance summary
   */
  async getPatientBalance(patientId: string) {
    try {
      const { data: invoices, error: invoiceError } = await supabase
        .from('invoices')
        .select('total_amount, paid_amount, status')
        .eq('patient_id', patientId);

      if (invoiceError) throw invoiceError;

      const summary = invoices?.reduce((acc, invoice) => {
        acc.totalBilled += invoice.total_amount || 0;
        acc.totalPaid += invoice.paid_amount || 0;
        acc.totalBalance += (invoice.total_amount || 0) - (invoice.paid_amount || 0);
        
        if (invoice.status === 'overdue') {
          acc.overdueBalance += (invoice.total_amount || 0) - (invoice.paid_amount || 0);
        }
        
        return acc;
      }, {
        totalBilled: 0,
        totalPaid: 0,
        totalBalance: 0,
        overdueBalance: 0
      }) || {
        totalBilled: 0,
        totalPaid: 0,
        totalBalance: 0,
        overdueBalance: 0
      };

      return { success: true, data: summary };
    } catch (error) {
      console.error('Error fetching patient balance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch patient balance'
      };
    }
  }

  /**
   * Get detailed insurance coverage information
   */
  async getInsuranceCoverage(patientId: string) {
    try {
      const { data: insuranceList, error } = await supabase
        .from('patient_insurance')
        .select('*')
        .eq('patient_id', patientId)
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: insuranceList || [],
        primaryInsurance: insuranceList?.find(ins => ins.is_active) || null
      };
    } catch (error) {
      console.error('Error fetching insurance coverage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch insurance coverage'
      };
    }
  }

  /**
   * Verify insurance benefits for a specific service
   */
  async verifyInsuranceBenefits(patientId: string, serviceCode: string) {
    try {
      const { data: insurance, error: insuranceError } = await supabase
        .from('patient_insurance')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .single();

      if (insuranceError && insuranceError.code !== 'PGRST116') throw insuranceError;

      if (!insurance) {
        return {
          success: true,
          data: {
            covered: false,
            message: 'No active insurance found',
            estimatedPatientResponsibility: null,
            copay: 0,
            deductible: 0
          }
        };
      }

      // Get service information
      const { data: service, error: serviceError } = await supabase
        .from('service_codes')
        .select('*')
        .eq('code', serviceCode)
        .single();

      if (serviceError && serviceError.code !== 'PGRST116') throw serviceError;

      // Mock benefit verification
      const mockCoverage = {
        covered: true,
        coveragePercentage: 80, // Mock 80% coverage
        copay: insurance.copay_amount || 25,
        deductible: insurance.deductible_amount || 500,
        message: 'Service covered under current plan'
      };

      const servicePrice = service?.default_price || 100;
      const estimatedInsurancePay = servicePrice * (mockCoverage.coveragePercentage / 100);
      const estimatedPatientResponsibility = servicePrice - estimatedInsurancePay + mockCoverage.copay;

      return {
        success: true,
        data: {
          ...mockCoverage,
          estimatedPatientResponsibility,
          estimatedInsurancePay,
          servicePrice,
          serviceDescription: service?.description || 'Unknown service'
        }
      };
    } catch (error) {
      console.error('Error verifying insurance benefits:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify insurance benefits'
      };
    }
  }

  /**
   * Submit insurance claim
   */
  async submitInsuranceClaim(claimData: {
    invoiceId: string;
    patientId: string;
    insuranceProvider: string;
    policyNumber?: string;
    groupNumber?: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const claimNumber = `CLM-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('insurance_claims')
        .insert({
          invoice_id: claimData.invoiceId,
          patient_id: claimData.patientId,
          claim_number: claimNumber,
          insurance_provider: claimData.insuranceProvider,
          policy_number: claimData.policyNumber,
          group_number: claimData.groupNumber,
          submitted_date: new Date().toISOString(),
          status: 'pending',
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: `Insurance claim ${claimNumber} submitted successfully`
      };
    } catch (error) {
      console.error('Error submitting insurance claim:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit insurance claim'
      };
    }
  }

  /**
   * Get insurance claims for a patient
   */
  async getPatientInsuranceClaims(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('insurance_claims')
        .select(`
          *,
          invoices!inner(invoice_number, total_amount)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Error fetching insurance claims:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch insurance claims'
      };
    }
  }

  /**
   * Process insurance claim response
   */
  async processClaimResponse(claimId: string, response: {
    status: 'approved' | 'denied' | 'partial';
    approvedAmount?: number;
    deniedAmount?: number;
    reasonCode?: string;
    reasonDescription?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('insurance_claims')
        .update({
          status: response.status,
          approved_amount: response.approvedAmount,
          denied_amount: response.deniedAmount,
          reason_code: response.reasonCode,
          reason_description: response.reasonDescription,
          processed_date: new Date().toISOString()
        })
        .eq('id', claimId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Insurance claim response processed successfully'
      };
    } catch (error) {
      console.error('Error processing claim response:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process claim response'
      };
    }
  }
}

/**
 * Reports Service
 */
export class SupabaseReportsService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      // Get patient count
      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      // Get appointment count for today
      const today = new Date().toISOString().split('T')[0];
      const { count: todayAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today);

      // Get revenue for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { data: revenueData } = await supabase
        .from('invoices')
        .select('paid_amount')
        .gte('issue_date', `${currentMonth}-01`)
        .eq('status', 'paid');

      const monthlyRevenue = revenueData?.reduce((sum, invoice) => sum + invoice.paid_amount, 0) || 0;

      // Get pending invoices count
      const { count: pendingInvoices } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .in('status', ['sent', 'overdue']);

      return {
        success: true,
        data: {
          totalPatients: patientCount || 0,
          todayAppointments: todayAppointments || 0,
          monthlyRevenue,
          pendingInvoices: pendingInvoices || 0
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats'
      };
    }
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('status, appointment_date')
        .gte('appointment_date', startDate)
        .lte('appointment_date', endDate);

      if (error) throw error;

      const stats = data?.reduce((acc, appointment) => {
        acc[appointment.status] = (acc[appointment.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch appointment stats'
      };
    }
  }
}

// Export service instances
export const patientService = new SupabasePatientService();
export const appointmentService = new SupabaseAppointmentService();
export const practitionerService = new SupabasePractitionerService();
export const vitalSignsService = new SupabaseVitalSignsService();
export const clinicalNotesService = new SupabaseClinicalNotesService();
export const medicationsService = new SupabaseMedicationsService();
export const prescriptionsService = new SupabasePrescriptionsService();
export const billingService = new SupabaseBillingService();
export const clinicalService = new SupabaseClinicalService();
export const reportsService = new SupabaseReportsService();