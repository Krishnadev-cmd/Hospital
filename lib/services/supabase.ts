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
export const reportsService = new SupabaseReportsService();