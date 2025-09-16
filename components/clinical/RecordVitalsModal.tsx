'use client';

import React, { useState } from 'react';
import { Activity, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { clinicalService } from '../../lib/services/fhir';

interface RecordVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVitalsRecorded: () => void;
  patient: { id: string; first_name: string; last_name: string };
}

interface VitalForm {
  patient_id: string;
  recorded_by: string;
  recorded_date: string;
  temperature?: string;
  temperature_unit: string;
  blood_pressure_systolic?: string;
  blood_pressure_diastolic?: string;
  heart_rate?: string;
  respiratory_rate?: string;
  oxygen_saturation?: string;
  weight?: string;
  weight_unit: string;
  height?: string;
  height_unit: string;
  notes: string;
}

export default function RecordVitalsModal({ 
  isOpen, 
  onClose, 
  onVitalsRecorded,
  patient 
}: RecordVitalsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<VitalForm>({
    patient_id: patient?.id || '',
    recorded_by: 'Dr. Default Practitioner',
    recorded_date: new Date().toISOString(),
    temperature_unit: 'C',
    weight_unit: 'kg',
    height_unit: 'cm',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert strings to numbers for the API
      const vitalData = {
        ...formData,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : undefined,
        blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : undefined,
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : undefined,
        respiratory_rate: formData.respiratory_rate ? parseInt(formData.respiratory_rate) : undefined,
        oxygen_saturation: formData.oxygen_saturation ? parseInt(formData.oxygen_saturation) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined
      };

      const result = await clinicalService.recordVitalSigns(vitalData);

      if (result.success) {
        onVitalsRecorded();
        onClose();
        resetForm();
      } else {
        setError(result.error || 'Failed to record vital signs');
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
      recorded_by: 'Dr. Default Practitioner',
      recorded_date: new Date().toISOString(),
      temperature_unit: 'C',
      weight_unit: 'kg',
      height_unit: 'cm',
      notes: ''
    });
    setError('');
  };

  const handleInputChange = (field: keyof VitalForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Activity className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Record Vital Signs</h3>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature
                </label>
                <div className="flex">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.temperature || ''}
                    onChange={(e) => handleInputChange('temperature', e.target.value)}
                    placeholder="36.5"
                    className="flex-1"
                  />
                  <select
                    value={formData.temperature_unit}
                    onChange={(e) => handleInputChange('temperature_unit', e.target.value)}
                    className="ml-2 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="C">°C</option>
                    <option value="F">°F</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heart Rate (bpm)
                </label>
                <Input
                  type="number"
                  value={formData.heart_rate || ''}
                  onChange={(e) => handleInputChange('heart_rate', e.target.value)}
                  placeholder="72"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Systolic BP (mmHg)
                </label>
                <Input
                  type="number"
                  value={formData.blood_pressure_systolic || ''}
                  onChange={(e) => handleInputChange('blood_pressure_systolic', e.target.value)}
                  placeholder="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diastolic BP (mmHg)
                </label>
                <Input
                  type="number"
                  value={formData.blood_pressure_diastolic || ''}
                  onChange={(e) => handleInputChange('blood_pressure_diastolic', e.target.value)}
                  placeholder="80"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Respiratory Rate (/min)
                </label>
                <Input
                  type="number"
                  value={formData.respiratory_rate || ''}
                  onChange={(e) => handleInputChange('respiratory_rate', e.target.value)}
                  placeholder="16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oxygen Saturation (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.oxygen_saturation || ''}
                  onChange={(e) => handleInputChange('oxygen_saturation', e.target.value)}
                  placeholder="98"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight
                </label>
                <div className="flex">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight || ''}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="70"
                    className="flex-1"
                  />
                  <select
                    value={formData.weight_unit}
                    onChange={(e) => handleInputChange('weight_unit', e.target.value)}
                    className="ml-2 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <div className="flex">
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.height || ''}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="170"
                    className="flex-1"
                  />
                  <select
                    value={formData.height_unit}
                    onChange={(e) => handleInputChange('height_unit', e.target.value)}
                    className="ml-2 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                placeholder="Additional notes about the vital signs..."
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
                    Recording...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Record Vitals
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