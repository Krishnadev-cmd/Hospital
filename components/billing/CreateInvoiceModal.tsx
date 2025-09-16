'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { FileText, X, User, Calendar, Plus, Minus } from 'lucide-react';
import { UIPatient, UIInvoice } from '../../lib/services/fhir';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: () => void;
  selectedPatient?: UIPatient;
}

interface InvoiceItem {
  service_code: string;
  description: string;
  quantity: number;
  unit_price: number;
}

interface InvoiceForm {
  patient_id: string;
  appointment_id?: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes: string;
  items: InvoiceItem[];
}

export default function CreateInvoiceModal({ isOpen, onClose, onInvoiceCreated, selectedPatient }: CreateInvoiceModalProps) {
  const [patients, setPatients] = useState<UIPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<InvoiceForm>({
    patient_id: selectedPatient?.id || '',
    appointment_id: '',
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 0,
    notes: '',
    items: [
      {
        service_code: '',
        description: '',
        quantity: 1,
        unit_price: 0
      }
    ]
  });

  useEffect(() => {
    if (isOpen) {
      loadPatients();
      generateInvoiceNumber();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({ ...prev, patient_id: selectedPatient.id }));
    }
  }, [selectedPatient]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.tax_amount, formData.discount_amount]);

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

  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const invoiceNumber = `INV-${year}-${month}-${random}`;
    setFormData(prev => ({ ...prev, invoice_number: invoiceNumber }));
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

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const total = subtotal + formData.tax_amount - formData.discount_amount;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      total_amount: Math.max(0, total) // Ensure total is not negative
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userId = await getCurrentUser();
      
      const invoiceData: Partial<UIInvoice> = {
        patient_id: formData.patient_id,
        amount: formData.total_amount,
        status: 'pending',
        due_date: formData.due_date,
        service_date: formData.issue_date,
        services: formData.items.map(item => item.description),
        invoice_items: formData.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price
        }))
      };

      console.log('Creating invoice with data:', invoiceData);
      
      // For demo purposes, simulate successful invoice creation
      const result = { success: true, data: { ...invoiceData, id: 'inv_' + Date.now() } };

      if (result.success) {
        alert('Invoice created successfully!');
        onInvoiceCreated();
        onClose();
        resetForm();
      } else {
        console.error('Invoice creation failed');
        setError('Failed to create invoice');
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
      invoice_number: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      notes: '',
      items: [
        {
          service_code: '',
          description: '',
          quantity: 1,
          unit_price: 0
        }
      ]
    });
    generateInvoiceNumber();
    setError('');
  };

  const handleInputChange = (field: keyof InvoiceForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          service_code: '',
          description: '',
          quantity: 1,
          unit_price: 0
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const selectedPatientData = patients.find(p => p.id === formData.patient_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create Invoice</h2>
                <p className="text-sm text-gray-600">Generate a new invoice for patient services</p>
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

              {/* Invoice Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Invoice Number *</label>
                <Input
                  type="text"
                  value={formData.invoice_number}
                  onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                  placeholder="INV-2024-001"
                  className="w-full"
                  required
                />
              </div>

              {/* Issue Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Issue Date *</label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => handleInputChange('issue_date', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Due Date *</label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
                <Button
                  type="button"
                  onClick={addItem}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {formData.items.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="grid md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Service Code</label>
                      <Input
                        type="text"
                        value={item.service_code}
                        onChange={(e) => handleItemChange(index, 'service_code', e.target.value)}
                        placeholder="99213"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Description *</label>
                      <Input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Office visit"
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Quantity *</label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Unit Price *</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        min="0"
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </span>
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeItem(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Totals */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Tax Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tax Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.tax_amount}
                    onChange={(e) => handleInputChange('tax_amount', parseFloat(e.target.value) || 0)}
                    min="0"
                    className="w-full"
                  />
                </div>

                {/* Discount Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Discount Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.discount_amount}
                    onChange={(e) => handleInputChange('discount_amount', parseFloat(e.target.value) || 0)}
                    min="0"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${formData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${formData.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span>-${formData.discount_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>${formData.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes for this invoice..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-vertical"
              />
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
                disabled={loading || !formData.patient_id || formData.items.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}