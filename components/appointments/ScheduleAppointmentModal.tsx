'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Calendar, Clock, User, FileText, X } from 'lucide-react';
import { appointmentService, patientService, UIPatient } from '../../lib/services/fhir';

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentScheduled: () => void;
  selectedPatient?: UIPatient;
}

interface AppointmentForm {
  patient_id: string;
  practitioner_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  appointment_type: string;
  reason: string;
  notes: string;
}

const appointmentTypes = [
  'Check-up',
  'Consultation',
  'Follow-up',
  'Vaccination',
  'Sick visit',
  'Procedure',
  'Screening',
  'Other'
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

export default function ScheduleAppointmentModal({ 
  isOpen, 
  onClose, 
  onAppointmentScheduled,
  selectedPatient 
}: ScheduleAppointmentModalProps) {
  const [patients, setPatients] = useState<UIPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<AppointmentForm>({
    patient_id: selectedPatient?.id || '',
    practitioner_id: 'default-practitioner',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: 30,
    appointment_type: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadPatients();
      // Set today as default date
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, appointment_date: today }));
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({ ...prev, patient_id: selectedPatient.id }));
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
      const result = await appointmentService.createAppointment({
        ...formData,
        status: 'scheduled'
      });

      if (result.success) {
        alert('Appointment scheduled successfully!');
        onAppointmentScheduled();
        onClose();
        resetForm();
      } else {
        setError(result.error || 'Failed to schedule appointment');
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
      practitioner_id: 'default-practitioner',
      appointment_date: '',
      appointment_time: '',
      duration_minutes: 30,
      appointment_type: '',
      reason: '',
      notes: ''
    });
    setError('');
  };

  const handleInputChange = (field: keyof AppointmentForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedPatientData = patients.find(p => p.id === formData.patient_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Schedule New Appointment</h2>
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
                
                <div className="space-y-3">
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
                  </div>

                  {selectedPatientData && (
                    <div className="p-3 bg-blue-50 rounded-lg">
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

            {/* Appointment Details */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" />
                  <label className="text-sm font-medium">Appointment Details</label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="practitioner_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Practitioner *
                    </label>
                    <select 
                      id="practitioner_id"
                      value={formData.practitioner_id} 
                      onChange={(e) => handleInputChange('practitioner_id', e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="default-practitioner">Dr. Default Practitioner - General</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="appointment_type" className="block text-sm font-medium text-gray-700 mb-1">
                      Appointment Type *
                    </label>
                    <select 
                      id="appointment_type"
                      value={formData.appointment_type} 
                      onChange={(e) => handleInputChange('appointment_type', e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select type</option>
                      {appointmentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <Input
                      id="appointment_date"
                      type="date"
                      value={formData.appointment_date}
                      onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="appointment_time" className="block text-sm font-medium text-gray-700 mb-1">
                      Time *
                    </label>
                    <select 
                      id="appointment_time"
                      value={formData.appointment_time} 
                      onChange={(e) => handleInputChange('appointment_time', e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <select 
                      id="duration_minutes"
                      value={formData.duration_minutes.toString()} 
                      onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4" />
                  <label className="text-sm font-medium">Additional Information</label>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Visit
                    </label>
                    <Input
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      placeholder="e.g., Annual check-up, Follow-up visit"
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Additional notes or special instructions"
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
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
                {loading ? 'Scheduling...' : 'Schedule Appointment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}