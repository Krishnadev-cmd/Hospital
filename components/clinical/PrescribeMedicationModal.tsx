'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Pill, X, User, Calendar } from 'lucide-react';
import { prescriptionsService, medicationsService, patientService, SupabasePatient, SupabasePrescription, SupabaseMedication } from '../../lib/services/supabase';
import { createClient } from '@supabase/supabase-js';

interface PrescribeMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrescriptionCreated: () => void;
  selectedPatient?: SupabasePatient;
}

interface PrescriptionForm {
  patient_id: string;
  medication_id: string;
  dosage: string;
  frequency: 'once_daily' | 'twice_daily' | 'three_times_daily' | 'four_times_daily' | 'every_4_hours' | 'every_6_hours' | 'every_8_hours' | 'every_12_hours' | 'as_needed' | 'weekly' | 'monthly' | 'other';
  frequency_detail?: string;
  route: string;
  quantity: number;
  quantity_unit: string;
  refills: number;
  days_supply?: number;
  instructions: string;
  start_date: string;
}

const commonFrequencies = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'three_times_daily', label: 'Three times daily' },
  { value: 'four_times_daily', label: 'Four times daily' },
  { value: 'every_6_hours', label: 'Every 6 hours' },
  { value: 'every_8_hours', label: 'Every 8 hours' },
  { value: 'every_12_hours', label: 'Every 12 hours' },
  { value: 'as_needed', label: 'As needed' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'other', label: 'Other' },
];

const commonRoutes = [
  'Oral',
  'Topical', 
  'Injection',
  'Intravenous',
  'Intramuscular',
  'Subcutaneous',
  'Inhalation',
  'Nasal',
  'Rectal',
  'Ophthalmic',
  'Otic',
];

const quantityUnits = [
  'tablets',
  'capsules',
  'ml',
  'grams',
  'doses',
  'units',
  'drops',
  'patches',
];

export default function PrescribeMedicationModal({ 
  isOpen, 
  onClose, 
  onPrescriptionCreated,
  selectedPatient 
}: PrescribeMedicationModalProps) {
  const [patients, setPatients] = useState<SupabasePatient[]>([]);
  const [medications, setMedications] = useState<SupabaseMedication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [formData, setFormData] = useState<PrescriptionForm>({
    patient_id: selectedPatient?.id || '',
    medication_id: '',
    dosage: '',
    frequency: 'once_daily',
    frequency_detail: '',
    route: 'Oral',
    quantity: 30,
    quantity_unit: 'tablets',
    refills: 0,
    days_supply: 30,
    instructions: '',
    start_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen) {
      loadPatients();
      loadMedications();
      getCurrentUser();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({ ...prev, patient_id: selectedPatient.id }));
    }
  }, [selectedPatient]);

  const getCurrentUser = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    } else {
      // Fallback to a default prescriber ID - replace with actual practitioner ID
      setCurrentUserId('01d64e80-323b-482b-9120-16391b53c52a');
    }
  };

  const loadPatients = async () => {
    const result = await patientService.getPatients();
    if (result.success && result.data) {
      setPatients(result.data);
    }
  };

  const loadMedications = async () => {
    const result = await medicationsService.getMedications();
    if (result.success && result.data) {
      setMedications(result.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const prescriptionData: Partial<SupabasePrescription> = {
        ...formData,
        prescriber_id: currentUserId || '01d64e80-323b-482b-9120-16391b53c52a', // Use current user or fallback
        status: 'pending' as const,
      };

      const result = await prescriptionsService.createPrescription(prescriptionData);

      if (result.success) {
        alert('Prescription created successfully!');
        onPrescriptionCreated();
        onClose();
        resetForm();
      } else {
        setError(result.error || 'Failed to create prescription');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: selectedPatient?.id || '',
      medication_id: '',
      dosage: '',
      frequency: 'once_daily',
      frequency_detail: '',
      route: 'Oral',
      quantity: 30,
      quantity_unit: 'tablets',
      refills: 0,
      days_supply: 30,
      instructions: '',
      start_date: new Date().toISOString().split('T')[0]
    });
    setError('');
  };

  const handleInputChange = (field: keyof PrescriptionForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedPatientData = patients.find(p => p.id === formData.patient_id);
  const selectedMedication = medications.find(m => m.id === formData.medication_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Prescribe Medication</h2>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4" />
                  <label className="text-sm font-medium">Patient Information</label>
                </div>
                
                <div>
                  <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Patient *
                  </label>
                  <select 
                    id="patient_id"
                    value={formData.patient_id} 
                    onChange={(e) => handleInputChange('patient_id', e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Choose a patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name} - MRN: {patient.mrn}
                      </option>
                    ))}
                  </select>

                  {selectedPatientData && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">
                        <strong>Patient:</strong> {selectedPatientData.first_name} {selectedPatientData.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        DOB: {new Date(selectedPatientData.date_of_birth).toLocaleDateString()} | 
                        Phone: {selectedPatientData.phone || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Medication Selection */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Pill className="h-4 w-4" />
                  <label className="text-sm font-medium">Medication Selection</label>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="medication_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Medication *
                    </label>
                    <select
                      id="medication_id"
                      value={formData.medication_id}
                      onChange={(e) => handleInputChange('medication_id', e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Choose a medication</option>
                      {medications.map((medication) => (
                        <option key={medication.id} value={medication.id}>
                          {medication.name} {medication.generic_name && `(${medication.generic_name})`} - {medication.strength}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedMedication && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm">
                        <strong>Selected:</strong> {selectedMedication.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Generic: {selectedMedication.generic_name || 'N/A'} | 
                        Strength: {selectedMedication.strength}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Prescription Details */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4" />
                  <label className="text-sm font-medium">Prescription Details</label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">
                      Dosage *
                    </label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => handleInputChange('dosage', e.target.value)}
                      placeholder="e.g., 500mg, 1 tablet"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="route" className="block text-sm font-medium text-gray-700 mb-1">
                      Route *
                    </label>
                    <select
                      id="route"
                      value={formData.route}
                      onChange={(e) => handleInputChange('route', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {commonRoutes.map((route) => (
                        <option key={route} value={route}>
                          {route}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <select
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) => handleInputChange('frequency', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {commonFrequencies.map((freq) => (
                        <option key={freq.value} value={freq.value}>
                          {freq.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="quantity_unit" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Unit *
                    </label>
                    <select
                      id="quantity_unit"
                      value={formData.quantity_unit}
                      onChange={(e) => handleInputChange('quantity_unit', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {quantityUnits.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="days_supply" className="block text-sm font-medium text-gray-700 mb-1">
                      Days Supply
                    </label>
                    <Input
                      id="days_supply"
                      type="number"
                      min="1"
                      max="365"
                      value={formData.days_supply || ''}
                      onChange={(e) => handleInputChange('days_supply', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label htmlFor="refills" className="block text-sm font-medium text-gray-700 mb-1">
                      Refills *
                    </label>
                    <Input
                      id="refills"
                      type="number"
                      min="0"
                      max="12"
                      value={formData.refills}
                      onChange={(e) => handleInputChange('refills', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions
                    </label>
                    <textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => handleInputChange('instructions', e.target.value)}
                      placeholder="Take with food, avoid alcohol, etc."
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prescription Summary */}
            {formData.medication_id && formData.dosage && (
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Prescription Summary</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      <strong>Medication:</strong> {selectedMedication?.name} - {formData.dosage}
                    </p>
                    <p>
                      <strong>Frequency:</strong> {commonFrequencies.find(f => f.value === formData.frequency)?.label}
                    </p>
                    <p>
                      <strong>Route:</strong> {formData.route}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {formData.quantity} {formData.quantity_unit}
                    </p>
                    <p>
                      <strong>Days Supply:</strong> {formData.days_supply || 'N/A'} days
                    </p>
                    <p>
                      <strong>Refills:</strong> {formData.refills}
                    </p>
                    <p>
                      <strong>Start Date:</strong> {new Date(formData.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.medication_id || !formData.dosage}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Creating Prescription...' : 'Create Prescription'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}