'use client';

import React, { useState, useEffect } from 'react';
import { 
  Pill,
  PlusCircle, 
  User,
  AlertCircle,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import PrescribeMedicationModal from './PrescribeMedicationModal';
import { prescriptionsService, SupabasePrescription } from '../../lib/services/supabase';

interface ClinicalOperationsProps {
  onPatientSelect?: (patientId: string) => void;
}

export default function ClinicalOperations({ onPatientSelect }: ClinicalOperationsProps) {
  const [prescriptions, setPrescriptions] = useState<SupabasePrescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrescribeMedicationModal, setShowPrescribeMedicationModal] = useState(false);

  // Load initial data
  useEffect(() => {
    loadClinicalData();
  }, []);

  const loadClinicalData = async () => {
    setLoading(true);
    try {
      // Load only prescription data
      const prescriptionsResult = await prescriptionsService.getAllPrescriptions();

      if (prescriptionsResult.success && prescriptionsResult.data) {
        setPrescriptions(prescriptionsResult.data);
      } else {
        console.warn('Failed to load prescriptions:', prescriptionsResult.error);
        setPrescriptions([]); // Set empty array instead of keeping old data
      }
    } catch (error) {
      console.error('Error loading clinical data:', error);
      // Set empty arrays on error to avoid showing stale data
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionCreated = () => {
    loadClinicalData(); // Refresh prescription data
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading clinical data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Medications</h2>
          <p className="text-sm text-gray-600">Manage patient medications and prescriptions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowPrescribeMedicationModal(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Prescribe Medication
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by patient name or medication..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {prescriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-20 w-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Pill className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescriptions Found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              Start by prescribing medications for your patients. All prescriptions will appear here.
            </p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowPrescribeMedicationModal(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Prescribe First Medication
            </Button>
          </div>
        ) : (
          prescriptions.map((prescription) => (
            <Card key={prescription.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Pill className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Patient ID: {prescription.patient_id}</h3>
                      <p className="text-sm text-gray-600">Prescriber ID: {prescription.prescriber_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      prescription.status === 'filled' 
                        ? 'bg-green-100 text-green-800' 
                        : prescription.status === 'cancelled' 
                          ? 'bg-red-100 text-red-800'
                          : prescription.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                    }`}>
                      {prescription.status}
                    </span>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Medication ID</label>
                      <p className="text-sm font-medium text-gray-900">{prescription.medication_id}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Dosage</label>
                      <p className="text-sm text-gray-900">{prescription.dosage}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Frequency</label>
                      <p className="text-sm text-gray-900">{prescription.frequency}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Days Supply</label>
                      <p className="text-sm text-gray-900">{prescription.days_supply || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Prescribed</label>
                      <p className="text-sm text-gray-900">{formatDateTime(prescription.created_at)}</p>
                    </div>
                  </div>
                </div>

                {prescription.instructions && (
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Instructions:</strong> {prescription.instructions}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Prescribe Medication Modal */}
      <PrescribeMedicationModal
        isOpen={showPrescribeMedicationModal}
        onClose={() => setShowPrescribeMedicationModal(false)}
        onPrescriptionCreated={handlePrescriptionCreated}
      />
    </div>
  );
}