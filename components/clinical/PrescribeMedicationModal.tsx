'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Pill, X, User } from 'lucide-react';
import { clinicalService } from '../../lib/services/fhir';

interface PrescribeMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMedicationAdded: () => void;
  patient: { id: string; first_name: string; last_name: string };
}

interface MedicationForm {
  patient_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  route: string;
  instructions: string;
  start_date: string;
  prescribed_by: string;
  status: 'active' | 'inactive' | 'stopped';
}

const frequencyOptions = [
  { value: 'once_daily', label: 'Once Daily' },
  { value: 'twice_daily', label: 'Twice Daily' },
  { value: 'three_times_daily', label: 'Three Times Daily' },
  { value: 'four_times_daily', label: 'Four Times Daily' },
  { value: 'as_needed', label: 'As Needed' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

const routeOptions = [
  'Oral',
  'Topical',
  'Injection',
  'Intravenous',
  'Inhalation',
  'Sublingual',
  'Rectal',
  'Other'
];

export default function PrescribeMedicationModal({ 
  isOpen, 
  onClose, 
  onMedicationAdded,
  patient 
}: PrescribeMedicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<MedicationForm>({
    patient_id: patient?.id || '',
    medication_name: '',
    dosage: '',
    frequency: 'once_daily',
    route: 'Oral',
    instructions: '',
    start_date: new Date().toISOString().split('T')[0],
    prescribed_by: 'Dr. Default Practitioner',
    status: 'active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await clinicalService.createMedication({
        ...formData,
        frequency: frequencyOptions.find(f => f.value === formData.frequency)?.label || formData.frequency
      });

      if (result.success) {
        alert('Medication prescribed successfully!');
        onMedicationAdded();
        onClose();
        resetForm();
      } else {
        setError(result.error || 'Failed to prescribe medication');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: patient?.id || '',
      medication_name: '',
      dosage: '',
      frequency: 'once_daily',
      route: 'Oral',
      instructions: '',
      start_date: new Date().toISOString().split('T')[0],
      prescribed_by: 'Dr. Default Practitioner',
      status: 'active'
    });
    setError('');
  };

  const handleInputChange = (field: keyof MedicationForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Pill className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Prescribe Medication</h3>
                <p className="text-sm text-gray-600">
                  Patient: {patient.first_name} {patient.last_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="medication_name" className="block text-sm font-medium text-gray-700 mb-1">
                Medication Name *
              </label>
              <Input
                id="medication_name"
                type="text"
                required
                value={formData.medication_name}
                onChange={(e) => handleInputChange('medication_name', e.target.value)}
                placeholder="Enter medication name"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">
                Dosage *
              </label>
              <Input
                id="dosage"
                type="text"
                required
                value={formData.dosage}
                onChange={(e) => handleInputChange('dosage', e.target.value)}
                placeholder="e.g., 10mg, 1 tablet"
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency *
                </label>
                <select 
                  id="frequency"
                  value={formData.frequency} 
                  onChange={(e) => handleInputChange('frequency', e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {frequencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="route" className="block text-sm font-medium text-gray-700 mb-1">
                  Route *
                </label>
                <select 
                  id="route"
                  value={formData.route} 
                  onChange={(e) => handleInputChange('route', e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {routeOptions.map((route) => (
                    <option key={route} value={route}>
                      {route}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <Input
                id="start_date"
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                placeholder="Special instructions for the patient..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Prescribing...
                  </>
                ) : (
                  <>
                    <Pill className="h-4 w-4 mr-2" />
                    Prescribe Medication
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}