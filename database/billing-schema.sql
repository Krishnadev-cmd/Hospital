-- Billing tables for EHR system

-- Create enum types for billing (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'card', 'check', 'insurance', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE insurance_status AS ENUM ('pending', 'approved', 'denied', 'partial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    balance_due DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status invoice_status DEFAULT 'draft',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    service_code VARCHAR(20), -- CPT codes
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_by UUID REFERENCES auth.users(id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method NOT NULL,
    reference_number VARCHAR(100), -- check number, transaction ID, etc.
    notes TEXT,
    processed_by UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create insurance_claims table
CREATE TABLE IF NOT EXISTS insurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    claim_number VARCHAR(100) UNIQUE NOT NULL,
    insurance_provider VARCHAR(200) NOT NULL,
    policy_number VARCHAR(100),
    group_number VARCHAR(100),
    submitted_date DATE,
    processed_date DATE,
    status insurance_status DEFAULT 'pending',
    approved_amount DECIMAL(10,2),
    denied_amount DECIMAL(10,2),
    reason_code VARCHAR(20),
    reason_description TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices (patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_appointment ON invoices (appointment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices (issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices (due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices (invoice_number);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items (invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments (invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments (payment_date);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_invoice ON insurance_claims (invoice_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_patient ON insurance_claims (patient_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims (status);

-- Create triggers for updated_at timestamps (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_invoices_updated_at') THEN
        CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payments_updated_at') THEN
        CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_insurance_claims_updated_at') THEN
        CREATE TRIGGER update_insurance_claims_updated_at BEFORE UPDATE ON insurance_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Allow authenticated users to view invoices" ON invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert invoices" ON invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update invoices" ON invoices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete invoices" ON invoices FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view invoice_items" ON invoice_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert invoice_items" ON invoice_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update invoice_items" ON invoice_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete invoice_items" ON invoice_items FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view payments" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert payments" ON payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update payments" ON payments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete payments" ON payments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view insurance_claims" ON insurance_claims FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert insurance_claims" ON insurance_claims FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update insurance_claims" ON insurance_claims FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete insurance_claims" ON insurance_claims FOR DELETE TO authenticated USING (true);

-- Insert sample service codes and common billing items
-- This creates a reference table for common medical services
CREATE TABLE IF NOT EXISTS service_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    code VARCHAR(20) NOT NULL UNIQUE, -- CPT code
    description TEXT NOT NULL,
    category VARCHAR(100),
    default_price DECIMAL(10,2),
    active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id)
);

-- Insert common CPT codes (only if they don't exist)
INSERT INTO service_codes (code, description, category, default_price) 
SELECT * FROM (VALUES
    ('99213', 'Office/outpatient visit, established patient, 20-29 minutes', 'Evaluation & Management', 150.00),
    ('99214', 'Office/outpatient visit, established patient, 30-39 minutes', 'Evaluation & Management', 200.00),
    ('99215', 'Office/outpatient visit, established patient, 40-54 minutes', 'Evaluation & Management', 250.00),
    ('99201', 'Office/outpatient visit, new patient, 10 minutes', 'Evaluation & Management', 100.00),
    ('99202', 'Office/outpatient visit, new patient, 20 minutes', 'Evaluation & Management', 150.00),
    ('99203', 'Office/outpatient visit, new patient, 30 minutes', 'Evaluation & Management', 200.00),
    ('80053', 'Comprehensive metabolic panel', 'Laboratory', 75.00),
    ('85025', 'Complete blood count', 'Laboratory', 45.00),
    ('71020', 'Chest X-ray', 'Radiology', 120.00),
    ('93000', 'Electrocardiogram', 'Cardiology', 85.00),
    ('36415', 'Routine venipuncture', 'Laboratory', 25.00),
    ('90471', 'Immunization administration', 'Immunization', 35.00)
) AS vals(code, description, category, default_price)
WHERE NOT EXISTS (SELECT 1 FROM service_codes WHERE service_codes.code = vals.code);

-- Sample billing data (using existing patient and user IDs)
DO $$
DECLARE
    sample_user_id UUID;
    patient1_id UUID;
    patient2_id UUID;
    invoice1_id UUID;
    invoice2_id UUID;
BEGIN
    -- Get existing user and patient IDs
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    SELECT id INTO patient1_id FROM patients WHERE mrn = 'MRN001001' LIMIT 1;
    SELECT id INTO patient2_id FROM patients WHERE mrn = 'MRN001002' LIMIT 1;
    
    IF patient1_id IS NOT NULL AND patient2_id IS NOT NULL THEN
        -- Insert sample invoices
        INSERT INTO invoices (patient_id, invoice_number, issue_date, due_date, subtotal, tax_amount, total_amount, paid_amount, status, created_by)
        VALUES 
        (patient1_id, 'INV-2024-001', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', 275.00, 22.00, 297.00, 297.00, 'paid', sample_user_id),
        (patient2_id, 'INV-2024-002', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '27 days', 195.00, 15.60, 210.60, 0.00, 'sent', sample_user_id);
        
        -- Get the invoice IDs for adding items
        SELECT id INTO invoice1_id FROM invoices WHERE invoice_number = 'INV-2024-001';
        SELECT id INTO invoice2_id FROM invoices WHERE invoice_number = 'INV-2024-002';
        
        -- Insert invoice items
        INSERT INTO invoice_items (invoice_id, service_code, description, quantity, unit_price, created_by)
        VALUES 
        (invoice1_id, '99213', 'Office visit - established patient', 1, 150.00, sample_user_id),
        (invoice1_id, '85025', 'Complete blood count', 1, 45.00, sample_user_id),
        (invoice1_id, '36415', 'Blood draw', 1, 25.00, sample_user_id),
        (invoice1_id, '80053', 'Comprehensive metabolic panel', 1, 75.00, sample_user_id),
        (invoice2_id, '99214', 'Office visit - established patient', 1, 200.00, sample_user_id);
        
        -- Insert sample payments
        INSERT INTO payments (invoice_id, payment_date, amount, payment_method, reference_number, created_by)
        VALUES 
        (invoice1_id, CURRENT_DATE - INTERVAL '2 days', 297.00, 'insurance', 'BC-CLAIM-2024-001', sample_user_id);
        
        -- Insert sample insurance claims
        INSERT INTO insurance_claims (invoice_id, patient_id, claim_number, insurance_provider, policy_number, submitted_date, status, approved_amount, created_by)
        VALUES 
        (invoice1_id, patient1_id, 'CLAIM-2024-001', 'Blue Cross Blue Shield', 'BC123456789', CURRENT_DATE - INTERVAL '4 days', 'approved', 297.00, sample_user_id),
        (invoice2_id, patient2_id, 'CLAIM-2024-002', 'Aetna Healthcare', 'AET987654321', CURRENT_DATE - INTERVAL '2 days', 'pending', NULL, sample_user_id);
        
    END IF;
END $$;

-- Verify the data was inserted
SELECT 'Invoices created:', COUNT(*) FROM invoices;
SELECT 'Invoice items created:', COUNT(*) FROM invoice_items;
SELECT 'Payments created:', COUNT(*) FROM payments;
SELECT 'Insurance claims created:', COUNT(*) FROM insurance_claims;
SELECT 'Service codes created:', COUNT(*) FROM service_codes;