-- Additional tables for EHR functionality (Schema Only)

-- Create enum types for vitals and medications
CREATE TYPE vital_type AS ENUM ('blood_pressure', 'heart_rate', 'temperature', 'respiratory_rate', 'oxygen_saturation', 'weight', 'height', 'bmi', 'pain_level', 'glucose', 'other');
CREATE TYPE medication_frequency AS ENUM ('once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'every_4_hours', 'every_6_hours', 'every_8_hours', 'every_12_hours', 'as_needed', 'weekly', 'monthly', 'other');
CREATE TYPE medication_status AS ENUM ('active', 'discontinued', 'completed', 'on_hold');
CREATE TYPE prescription_status AS ENUM ('pending', 'sent', 'filled', 'cancelled');
CREATE TYPE note_type AS ENUM ('progress_note', 'consultation', 'discharge_summary', 'admission_note', 'procedure_note', 'other');

-- Create vital_signs table
CREATE TABLE IF NOT EXISTS vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    recorded_by UUID NOT NULL REFERENCES auth.users(id),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    vital_type vital_type NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    systolic INTEGER, -- For blood pressure
    diastolic INTEGER, -- For blood pressure
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create clinical_notes table
CREATE TABLE IF NOT EXISTS clinical_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    note_type note_type NOT NULL DEFAULT 'progress_note',
    subject VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_confidential BOOLEAN DEFAULT FALSE,
    signed_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    brand_name VARCHAR(200),
    drug_class VARCHAR(200),
    strength VARCHAR(100),
    form VARCHAR(100), -- tablet, capsule, liquid, injection, etc.
    route VARCHAR(100), -- oral, topical, iv, im, etc.
    manufacturer VARCHAR(200),
    ndc_number VARCHAR(20), -- National Drug Code
    active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE RESTRICT,
    prescriber_id UUID NOT NULL REFERENCES auth.users(id),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    dosage VARCHAR(200) NOT NULL, -- e.g., "10mg", "1 tablet"
    frequency medication_frequency NOT NULL,
    frequency_detail VARCHAR(200), -- for custom frequencies
    route VARCHAR(100) NOT NULL DEFAULT 'oral',
    quantity INTEGER NOT NULL,
    quantity_unit VARCHAR(50) DEFAULT 'tablets',
    refills INTEGER DEFAULT 0,
    days_supply INTEGER,
    instructions TEXT,
    indication VARCHAR(500), -- reason for prescription
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    status prescription_status DEFAULT 'pending',
    pharmacy_name VARCHAR(200),
    pharmacy_phone VARCHAR(20),
    sent_to_pharmacy_at TIMESTAMPTZ,
    filled_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vital_signs_patient ON vital_signs (patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_appointment ON vital_signs (appointment_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_type ON vital_signs (vital_type);
CREATE INDEX IF NOT EXISTS idx_vital_signs_recorded_at ON vital_signs (recorded_at);

CREATE INDEX IF NOT EXISTS idx_clinical_notes_patient ON clinical_notes (patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_appointment ON clinical_notes (appointment_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_author ON clinical_notes (author_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_type ON clinical_notes (note_type);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_created_at ON clinical_notes (created_at);

CREATE INDEX IF NOT EXISTS idx_medications_name ON medications (name);
CREATE INDEX IF NOT EXISTS idx_medications_generic_name ON medications (generic_name);
CREATE INDEX IF NOT EXISTS idx_medications_active ON medications (active);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions (patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_medication ON prescriptions (medication_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_prescriber ON prescriptions (prescriber_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment ON prescriptions (appointment_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions (status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_start_date ON prescriptions (start_date);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_vital_signs_updated_at BEFORE UPDATE ON vital_signs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinical_notes_updated_at BEFORE UPDATE ON clinical_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Allow authenticated users to view vital_signs" ON vital_signs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert vital_signs" ON vital_signs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update vital_signs" ON vital_signs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete vital_signs" ON vital_signs FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view clinical_notes" ON clinical_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert clinical_notes" ON clinical_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update clinical_notes" ON clinical_notes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete clinical_notes" ON clinical_notes FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view medications" ON medications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert medications" ON medications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update medications" ON medications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete medications" ON medications FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view prescriptions" ON prescriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert prescriptions" ON prescriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update prescriptions" ON prescriptions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete prescriptions" ON prescriptions FOR DELETE TO authenticated USING (true);

-- Insert sample medications (these don't require user IDs)
INSERT INTO medications (name, generic_name, brand_name, drug_class, strength, form, route, manufacturer, ndc_number) VALUES
('Lisinopril 10mg Tablets', 'Lisinopril', 'Prinivil', 'ACE Inhibitor', '10mg', 'Tablet', 'Oral', 'Generic Pharma', '12345-001-01'),
('Metformin 500mg Tablets', 'Metformin HCl', 'Glucophage', 'Biguanide', '500mg', 'Tablet', 'Oral', 'Generic Pharma', '12345-002-01'),
('Atorvastatin 20mg Tablets', 'Atorvastatin', 'Lipitor', 'Statin', '20mg', 'Tablet', 'Oral', 'Generic Pharma', '12345-003-01'),
('Amoxicillin 500mg Capsules', 'Amoxicillin', 'Amoxil', 'Antibiotic', '500mg', 'Capsule', 'Oral', 'Generic Pharma', '12345-004-01'),
('Ibuprofen 200mg Tablets', 'Ibuprofen', 'Advil', 'NSAID', '200mg', 'Tablet', 'Oral', 'Generic Pharma', '12345-005-01'),
('Omeprazole 20mg Capsules', 'Omeprazole', 'Prilosec', 'Proton Pump Inhibitor', '20mg', 'Capsule', 'Oral', 'Generic Pharma', '12345-006-01'),
('Albuterol 90mcg Inhaler', 'Albuterol Sulfate', 'ProAir', 'Bronchodilator', '90mcg/puff', 'Inhaler', 'Inhalation', 'Teva', '12345-007-01'),
('Hydrochlorothiazide 25mg Tablets', 'Hydrochlorothiazide', 'Microzide', 'Thiazide Diuretic', '25mg', 'Tablet', 'Oral', 'Generic Pharma', '12345-008-01'),
('Simvastatin 40mg Tablets', 'Simvastatin', 'Zocor', 'Statin', '40mg', 'Tablet', 'Oral', 'Generic Pharma', '12345-009-01'),
('Levothyroxine 100mcg Tablets', 'Levothyroxine Sodium', 'Synthroid', 'Thyroid Hormone', '100mcg', 'Tablet', 'Oral', 'AbbVie', '12345-010-01');

-- Display success message
SELECT 'EHR schema created successfully! Medications table populated.' as message;
SELECT 'Note: Sample data for vital_signs, clinical_notes, and prescriptions will be added after user authentication is set up.' as note;