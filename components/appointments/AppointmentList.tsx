'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, MapPin, AlertCircle, Loader2, Plus, Search, Edit, RotateCcw, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { appointmentService, UIAppointment } from '../../lib/services/fhir';
import ScheduleAppointmentModal from './ScheduleAppointmentModal';
import EditAppointmentModal from '@/components/appointments/EditAppointmentModal';
import RescheduleAppointmentModal from '@/components/appointments/RescheduleAppointmentModal';

interface AppointmentListProps {
  onAppointmentSelect?: (appointment: UIAppointment) => void;
}

export default function AppointmentList({ onAppointmentSelect }: AppointmentListProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<any>(null);

  const loadAppointments = async (date?: string, searchText?: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await appointmentService.getAppointments({
        date: date || selectedDate,
        limit: 50
      });

      if (result.success) {
        let filteredAppointments = result.data || [];
        
        // Filter by search term if provided
        if (searchText) {
          filteredAppointments = filteredAppointments.filter((apt: any) => 
            apt.patients?.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            apt.patients?.last_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            apt.practitioners?.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            apt.practitioners?.last_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            apt.reason?.toLowerCase().includes(searchText.toLowerCase()) ||
            apt.appointment_type?.toLowerCase().includes(searchText.toLowerCase())
          );
        }
        
        setAppointments(filteredAppointments);
      } else {
        setError(result.error || 'Failed to load appointments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(selectedDate, searchTerm);
  }, [selectedDate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAppointments(selectedDate, searchTerm);
  };

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    onAppointmentSelect?.(appointment);
  };

  const handleAppointmentScheduled = () => {
    loadAppointments(selectedDate, searchTerm);
  };

  const handleEditAppointment = (appointment: any) => {
    setAppointmentToEdit(appointment);
    setShowEditModal(true);
  };

  const handleRescheduleAppointment = (appointment: any) => {
    setAppointmentToEdit(appointment);
    setShowRescheduleModal(true);
  };

  const handleCancelAppointment = async (appointment: any) => {
    const reason = prompt('Please provide a reason for cancellation (optional):');
    
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        setLoading(true);
        const result = await appointmentService.cancelAppointment(appointment.id, reason || undefined);
        
        if (result.success) {
          alert('Appointment cancelled successfully');
          loadAppointments(selectedDate, searchTerm);
        } else {
          alert(`Failed to cancel appointment: ${result.error}`);
        }
      } catch (error) {
        alert('Failed to cancel appointment');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAppointmentUpdated = () => {
    setShowEditModal(false);
    setShowRescheduleModal(false);
    setAppointmentToEdit(null);
    loadAppointments(selectedDate, searchTerm);
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      arrived: 'bg-purple-100 text-purple-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading appointments...</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-600">
            Manage appointment schedules and patient visits ({appointments.length} appointments)
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowScheduleModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full md:w-auto"
              />
            </div>
            
            <form onSubmit={handleSearch} className="flex-2 flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search appointments..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Appointments for {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search terms' : `No appointments scheduled for ${new Date(selectedDate).toLocaleDateString()}`}
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedAppointment?.id === appointment.id ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                  }`}
                  onClick={() => handleAppointmentClick(appointment)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          {formatTime(appointment.appointment_time)}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {appointment.patients?.first_name} {appointment.patients?.last_name}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">
                            with Dr. {appointment.practitioners?.first_name} {appointment.practitioners?.last_name}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p><strong>Type:</strong> {appointment.appointment_type || 'General'}</p>
                        {appointment.reason && (
                          <p><strong>Reason:</strong> {appointment.reason}</p>
                        )}
                        <p><strong>Duration:</strong> {appointment.duration_minutes} minutes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAppointment(appointment);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRescheduleAppointment(appointment);
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reschedule
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelAppointment(appointment);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Appointment Details */}
      {selectedAppointment && (
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {selectedAppointment.patients?.first_name} {selectedAppointment.patients?.last_name}</p>
                  <p><strong>Phone:</strong> {selectedAppointment.patients?.phone || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedAppointment.patients?.email || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Provider Information</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Doctor:</strong> Dr. {selectedAppointment.practitioners?.first_name} {selectedAppointment.practitioners?.last_name}</p>
                  <p><strong>Title:</strong> {selectedAppointment.practitioners?.title || 'N/A'}</p>
                  <p><strong>Specialty:</strong> {selectedAppointment.practitioners?.specialty || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {selectedAppointment.notes && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{selectedAppointment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schedule Appointment Modal */}
      <ScheduleAppointmentModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onAppointmentScheduled={handleAppointmentScheduled}
      />

      {/* Edit Appointment Modal */}
      {appointmentToEdit && (
        <EditAppointmentModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          appointment={appointmentToEdit}
          onAppointmentUpdated={handleAppointmentUpdated}
        />
      )}

      {/* Reschedule Appointment Modal */}
      {appointmentToEdit && (
        <RescheduleAppointmentModal
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          appointment={appointmentToEdit}
          onAppointmentRescheduled={handleAppointmentUpdated}
        />
      )}
    </div>
  );
}