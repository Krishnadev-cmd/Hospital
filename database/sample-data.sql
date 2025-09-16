-- Sample data for EHR tables
-- Run this AFTER you have authenticated users in your system
-- Replace 'your-user-id-here' with actual user IDs from auth.users

-- Insert sample vital signs
-- First, get a user ID: SELECT id FROM auth.users LIMIT 1;
-- Then replace the placeholder below

INSERT INTO vital_signs (patient_id, vital_type, value, unit, systolic, diastolic, recorded_by, notes) VALUES
((SELECT id FROM patients WHERE mrn = 'MRN001001'), 'blood_pressure', 120, 'mmHg', 120, 80, '01d64e80-323b-482b-9120-16391b53c52a', 'Normal blood pressure'),
((SELECT id FROM patients WHERE mrn = 'MRN001001'), 'heart_rate', 72, 'bpm', NULL, NULL, '01d64e80-323b-482b-9120-16391b53c52a', 'Regular rhythm'),
((SELECT id FROM patients WHERE mrn = 'MRN001001'), 'temperature', 98.6, '°F', NULL, NULL, '01d64e80-323b-482b-9120-16391b53c52a', 'Normal temperature'),
((SELECT id FROM patients WHERE mrn = 'MRN001001'), 'weight', 180, 'lbs', NULL, NULL, '01d64e80-323b-482b-9120-16391b53c52a', NULL),
((SELECT id FROM patients WHERE mrn = 'MRN001002'), 'blood_pressure', 140, 'mmHg', 140, 90, '01d64e80-323b-482b-9120-16391b53c52a', 'Elevated blood pressure'),
((SELECT id FROM patients WHERE mrn = 'MRN001002'), 'heart_rate', 88, 'bpm', NULL, NULL, '01d64e80-323b-482b-9120-16391b53c52a', 'Slightly elevated'),
((SELECT id FROM patients WHERE mrn = 'MRN001003'), 'oxygen_saturation', 98, '%', NULL, NULL, '01d64e80-323b-482b-9120-16391b53c52a', 'Good oxygen saturation');

-- Insert sample clinical notes
INSERT INTO clinical_notes (patient_id, author_id, note_type, subject, content) VALUES
((SELECT id FROM patients WHERE mrn = 'MRN001001'), '01d64e80-323b-482b-9120-16391b53c52a', 'progress_note', 'Annual Physical Examination', 'Patient presents for routine annual physical. Overall health appears good. Vital signs within normal limits. Patient reports no current concerns. Advised to continue current exercise routine and maintain healthy diet. Follow-up in 12 months.'),
((SELECT id FROM patients WHERE mrn = 'MRN001002'), '01d64e80-323b-482b-9120-16391b53c52a', 'consultation', 'Chest Pain Evaluation', 'Patient presents with complaint of chest pain occurring over the past week. Pain is described as pressure-like, occurring with exertion. EKG performed - shows normal sinus rhythm. Recommended stress test and echocardiogram. Patient advised to avoid strenuous activity until further evaluation.'),
((SELECT id FROM patients WHERE mrn = 'MRN001003'), '01d64e80-323b-482b-9120-16391b53c52a', 'procedure_note', 'Post-Surgical Follow-up', 'Patient seen for post-operative follow-up after knee arthroscopy. Incision sites healing well, no signs of infection. Patient reports decreased pain and improved mobility. Physical therapy recommended. Next follow-up in 2 weeks.');

-- Insert sample prescriptions
INSERT INTO prescriptions (patient_id, medication_id, prescriber_id, dosage, frequency, route, quantity, quantity_unit, refills, days_supply, instructions, indication) VALUES
((SELECT id FROM patients WHERE mrn = 'MRN001002'), (SELECT id FROM medications WHERE name = 'Lisinopril 10mg Tablets'), '01d64e80-323b-482b-9120-16391b53c52a', '10mg', 'once_daily', 'oral', 30, 'tablets', 5, 30, 'Take one tablet by mouth once daily', 'Hypertension'),
((SELECT id FROM patients WHERE mrn = 'MRN001002'), (SELECT id FROM medications WHERE name = 'Atorvastatin 20mg Tablets'), '01d64e80-323b-482b-9120-16391b53c52a', '20mg', 'once_daily', 'oral', 30, 'tablets', 5, 30, 'Take one tablet by mouth once daily at bedtime', 'High cholesterol'),
((SELECT id FROM patients WHERE mrn = 'MRN001001'), (SELECT id FROM medications WHERE name = 'Ibuprofen 200mg Tablets'), '01d64e80-323b-482b-9120-16391b53c52a', '400mg', 'as_needed', 'oral', 20, 'tablets', 0, 10, 'Take 2 tablets by mouth every 6 hours as needed for pain', 'Pain management');

-- Verify the data was inserted
SELECT 'Vital Signs created:', COUNT(*) FROM vital_signs;
SELECT 'Clinical Notes created:', COUNT(*) FROM clinical_notes;
SELECT 'Prescriptions created:', COUNT(*) FROM prescriptions;