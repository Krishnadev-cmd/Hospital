-- Additional tables for EHR functionality

-- Create enum types for vitals and medications (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE vital_type AS ENUM ('blood_pressure', 'heart_rate', 'temperature', 'respiratory_rate', 'oxygen_saturation', 'weight', 'height', 'bmi', 'pain_level', 'glucose', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE medication_frequency AS ENUM ('once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'every_4_hours', 'every_6_hours', 'every_8_hours', 'every_12_hours', 'as_needed', 'weekly', 'monthly', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE medication_status AS ENUM ('active', 'discontinued', 'completed', 'on_hold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prescription_status AS ENUM ('pending', 'sent', 'filled', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE note_type AS ENUM ('progress_note', 'consultation', 'discharge_summary', 'admission_note', 'procedure_note', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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

-- Create triggers for updated_at timestamps (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_vital_signs_updated_at') THEN
        CREATE TRIGGER update_vital_signs_updated_at BEFORE UPDATE ON vital_signs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clinical_notes_updated_at') THEN
        CREATE TRIGGER update_clinical_notes_updated_at BEFORE UPDATE ON clinical_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_medications_updated_at') THEN
        CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_prescriptions_updated_at') THEN
        CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

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

-- Insert sample medications (only if they don't already exist)
INSERT INTO medications (name, generic_name, brand_name, drug_class, strength, form, route, manufacturer, ndc_number) 
SELECT 'Lisinopril 10mg Tablets', 'Lisinopril', 'Prinivil', 'ACE Inhibitor', '10mg', 'Tablet', 'Oral', 'Generic Pharma', '12345-001-01'
WHERE NOT EXISTS (SELECT 1 FROM medications WHERE name = 'Lisinopril 10mg Tablets')
UNION ALL
SELECT 'Metformin 500mg Tablets', 'Metformin HCl', 'Glucophage', 'Biguanide', '500mg', 'Tablet', 'Oral', 'Generic Pharma', '12345-002-01'
WHERE NOT EXISTS (SELECT 1 FROM medications WHERE name = 'Metformin 500mg Tablets')
UNION ALL
SELECT 'Atorvastatin 20mg Tablets', 'Atorvastatin', 'Lipitor', 'Statin', '20mg', 'Tablet', 'Oral', 'Generic Pharma', '12345-003-01'
WHERE NOT EXISTS (SELECT 1 FROM medications WHERE name = 'Atorvastatin 20mg Tablets')
UNION ALL
SELECT 'Amoxicillin 500mg Capsules', 'Amoxicillin', 'Amoxil', 'Antibiotic', '500mg', 'Capsule', 'Oral', 'Generic Pharma', '12345-004-01'
WHERE NOT EXISTS (SELECT 1 FROM medications WHERE name = 'Amoxicillin 500mg Capsules')
UNION ALL
SELECT 'Ibuprofen 200mg Tablets', 'Ibuprofen', 'Advil', 'NSAID', '200mg', 'Tablet', 'Oral', 'Generic Pharma', '12345-005-01'
WHERE NOT EXISTS (SELECT 1 FROM medications WHERE name = 'Ibuprofen 200mg Tablets')
UNION ALL
SELECT 'Omeprazole 20mg Capsules', 'Omeprazole', 'Prilosec', 'Proton Pump Inhibitor', '20mg', 'Capsule', 'Oral', 'Generic Pharma', '12345-006-01'
WHERE NOT EXISTS (SELECT 1 FROM medications WHERE name = 'Omeprazole 20mg Capsules')
UNION ALL
SELECT 'Albuterol 90mcg Inhaler', 'Albuterol Sulfate', 'ProAir', 'Bronchodilator', '90mcg/puff', 'Inhaler', 'Inhalation', 'Teva', '12345-007-01'
WHERE NOT EXISTS (SELECT 1 FROM medications WHERE name = 'Albuterol 90mcg Inhaler')
UNION ALL
SELECT 'Hydrochlorothiazide 25mg Tablets', 'Hydrochlorothiazide', 'Microzide', 'Thiazide Diuretic', '25mg', 'Tablet', 'Oral', 'Generic Pharma', '12345-008-01'
WHERE NOT EXISTS (SELECT 1 FROM medications WHERE name = 'Hydrochlorothiazide 25mg Tablets')
UNION ALL
SELECT 'Simvastatin 40mg Tablets', 'Simvastatin', 'Zocor', 'Statin', '40mg', 'Tablet', 'Oral', 'Generic Pharma', '12345-009-01'
WHERE NOT EXISTS (SELECT 1 FROM medications WHERE name = 'Simvastatin 40mg Tablets')
UNION ALL
SELECT 'Levothyroxine 100mcg Tablets', 'Levothyroxine Sodium', 'Synthroid', 'Thyroid Hormone', '100mcg', 'Tablet', 'Oral', 'AbbVie', '12345-010-01'
WHERE NOT EXISTS (SELECT 1 FROM medications WHERE name = 'Levothyroxine 100mcg Tablets');

-- Insert sample vital signs (using auth user IDs - replace with actual user IDs from your system)
-- Note: You'll need to replace these UUIDs with actual user IDs from auth.users table
DO $$
DECLARE
    sample_user_id UUID;
    patient1_id UUID;
    patient2_id UUID;
    patient3_id UUID;
BEGIN
    -- Try to get a user ID from auth.users, or use a placeholder
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    IF sample_user_id IS NULL THEN
        -- If no users exist, create sample data with a placeholder that you'll need to update
        RAISE NOTICE 'No users found in auth.users table. You will need to update recorded_by fields with actual user IDs after authentication setup.';
        -- Skip vital signs insertion for now
    ELSE
        -- Get unique patient IDs to avoid "more than one row" error
        SELECT id INTO patient1_id FROM patients WHERE mrn = 'MRN001001' LIMIT 1;
        SELECT id INTO patient2_id FROM patients WHERE mrn = 'MRN001002' LIMIT 1;
        SELECT id INTO patient3_id FROM patients WHERE mrn = 'MRN001003' LIMIT 1;
        
        -- Only insert if we found the required patients
        IF patient1_id IS NOT NULL AND patient2_id IS NOT NULL THEN
            INSERT INTO vital_signs (patient_id, vital_type, value, unit, systolic, diastolic, recorded_by, notes) VALUES
            (patient1_id, 'blood_pressure', 120, 'mmHg', 120, 80, '01d64e80-323b-482b-9120-16391b53c52a', 'Normal blood pressure'),
            (patient1_id, 'heart_rate', 72, 'bpm', NULL, NULL, '01d64e80-323b-482b-9120-16391b53c52a', 'Regular rhythm'),
            (patient1_id, 'temperature', 98.6, '°F', NULL, NULL, '01d64e80-323b-482b-9120-16391b53c52a', 'Normal temperature'),
            (patient1_id, 'weight', 180, 'lbs', NULL, NULL, '01d64e80-323b-482b-9120-16391b53c52a', NULL),
            (patient2_id, 'blood_pressure', 140, 'mmHg', 140, 90, '01d64e80-323b-482b-9120-16391b53c52a', 'Elevated blood pressure'),
            (patient2_id, 'heart_rate', 88, 'bpm', NULL, NULL, '01d64e80-323b-482b-9120-16391b53c52a', 'Slightly elevated');
            
            -- Add patient3 vital if exists
            IF patient3_id IS NOT NULL THEN
                INSERT INTO vital_signs (patient_id, vital_type, value, unit, systolic, diastolic, recorded_by, notes) VALUES
                (patient3_id, 'oxygen_saturation', 98, '%', NULL, NULL, '01d64e80-323b-482b-9120-16391b53c52a', 'Good oxygen saturation');
            END IF;
        ELSE
            RAISE NOTICE 'Could not find required patients. Please check that base schema with sample patients has been run first.';
        END IF;
    END IF;
END $$;

-- Insert sample clinical notes (using auth user IDs)
DO $$
DECLARE
    sample_user_id UUID;
    patient1_id UUID;
    patient2_id UUID;
    patient3_id UUID;
BEGIN
    -- Try to get a user ID from auth.users, or use a placeholder
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    IF sample_user_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users table. You will need to update author_id fields with actual user IDs after authentication setup.';
    ELSE
        -- Get unique patient IDs to avoid "more than one row" error
        SELECT id INTO patient1_id FROM patients WHERE mrn = 'MRN001001' LIMIT 1;
        SELECT id INTO patient2_id FROM patients WHERE mrn = 'MRN001002' LIMIT 1;
        SELECT id INTO patient3_id FROM patients WHERE mrn = 'MRN001003' LIMIT 1;
        
        -- Only insert if we found the required patients
        IF patient1_id IS NOT NULL AND patient2_id IS NOT NULL THEN
            INSERT INTO clinical_notes (patient_id, author_id, note_type, subject, content) VALUES
            (patient1_id, sample_user_id, 'progress_note', 'Annual Physical Examination', 'Patient presents for routine annual physical. Overall health appears good. Vital signs within normal limits. Patient reports no current concerns. Advised to continue current exercise routine and maintain healthy diet. Follow-up in 12 months.'),
            (patient2_id, sample_user_id, 'consultation', 'Chest Pain Evaluation', 'Patient presents with complaint of chest pain occurring over the past week. Pain is described as pressure-like, occurring with exertion. EKG performed - shows normal sinus rhythm. Recommended stress test and echocardiogram. Patient advised to avoid strenuous activity until further evaluation.');
            
            -- Add patient3 note if exists
            IF patient3_id IS NOT NULL THEN
                INSERT INTO clinical_notes (patient_id, author_id, note_type, subject, content) VALUES
                (patient3_id, sample_user_id, 'procedure_note', 'Post-Surgical Follow-up', 'Patient seen for post-operative follow-up after knee arthroscopy. Incision sites healing well, no signs of infection. Patient reports decreased pain and improved mobility. Physical therapy recommended. Next follow-up in 2 weeks.');
            END IF;
        ELSE
            RAISE NOTICE 'Could not find required patients. Please check that base schema with sample patients has been run first.';
        END IF;
    END IF;
END $$;

-- Insert sample prescriptions (using auth user IDs)
DO $$
DECLARE
    sample_user_id UUID;
    patient1_id UUID;
    patient2_id UUID;
    lisinopril_id UUID;
    atorvastatin_id UUID;
    ibuprofen_id UUID;
BEGIN
    -- Try to get a user ID from auth.users, or use a placeholder
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    IF sample_user_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users table. You will need to update prescriber_id fields with actual user IDs after authentication setup.';
    ELSE
        -- Get unique patient and medication IDs to avoid "more than one row" error
        SELECT id INTO patient1_id FROM patients WHERE mrn = 'MRN001001' LIMIT 1;
        SELECT id INTO patient2_id FROM patients WHERE mrn = 'MRN001002' LIMIT 1;
        SELECT id INTO lisinopril_id FROM medications WHERE name = 'Lisinopril 10mg Tablets' LIMIT 1;
        SELECT id INTO atorvastatin_id FROM medications WHERE name = 'Atorvastatin 20mg Tablets' LIMIT 1;
        SELECT id INTO ibuprofen_id FROM medications WHERE name = 'Ibuprofen 200mg Tablets' LIMIT 1;
        
        -- Only insert if we found the required records
        IF patient1_id IS NOT NULL AND patient2_id IS NOT NULL AND lisinopril_id IS NOT NULL AND atorvastatin_id IS NOT NULL AND ibuprofen_id IS NOT NULL THEN
            INSERT INTO prescriptions (patient_id, medication_id, prescriber_id, dosage, frequency, route, quantity, quantity_unit, refills, days_supply, instructions, indication) VALUES
            (patient2_id, lisinopril_id, '01d64e80-323b-482b-9120-16391b53c52a', '10mg', 'once_daily', 'oral', 30, 'tablets', 5, 30, 'Take one tablet by mouth once daily', 'Hypertension'),
            (patient2_id, atorvastatin_id, '01d64e80-323b-482b-9120-16391b53c52a', '20mg', 'once_daily', 'oral', 30, 'tablets', 5, 30, 'Take one tablet by mouth once daily at bedtime', 'High cholesterol'),
            (patient1_id, ibuprofen_id, '01d64e80-323b-482b-9120-16391b53c52a', '400mg', 'as_needed', 'oral', 20, 'tablets', 0, 10, 'Take 2 tablets by mouth every 6 hours as needed for pain', 'Pain management');
        ELSE
            RAISE NOTICE 'Could not find required patients or medications. Please check that base schema with sample patients has been run first.';
        END IF;
    END IF;
END $$;

-- Verify the data was inserted
SELECT 'Vital Signs created:', COUNT(*) FROM vital_signs;
SELECT 'Clinical Notes created:', COUNT(*) FROM clinical_notes;
SELECT 'Medications created:', COUNT(*) FROM medications;
SELECT 'Prescriptions created:', COUNT(*) FROM prescriptions;