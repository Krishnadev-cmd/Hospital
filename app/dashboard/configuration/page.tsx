'use client';

import { FHIRConfigurationManager } from '@/components/configuration/FHIRConfigurationManager';

export default function ConfigurationPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">FHIR Configuration</h1>
        <p className="text-gray-600 mt-2">
          Configure your FHIR server connection and test the integration
        </p>
      </div>
      
      <FHIRConfigurationManager />
    </div>
  );
}