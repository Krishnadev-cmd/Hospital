-- EHR System Database Schema for Supabase

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'unknown');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'arrived', 'in-progress', 'completed', 'cancelled', 'no-show');
CREATE TYPE allergy_severity AS ENUM ('mild', 'moderate', 'severe');
CREATE TYPE allergy_category AS ENUM ('food', 'medication', 'environment', 'biologic');

-- Patients table
CREATE TABLE patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Basic Demographics
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    
    -- Contact Information
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Address
    street_address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'US',
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_relationship VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    
    -- Insurance
    insurance_provider VARCHAR(200),
    insurance_policy_number VARCHAR(100),
    insurance_group_number VARCHAR(100),
    
    -- Medical Record Number
    mrn VARCHAR(50) UNIQUE,
    
    -- Status
    active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Practitioners table
CREATE TABLE practitioners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Basic Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    title VARCHAR(20), -- Dr., Nurse, etc.
    
    -- Contact Information
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Professional Information
    specialty VARCHAR(200),
    license_number VARCHAR(100),
    npi_number VARCHAR(20),
    department VARCHAR(200),
    
    -- Status
    active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Appointments table
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- References
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE RESTRICT,
    
    -- Appointment Details
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status appointment_status DEFAULT 'scheduled',
    
    -- Appointment Information
    appointment_type VARCHAR(200),
    reason TEXT,
    notes TEXT,
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Allergies table
CREATE TABLE allergies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- References
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    
    -- Allergy Information
    allergen VARCHAR(200) NOT NULL,
    category allergy_category NOT NULL,
    severity allergy_severity NOT NULL,
    reactions TEXT[], -- Array of reaction symptoms
    onset_date DATE,
    notes TEXT,
    
    -- Status
    active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Medications table
CREATE TABLE medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- References
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    prescribed_by UUID REFERENCES practitioners(id),
    
    -- Medication Information
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    route VARCHAR(50) NOT NULL, -- oral, injection, etc.
    
    -- Prescription Details
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    refills INTEGER DEFAULT 0,
    quantity VARCHAR(50),
    
    -- Status
    active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Vital Signs table
CREATE TABLE vital_signs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    
    -- Vital Signs
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    bmi DECIMAL(4,2),
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    temperature_celsius DECIMAL(3,1),
    oxygen_saturation INTEGER,
    
    -- Measurement Details
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    measured_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Clinical Notes table
CREATE TABLE clinical_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- References
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    practitioner_id UUID NOT NULL REFERENCES practitioners(id),
    
    -- Note Information
    note_type VARCHAR(100) NOT NULL, -- progress, consultation, discharge, etc.
    subject VARCHAR(200),
    content TEXT NOT NULL,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_patients_active ON patients(active);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_practitioner ON appointments(practitioner_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_allergies_patient ON allergies(patient_id);
CREATE INDEX idx_medications_patient ON medications(patient_id);
CREATE INDEX idx_vital_signs_patient ON vital_signs(patient_id);
CREATE INDEX idx_clinical_notes_patient ON clinical_notes(patient_id);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow authenticated users to access all data for now)
-- In production, you'd want more granular policies

CREATE POLICY "Allow authenticated users to read patients" ON patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert patients" ON patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update patients" ON patients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete patients" ON patients FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read practitioners" ON practitioners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert practitioners" ON practitioners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update practitioners" ON practitioners FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read appointments" ON appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert appointments" ON appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update appointments" ON appointments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete appointments" ON appointments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read allergies" ON allergies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert allergies" ON allergies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update allergies" ON allergies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete allergies" ON allergies FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read medications" ON medications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert medications" ON medications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update medications" ON medications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete medications" ON medications FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read vital_signs" ON vital_signs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert vital_signs" ON vital_signs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update vital_signs" ON vital_signs FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read clinical_notes" ON clinical_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert clinical_notes" ON clinical_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update clinical_notes" ON clinical_notes FOR UPDATE TO authenticated USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practitioners_updated_at BEFORE UPDATE ON practitioners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allergies_updated_at BEFORE UPDATE ON allergies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinical_notes_updated_at BEFORE UPDATE ON clinical_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();