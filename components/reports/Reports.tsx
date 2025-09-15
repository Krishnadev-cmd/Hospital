'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  RefreshCw,
  Activity,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  patientService, 
  appointmentService, 
  billingService, 
  reportsService 
} from '../../lib/services/supabase';

// Real data interfaces
interface ReportData {
  patientStats: {
    totalPatients: number;
    newPatientsThisMonth: number;
    averageAge: number;
    malePatients: number;
    femalePatients: number;
  };
  appointmentStats: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    upcomingAppointments: number;
  };
  financialStats: {
    monthlyRevenue: number;
    pendingPayments: number;
    insuranceClaims: number;
    averageClaimAmount: number;
  };
  clinicalStats: {
    vitalSignsRecorded: number;
    clinicalNotesCreated: number;
    medicationsPrescribed: number;
    labResultsPending: number;
  };
}

interface ChartData {
  monthlyPatients: Array<{ month: string; patients: number; appointments: number }>;
  appointmentTypes: Array<{ type: string; count: number; percentage: number }>;
}

interface ReportsProps {
  onDataRefresh?: () => void;
}

export default function Reports({ onDataRefresh }: ReportsProps) {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [reportData, setReportData] = useState<ReportData>({
    patientStats: {
      totalPatients: 0,
      newPatientsThisMonth: 0,
      averageAge: 0,
      malePatients: 0,
      femalePatients: 0
    },
    appointmentStats: {
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      noShowAppointments: 0,
      upcomingAppointments: 0
    },
    financialStats: {
      monthlyRevenue: 0,
      pendingPayments: 0,
      insuranceClaims: 0,
      averageClaimAmount: 0
    },
    clinicalStats: {
      vitalSignsRecorded: 0,
      clinicalNotesCreated: 0,
      medicationsPrescribed: 0,
      labResultsPending: 0
    }
  });
  const [chartData, setChartData] = useState<ChartData>({
    monthlyPatients: [],
    appointmentTypes: []
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Fetch patient statistics
      const patientResult = await patientService.getPatientStats();
      
      // Fetch appointment statistics
      const today = new Date().toISOString().split('T')[0];
      const appointmentResult = await appointmentService.getTodaysAppointments();
      
      // Fetch dashboard statistics
      const dashboardResult = await reportsService.getDashboardStats();
      
      // Fetch invoices for financial data
      const invoiceResult = await billingService.getInvoices();

      // Process patient data
      let patientStats = {
        totalPatients: 0,
        newPatientsThisMonth: 0,
        averageAge: 0,
        malePatients: 0,
        femalePatients: 0
      };

      if (patientResult.success && patientResult.data) {
        patientStats.totalPatients = patientResult.data.totalPatients || 0;
        const genderData = patientResult.data.genderDistribution || [];
        const maleData = genderData.find((g: any) => g.gender === 'male');
        const femaleData = genderData.find((g: any) => g.gender === 'female');
        patientStats.malePatients = (maleData?.count as number) || 0;
        patientStats.femalePatients = (femaleData?.count as number) || 0;
      }

      // Process appointment data
      let appointmentStats = {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        noShowAppointments: 0,
        upcomingAppointments: 0
      };

      if (appointmentResult.success && appointmentResult.data) {
        const appointments = appointmentResult.data;
        appointmentStats.totalAppointments = appointments.length;
        appointments.forEach((apt: any) => {
          switch (apt.status) {
            case 'completed':
              appointmentStats.completedAppointments++;
              break;
            case 'cancelled':
              appointmentStats.cancelledAppointments++;
              break;
            case 'no-show':
              appointmentStats.noShowAppointments++;
              break;
            case 'scheduled':
            case 'confirmed':
              appointmentStats.upcomingAppointments++;
              break;
          }
        });
      }

      // Process financial data
      let financialStats = {
        monthlyRevenue: 0,
        pendingPayments: 0,
        insuranceClaims: 0,
        averageClaimAmount: 0
      };

      if (invoiceResult.success && invoiceResult.data) {
        const invoices = invoiceResult.data;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        invoices.forEach((invoice: any) => {
          const invoiceDate = new Date(invoice.issue_date);
          if (invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear) {
            financialStats.monthlyRevenue += invoice.paid_amount || 0;
          }
          if (invoice.status === 'sent' || invoice.status === 'overdue') {
            financialStats.pendingPayments += invoice.balance_due || 0;
          }
          if (invoice.insurance_claims && invoice.insurance_claims.length > 0) {
            financialStats.insuranceClaims += invoice.insurance_claims.length;
          }
        });
      }

      // Set clinical stats (mock for now as we don't have these services active)
      const clinicalStats = {
        vitalSignsRecorded: 0,
        clinicalNotesCreated: 0,
        medicationsPrescribed: 0,
        labResultsPending: 0
      };

      // Generate chart data
      const monthlyPatients = generateMonthlyData();
      const appointmentTypes = generateAppointmentTypesData(appointmentResult.data || []);

      setReportData({
        patientStats,
        appointmentStats,
        financialStats,
        clinicalStats
      });

      setChartData({
        monthlyPatients,
        appointmentTypes
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = () => {
    // Generate last 6 months data (simplified for now)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      patients: Math.floor(Math.random() * 50) + 20, // Mock data for now
      appointments: Math.floor(Math.random() * 100) + 50 // Mock data for now
    }));
  };

  const generateAppointmentTypesData = (appointments: any[]) => {
    const typeCounts: Record<string, number> = {};
    const total = appointments.length || 1;

    appointments.forEach((apt: any) => {
      const type = apt.appointment_type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  };

  useEffect(() => {
    loadReportData();
  }, []);

  const handleRefresh = async () => {
    await loadReportData();
    if (onDataRefresh) onDataRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Dashboard Reports</h1>
          <p className="text-sm text-gray-600">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-gray-600">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading report data...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.patientStats.totalPatients}</p>
                    <p className="text-sm text-green-600">+{reportData.patientStats.newPatientsThisMonth} this month</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.appointmentStats.totalAppointments}</p>
                    <p className="text-sm text-green-600">{reportData.appointmentStats.completedAppointments} completed</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.financialStats.monthlyRevenue)}</p>
                    <p className="text-sm text-orange-600">{formatCurrency(reportData.financialStats.pendingPayments)} pending</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clinical Records</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.clinicalStats.vitalSignsRecorded}</p>
                    <p className="text-sm text-blue-600">{reportData.clinicalStats.clinicalNotesCreated} notes</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Monthly Patient & Appointment Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.monthlyPatients.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 text-sm font-medium text-gray-900">{data.month}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Patients: {data.patients}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Appointments: {data.appointments}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Appointment Types Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.appointmentTypes.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" 
                             style={{ opacity: 1 - (index * 0.2) }}></div>
                        <span className="text-sm font-medium text-gray-900">{data.type}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">{data.count}</span>
                        <span className="text-sm font-medium text-gray-900">{data.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                System Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-green-900">{reportData.appointmentStats.completedAppointments}</p>
                  <p className="text-sm text-green-600">Completed Appointments</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-blue-900">{reportData.appointmentStats.upcomingAppointments}</p>
                  <p className="text-sm text-blue-600">Upcoming Appointments</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-purple-900">{reportData.clinicalStats.medicationsPrescribed}</p>
                  <p className="text-sm text-purple-600">Medications Prescribed</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-yellow-900">{reportData.clinicalStats.labResultsPending}</p>
                  <p className="text-sm text-yellow-600">Pending Lab Results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}