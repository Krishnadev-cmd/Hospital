'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FHIRConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
}

interface ConnectionStatus {
  isConnected: boolean;
  message: string;
  serverInfo?: any;
}

export function FHIRConfigurationManager() {
  const [config, setConfig] = useState<FHIRConfig>({
    baseUrl: '',
    clientId: '',
    clientSecret: '',
    accessToken: ''
  });
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    message: 'Not connected'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Load current configuration on component mount
  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      const response = await fetch('/api/fhir/config');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConfig(prev => ({
            ...prev,
            baseUrl: data.data.baseUrl || '',
            clientId: data.data.clientId || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleInputChange = (field: keyof FHIRConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/fhir/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus({
          isConnected: false,
          message: 'Configuration is valid ✓'
        });
      } else {
        setStatus({
          isConnected: false,
          message: `Validation failed: ${data.errors?.join(', ') || 'Unknown error'}`
        });
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        message: 'Failed to validate configuration'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/fhir/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus({
          isConnected: true,
          message: 'Connected successfully! ✓',
          serverInfo: data.serverInfo
        });
      } else {
        setStatus({
          isConnected: false,
          message: `Connection failed: ${data.error}`,
        });
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        message: 'Connection test failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">FHIR Server Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              FHIR Base URL *
            </label>
            <Input
              type="url"
              value={config.baseUrl}
              onChange={(e) => handleInputChange('baseUrl', e.target.value)}
              placeholder="https://api.practicefusion.com/fhir/R4"
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Example: https://api.practicefusion.com/fhir/R4
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Client ID
              </label>
              <Input
                type="text"
                value={config.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                placeholder="your-client-id"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Client Secret
              </label>
              <Input
                type="password"
                value={config.clientSecret}
                onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                placeholder="your-client-secret"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Access Token (Alternative to Client ID/Secret)
            </label>
            <Input
              type="password"
              value={config.accessToken}
              onChange={(e) => handleInputChange('accessToken', e.target.value)}
              placeholder="Bearer token for direct authentication"
            />
            <p className="text-sm text-gray-500 mt-1">
              Use either Client ID/Secret OR Access Token
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={validateConfig}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Validating...' : 'Validate Config'}
            </Button>
            <Button
              onClick={testConnection}
              disabled={isTesting || !config.baseUrl}
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          <div className={`p-4 rounded-lg ${
            status.isConnected 
              ? 'bg-green-50 border border-green-200' 
              : status.message.includes('✓') 
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-gray-50 border border-gray-200'
          }`}>
            <p className={`font-medium ${
              status.isConnected 
                ? 'text-green-800' 
                : status.message.includes('✓')
                  ? 'text-blue-800'
                  : 'text-gray-700'
            }`}>
              Status: {status.message}
            </p>
            {status.serverInfo && (
              <div className="mt-2 text-sm text-green-700">
                <p>Server: {status.serverInfo.fhirVersion || 'FHIR R4'}</p>
                <p>Implementation: {status.serverInfo.implementation || 'Unknown'}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Environment Setup</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">
            For production, set these environment variables:
          </p>
          <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`FHIR_BASE_URL=${config.baseUrl || 'https://api.practicefusion.com/fhir/R4'}
FHIR_CLIENT_ID=${config.clientId || 'your-client-id'}
FHIR_CLIENT_SECRET=${config.clientSecret || 'your-client-secret'}
FHIR_ACCESS_TOKEN=${config.accessToken || 'your-access-token'}`}
          </pre>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Quick Test</h3>
        <p className="text-sm text-gray-600 mb-4">
          Once connected, you can test basic operations:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            size="sm"
            disabled={!status.isConnected}
            onClick={() => window.open('/api/fhir/patients?_count=5', '_blank')}
          >
            List Patients
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={!status.isConnected}
            onClick={() => window.open('/api/fhir/observations?_count=5', '_blank')}
          >
            List Observations
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={!status.isConnected}
            onClick={() => window.open('/api/fhir/conditions?patient=example', '_blank')}
          >
            List Conditions
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={!status.isConnected}
            onClick={() => window.open('/api/fhir/encounters?_count=5', '_blank')}
          >
            List Encounters
          </Button>
        </div>
      </Card>
    </div>
  );
}