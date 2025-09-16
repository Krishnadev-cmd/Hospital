import { NextRequest, NextResponse } from 'next/server';

const FHIR_BASE_URL = process.env.FHIR_BASE_URL;

export async function POST(request: NextRequest) {
  if (!FHIR_BASE_URL) {
    return NextResponse.json({ error: 'FHIR base URL is required' }, { status: 500 });
  }

  try {
    const { patientId, coverageId, serviceType } = await request.json();
    
    // In a real FHIR implementation, you would use the $eligibility operation
    // or call an external eligibility verification service
    // For now, we'll return mock eligibility data
    
    const eligibilityResponse = {
      resourceType: 'CoverageEligibilityResponse',
      id: `eligibility-${Date.now()}`,
      status: 'active',
      purpose: ['validation', 'benefits'],
      patient: {
        reference: `Patient/${patientId}`
      },
      created: new Date().toISOString(),
      insurer: {
        display: 'Insurance Provider'
      },
      outcome: 'complete',
      insurance: [{
        coverage: {
          reference: `Coverage/${coverageId || 'coverage-1'}`
        },
        inforce: true,
        benefitPeriod: {
          start: '2025-01-01',
          end: '2025-12-31'
        },
        item: [{
          category: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/ex-benefitcategory',
              code: serviceType || 'medical',
              display: serviceType === 'pharmacy' ? 'Pharmacy' : 'Medical Care'
            }]
          },
          network: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/benefit-network',
              code: 'in',
              display: 'In Network'
            }]
          },
          benefit: [{
            type: {
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/benefit-type',
                code: 'copay',
                display: 'Copay'
              }]
            },
            allowedMoney: {
              value: 25.00,
              currency: 'USD'
            }
          }, {
            type: {
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/benefit-type',
                code: 'deductible',
                display: 'Deductible'
            }]
            },
            allowedMoney: {
              value: 500.00,
              currency: 'USD'
            },
            usedMoney: {
              value: 150.00,
              currency: 'USD'
            }
          }]
        }]
      }]
    };

    return NextResponse.json({
      eligible: true,
      copay: 25.00,
      deductible: {
        total: 500.00,
        used: 150.00,
        remaining: 350.00
      },
      coverage: 'Active',
      network: 'In Network',
      details: eligibilityResponse
    });

  } catch (error) {
    console.error('Error checking eligibility:', error);
    return NextResponse.json({ 
      error: 'Failed to check eligibility',
      eligible: false 
    }, { status: 500 });
  }
}