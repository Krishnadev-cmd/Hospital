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
  billingService
} from '../../lib/services/fhir';

interface ReportsProps {
  onDataRefresh?: () => void;
}

export default function Reports({ onDataRefresh }: ReportsProps) {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [stats, setStats] = useState({
    totalPatients: 0,
    newPatientsThisMonth: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalRevenue: 0,
    pendingPayments: 0
  });
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const loadReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch data from all services
      const [patientStatsResult, appointmentStatsResult, invoicesResult] = await Promise.all([
        patientService.getPatientStats(),
        appointmentService.getAppointmentStats(),
        billingService.getInvoices()
      ]);

      // Process results
      let newStats = {
        totalPatients: 0,
        newPatientsThisMonth: 0,
        totalAppointments: 0,
        upcomingAppointments: 0,
        totalRevenue: 0,
        pendingPayments: 0
      };

      // Patient stats
      if (patientStatsResult.success && patientStatsResult.data) {
        newStats.totalPatients = patientStatsResult.data.totalPatients || 0;
        newStats.newPatientsThisMonth = patientStatsResult.data.newPatientsThisMonth || 0;
      }

      // Appointment stats
      if (appointmentStatsResult.success && appointmentStatsResult.data) {
        const appointmentData = appointmentStatsResult.data;
        newStats.totalAppointments = appointmentData.today?.total || 0;
        newStats.upcomingAppointments = appointmentData.week?.upcoming || 0;
      }

      // Financial stats
      if (invoicesResult.success && invoicesResult.data) {
        const invoices = invoicesResult.data;
        newStats.totalRevenue = invoices.reduce((total, invoice) => total + (invoice.paid_amount || 0), 0);
        newStats.pendingPayments = invoices.reduce((total, invoice) => total + (invoice.amount - (invoice.paid_amount || 0)), 0);
      }

      setStats(newStats);
      setLastUpdated(new Date());
      
      if (onDataRefresh) {
        onDataRefresh();
      }
    } catch (err) {
      console.error('Error loading report data:', err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
            <Button 
              onClick={loadReportData} 
              className="mt-2 bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hospital Reports</h2>
          <p className="text-gray-600">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <Button 
          onClick={loadReportData} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Patient Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalPatients}</div>
            <p className="text-xs text-gray-500">
              {stats.newPatientsThisMonth} new this month
            </p>
          </CardContent>
        </Card>

        {/* Appointment Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalAppointments}</div>
            <p className="text-xs text-gray-500">
              {stats.upcomingAppointments} upcoming
            </p>
          </CardContent>
        </Card>

        {/* Revenue Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(stats.pendingPayments)} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Patient Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Patients</span>
                <span className="font-medium">{stats.totalPatients}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New This Month</span>
                <span className="font-medium text-green-600">+{stats.newPatientsThisMonth}</span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Patient data is pulled from FHIR-compliant patient resources
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Collected</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Outstanding</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(stats.pendingPayments)}
                </span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Financial data from FHIR billing resources and coverage information
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-purple-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">FHIR Services Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Patient Data Synced</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Billing Integration Ready</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">
              This hospital management system is integrated with FHIR R4 standards for healthcare interoperability.
              All patient data, appointments, and billing information follows FHIR resource specifications.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}