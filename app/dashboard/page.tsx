'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  FileText, 
  CreditCard,
  BarChart3,
  Stethoscope,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import PatientList from '../../components/patients/PatientList';
import AppointmentList from '../../components/appointments/AppointmentList';
import ClinicalOperations from '@/components/clinical/ClinicalOperations';
import BillingOperations from '../../components/billing/BillingOperations';
import Reports from '../../components/reports/Reports';
import { patientService, appointmentService, UIPatient } from '../../lib/services/fhir';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState<UIPatient | null>(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todaysAppointments: 0,
    weekAppointments: 0,
    pendingLabs: 0
  });
  const [loading, setLoading] = useState(true);

  // Load dashboard statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        
        const [patientStats, appointmentStats] = await Promise.all([
          patientService.getPatientStats(),
          appointmentService.getAppointmentStats()
        ]);

        if (patientStats.success && appointmentStats.success) {
          setStats({
            totalPatients: patientStats.data?.totalPatients || 0,
            todaysAppointments: appointmentStats.data?.today.total || 0,
            weekAppointments: appointmentStats.data?.week.total || 0,
            pendingLabs: 8 // TODO: Add lab service
          });
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const navigationItems = [
    { id: 'overview', name: 'Overview', icon: BarChart3, badge: null },
    { id: 'patients', name: 'Patients', icon: Users, badge: stats.totalPatients },
    { id: 'appointments', name: 'Appointments', icon: Calendar, badge: stats.todaysAppointments },
    { id: 'clinical', name: 'Clinical', icon: Stethoscope, badge: stats.pendingLabs },
    { id: 'billing', name: 'Billing', icon: CreditCard, badge: null },
    { id: 'reports', name: 'Reports', icon: FileText, badge: null },
    { id: 'configuration', name: 'Configuration', icon: Activity, badge: null },
  ];

  const statsCards = [
    {
      title: 'Total Patients',
      value: loading ? '...' : stats.totalPatients.toString(),
      change: { value: 12, type: 'increase' as const, period: 'this month' },
      icon: Users,
      color: 'blue' as const
    },
    {
      title: 'Today\'s Appointments',
      value: loading ? '...' : stats.todaysAppointments.toString(),
      change: { value: 3, type: 'increase' as const, period: 'from yesterday' },
      icon: Calendar,
      color: 'green' as const
    },
    {
      title: 'This Week\'s Appointments',
      value: loading ? '...' : stats.weekAppointments.toString(),
      change: { value: 15, type: 'increase' as const, period: 'from last week' },
      icon: Calendar,
      color: 'orange' as const
    },
    {
      title: 'Pending Lab Results',
      value: '8',
      change: { value: 2, type: 'decrease' as const, period: 'from yesterday' },
      icon: Activity,
      color: 'yellow' as const
    },
    {
      title: 'Revenue (MTD)',
      value: '$45,231',
      change: { value: 8, type: 'increase' as const, period: 'this month' },
      icon: CreditCard,
      color: 'purple' as const
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statsCards.map((stat, index) => (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      stat.change.type === 'increase' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {stat.change.type === 'increase' ? '+' : '-'}{stat.change.value}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{stat.change.period}</p>
                </div>
                <div className={`p-4 rounded-full bg-${stat.color}-100 ml-4`}>
                  <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { patient: 'John Smith', time: '9:00 AM', type: 'Checkup', status: 'confirmed' },
                { patient: 'Emily Johnson', time: '10:30 AM', type: 'Follow-up', status: 'in-progress' },
                { patient: 'Michael Williams', time: '2:00 PM', type: 'Consultation', status: 'waiting' },
                { patient: 'Sarah Davis', time: '3:30 PM', type: 'Lab Results', status: 'scheduled' },
              ].map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{appointment.patient}</p>
                    <p className="text-sm text-gray-600">{appointment.type} - {appointment.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'in-progress' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { task: 'Review lab results for John Smith', priority: 'high', due: '2 hours' },
                { task: 'Follow up with Emily Johnson', priority: 'medium', due: '4 hours' },
                { task: 'Schedule surgery for Michael Williams', priority: 'high', due: '1 day' },
                { task: 'Update insurance information', priority: 'low', due: '3 days' },
              ].map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{task.task}</p>
                    <p className="text-sm text-gray-600">Due in {task.due}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'patients':
        return (
          <PatientList 
            onPatientSelect={setSelectedPatient}
          />
        );
      case 'appointments':
        return (
          <AppointmentList
            onAppointmentSelect={(appointment) => {
              console.log('Selected appointment:', appointment);
            }}
          />
        );
      case 'clinical':
        return <ClinicalOperations selectedPatient={selectedPatient} />;
      case 'billing':
        return <BillingOperations />;
      case 'reports':
        return <Reports />;
      case 'configuration':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">FHIR Configuration</h1>
              <p className="text-gray-600 mt-2">
                Configure your FHIR server connection and test the integration
              </p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                Please visit the dedicated configuration page for full FHIR setup.
              </p>
              <Button 
                onClick={() => window.open('/dashboard/configuration', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Open Configuration Page
              </Button>
            </div>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">EHR Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, Dr. Smith</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-72 bg-white shadow-sm h-screen sticky top-0">
          <div className="p-8">
            <div className="space-y-3">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <item.icon className="w-6 h-6" />
                    <span className="font-medium text-base">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>

      {/* Patient Detail Sidebar (if patient selected) */}
      {selectedPatient && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg border-l z-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Patient Details</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedPatient(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">
                  {selectedPatient.first_name} {selectedPatient.middle_name} {selectedPatient.last_name}
                </h3>
                <p className="text-gray-600">MRN: {selectedPatient.mrn}</p>
              </div>
              
              <div className="space-y-2">
                <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                <p><strong>Birth Date:</strong> {selectedPatient.date_of_birth}</p>
                {selectedPatient.phone && (
                  <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                )}
                {selectedPatient.email && (
                  <p><strong>Email:</strong> {selectedPatient.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}