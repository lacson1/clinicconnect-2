#!/usr/bin/env node

/**
 * Test script for Patient Portal functionality
 * Tests all patient portal endpoints
 */

import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';

let patientToken = '';
let patientData = null;

console.log(`
============================================================
🧪 PATIENT PORTAL FUNCTIONALITY TEST
============================================================
Testing against: ${BASE_URL}
`);

// Helper function for authenticated requests
async function authenticatedRequest(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': patientToken ? `Bearer ${patientToken}` : '',
      },
      ...(data && { data }),
    };

    const response = await axios(config);
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

  // Step 1: Admin Login (to get patients)
  console.log(`
============================================================
🧪 TEST: STEP 1: Admin Login (to get test patient)
============================================================
`);
  let adminSession = '';
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    }, {
      withCredentials: true
    });
    
    if (loginResponse.headers['set-cookie']) {
      adminSession = loginResponse.headers['set-cookie'][0].split(';')[0];
    }
    console.log('✅ Admin login successful');
  } catch (error) {
    console.error('❌ Admin login failed:', error.message);
    results.failed.push('Admin Login');
    return results;
  }

  // Step 2: Get a patient for testing
  console.log(`
============================================================
🧪 TEST: STEP 2: Get Test Patient
============================================================
`);
  try {
    const response = await axios.get(`${BASE_URL}/api/patients`, {
      headers: {
        Cookie: adminSession
      },
      withCredentials: true
    });
    const patients = response.data;
    
    if (patients.length === 0) {
      console.log('⚠️  No patients found. Cannot test login.');
      results.skipped.push('Patient Login (no patients)');
      console.log('\n⏭️  Skipping remaining tests - no patients available.');
      return results;
    }

    patientData = patients[0];
    console.log(`✅ Found test patient: ${patientData.firstName} ${patientData.lastName} (ID: ${patientData.id})`);
    console.log(`   Phone: ${patientData.phone || 'N/A'}`);
    console.log(`   DOB: ${patientData.dateOfBirth || 'N/A'}`);
    results.passed.push('Get Test Patient');
  } catch (error) {
    console.error('❌ Failed to get patients:', error.message);
    results.failed.push('Get Test Patient');
    return results;
  }

  // Step 3: Patient Login
  console.log(`
============================================================
🧪 TEST: STEP 3: Patient Login
============================================================
`);
  try {
    if (!patientData.phone || !patientData.dateOfBirth) {
      throw new Error('Patient missing phone or dateOfBirth');
    }

    const loginResponse = await axios.post(`${BASE_URL}/api/patient-auth/login`, {
      patientId: patientData.id.toString(),
      phone: patientData.phone,
      dateOfBirth: patientData.dateOfBirth
    });

    if (loginResponse.data.token) {
      patientToken = loginResponse.data.token;
      console.log('✅ Login successful');
      console.log(`   Token received: ${patientToken.substring(0, 20)}...`);
      console.log(`   Patient data: ${loginResponse.data.patient.firstName} ${loginResponse.data.patient.lastName}`);
      results.passed.push('Patient Login');
    } else {
      throw new Error('No token received');
    }
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    results.failed.push('Patient Login');
    console.log('\n❌ Cannot proceed without login. Exiting tests.');
    return results;
  }

  // Step 4: Get Patient Profile
  console.log(`
============================================================
🧪 TEST: STEP 4: Get Patient Profile
============================================================
`);
  try {
    const profile = await authenticatedRequest('/api/patient-portal/profile');
    console.log('✅ Profile retrieved successfully');
    console.log(`   Name: ${profile.firstName} ${profile.lastName}`);
    results.passed.push('Get Patient Profile');
  } catch (error) {
    console.error('❌ Failed to get profile:', error.message);
    results.failed.push('Get Patient Profile');
  }

  // Step 5: Get Appointments
  console.log(`
============================================================
🧪 TEST: STEP 5: Get Appointments
============================================================
`);
  try {
    const appointments = await authenticatedRequest('/api/patient-portal/appointments');
    console.log(`✅ Appointments retrieved: ${appointments.length} appointments`);
    results.passed.push('Get Appointments');
  } catch (error) {
    console.error('❌ Failed to get appointments:', error.message);
    results.failed.push('Get Appointments');
  }

  // Step 6: Create Appointment Request
  console.log(`
============================================================
🧪 TEST: STEP 6: Create Appointment Request
============================================================
`);
  try {
    const appointmentRequest = await authenticatedRequest('/api/patient-portal/appointment-requests', 'POST', {
      type: 'consultation',
      preferredDate: '2024-12-25',
      preferredTime: '10:00',
      reason: 'Test appointment request',
      urgency: 'routine'
    });
    console.log('✅ Appointment request created successfully');
    console.log(`   Request ID: ${appointmentRequest.id}`);
    console.log(`   Status: ${appointmentRequest.status}`);
    results.passed.push('Create Appointment Request');
  } catch (error) {
    console.error('❌ Failed to create appointment request:', error.message);
    results.failed.push('Create Appointment Request');
  }

  // Step 7: Get Prescriptions
  console.log(`
============================================================
🧪 TEST: STEP 7: Get Prescriptions
============================================================
`);
  try {
    const prescriptions = await authenticatedRequest('/api/patient-portal/prescriptions');
    console.log(`✅ Prescriptions retrieved: ${prescriptions.length} prescriptions`);
    results.passed.push('Get Prescriptions');
  } catch (error) {
    console.error('❌ Failed to get prescriptions:', error.message);
    results.failed.push('Get Prescriptions');
  }

  // Step 8: Get Lab Results
  console.log(`
============================================================
🧪 TEST: STEP 8: Get Lab Results
============================================================
`);
  try {
    const labResults = await authenticatedRequest('/api/patient-portal/lab-results');
    console.log(`✅ Lab results retrieved: ${labResults.length} results`);
    results.passed.push('Get Lab Results');
  } catch (error) {
    console.error('❌ Failed to get lab results:', error.message);
    results.failed.push('Get Lab Results');
  }

  // Step 9: Get Medical Records
  console.log(`
============================================================
🧪 TEST: STEP 9: Get Medical Records
============================================================
`);
  try {
    const medicalRecords = await authenticatedRequest('/api/patient-portal/medical-records');
    console.log(`✅ Medical records retrieved: ${medicalRecords.length} records`);
    results.passed.push('Get Medical Records');
  } catch (error) {
    console.error('❌ Failed to get medical records:', error.message);
    results.failed.push('Get Medical Records');
  }

  // Step 10: Get Messages
  console.log(`
============================================================
🧪 TEST: STEP 10: Get Messages
============================================================
`);
  try {
    const messages = await authenticatedRequest('/api/patient-portal/messages');
    console.log(`✅ Messages retrieved: ${messages.length} messages`);
    results.passed.push('Get Messages');
  } catch (error) {
    console.error('❌ Failed to get messages:', error.message);
    results.failed.push('Get Messages');
  }

  // Step 11: Send Message
  console.log(`
============================================================
🧪 TEST: STEP 11: Send Message
============================================================
`);
  try {
    const messageResponse = await authenticatedRequest('/api/patient-portal/messages', 'POST', {
      subject: 'Test Message',
      message: 'This is a test message from the patient portal',
      category: 'general',
      targetOrganizationId: 1
    });
    console.log('✅ Message sent successfully');
    results.passed.push('Send Message');
  } catch (error) {
    console.error('❌ Failed to send message:', error.message);
    results.failed.push('Send Message');
  }

  // Step 12: Logout
  console.log(`
============================================================
🧪 TEST: STEP 12: Logout
============================================================
`);
  try {
    await axios.post(`${BASE_URL}/api/patient-auth/logout`);
    console.log('✅ Logout successful');
    results.passed.push('Logout');
  } catch (error) {
    console.error('❌ Logout failed:', error.message);
    results.failed.push('Logout');
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
    console.log('🎉 All tests passed! Patient portal is functional.');
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

