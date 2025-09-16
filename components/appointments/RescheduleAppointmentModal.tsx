'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, Clock, RotateCcw } from 'lucide-react';
import { appointmentService } from '../../lib/services/fhir';

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onAppointmentRescheduled: () => void;
}

export default function RescheduleAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onAppointmentRescheduled
}: RescheduleAppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    new_date: '',
    new_time: '',
    reason: ''
  });

  // Available time slots for simplicity
  const availableSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];

  useEffect(() => {
    if (isOpen && appointment) {
      setFormData({
        new_date: '',
        new_time: '',
        reason: ''
      });
    }
  }, [isOpen, appointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await appointmentService.updateAppointment(appointment.id, {
        appointment_date: formData.new_date,
        appointment_time: formData.new_time,
        notes: formData.reason ? `Rescheduled: ${formData.reason}` : 'Rescheduled'
      });

      if (result.success) {
        alert('Appointment rescheduled successfully');
        onAppointmentRescheduled();
      } else {
        alert(`Error rescheduling appointment: ${result.error}`);
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      alert('Failed to reschedule appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <RotateCcw className="h-5 w-5 mr-2" />
            Reschedule Appointment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Current Appointment Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Current Appointment</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Patient:</strong> {appointment.patients?.first_name} {appointment.patients?.last_name}</p>
            <p><strong>Provider:</strong> Dr. {appointment.practitioners?.first_name} {appointment.practitioners?.last_name}</p>
            <p><strong>Current Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}</p>
            <p><strong>Current Time:</strong> {new Date(`2000-01-01T${appointment.appointment_time}`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              New Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.new_date}
              onChange={(e) => setFormData({ ...formData, new_date: e.target.value, new_time: '' })}
            />
          </div>

          {/* Available Time Slots */}
          {formData.new_date && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Available Time Slots
              </label>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, new_time: slot })}
                      className={`p-2 text-sm rounded-md border transition-colors ${
                        formData.new_time === slot
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {new Date(`2000-01-01T${slot}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No available time slots for this date</p>
                  <p className="text-xs text-gray-400">Please select a different date</p>
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Rescheduling (Optional)
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please provide a reason for rescheduling this appointment"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.new_date || !formData.new_time}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rescheduling...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reschedule Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}