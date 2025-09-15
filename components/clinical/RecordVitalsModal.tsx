'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Heart, Thermometer, Activity, Weight, X, User, Calendar } from 'lucide-react';
import { vitalSignsService, patientService, SupabasePatient, SupabaseVitalSign } from '../../lib/services/supabase';

interface RecordVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVitalsRecorded: () => void;
  selectedPatient?: SupabasePatient;
}

interface VitalForm {
  patient_id: string;
  appointment_id?: string;
  vital_type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'respiratory_rate' | 'oxygen_saturation' | 'weight' | 'height' | 'bmi' | 'pain_level' | 'glucose' | 'other';
  value: string;
  unit: string;
  systolic?: string;
  diastolic?: string;
  notes: string;
}

const vitalTypes = [
  { value: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg', icon: Heart, color: 'text-red-500' },
  { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm', icon: Heart, color: 'text-red-500' },
  { value: 'temperature', label: 'Temperature', unit: '°F', icon: Thermometer, color: 'text-orange-500' },
  { value: 'respiratory_rate', label: 'Respiratory Rate', unit: 'breaths/min', icon: Activity, color: 'text-blue-500' },
  { value: 'oxygen_saturation', label: 'Oxygen Saturation', unit: '%', icon: Activity, color: 'text-blue-500' },
  { value: 'weight', label: 'Weight', unit: 'lbs', icon: Weight, color: 'text-green-500' },
  { value: 'height', label: 'Height', unit: 'inches', icon: Weight, color: 'text-green-500' },
  { value: 'pain_level', label: 'Pain Level', unit: '/10', icon: Activity, color: 'text-yellow-500' },
  { value: 'glucose', label: 'Blood Glucose', unit: 'mg/dL', icon: Activity, color: 'text-purple-500' },
];

export default function RecordVitalsModal({ 
  isOpen, 
  onClose, 
  onVitalsRecorded,
  selectedPatient 
}: RecordVitalsModalProps) {
  const [patients, setPatients] = useState<SupabasePatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vitals, setVitals] = useState<VitalForm[]>([
    {
      patient_id: selectedPatient?.id || '',
      vital_type: 'blood_pressure',
      value: '',
      unit: 'mmHg',
      systolic: '',
      diastolic: '',
      notes: ''
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      loadPatients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPatient) {
      setVitals(prev => prev.map(vital => ({ ...vital, patient_id: selectedPatient.id })));
    }
  }, [selectedPatient]);

  const loadPatients = async () => {
    const result = await patientService.getPatients();
    if (result.success && result.data) {
      setPatients(result.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Record each vital sign
      const promises = vitals.map(async (vital) => {
        if (!vital.value && (!vital.systolic || !vital.diastolic)) return null;

        const vitalData: Partial<SupabaseVitalSign> = {
          patient_id: vital.patient_id,
          vital_type: vital.vital_type,
          value: parseFloat(vital.value) || 0,
          unit: vital.unit,
          notes: vital.notes,
          recorded_by: 'current-user-id', // TODO: Get from auth context
        };

        if (vital.vital_type === 'blood_pressure') {
          vitalData.systolic = vital.systolic ? parseInt(vital.systolic) : undefined;
          vitalData.diastolic = vital.diastolic ? parseInt(vital.diastolic) : undefined;
          vitalData.value = vitalData.systolic || 0;
        }

        return vitalSignsService.createVitalSign(vitalData);
      });

      const results = await Promise.all(promises);
      const failedResults = results.filter(r => r && !r.success);

      if (failedResults.length > 0) {
        setError('Some vital signs failed to record');
      } else {
        alert('Vital signs recorded successfully!');
        onVitalsRecorded();
        onClose();
        resetForm();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setVitals([{
      patient_id: selectedPatient?.id || '',
      vital_type: 'blood_pressure',
      value: '',
      unit: 'mmHg',
      systolic: '',
      diastolic: '',
      notes: ''
    }]);
    setError('');
  };

  const addVital = () => {
    setVitals(prev => [...prev, {
      patient_id: vitals[0]?.patient_id || '',
      vital_type: 'heart_rate',
      value: '',
      unit: 'bpm',
      notes: ''
    }]);
  };

  const removeVital = (index: number) => {
    if (vitals.length > 1) {
      setVitals(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateVital = (index: number, field: keyof VitalForm, value: string) => {
    setVitals(prev => prev.map((vital, i) => {
      if (i === index) {
        const updated = { ...vital, [field]: value };
        
        // Update unit when vital type changes
        if (field === 'vital_type') {
          const vitalType = vitalTypes.find(vt => vt.value === value);
          if (vitalType) {
            updated.unit = vitalType.unit;
          }
        }
        
        return updated;
      }
      return vital;
    }));
  };

  const selectedPatientData = patients.find(p => p.id === vitals[0]?.patient_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Record Vital Signs</h2>
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
                    value={vitals[0]?.patient_id || ''} 
                    onChange={(e) => {
                      const patientId = e.target.value;
                      setVitals(prev => prev.map(vital => ({ ...vital, patient_id: patientId })));
                    }}
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

            {/* Vital Signs */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <label className="text-sm font-medium">Vital Signs</label>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addVital}
                    className="text-sm"
                  >
                    Add Another Vital
                  </Button>
                </div>

                <div className="space-y-4">
                  {vitals.map((vital, index) => {
                    const vitalTypeConfig = vitalTypes.find(vt => vt.value === vital.vital_type);
                    const VitalIcon = vitalTypeConfig?.icon || Activity;

                    return (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <VitalIcon className={`h-4 w-4 ${vitalTypeConfig?.color || 'text-gray-500'}`} />
                            <span className="font-medium">Vital Sign {index + 1}</span>
                          </div>
                          {vitals.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeVital(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Vital Type *
                            </label>
                            <select
                              value={vital.vital_type}
                              onChange={(e) => updateVital(index, 'vital_type', e.target.value)}
                              required
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              {vitalTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {vital.vital_type === 'blood_pressure' ? (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Systolic *
                                </label>
                                <Input
                                  type="number"
                                  value={vital.systolic}
                                  onChange={(e) => updateVital(index, 'systolic', e.target.value)}
                                  placeholder="120"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Diastolic *
                                </label>
                                <Input
                                  type="number"
                                  value={vital.diastolic}
                                  onChange={(e) => updateVital(index, 'diastolic', e.target.value)}
                                  placeholder="80"
                                  required
                                />
                              </div>
                            </>
                          ) : (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Value * ({vital.unit})
                              </label>
                              <Input
                                type="number"
                                step="0.1"
                                value={vital.value}
                                onChange={(e) => updateVital(index, 'value', e.target.value)}
                                placeholder="Enter value"
                                required
                              />
                            </div>
                          )}

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <textarea
                              value={vital.notes}
                              onChange={(e) => updateVital(index, 'notes', e.target.value)}
                              placeholder="Additional notes or observations"
                              rows={2}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

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
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Recording...' : 'Record Vitals'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}