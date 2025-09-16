'use client';

import React, { useState, useEffect } from 'react';
import { 
  Pill,
  PlusCircle, 
  User,
  AlertCircle,
  Loader2,
  Activity,
  FileText,
  Stethoscope,
  ClipboardList
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PrescribeMedicationModal from './PrescribeMedicationModal';
import RecordVitalsModal from './RecordVitalsModal';
import AddClinicalNoteModal from './AddClinicalNoteModal';
import { 
  clinicalService,
  UIMedication,
  UIVitalSign,
  UIClinicalNote,
  UICondition,
  SupabasePatient
} from '../../lib/services/fhir';

interface UILabResult {
  id: string;
  patient_id: string;
  test_name: string;
  test_code: string;
  value: string;
  unit: string;
  reference_range: string;
  status: 'normal' | 'abnormal' | 'critical' | 'pending';
  ordered_date: string;
  result_date?: string;
  ordered_by: string;
}

interface UIDiagnosticReport {
  id: string;
  patient_id: string;
  report_type: string;
  report_name: string;
  status: 'preliminary' | 'final' | 'amended' | 'corrected';
  category: 'radiology' | 'laboratory' | 'pathology' | 'other';
  effective_date: string;
  issued_date?: string;
  performer: string;
  conclusion?: string;
  findings?: string;
}

interface ClinicalOperationsProps {
  selectedPatient?: SupabasePatient | null;
}

export default function ClinicalOperations({ selectedPatient }: ClinicalOperationsProps) {
  const [medications, setMedications] = useState<UIMedication[]>([]);
  const [vitalSigns, setVitalSigns] = useState<UIVitalSign[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<UIClinicalNote[]>([]);
  const [conditions, setConditions] = useState<UICondition[]>([]);
  const [labResults, setLabResults] = useState<UILabResult[]>([]);
  const [diagnosticReports, setDiagnosticReports] = useState<UIDiagnosticReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrescribeMedicationModal, setShowPrescribeMedicationModal] = useState(false);
  const [showRecordVitalsModal, setShowRecordVitalsModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('medications');

  // Load clinical data when patient is selected
  useEffect(() => {
    if (selectedPatient) {
      loadClinicalData();
    }
  }, [selectedPatient]);

  const loadClinicalData = async () => {
    if (!selectedPatient) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load all clinical data for the patient
      const [medicationsResult, vitalSignsResult, clinicalNotesResult, conditionsResult] = await Promise.all([
        clinicalService.getMedications(selectedPatient.id),
        clinicalService.getVitalSigns(selectedPatient.id),
        clinicalService.getClinicalNotes(selectedPatient.id),
        clinicalService.getConditions(selectedPatient.id)
      ]);

      if (medicationsResult.success) {
        setMedications(medicationsResult.data || []);
      }
      
      if (vitalSignsResult.success) {
        setVitalSigns(vitalSignsResult.data || []);
      }
      
      if (clinicalNotesResult.success) {
        setClinicalNotes(clinicalNotesResult.data || []);
      }
      
      if (conditionsResult.success) {
        setConditions(conditionsResult.data || []);
      }

      // Load mock lab results and diagnostic reports for now
      loadMockLabResults();
      loadMockDiagnosticReports();

    } catch (error) {
      console.error('Error loading clinical data:', error);
      setError('Failed to load clinical data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMockLabResults = () => {
    const mockLabResults: UILabResult[] = [
      {
        id: 'lab-1',
        patient_id: selectedPatient?.id || '',
        test_name: 'Complete Blood Count',
        test_code: 'CBC',
        value: '7.2',
        unit: '10^3/uL',
        reference_range: '4.5-11.0',
        status: 'normal',
        ordered_date: '2025-09-15',
        result_date: '2025-09-15',
        ordered_by: 'Dr. Smith'
      },
      {
        id: 'lab-2',
        patient_id: selectedPatient?.id || '',
        test_name: 'Glucose',
        test_code: 'GLUC',
        value: '105',
        unit: 'mg/dL',
        reference_range: '70-100',
        status: 'abnormal',
        ordered_date: '2025-09-15',
        result_date: '2025-09-15',
        ordered_by: 'Dr. Smith'
      }
    ];
    setLabResults(mockLabResults);
  };

  const loadMockDiagnosticReports = () => {
    const mockReports: UIDiagnosticReport[] = [
      {
        id: 'report-1',
        patient_id: selectedPatient?.id || '',
        report_type: 'X-Ray',
        report_name: 'Chest X-Ray',
        status: 'final',
        category: 'radiology',
        effective_date: '2025-09-14',
        issued_date: '2025-09-14',
        performer: 'Dr. Johnson',
        conclusion: 'Normal chest x-ray with no acute cardiopulmonary abnormalities.',
        findings: 'Clear lung fields bilaterally. Normal cardiac silhouette. No pleural effusions.'
      }
    ];
    setDiagnosticReports(mockReports);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!selectedPatient) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Clinical Operations</h2>
        </div>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Patient Selected</h3>
                <p className="text-gray-600 mb-4">
                  To access clinical operations, please select a patient first.
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-semibold">1</div>
                    <span>Click on the <strong>"Patients"</strong> tab in the sidebar</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-semibold">2</div>
                    <span>Click on any patient from the list</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-semibold">3</div>
                    <span>Return to the <strong>"Clinical"</strong> tab to view their medical data</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope className="h-5 w-5 mr-2" />
              Available Clinical Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Pill className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Medication Management</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="text-sm">Vital Signs Recording</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <ClipboardList className="h-5 w-5 text-purple-600" />
                <span className="text-sm">Lab Results & Reports</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
                <span className="text-sm">Clinical Notes</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm">Conditions & Diagnoses</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-indigo-600" />
                <span className="text-sm">Diagnostic Imaging</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading clinical data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Clinical Operations - {selectedPatient.first_name} {selectedPatient.last_name}
          </CardTitle>
        </CardHeader>
      </Card>

      {error && (
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Button 
          onClick={() => setShowPrescribeMedicationModal(true)}
          className="flex items-center justify-center"
          variant="outline"
        >
          <Pill className="h-4 w-4 mr-2" />
          Prescribe Medication
        </Button>
        <Button 
          onClick={() => setShowRecordVitalsModal(true)}
          className="flex items-center justify-center"
          variant="outline"
        >
          <Activity className="h-4 w-4 mr-2" />
          Record Vitals
        </Button>
        <Button 
          onClick={() => setShowAddNoteModal(true)}
          className="flex items-center justify-center"
          variant="outline"
        >
          <FileText className="h-4 w-4 mr-2" />
          Add Note
        </Button>
        <Button 
          onClick={() => {/* TODO: Order lab test */}}
          className="flex items-center justify-center"
          variant="outline"
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          Order Lab
        </Button>
        <Button 
          onClick={() => {/* TODO: Add diagnosis */}}
          className="flex items-center justify-center"
          variant="outline"
        >
          <Stethoscope className="h-4 w-4 mr-2" />
          Add Diagnosis
        </Button>
      </div>

      {/* Clinical Data Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="labs">Lab Results</TabsTrigger>
          <TabsTrigger value="reports">Imaging</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
        </TabsList>

        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                Current Medications ({medications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medications.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No medications recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medications.map((medication) => (
                    <div key={medication.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{medication.medication_name}</h4>
                          <p className="text-sm text-gray-600">
                            {medication.dosage} - {medication.frequency}
                          </p>
                          <p className="text-sm text-gray-600">
                            Route: {medication.route}
                          </p>
                          <p className="text-sm text-gray-600">
                            Prescribed by: {medication.prescribed_by}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            medication.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : medication.status === 'inactive'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {medication.status}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            Start: {formatDate(medication.start_date)}
                          </p>
                          {medication.end_date && (
                            <p className="text-sm text-gray-500">
                              End: {formatDate(medication.end_date)}
                            </p>
                          )}
                        </div>
                      </div>
                      {medication.instructions && (
                        <p className="text-sm text-gray-600 mt-2">
                          Instructions: {medication.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Vital Signs History ({vitalSigns.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vitalSigns.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No vital signs recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vitalSigns.map((vital) => (
                    <div key={vital.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            Recorded: {formatDateTime(vital.recorded_date)}
                          </p>
                          <p className="text-sm text-gray-600">
                            By: {vital.recorded_by}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {vital.temperature && (
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">
                              {vital.temperature}°{vital.temperature_unit}
                            </p>
                            <p className="text-xs text-gray-600">Temperature</p>
                          </div>
                        )}
                        {vital.blood_pressure_systolic && vital.blood_pressure_diastolic && (
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">
                              {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}
                            </p>
                            <p className="text-xs text-gray-600">Blood Pressure</p>
                          </div>
                        )}
                        {vital.heart_rate && (
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">
                              {vital.heart_rate} bpm
                            </p>
                            <p className="text-xs text-gray-600">Heart Rate</p>
                          </div>
                        )}
                        {vital.oxygen_saturation && (
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">
                              {vital.oxygen_saturation}%
                            </p>
                            <p className="text-xs text-gray-600">O2 Saturation</p>
                          </div>
                        )}
                        {vital.weight && (
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">
                              {vital.weight} {vital.weight_unit}
                            </p>
                            <p className="text-xs text-gray-600">Weight</p>
                          </div>
                        )}
                        {vital.height && (
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">
                              {vital.height} {vital.height_unit}
                            </p>
                            <p className="text-xs text-gray-600">Height</p>
                          </div>
                        )}
                      </div>
                      {vital.notes && (
                        <p className="text-sm text-gray-600 mt-3">
                          Notes: {vital.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="h-5 w-5 mr-2" />
                Lab Results ({labResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {labResults.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No lab results available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {labResults.map((lab) => (
                    <div key={lab.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{lab.test_name} ({lab.test_code})</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lab.status === 'normal' ? 'bg-green-100 text-green-800' :
                          lab.status === 'abnormal' ? 'bg-yellow-100 text-yellow-800' :
                          lab.status === 'critical' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lab.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Result: </span>
                          <span className={lab.status === 'normal' ? 'text-green-600' : 'text-yellow-600'}>
                            {lab.value} {lab.unit}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Reference: </span>
                          <span className="text-gray-600">{lab.reference_range}</span>
                        </div>
                        <div>
                          <span className="font-medium">Ordered: </span>
                          <span className="text-gray-600">{formatDate(lab.ordered_date)}</span>
                        </div>
                        <div>
                          <span className="font-medium">Result Date: </span>
                          <span className="text-gray-600">{lab.result_date ? formatDate(lab.result_date) : 'Pending'}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Ordered by: </span>
                        <span className="text-gray-600">{lab.ordered_by}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Diagnostic Reports ({diagnosticReports.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {diagnosticReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No diagnostic reports available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {diagnosticReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{report.report_name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.category === 'radiology' ? 'bg-blue-100 text-blue-800' :
                            report.category === 'laboratory' ? 'bg-green-100 text-green-800' :
                            report.category === 'pathology' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === 'final' ? 'bg-green-100 text-green-800' :
                            report.status === 'preliminary' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="font-medium">Effective Date: </span>
                          <span className="text-gray-600">{formatDate(report.effective_date)}</span>
                        </div>
                        <div>
                          <span className="font-medium">Issued: </span>
                          <span className="text-gray-600">{report.issued_date ? formatDate(report.issued_date) : 'N/A'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Performer: </span>
                          <span className="text-gray-600">{report.performer}</span>
                        </div>
                      </div>
                      {report.conclusion && (
                        <div className="mb-2">
                          <span className="font-medium">Conclusion: </span>
                          <p className="text-gray-600 mt-1">{report.conclusion}</p>
                        </div>
                      )}
                      {report.findings && (
                        <div>
                          <span className="font-medium">Findings: </span>
                          <p className="text-gray-600 mt-1">{report.findings}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Clinical Notes ({clinicalNotes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clinicalNotes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No clinical notes recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clinicalNotes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{note.title}</h4>
                          <p className="text-sm text-gray-600">
                            Type: {note.note_type.replace('_', ' ').toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {formatDateTime(note.authored_date)}
                          </p>
                          <p className="text-sm text-gray-500">
                            By: {note.authored_by}
                          </p>
                        </div>
                      </div>
                      <div className="prose max-w-none">
                        <p className="text-sm text-gray-700">{note.content}</p>
                      </div>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {note.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="h-5 w-5 mr-2" />
                Conditions & Diagnoses ({conditions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conditions.length === 0 ? (
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No conditions recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conditions.map((condition) => (
                    <div key={condition.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{condition.condition_name}</h4>
                          {condition.condition_code && (
                            <p className="text-sm text-gray-600">
                              Code: {condition.condition_code}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            Recorded by: {condition.recorded_by}
                          </p>
                          <p className="text-sm text-gray-600">
                            Recorded: {formatDate(condition.recorded_date)}
                          </p>
                          {condition.onset_date && (
                            <p className="text-sm text-gray-600">
                              Onset: {formatDate(condition.onset_date)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            condition.clinical_status === 'active'
                              ? 'bg-red-100 text-red-800'
                              : condition.clinical_status === 'inactive'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {condition.clinical_status}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {condition.verification_status}
                          </p>
                        </div>
                      </div>
                      {condition.severity && (
                        <p className="text-sm text-gray-600 mt-2">
                          Severity: {condition.severity}
                        </p>
                      )}
                      {condition.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          Notes: {condition.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showPrescribeMedicationModal && (
        <PrescribeMedicationModal
          isOpen={showPrescribeMedicationModal}
          onClose={() => setShowPrescribeMedicationModal(false)}
          patient={selectedPatient}
          onMedicationAdded={loadClinicalData}
        />
      )}

      {showRecordVitalsModal && (
        <RecordVitalsModal
          isOpen={showRecordVitalsModal}
          onClose={() => setShowRecordVitalsModal(false)}
          patient={selectedPatient}
          onVitalsRecorded={loadClinicalData}
        />
      )}

      {showAddNoteModal && selectedPatient && (
        <AddClinicalNoteModal
          isOpen={showAddNoteModal}
          onClose={() => setShowAddNoteModal(false)}
          selectedPatient={{
            id: selectedPatient.id,
            first_name: selectedPatient.first_name,
            last_name: selectedPatient.last_name,
            created_at: selectedPatient.created_at || '',
            updated_at: selectedPatient.updated_at || '',
            date_of_birth: selectedPatient.date_of_birth || '',
            gender: selectedPatient.gender || 'unknown' as const,
            active: selectedPatient.active ?? true
          }}
          onNoteAdded={loadClinicalData}
        />
      )}
    </div>
  );
}