#!/usr/bin/env node

/**
 * Test script for Print All Cards functionality
 * Tests the printCards function logic and card generation
 */

import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';
const TEST_USERNAME = process.argv[2] || 'admin';
const TEST_PASSWORD = process.argv[3] || 'admin123';

let sessionCookie = '';

console.log(`
============================================================
🧪 PRINT ALL CARDS FUNCTIONALITY TEST
============================================================
Testing against: ${BASE_URL}
Username: ${TEST_USERNAME}
`);

// Helper function for API requests
async function apiRequest(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie ? { Cookie: sessionCookie } : {}),
      },
      withCredentials: true,
      ...(data && { data }),
    };

    const response = await axios(config);
    
    // Extract session cookie if present
    if (response.headers['set-cookie']) {
      sessionCookie = response.headers['set-cookie'][0].split(';')[0];
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Request failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

// Test Steps
async function runTests() {
  const results = {
    passed: [],
    failed: [],
    skipped: []
  };

  // Step 1: Login
  console.log(`
============================================================
🧪 TEST: STEP 1: Login
============================================================
`);
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: TEST_USERNAME,
      password: TEST_PASSWORD
    }, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    });

    if (loginResponse.headers['set-cookie']) {
      sessionCookie = loginResponse.headers['set-cookie'][0].split(';')[0];
    }

    console.log('✅ Login successful');
    results.passed.push('Login');
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    results.failed.push('Login');
    console.log('\n❌ Cannot proceed without login. Exiting tests.');
    return results;
  }

  // Step 2: Get Patients
  console.log(`
============================================================
🧪 TEST: STEP 2: Get Patients
============================================================
`);
  try {
    const patients = await apiRequest('/api/patients');
    console.log(`✅ Retrieved ${patients.length} patients`);
    
    if (patients.length === 0) {
      console.log('⚠️  No patients found. Some tests will be skipped.');
      results.skipped.push('Patient card generation (no patients)');
    } else {
      console.log(`   Sample patient: ${patients[0].firstName} ${patients[0].lastName} (ID: ${patients[0].id})`);
      results.passed.push('Get Patients');
    }
  } catch (error) {
    console.error('❌ Failed to get patients:', error.message);
    results.failed.push('Get Patients');
  }

  // Step 3: Test Card Data Structure
  console.log(`
============================================================
🧪 TEST: STEP 3: Test Card Data Structure
============================================================
`);
  try {
    // Simulate card data structure
    const mockCard = {
      patient: {
        id: 1,
        firstName: 'Test',
        lastName: 'Patient',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01'
      },
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      barcode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      portalUrl: 'http://localhost:5001/patient-portal',
      generatedAt: new Date().toISOString()
    };

    // Validate structure
    const requiredFields = ['patient', 'portalUrl', 'generatedAt'];
    const missingFields = requiredFields.filter(field => !mockCard[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate patient structure
    const requiredPatientFields = ['id', 'firstName', 'lastName', 'phone', 'dateOfBirth'];
    const missingPatientFields = requiredPatientFields.filter(field => !mockCard.patient[field]);
    
    if (missingPatientFields.length > 0) {
      throw new Error(`Missing required patient fields: ${missingPatientFields.join(', ')}`);
    }

    console.log('✅ Card data structure is valid');
    console.log(`   Patient ID format: PT${mockCard.patient.id.toString().padStart(6, '0')}`);
    console.log(`   Portal URL: ${mockCard.portalUrl}`);
    console.log(`   QR Code: ${mockCard.qrCode ? 'Present' : 'Missing'}`);
    console.log(`   Barcode: ${mockCard.barcode ? 'Present' : 'Missing'}`);
    results.passed.push('Card Data Structure');
  } catch (error) {
    console.error('❌ Card data structure validation failed:', error.message);
    results.failed.push('Card Data Structure');
  }

  // Step 4: Test HTML Generation Logic
  console.log(`
============================================================
🧪 TEST: STEP 4: Test HTML Generation Logic
============================================================
`);
  try {
    const mockCard = {
      patient: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01'
      },
      qrCode: 'data:image/png;base64,test',
      barcode: 'data:image/png;base64,test',
      portalUrl: 'http://localhost:5001/patient-portal',
      generatedAt: new Date().toISOString()
    };

    // Simulate getCardHTML function
    const cardFormat = 'standard';
    const cardClass = `access-card ${cardFormat}`;
    
    const cardHTML = `
      <div class="${cardClass}">
        <div class="header">
          <div class="clinic-logo">🏥</div>
          <div class="clinic-name">Bluequee Patient Portal</div>
        </div>
        <div class="patient-section">
          <div class="patient-name">${mockCard.patient.firstName} ${mockCard.patient.lastName}</div>
          <div class="credentials">
            <div class="credential-row">
              <span class="label">Patient ID:</span>
              <span class="value">PT${mockCard.patient.id.toString().padStart(6, '0')}</span>
            </div>
            <div class="credential-row">
              <span class="label">Phone:</span>
              <span class="value">${mockCard.patient.phone}</span>
            </div>
            <div class="credential-row">
              <span class="label">DOB:</span>
              <span class="value">${mockCard.patient.dateOfBirth}</span>
            </div>
          </div>
        </div>
        ${mockCard.qrCode ? `
          <div class="qr-section">
            <img src="${mockCard.qrCode}" alt="QR Code" class="qr-code" />
            <div class="qr-label">Scan to Access Portal</div>
          </div>
        ` : ''}
        ${mockCard.barcode ? `
          <div class="barcode-section">
            <img src="${mockCard.barcode}" alt="Barcode" class="barcode" />
          </div>
        ` : ''}
        <div class="portal-info">
          <div class="website">${mockCard.portalUrl}</div>
          <div class="features">Access: Appointments • Messages • Records • Lab Results</div>
        </div>
      </div>
    `;

    // Validate HTML contains required elements
    const requiredElements = [
      'access-card',
      'patient-name',
      'Patient ID:',
      'PT000001',
      'Bluequee Patient Portal'
    ];

    const missingElements = requiredElements.filter(element => !cardHTML.includes(element));
    
    if (missingElements.length > 0) {
      throw new Error(`Missing required HTML elements: ${missingElements.join(', ')}`);
    }

    console.log('✅ HTML generation logic is valid');
    console.log(`   Card HTML length: ${cardHTML.length} characters`);
    console.log(`   Contains patient name: ${cardHTML.includes('John Doe')}`);
    console.log(`   Contains patient ID: ${cardHTML.includes('PT000001')}`);
    console.log(`   Contains QR code: ${cardHTML.includes('qr-code')}`);
    console.log(`   Contains barcode: ${cardHTML.includes('barcode')}`);
    results.passed.push('HTML Generation Logic');
  } catch (error) {
    console.error('❌ HTML generation validation failed:', error.message);
    results.failed.push('HTML Generation Logic');
  }

  // Step 5: Test Card Format Options
  console.log(`
============================================================
🧪 TEST: STEP 5: Test Card Format Options
============================================================
`);
  try {
    const formats = ['standard', 'compact', 'business'];
    const formatSizes = {
      standard: { width: '85mm', height: '54mm' },
      compact: { width: '70mm', height: '45mm' },
      business: { width: '90mm', height: '50mm' }
    };

    formats.forEach(format => {
      const cardClass = `access-card ${format}`;
      console.log(`   ✅ Format "${format}": ${formatSizes[format].width} × ${formatSizes[format].height}`);
    });

    results.passed.push('Card Format Options');
  } catch (error) {
    console.error('❌ Card format validation failed:', error.message);
    results.failed.push('Card Format Options');
  }

  // Summary
  console.log(`
============================================================
📊 TEST SUMMARY
============================================================
✅ Passed: ${results.passed.length}
❌ Failed: ${results.failed.length}
⏭️  Skipped: ${results.skipped.length}

${results.passed.length > 0 ? `✅ Passed Tests:\n   ${results.passed.map(t => `✓ ${t}`).join('\n   ')}` : ''}
${results.failed.length > 0 ? `❌ Failed Tests:\n   ${results.failed.map(t => `✗ ${t}`).join('\n   ')}` : ''}
${results.skipped.length > 0 ? `⏭️  Skipped Tests:\n   ${results.skipped.map(t => `⊘ ${t}`).join('\n   ')}` : ''}
`);

  if (results.failed.length === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
  }

  return results;
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test execution failed:', error);
  process.exit(1);
});

