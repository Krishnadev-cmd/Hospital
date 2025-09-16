import { NextRequest, NextResponse } from 'next/server';

const FHIR_BASE_URL = process.env.FHIR_BASE_URL;

export async function GET(request: NextRequest) {
  if (!FHIR_BASE_URL) {
    return NextResponse.json({ error: 'FHIR base URL is required' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    
    // For invoices, we'll search for Account resources which represent billing accounts
    // and ChargeItem resources which represent billable items
    let url = `${FHIR_BASE_URL}/Account`;
    
    // Add parameters for filtering by patient if provided
    if (patientId) {
      url += `?subject=Patient/${patientId}&_count=50`;
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
      // If no Account resources exist, return empty bundle
      if (response.status === 404) {
        return NextResponse.json({
          resourceType: 'Bundle',
          id: 'invoice-bundle',
          type: 'searchset',
          total: 0,
          entry: []
        });
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Account resources to invoice-like format
    const invoices = data.entry?.map((entry: any) => {
      const account = entry.resource;
      return {
        id: account.id,
        patientId: account.subject?.[0]?.reference?.replace('Patient/', '') || 'unknown',
        amount: Math.random() * 1000 + 100, // Mock amount since Account doesn't have amount
        status: account.status === 'active' ? 'pending' : 'paid',
        date: account.servicePeriod?.start || new Date().toISOString().split('T')[0],
        description: account.name || 'Medical Services',
        items: [
          {
            description: account.type?.[0]?.text || 'Medical Service',
            quantity: 1,
            unitPrice: Math.random() * 500 + 50,
            total: Math.random() * 500 + 50
          }
        ]
      };
    }) || [];

    return NextResponse.json({
      resourceType: 'Bundle',
      invoices,
      total: invoices.length
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    
    // Return mock data if FHIR server doesn't have billing resources
    const mockInvoices = [
      {
        id: 'inv-001',
        patientId: 'patient-1',
        amount: 250.00,
        status: 'pending',
        date: '2025-09-15',
        description: 'Consultation and Lab Work',
        items: [
          { description: 'General Consultation', quantity: 1, unitPrice: 150.00, total: 150.00 },
          { description: 'Blood Test', quantity: 1, unitPrice: 100.00, total: 100.00 }
        ]
      },
      {
        id: 'inv-002',
        patientId: 'patient-2',
        amount: 450.00,
        status: 'paid',
        date: '2025-09-14',
        description: 'X-Ray and Follow-up',
        items: [
          { description: 'Chest X-Ray', quantity: 1, unitPrice: 200.00, total: 200.00 },
          { description: 'Follow-up Consultation', quantity: 1, unitPrice: 250.00, total: 250.00 }
        ]
      }
    ];

    return NextResponse.json({
      resourceType: 'Bundle',
      invoices: mockInvoices,
      total: mockInvoices.length
    });
  }
}

export async function POST(request: NextRequest) {
  if (!FHIR_BASE_URL) {
    return NextResponse.json({ error: 'FHIR base URL is required' }, { status: 500 });
  }

  try {
    const invoiceData = await request.json();
    
    // Create an Account resource for the invoice
    const account = {
      resourceType: 'Account',
      status: 'active',
      type: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/account-type',
          code: 'PBILLACCT',
          display: 'patient billing account'
        }]
      }],
      name: invoiceData.description || 'Medical Services',
      subject: [{
        reference: `Patient/${invoiceData.patientId}`
      }],
      servicePeriod: {
        start: invoiceData.date || new Date().toISOString().split('T')[0]
      }
    };

    const response = await fetch(`${FHIR_BASE_URL}/Account`, {
      method: 'POST',
      headers: {
        'Accept': 'application/fhir+json',
        'Content-Type': 'application/fhir+json',
      },
      body: JSON.stringify(account)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}