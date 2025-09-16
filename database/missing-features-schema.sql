-- Additional tables for enhanced EHR functionality
-- Run this after the main schema is created

-- Patient Medical History
CREATE TABLE IF NOT EXISTS patient_medical_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  condition_name VARCHAR(200) NOT NULL,
  diagnosis_date DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, resolved, chronic
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Patient Allergies
CREATE TABLE IF NOT EXISTS patient_allergies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  allergen VARCHAR(200) NOT NULL,
  reaction TEXT,
  severity VARCHAR(20) DEFAULT 'mild', -- mild, moderate, severe
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Patient Immunizations
CREATE TABLE IF NOT EXISTS patient_immunizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  vaccine_name VARCHAR(200) NOT NULL,
  vaccination_date DATE NOT NULL,
  lot_number VARCHAR(50),
  expiration_date DATE,
  administered_by VARCHAR(200),
  site VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Lab Results
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  test_name VARCHAR(200) NOT NULL,
  test_category VARCHAR(100),
  result_value VARCHAR(200),
  reference_range VARCHAR(100),
  unit VARCHAR(50),
  status VARCHAR(50) DEFAULT 'completed', -- pending, completed, cancelled
  abnormal_flag BOOLEAN DEFAULT FALSE,
  collected_date DATE,
  reported_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Diagnoses
CREATE TABLE IF NOT EXISTS patient_diagnoses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  diagnosis_code VARCHAR(20), -- ICD-10 codes
  diagnosis_name VARCHAR(300) NOT NULL,
  type VARCHAR(50) DEFAULT 'primary', -- primary, secondary
  status VARCHAR(50) DEFAULT 'active', -- active, resolved, chronic
  onset_date DATE,
  resolved_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Provider Schedule (for availability checking)
CREATE TABLE IF NOT EXISTS provider_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment History
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id),
  payment_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50), -- cash, card, check, insurance
  reference_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Insurance Information (enhanced)
CREATE TABLE IF NOT EXISTS patient_insurance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  insurance_provider VARCHAR(200) NOT NULL,
  policy_number VARCHAR(100),
  group_number VARCHAR(100),
  subscriber_name VARCHAR(200),
  relationship VARCHAR(50) DEFAULT 'self',
  effective_date DATE,
  expiration_date DATE,
  copay_amount DECIMAL(6,2),
  deductible_amount DECIMAL(8,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_medical_history_patient ON patient_medical_history(patient_id);
CREATE INDEX idx_allergies_patient ON patient_allergies(patient_id);
CREATE INDEX idx_immunizations_patient ON patient_immunizations(patient_id);
CREATE INDEX idx_lab_results_patient ON lab_results(patient_id);
CREATE INDEX idx_diagnoses_patient ON patient_diagnoses(patient_id);
CREATE INDEX idx_provider_schedules_practitioner ON provider_schedules(practitioner_id);
CREATE INDEX idx_payment_history_patient ON payment_history(patient_id);
CREATE INDEX idx_insurance_patient ON patient_insurance(patient_id);

-- Update triggers for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patient_insurance_updated_at 
  BEFORE UPDATE ON patient_insurance 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();