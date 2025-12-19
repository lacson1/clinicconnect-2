#!/usr/bin/env node

/**
 * Test Vital Signs Recording
 * 
 * Tests the vital signs recording endpoint to verify the fix works correctly
 * 
 * Usage: node test-vital-signs.mjs [username] [password] [patientId]
 */

import 'dotenv/config';
import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:5001';
const API_BASE = `${BASE_URL}/api`;

// Test state
let sessionCookie = null;
let userId = null;
let organizationId = null;
let patientId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🧪 TEST: ${testName}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logStep(stepNum, message) {
  log(`\n[Step ${stepNum}] ${message}`, 'magenta');
}

// Axios instance with cookie support
const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to make authenticated requests
async function apiRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: endpoint,
      ...(data && { data }),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (sessionCookie) {
      config.headers['Cookie'] = sessionCookie;
    }

    const response = await axiosInstance(config);
    
    // Extract cookies from response if present
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader && Array.isArray(setCookieHeader)) {
      const sessionCookieHeader = setCookieHeader.find(c => 
        c.includes('clinic.session.id') || c.includes('connect.sid')
      );
      if (sessionCookieHeader) {
        sessionCookie = sessionCookieHeader.split(';')[0];
      }
    }
    
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    const errorData = error.response?.data || error.message;
    const status = error.response?.status || 500;
    
    return {
      success: false,
      error: errorData,
      status: status,
    };
  }
}

// ============================================================================
// STEP 1: Login
// ============================================================================
async function step1_Login(username, password) {
  logTest('STEP 1: Login');
  
  try {
    const response = await axiosInstance.post('/auth/login', {
      username,
      password,
    });

    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader && Array.isArray(setCookieHeader)) {
      const sessionCookieHeader = setCookieHeader.find(c => 
        c.includes('clinic.session.id') || c.includes('connect.sid')
      );
      if (sessionCookieHeader) {
        sessionCookie = sessionCookieHeader.split(';')[0];
        logInfo(`Session cookie extracted`);
      }
    }

    if (response.data?.data?.user) {
      const user = response.data.data.user;
      userId = user.id;
      organizationId = user.organizationId || user.organization?.id;
      
      logSuccess(`Logged in as ${username} (${user.role})`);
      logInfo(`User ID: ${userId}`);
      logInfo(`Organization ID: ${organizationId}`);
      return true;
    } else {
      logError(`Login response missing user data`);
      return false;
    }
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// ============================================================================
// STEP 2: Get or Create Test Patient
// ============================================================================
async function step2_GetOrCreatePatient(providedPatientId) {
  logTest('STEP 2: Get or Create Test Patient');
  
  if (providedPatientId) {
    logStep(1, `Using provided patient ID: ${providedPatientId}`);
    patientId = parseInt(providedPatientId);
    
    // Verify patient exists
    const result = await apiRequest('GET', `/patients/${patientId}`);
    if (result.success) {
      logSuccess(`Patient found: ${result.data.firstName} ${result.data.lastName}`);
      logInfo(`Patient ID: ${patientId}`);
      logInfo(`Patient Organization ID: ${result.data.organizationId}`);
      
      if (result.data.organizationId !== organizationId) {
        logError(`Patient belongs to different organization!`);
        return false;
      }
      
      return true;
    } else {
      logError(`Patient not found: ${result.error?.message || result.error}`);
      return false;
    }
  }
  
  // Create a test patient
  logStep(1, 'Creating test patient');
  const patientData = {
    firstName: 'Test',
    lastName: `Patient-${Date.now()}`,
    dateOfBirth: '1990-01-01',
    gender: 'male',
    phone: `555${Math.floor(Math.random() * 10000000)}`,
    organizationId: organizationId,
  };
  
  const result = await apiRequest('POST', '/patients', patientData);
  
  if (result.success) {
    patientId = result.data.id;
    logSuccess(`Test patient created successfully!`);
    logInfo(`Patient ID: ${patientId}`);
    logInfo(`Name: ${result.data.firstName} ${result.data.lastName}`);
    return true;
  } else {
    logError(`Failed to create patient: ${result.error?.message || JSON.stringify(result.error)}`);
    return false;
  }
}

// ============================================================================
// STEP 3: Record Vital Signs
// ============================================================================
async function step3_RecordVitalSigns() {
  logTest('STEP 3: Record Vital Signs');
  
  if (!patientId) {
    logError('No patient ID available. Cannot record vital signs.');
    return null;
  }
  
  logStep(1, `Recording vital signs for patient ID: ${patientId}`);
  
  const vitalSignsData = {
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    heartRate: 72,
    temperature: 36.5,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    weight: 70.5,
    height: 175.0
  };
  
  logInfo('Vital signs data:');
  log(`  Blood Pressure: ${vitalSignsData.bloodPressureSystolic}/${vitalSignsData.bloodPressureDiastolic}`, 'blue');
  log(`  Heart Rate: ${vitalSignsData.heartRate} bpm`, 'blue');
  log(`  Temperature: ${vitalSignsData.temperature}°C`, 'blue');
  log(`  Respiratory Rate: ${vitalSignsData.respiratoryRate}`, 'blue');
  log(`  Oxygen Saturation: ${vitalSignsData.oxygenSaturation}%`, 'blue');
  log(`  Weight: ${vitalSignsData.weight} kg`, 'blue');
  log(`  Height: ${vitalSignsData.height} cm`, 'blue');
  
  const result = await apiRequest('POST', `/patients/${patientId}/vitals`, vitalSignsData);
  
  if (result.success) {
    logSuccess(`Vital signs recorded successfully!`);
    logInfo(`Vital Signs ID: ${result.data.id}`);
    logInfo(`Recorded At: ${result.data.recordedAt}`);
    logInfo(`Recorded By: ${result.data.recordedBy}`);
    logInfo(`Organization ID: ${result.data.organizationId || 'N/A'}`);
    
    if (result.data.organizationId) {
      logSuccess(`✅ Organization ID correctly set: ${result.data.organizationId}`);
    } else {
      logError(`❌ Organization ID missing in response!`);
    }
    
    return result.data;
  } else {
    logError(`Failed to record vital signs: ${result.error?.message || JSON.stringify(result.error)}`);
    if (result.error?.error) {
      logInfo(`Error details: ${JSON.stringify(result.error.error, null, 2)}`);
    }
    return null;
  }
}

// ============================================================================
// STEP 4: Verify Vital Signs Were Saved
// ============================================================================
async function step4_VerifyVitalSigns() {
  logTest('STEP 4: Verify Vital Signs Were Saved');
  
  if (!patientId) {
    logError('No patient ID available. Cannot verify vital signs.');
    return null;
  }
  
  logStep(1, `Fetching vital signs for patient ID: ${patientId}`);
  
  const result = await apiRequest('GET', `/patients/${patientId}/vitals`);
  
  if (result.success) {
    const vitals = result.data;
    logSuccess(`Retrieved ${vitals.length} vital signs record(s)`);
    
    if (vitals.length > 0) {
      const latest = vitals[0];
      logInfo('\nLatest vital signs:');
      log(`  ID: ${latest.id}`, 'blue');
      log(`  Blood Pressure: ${latest.bloodPressureSystolic}/${latest.bloodPressureDiastolic}`, 'blue');
      log(`  Heart Rate: ${latest.heartRate} bpm`, 'blue');
      log(`  Temperature: ${latest.temperature}°C`, 'blue');
      log(`  Recorded At: ${latest.recordedAt}`, 'blue');
      log(`  Organization ID: ${latest.organizationId || 'N/A'}`, 'blue');
      
      if (latest.organizationId) {
        logSuccess(`✅ Organization ID present: ${latest.organizationId}`);
        if (latest.organizationId === organizationId) {
          logSuccess(`✅ Organization ID matches user's organization`);
        } else {
          logError(`❌ Organization ID mismatch! Expected ${organizationId}, got ${latest.organizationId}`);
        }
      } else {
        logError(`❌ Organization ID missing in vital signs record!`);
      }
    } else {
      logError(`No vital signs found for patient ${patientId}`);
    }
    
    return vitals;
  } else {
    logError(`Failed to fetch vital signs: ${result.error?.message || result.error}`);
    return null;
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================
async function runAllTests() {
  const args = process.argv.slice(2);
  const username = args[0] || process.env.TEST_USERNAME || 'admin';
  const password = args[1] || process.env.TEST_PASSWORD || 'admin123';
  const providedPatientId = args[2];
  
  log('\n' + '='.repeat(60), 'cyan');
  log('🧪 VITAL SIGNS RECORDING TEST', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`\nTesting against: ${BASE_URL}`, 'blue');
  log(`Username: ${username}`, 'blue');
  if (providedPatientId) {
    log(`Patient ID: ${providedPatientId}`, 'blue');
  }
  log('');
  
  try {
    // Step 1: Login
    const loginSuccess = await step1_Login(username, password);
    if (!loginSuccess) {
      logError('\n❌ Login failed. Cannot proceed with tests.');
      process.exit(1);
    }
    
    // Step 2: Get or create patient
    const patientSuccess = await step2_GetOrCreatePatient(providedPatientId);
    if (!patientSuccess) {
      logError('\n❌ Patient setup failed. Cannot proceed with tests.');
      process.exit(1);
    }
    
    // Step 3: Record vital signs
    const recordSuccess = await step3_RecordVitalSigns();
    if (!recordSuccess) {
      logError('\n❌ Vital signs recording failed!');
      process.exit(1);
    }
    
    // Step 4: Verify vital signs
    await step4_VerifyVitalSigns();
    
    // Final summary
    log('\n' + '='.repeat(60), 'green');
    log('✅ ALL TESTS PASSED!', 'green');
    log('='.repeat(60), 'green');
    log('\n✅ Vital signs recording is working correctly!', 'green');
    log(`✅ Organization ID is properly set: ${organizationId}`, 'green');
    
  } catch (error) {
    logError(`\n❌ Test suite failed with error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
runAllTests();

