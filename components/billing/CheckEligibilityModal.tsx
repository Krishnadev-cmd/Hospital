'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X, CheckCircle, AlertCircle, User, CreditCard, Calendar, Shield } from 'lucide-react';

interface CheckEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEligibilityChecked?: () => void;
}

export function CheckEligibilityModal({ isOpen, onClose, onEligibilityChecked }: CheckEligibilityModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    policy_number: '',
    group_number: '',
    insurance_provider: '',
    date_of_birth: '',
    first_name: '',
    last_name: ''
  });

  const insuranceProviders = [
    'Blue Cross Blue Shield',
    'Aetna',
    'Cigna',
    'UnitedHealthcare',
    'Humana',
    'Kaiser Permanente',
    'Medicare',
    'Medicaid',
    'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.policy_number || !formData.insurance_provider) return;

    setIsLoading(true);
    setEligibilityResult(null);
    
    try {
      // Simulate eligibility check - in real implementation, this would call insurance API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      const mockResult = {
        eligible: Math.random() > 0.3, // 70% chance of being eligible
        coverage_details: {
          deductible: '$1,000',
          copay: '$25',
          coinsurance: '20%',
          out_of_pocket_max: '$5,000'
        },
        covered_services: ['Primary Care', 'Specialist Visits', 'Emergency Care', 'Prescription Drugs'],
        effective_date: '2024-01-01',
        termination_date: '2024-12-31',
        member_id: formData.patient_id,
        group_number: formData.group_number
      };

      setEligibilityResult(mockResult);
      
      if (onEligibilityChecked) {
        onEligibilityChecked();
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setEligibilityResult({
        eligible: false,
        error: 'Unable to verify eligibility. Please try again or contact the insurance provider.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      patient_id: '',
      policy_number: '',
      group_number: '',
      insurance_provider: '',
      date_of_birth: '',
      first_name: '',
      last_name: ''
    });
    setEligibilityResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center text-lg font-semibold">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              Check Insurance Eligibility
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!eligibilityResult ? (
              <form onSubmit={handleCheckEligibility} className="space-y-4">
                {/* Patient Information */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700 mb-1">Patient ID *</label>
                      <Input
                        id="patient_id"
                        type="text"
                        value={formData.patient_id}
                        onChange={(e) => handleInputChange('patient_id', e.target.value)}
                        placeholder="Enter patient ID"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <Input
                        id="first_name"
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="Patient first name"
                      />
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <Input
                        id="last_name"
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder="Patient last name"
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Insurance Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="insurance_provider" className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider *</label>
                      <select
                        id="insurance_provider"
                        value={formData.insurance_provider}
                        onChange={(e) => handleInputChange('insurance_provider', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select insurance provider</option>
                        {insuranceProviders.map((provider) => (
                          <option key={provider} value={provider}>
                            {provider}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="policy_number" className="block text-sm font-medium text-gray-700 mb-1">Policy Number *</label>
                      <Input
                        id="policy_number"
                        type="text"
                        value={formData.policy_number}
                        onChange={(e) => handleInputChange('policy_number', e.target.value)}
                        placeholder="Insurance policy number"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="group_number" className="block text-sm font-medium text-gray-700 mb-1">Group Number</label>
                      <Input
                        id="group_number"
                        type="text"
                        value={formData.group_number}
                        onChange={(e) => handleInputChange('group_number', e.target.value)}
                        placeholder="Group number (if applicable)"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isLoading || !formData.patient_id || !formData.policy_number || !formData.insurance_provider}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 animate-pulse" />
                        Checking Eligibility...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Check Eligibility
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Eligibility Result */}
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    eligibilityResult.eligible ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {eligibilityResult.eligible ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${
                    eligibilityResult.eligible ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {eligibilityResult.eligible ? 'Coverage Confirmed' : 'Not Eligible'}
                  </h3>
                  <p className="text-gray-600">
                    {eligibilityResult.eligible 
                      ? 'Patient has active insurance coverage'
                      : eligibilityResult.error || 'Coverage could not be verified'
                    }
                  </p>
                </div>

                {eligibilityResult.eligible && (
                  <div className="space-y-4">
                    {/* Coverage Details */}
                    <Card className="bg-green-50 border-green-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-green-900">Coverage Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Deductible:</span>
                            <p className="text-sm text-gray-900">{eligibilityResult.coverage_details.deductible}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Copay:</span>
                            <p className="text-sm text-gray-900">{eligibilityResult.coverage_details.copay}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Coinsurance:</span>
                            <p className="text-sm text-gray-900">{eligibilityResult.coverage_details.coinsurance}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Out-of-Pocket Max:</span>
                            <p className="text-sm text-gray-900">{eligibilityResult.coverage_details.out_of_pocket_max}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Effective Date:</span>
                            <p className="text-sm text-gray-900">{eligibilityResult.effective_date}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Termination Date:</span>
                            <p className="text-sm text-gray-900">{eligibilityResult.termination_date}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Covered Services */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-blue-900">Covered Services</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          {eligibilityResult.covered_services.map((service: string, index: number) => (
                            <div key={index} className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-sm text-gray-900">{service}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                  >
                    Check Another Patient
                  </Button>
                  <Button onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}