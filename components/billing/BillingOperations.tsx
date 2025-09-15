'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users,
  Calendar,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  PlusCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { billingService, SupabaseInvoice } from '../../lib/services/supabase';
import CreateInvoiceModal from './CreateInvoiceModal';

// Mock data for billing operations
const mockBilling = [
  {
    id: '1',
    patientName: 'John Doe',
    patientId: '1',
    serviceDate: '2024-01-15',
    services: ['Consultation', 'Lab Work', 'X-Ray'],
    totalAmount: 450.00,
    paidAmount: 450.00,
    status: 'paid',
    insuranceProvider: 'Blue Cross Blue Shield',
    claimNumber: 'BC-2024-001',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    patientName: 'Sarah Smith',
    patientId: '2',
    serviceDate: '2024-01-14',
    services: ['Consultation', 'ECG'],
    totalAmount: 280.00,
    paidAmount: 0.00,
    status: 'pending',
    insuranceProvider: 'Aetna',
    claimNumber: 'AET-2024-002',
    createdAt: '2024-01-14T14:15:00Z'
  },
  {
    id: '3',
    patientName: 'Michael Johnson',
    patientId: '3',
    serviceDate: '2024-01-13',
    services: ['Emergency Visit', 'CT Scan', 'Blood Test'],
    totalAmount: 1250.00,
    paidAmount: 312.50,
    status: 'partial',
    insuranceProvider: 'Medicare',
    claimNumber: 'MC-2024-003',
    createdAt: '2024-01-13T16:45:00Z'
  }
];

const mockInsuranceProviders = [
  {
    id: '1',
    name: 'Blue Cross Blue Shield',
    type: 'PPO',
    contactInfo: '1-800-BCBS-123',
    activePatients: 45,
    averageProcessingTime: '14 days',
    reimbursementRate: 85
  },
  {
    id: '2',
    name: 'Aetna',
    type: 'HMO',
    contactInfo: '1-800-AETNA-24',
    activePatients: 32,
    averageProcessingTime: '10 days',
    reimbursementRate: 78
  },
  {
    id: '3',
    name: 'Medicare',
    type: 'Government',
    contactInfo: '1-800-MEDICARE',
    activePatients: 28,
    averageProcessingTime: '21 days',
    reimbursementRate: 80
  }
];

interface BillingOperationsProps {
  onPatientSelect?: (patientId: string) => void;
}

export default function BillingOperations({ onPatientSelect }: BillingOperationsProps) {
  const [activeTab, setActiveTab] = useState<'billing' | 'insurance' | 'reports'>('billing');
  const [billingRecords, setBillingRecords] = useState<SupabaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    const result = await billingService.getInvoices();
    
    if (result.success && result.data) {
      setBillingRecords(result.data);
    } else {
      setError(result.error || 'Failed to load billing data');
    }
    
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-orange-100 text-orange-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotalRevenue = () => {
    return billingRecords.reduce((total, record) => total + (record.paid_amount || 0), 0);
  };

  const calculateOutstanding = () => {
    return billingRecords.reduce((total, record) => total + (record.balance_due || 0), 0);
  };

  const getPatientName = (record: SupabaseInvoice) => {
    if (record.patients) {
      return `${record.patients.first_name} ${record.patients.last_name}`;
    }
    return 'Unknown Patient';
  };

  const getPatientInitials = (record: SupabaseInvoice) => {
    if (record.patients) {
      return `${record.patients.first_name?.[0] || ''}${record.patients.last_name?.[0] || ''}`;
    }
    return 'UK';
  };

  const getInvoiceServices = (record: SupabaseInvoice) => {
    if (record.invoice_items) {
      return record.invoice_items.map(item => item.description);
    }
    return ['General Service'];
  };

  const getInsuranceInfo = (record: SupabaseInvoice) => {
    if (record.insurance_claims && record.insurance_claims.length > 0) {
      const claim = record.insurance_claims[0];
      return {
        provider: claim.insurance_provider,
        claimNumber: claim.claim_number
      };
    }
    return {
      provider: 'No Insurance',
      claimNumber: 'N/A'
    };
  };

  const renderBillingTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculateTotalRevenue())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(calculateOutstanding())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Claims</p>
                <p className="text-2xl font-bold text-gray-900">{billingRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {billingRecords.length > 0 ? Math.round((calculateTotalRevenue() / billingRecords.reduce((total, record) => total + (record.total_amount || 0), 0)) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Billing Records</h2>
          <p className="text-sm text-gray-600">Manage patient billing and insurance claims</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowCreateInvoiceModal(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by patient name or claim number..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Records Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Service Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Services</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Paid</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Insurance</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {billingRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {getPatientInitials(record)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{getPatientName(record)}</p>
                          <p className="text-sm text-gray-500">ID: {record.patient_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(record.issue_date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {getInvoiceServices(record).map((service, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(record.total_amount || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(record.paid_amount || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        <span className="ml-1 capitalize">{record.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{getInsuranceInfo(record).provider}</div>
                      <div className="text-sm text-gray-500">{getInsuranceInfo(record).claimNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsuranceTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Insurance Providers</h2>
          <p className="text-sm text-gray-600">Manage insurance provider relationships and claims</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Provider
        </Button>
      </div>

      {/* Insurance Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-full">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-2">Insurance Provider Management</p>
            <p className="text-sm text-gray-400">This section will be enhanced with full insurance provider management capabilities.</p>
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Financial Reports</h2>
          <p className="text-sm text-gray-600">View financial analytics and key metrics</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(calculateTotalRevenue())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Outstanding</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(calculateOutstanding())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {billingRecords.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Paid Invoices</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {billingRecords.filter(r => r.status === 'paid').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['paid', 'sent', 'draft', 'overdue', 'cancelled'].map((status) => {
              const count = billingRecords.filter(r => r.status === status).length;
              const percentage = billingRecords.length > 0 ? (count / billingRecords.length) * 100 : 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></span>
                    <span className="text-sm font-medium capitalize">{status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'paid' ? 'bg-green-500' :
                          status === 'sent' ? 'bg-blue-500' :
                          status === 'draft' ? 'bg-gray-500' :
                          status === 'overdue' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Billing Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingRecords.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium">{getPatientName(record)}</p>
                  <p className="text-xs text-gray-500">Invoice #{record.invoice_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(record.total_amount || 0)}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadBillingData} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'billing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CreditCard className="h-4 w-4 inline mr-2" />
            Billing
          </button>
          <button
            onClick={() => setActiveTab('insurance')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'insurance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Insurance
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="h-4 w-4 inline mr-2" />
            Reports
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'billing' && renderBillingTab()}
        {activeTab === 'insurance' && renderInsuranceTab()}
        {activeTab === 'reports' && renderReportsTab()}
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={showCreateInvoiceModal}
        onClose={() => setShowCreateInvoiceModal(false)}
        onInvoiceCreated={() => {
          loadBillingData(); // Refresh the billing data
          setShowCreateInvoiceModal(false);
        }}
      />
    </div>
  );
}