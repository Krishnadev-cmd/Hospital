-- Instructions for setting up Supabase database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the following SQL commands to create the database schema:

-- First, enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for standardized values
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'unknown');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'arrived', 'in-progress', 'completed', 'cancelled', 'no-show');

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL DEFAULT 'unknown',
    phone VARCHAR(20),
    email VARCHAR(255),
    street_address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    emergency_contact_name VARCHAR(200),
    emergency_contact_relationship VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    insurance_provider VARCHAR(200),
    insurance_policy_number VARCHAR(100),
    insurance_group_number VARCHAR(100),
    mrn VARCHAR(50) UNIQUE,
    active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create practitioners table
CREATE TABLE IF NOT EXISTS practitioners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    title VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255),
    specialty VARCHAR(200),
    license_number VARCHAR(100),
    npi_number VARCHAR(20),
    department VARCHAR(200),
    active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status appointment_status DEFAULT 'scheduled',
    appointment_type VARCHAR(200),
    reason TEXT,
    notes TEXT,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    checked_in_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients (last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients (mrn);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients (email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients (phone);
CREATE INDEX IF NOT EXISTS idx_patients_active ON patients (active);

CREATE INDEX IF NOT EXISTS idx_practitioners_name ON practitioners (last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_practitioners_specialty ON practitioners (specialty);
CREATE INDEX IF NOT EXISTS idx_practitioners_active ON practitioners (active);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_practitioner ON appointments (practitioner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_practitioners_updated_at BEFORE UPDATE ON practitioners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Allow authenticated users to view patients" ON patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert patients" ON patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update patients" ON patients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete patients" ON patients FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view practitioners" ON practitioners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert practitioners" ON practitioners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update practitioners" ON practitioners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete practitioners" ON practitioners FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view appointments" ON appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert appointments" ON appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update appointments" ON appointments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete appointments" ON appointments FOR DELETE TO authenticated USING (true);

-- Insert sample data
INSERT INTO practitioners (first_name, last_name, title, specialty, email, phone, npi_number, department) VALUES
('Dr. Sarah', 'Johnson', 'MD', 'Internal Medicine', 'sarah.johnson@hospital.com', '555-0101', '1234567890', 'General Medicine'),
('Dr. Michael', 'Chen', 'MD', 'Cardiology', 'michael.chen@hospital.com', '555-0102', '1234567891', 'Cardiology'),
('Dr. Emily', 'Davis', 'MD', 'Pediatrics', 'emily.davis@hospital.com', '555-0103', '1234567892', 'Pediatrics'),
('Dr. Robert', 'Wilson', 'MD', 'Orthopedics', 'robert.wilson@hospital.com', '555-0104', '1234567893', 'Orthopedics'),
('Dr. Lisa', 'Anderson', 'MD', 'Family Medicine', 'lisa.anderson@hospital.com', '555-0105', '1234567894', 'Family Medicine');

INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email, street_address, city, state, postal_code, emergency_contact_name, emergency_contact_relationship, emergency_contact_phone, insurance_provider, insurance_policy_number, mrn) VALUES
('John', 'Doe', '1985-06-15', 'male', '555-1001', 'john.doe@email.com', '123 Main St', 'Springfield', 'IL', '62701', 'Jane Doe', 'Spouse', '555-1002', 'Blue Cross Blue Shield', 'BC123456', 'MRN001001'),
('Sarah', 'Smith', '1990-03-22', 'female', '555-1003', 'sarah.smith@email.com', '456 Oak Ave', 'Springfield', 'IL', '62702', 'Mike Smith', 'Brother', '555-1004', 'Aetna', 'AE789012', 'MRN001002'),
('Michael', 'Brown', '1978-11-08', 'male', '555-1005', 'michael.brown@email.com', '789 Pine St', 'Springfield', 'IL', '62703', 'Lisa Brown', 'Wife', '555-1006', 'United Healthcare', 'UH345678', 'MRN001003'),
('Emily', 'Johnson', '1995-07-14', 'female', '555-1007', 'emily.johnson@email.com', '321 Elm St', 'Springfield', 'IL', '62704', 'David Johnson', 'Father', '555-1008', 'Cigna', 'CI901234', 'MRN001004'),
('David', 'Wilson', '1982-12-03', 'male', '555-1009', 'david.wilson@email.com', '654 Cedar Ave', 'Springfield', 'IL', '62705', 'Jennifer Wilson', 'Wife', '555-1010', 'Humana', 'HU567890', 'MRN001005');

-- Insert sample appointments
INSERT INTO appointments (patient_id, practitioner_id, appointment_date, appointment_time, duration_minutes, status, appointment_type, reason) VALUES
((SELECT id FROM patients WHERE mrn = 'MRN001001'), (SELECT id FROM practitioners WHERE email = 'sarah.johnson@hospital.com'), CURRENT_DATE, '09:00:00', 30, 'scheduled', 'Check-up', 'Annual physical examination'),
((SELECT id FROM patients WHERE mrn = 'MRN001002'), (SELECT id FROM practitioners WHERE email = 'michael.chen@hospital.com'), CURRENT_DATE, '10:30:00', 45, 'confirmed', 'Consultation', 'Chest pain evaluation'),
((SELECT id FROM patients WHERE mrn = 'MRN001003'), (SELECT id FROM practitioners WHERE email = 'robert.wilson@hospital.com'), CURRENT_DATE + 1, '14:00:00', 60, 'scheduled', 'Follow-up', 'Post-surgery check'),
((SELECT id FROM patients WHERE mrn = 'MRN001004'), (SELECT id FROM practitioners WHERE email = 'emily.davis@hospital.com'), CURRENT_DATE + 2, '11:15:00', 30, 'scheduled', 'Vaccination', 'Routine immunizations'),
((SELECT id FROM patients WHERE mrn = 'MRN001005'), (SELECT id FROM practitioners WHERE email = 'lisa.anderson@hospital.com'), CURRENT_DATE, '15:30:00', 30, 'completed', 'Sick visit', 'Cold symptoms');

-- Add some historical appointments for better statistics
INSERT INTO appointments (patient_id, practitioner_id, appointment_date, appointment_time, duration_minutes, status, appointment_type, reason) VALUES
((SELECT id FROM patients WHERE mrn = 'MRN001001'), (SELECT id FROM practitioners WHERE email = 'sarah.johnson@hospital.com'), CURRENT_DATE - 7, '09:00:00', 30, 'completed', 'Check-up', 'Follow-up visit'),
((SELECT id FROM patients WHERE mrn = 'MRN001002'), (SELECT id FROM practitioners WHERE email = 'michael.chen@hospital.com'), CURRENT_DATE - 14, '10:30:00', 45, 'completed', 'Consultation', 'Test results review'),
((SELECT id FROM patients WHERE mrn = 'MRN001003'), (SELECT id FROM practitioners WHERE email = 'robert.wilson@hospital.com'), CURRENT_DATE - 21, '14:00:00', 60, 'completed', 'Procedure', 'Minor surgery');

-- Verify the data was inserted
SELECT 'Patients created:', COUNT(*) FROM patients;
SELECT 'Practitioners created:', COUNT(*) FROM practitioners;
SELECT 'Appointments created:', COUNT(*) FROM appointments;