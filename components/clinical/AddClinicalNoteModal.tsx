'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { FileText, X, User, Calendar } from 'lucide-react';
import { UIPatient, UIClinicalNote } from '../../lib/services/fhir';

interface AddClinicalNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteAdded: () => void;
  selectedPatient?: UIPatient;
}

interface NoteForm {
  patient_id: string;
  appointment_id?: string;
  note_type: 'progress_note' | 'consultation' | 'discharge_summary' | 'admission_note' | 'procedure_note' | 'other';
  subject: string;
  content: string;
  is_confidential: boolean;
}

export default function AddClinicalNoteModal({ isOpen, onClose, onNoteAdded, selectedPatient }: AddClinicalNoteModalProps) {
  const [patients, setPatients] = useState<UIPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<NoteForm>({
    patient_id: selectedPatient?.id || '',
    appointment_id: '',
    note_type: 'progress_note',
    subject: '',
    content: '',
    is_confidential: false
  });

  useEffect(() => {
    if (isOpen) {
      loadPatients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({ ...prev, patient_id: selectedPatient.id }));
    }
  }, [selectedPatient]);

  const loadPatients = async () => {
    try {
      // For demo purposes, return mock patient data
      const mockPatients: UIPatient[] = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1980-01-01',
          gender: 'male',
          phone: '555-0123',
          email: 'john.doe@email.com',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          mrn: 'MRN001'
        }
      ];
      setPatients(mockPatients);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const getCurrentUser = async () => {
    try {
      // For demo purposes, return a mock user ID
      return '01d64e80-323b-482b-9120-16391b53c52a';
    } catch (error) {
      console.error('Error getting current user:', error);
      return '01d64e80-323b-482b-9120-16391b53c52a';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userId = await getCurrentUser();
      
      const noteData: Partial<UIClinicalNote> = {
        patient_id: formData.patient_id,
        authored_by: userId,
        authored_date: new Date().toISOString(),
        note_type: formData.note_type === 'progress_note' ? 'progress_note' : 
                   formData.note_type === 'consultation' ? 'assessment' :
                   formData.note_type === 'discharge_summary' ? 'plan' :
                   formData.note_type === 'admission_note' ? 'history' : 'physical_exam',
        title: formData.subject,
        content: formData.content,
        is_confidential: formData.is_confidential
      };

      console.log('Creating clinical note with data:', noteData);
      
      // For demo purposes, simulate successful note creation
      const result = { success: true, data: { ...noteData, id: 'note_' + Date.now() } };

      if (result.success) {
        alert('Clinical note added successfully!');
        onNoteAdded();
        onClose();
        resetForm();
      } else {
        console.error('Clinical note creation failed');
        setError('Failed to add clinical note');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: selectedPatient?.id || '',
      appointment_id: '',
      note_type: 'progress_note',
      subject: '',
      content: '',
      is_confidential: false
    });
    setError('');
  };

  const handleInputChange = (field: keyof NoteForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedPatientData = patients.find(p => p.id === formData.patient_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add Clinical Note</h2>
                <p className="text-sm text-gray-600">Create a new clinical note for the patient</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Patient Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Patient *</label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => handleInputChange('patient_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!!selectedPatient}
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name} (MRN: {patient.mrn})
                    </option>
                  ))}
                </select>
                {selectedPatientData && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{selectedPatientData.first_name} {selectedPatientData.last_name}</span>
                  </div>
                )}
              </div>

              {/* Note Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Note Type *</label>
                <select
                  value={formData.note_type}
                  onChange={(e) => handleInputChange('note_type', e.target.value as NoteForm['note_type'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="progress_note">Progress Note</option>
                  <option value="consultation">Consultation</option>
                  <option value="discharge_summary">Discharge Summary</option>
                  <option value="admission_note">Admission Note</option>
                  <option value="procedure_note">Procedure Note</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Subject *</label>
                <Input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Enter note subject (e.g., Annual Physical, Follow-up Visit)"
                  className="w-full"
                  required
                />
              </div>

              {/* Content */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Enter detailed clinical notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-vertical"
                  required
                />
              </div>

              {/* Confidential */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_confidential}
                    onChange={(e) => handleInputChange('is_confidential', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Mark as confidential</span>
                </label>
                <p className="text-xs text-gray-500">
                  Confidential notes have additional access restrictions
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.patient_id || !formData.subject || !formData.content}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}