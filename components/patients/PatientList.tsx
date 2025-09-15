'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Phone, Mail, MapPin, Calendar, User, Loader2, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { patientService, SupabasePatient } from '../../lib/services/supabase';
import PatientForm from './PatientForm';

interface PatientListProps {
  onPatientSelect?: (patient: SupabasePatient) => void;
  onNewPatient?: () => void;
}

export default function PatientList({ onPatientSelect, onNewPatient }: PatientListProps) {
  const [patients, setPatients] = useState<SupabasePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<SupabasePatient | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<SupabasePatient | null>(null);

  const loadPatients = async (searchText?: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await patientService.getPatients({
        search: searchText || undefined,
        limit: 50,
        orderBy: 'last_name'
      });

      if (result.success) {
        setPatients(result.data || []);
      } else {
        setError(result.error || 'Failed to load patients');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      loadPatients(searchTerm.trim());
    } else {
      loadPatients();
    }
  };

  const formatPatientName = (patient: SupabasePatient): string => {
    const firstName = patient.first_name || '';
    const middleName = patient.middle_name ? ` ${patient.middle_name}` : '';
    const lastName = patient.last_name || '';
    
    return `${firstName}${middleName} ${lastName}`.trim() || 'Unknown Name';
  };

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatAddress = (patient: SupabasePatient): string => {
    const parts = [
      patient.street_address,
      patient.city,
      patient.state,
      patient.postal_code
    ].filter(Boolean);
    
    return parts.join(', ') || 'No address provided';
  };

  const handlePatientClick = (patient: SupabasePatient) => {
    setSelectedPatient(patient);
    onPatientSelect?.(patient);
  };

  const handleDeletePatient = async (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this patient?')) {
      const result = await patientService.deletePatient(patientId);
      if (result.success) {
        loadPatients(searchTerm || undefined);
        if (selectedPatient?.id === patientId) {
          setSelectedPatient(null);
        }
      } else {
        alert(result.error || 'Failed to delete patient');
      }
    }
  };

  const handleEditPatient = (patient: SupabasePatient, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPatient(patient);
    setShowPatientForm(true);
  };

  const handleNewPatient = () => {
    setEditingPatient(null);
    setShowPatientForm(true);
    onNewPatient?.();
  };

  const handlePatientFormClose = () => {
    setShowPatientForm(false);
    setEditingPatient(null);
  };

  const handlePatientCreated = (patient: SupabasePatient) => {
    loadPatients(searchTerm || undefined);
    setSelectedPatient(patient);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading patients...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-sm text-gray-600">
            Manage patient records and information ({patients.length} patients)
          </p>
        </div>
        <Button onClick={handleNewPatient} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search patients by name, email, phone, or MRN..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button type="button" variant="outline" onClick={() => {
              setSearchTerm('');
              loadPatients();
            }}>
              Clear
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Patients ({patients.length})</span>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first patient'}
              </p>
              <Button onClick={handleNewPatient}>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Patient</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Demographics</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Insurance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">MRN</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr
                      key={patient.id}
                      className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => handlePatientClick(patient)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {formatPatientName(patient)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatAddress(patient)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {patient.phone && (
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              {patient.phone}
                            </div>
                          )}
                          {patient.email && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              {patient.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            Age {calculateAge(patient.date_of_birth)}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {patient.gender}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {patient.insurance_provider || 'Not specified'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {patient.mrn}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-900"
                            onClick={(e) => handleEditPatient(patient, e)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-900"
                            onClick={(e) => handleDeletePatient(patient.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Patient Details */}
      {selectedPatient && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Emergency Contact</h4>
                <p className="text-sm text-gray-600">
                  {selectedPatient.emergency_contact_name} ({selectedPatient.emergency_contact_relationship})
                </p>
                <p className="text-sm text-gray-600">{selectedPatient.emergency_contact_phone}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Insurance Details</h4>
                <p className="text-sm text-gray-600">
                  Provider: {selectedPatient.insurance_provider || 'Not specified'}
                </p>
                <p className="text-sm text-gray-600">
                  Policy: {selectedPatient.insurance_policy_number || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  Group: {selectedPatient.insurance_group_number || 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Record Information</h4>
                <p className="text-sm text-gray-600">
                  Created: {new Date(selectedPatient.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Updated: {new Date(selectedPatient.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Form Modal */}
      {showPatientForm && (
        <PatientForm
          onClose={handlePatientFormClose}
          onPatientCreated={handlePatientCreated}
          initialData={editingPatient || undefined}
          mode={editingPatient ? 'edit' : 'create'}
        />
      )}
    </div>
  );
}