import { NextRequest, NextResponse } from 'next/server';

const FHIR_BASE_URL = process.env.FHIR_BASE_URL;

export async function GET(request: NextRequest) {
  if (!FHIR_BASE_URL) {
    return NextResponse.json({ error: 'FHIR base URL is required' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    
    // Search for Coverage resources
    let url = `${FHIR_BASE_URL}/Coverage`;
    if (patientId) {
      url += `?beneficiary=Patient/${patientId}&_count=50`;
    } else {
      url += '?_count=50';
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/fhir+json',
        'Content-Type': 'application/fhir+json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          resourceType: 'Bundle',
          id: 'coverage-bundle',
          type: 'searchset',
          total: 0,
          entry: []
        });
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching coverage:', error);
    
    // Return mock coverage data
    const mockCoverage = {
      resourceType: 'Bundle',
      id: 'coverage-bundle',
      type: 'searchset',
      total: 2,
      entry: [
        {
          resource: {
            resourceType: 'Coverage',
            id: 'coverage-1',
            status: 'active',
            type: {
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                code: 'EHCPOL',
                display: 'Extended Healthcare Policy'
              }]
            },
            beneficiary: {
              reference: 'Patient/patient-1',
              display: 'John Doe'
            },
            payor: [{
              reference: 'Organization/insurance-1',
              display: 'Blue Cross Blue Shield'
            }],
            period: {
              start: '2025-01-01',
              end: '2025-12-31'
            }
          }
        }
      ]
    };

    return NextResponse.json(mockCoverage);
  }
}

export async function POST(request: NextRequest) {
  if (!FHIR_BASE_URL) {
    return NextResponse.json({ error: 'FHIR base URL is required' }, { status: 500 });
  }

  try {
    const coverageData = await request.json();
    
    const coverage = {
      resourceType: 'Coverage',
      status: 'active',
      beneficiary: {
        reference: `Patient/${coverageData.patientId}`
      },
      payor: [{
        display: coverageData.insuranceName || 'Insurance Provider'
      }],
      period: {
        start: coverageData.startDate || new Date().toISOString().split('T')[0],
        end: coverageData.endDate
      }
    };

    const response = await fetch(`${FHIR_BASE_URL}/Coverage`, {
      method: 'POST',
      headers: {
        'Accept': 'application/fhir+json',
        'Content-Type': 'application/fhir+json',
      },
      body: JSON.stringify(coverage)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error creating coverage:', error);
    return NextResponse.json({ error: 'Failed to create coverage' }, { status: 500 });
  }
}