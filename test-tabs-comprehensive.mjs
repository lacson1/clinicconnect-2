#!/usr/bin/env node

/**
 * Comprehensive Tab Functions Test Script
 * 
 * This script tests all tab management functionality step by step:
 * - List tabs
 * - Create custom tabs
 * - Update tabs
 * - Toggle visibility
 * - Reorder tabs
 * - Delete tabs
 * - Reset tabs
 * - List presets
 * - Preview presets
 * - Apply presets
 * 
 * Usage: node test-tabs-comprehensive.mjs [username] [password]
 */

import 'dotenv/config';
import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:5001';
const API_BASE = `${BASE_URL}/api`;

// Test state
let sessionCookie = null;
let userId = null;
let organizationId = null;
let roleId = null;
let createdTabId = null;
let systemTabId = null;
let presetId = null;

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

    // Add session cookie if available
    if (sessionCookie) {
      config.headers['Cookie'] = sessionCookie;
    }

    const response = await axiosInstance(config);
    
    // Extract cookies from response if present
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader && Array.isArray(setCookieHeader)) {
      const sessionCookieHeader = setCookieHeader.find(c => c.includes('clinic.session.id') || c.includes('connect.sid'));
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
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Extract session cookie
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
      roleId = user.roleId;
      
      logSuccess(`Logged in as ${username} (${user.role})`);
      logInfo(`User ID: ${userId}`);
      logInfo(`Organization ID: ${organizationId}`);
      logInfo(`Role ID: ${roleId || 'N/A'}`);
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
// STEP 2: Get All Tabs
// ============================================================================
async function step2_GetAllTabs() {
  logTest('STEP 2: Get All Tabs');
  
  const result = await apiRequest('GET', '/tab-configs');
  
  if (result.success) {
    const tabs = result.data;
    logSuccess(`Retrieved ${tabs.length} tabs`);
    
    // Display tab summary
    logInfo('\nTab Summary:');
    tabs.forEach((tab, index) => {
      const scope = tab.scope || 'unknown';
      const visible = tab.isVisible ? '👁️' : '🚫';
      log(`  ${index + 1}. [${scope}] ${tab.label} ${visible} (Order: ${tab.displayOrder})`, 'blue');
      
      // Store first system tab ID for later tests
      if (!systemTabId && tab.isSystemDefault) {
        systemTabId = tab.id;
      }
    });
    
    return tabs;
  } else {
    logError(`Failed to get tabs: ${result.error?.error || result.error}`);
    return null;
  }
}

// ============================================================================
// STEP 3: Create Custom Tab
// ============================================================================
async function step3_CreateCustomTab() {
  logTest('STEP 3: Create Custom Tab');
  
  const tabData = {
    scope: 'user',
    key: `test-tab-${Date.now()}`,
    label: 'Test Custom Tab',
    icon: 'FileText',
    contentType: 'markdown',
    settings: {
      markdown: '# Test Custom Tab\n\nThis is a test custom tab created by the test script.'
    },
    isVisible: true,
    displayOrder: 1000,
    isSystemDefault: false,
    isMandatory: false,
  };
  
  logStep(1, `Creating tab with label: "${tabData.label}"`);
  
  const result = await apiRequest('POST', '/tab-configs', tabData);
  
  if (result.success) {
    createdTabId = result.data.id;
    logSuccess(`Custom tab created successfully!`);
    logInfo(`Tab ID: ${createdTabId}`);
    logInfo(`Tab Key: ${result.data.key}`);
    logInfo(`Tab Label: ${result.data.label}`);
    logInfo(`Tab Icon: ${result.data.icon}`);
    logInfo(`Tab Scope: ${result.data.scope}`);
    return result.data;
  } else {
    logError(`Failed to create tab: ${result.error?.error || result.error?.message || JSON.stringify(result.error)}`);
    if (result.error?.details) {
      logInfo(`Details: ${JSON.stringify(result.error.details, null, 2)}`);
    }
    return null;
  }
}

// ============================================================================
// STEP 4: Update Custom Tab
// ============================================================================
async function step4_UpdateCustomTab() {
  logTest('STEP 4: Update Custom Tab');
  
  if (!createdTabId) {
    logError('No custom tab ID available. Skipping update test.');
    return null;
  }
  
  const updateData = {
    label: 'Updated Test Tab',
    icon: 'Settings2',
    isVisible: true,
    settings: {
      markdown: '# Updated Test Custom Tab\n\nThis tab has been updated!'
    }
  };
  
  logStep(1, `Updating tab ID: ${createdTabId}`);
  logStep(2, `New label: "${updateData.label}"`);
  logStep(3, `New icon: ${updateData.icon}`);
  
  const result = await apiRequest('PATCH', `/tab-configs/${createdTabId}`, updateData);
  
  if (result.success) {
    logSuccess(`Tab updated successfully!`);
    logInfo(`Updated Label: ${result.data.label}`);
    logInfo(`Updated Icon: ${result.data.icon}`);
    return result.data;
  } else {
    logError(`Failed to update tab: ${result.error?.error || result.error}`);
    return null;
  }
}

// ============================================================================
// STEP 5: Toggle Tab Visibility
// ============================================================================
async function step5_ToggleVisibility() {
  logTest('STEP 5: Toggle Tab Visibility');
  
  if (!createdTabId) {
    logError('No custom tab ID available. Skipping visibility test.');
    return null;
  }
  
  // Test 1: Hide the tab
  logStep(1, `Hiding tab ID: ${createdTabId}`);
  let result = await apiRequest('PATCH', `/tab-configs/${createdTabId}/visibility`, {
    isVisible: false,
    scope: 'user'
  });
  
  if (result.success) {
    logSuccess(`Tab hidden successfully!`);
    logInfo(`Visibility: ${result.data.isVisible}`);
  } else {
    logError(`Failed to hide tab: ${result.error?.error || result.error}`);
    return null;
  }
  
  // Verify it's hidden by fetching all tabs
  logStep(2, 'Verifying tab is hidden');
  const allTabs = await apiRequest('GET', '/tab-configs');
  if (allTabs.success) {
    const hiddenTab = allTabs.data.find(t => t.id === createdTabId);
    if (hiddenTab && !hiddenTab.isVisible) {
      logSuccess('Tab is confirmed hidden');
    } else {
      logInfo('Tab visibility status: ' + (hiddenTab?.isVisible ? 'visible' : 'hidden'));
    }
  }
  
  // Test 2: Show the tab again
  logStep(3, `Showing tab ID: ${createdTabId}`);
  result = await apiRequest('PATCH', `/tab-configs/${createdTabId}/visibility`, {
    isVisible: true,
    scope: 'user'
  });
  
  if (result.success) {
    logSuccess(`Tab shown successfully!`);
    logInfo(`Visibility: ${result.data.isVisible}`);
    return result.data;
  } else {
    logError(`Failed to show tab: ${result.error?.error || result.error}`);
    return null;
  }
}

// ============================================================================
// STEP 6: Test System Tab Visibility (Create Override)
// ============================================================================
async function step6_ToggleSystemTabVisibility() {
  logTest('STEP 6: Toggle System Tab Visibility (Create Override)');
  
  if (!systemTabId) {
    logError('No system tab ID available. Skipping system tab visibility test.');
    return null;
  }
  
  logStep(1, `Hiding system tab ID: ${systemTabId} (creates user override)`);
  
  const result = await apiRequest('PATCH', `/tab-configs/${systemTabId}/visibility`, {
    isVisible: false,
    scope: 'user'
  });
  
  if (result.success) {
    logSuccess(`System tab override created successfully!`);
    logInfo(`Override Tab ID: ${result.data.id}`);
    logInfo(`Visibility: ${result.data.isVisible}`);
    logInfo(`Scope: ${result.data.scope}`);
    logInfo('Note: This creates a user-level override, not modifying the system tab itself');
    return result.data;
  } else {
    logError(`Failed to create override: ${result.error?.error || result.error?.message || result.error}`);
    return null;
  }
}

// ============================================================================
// STEP 7: Reorder Tabs
// ============================================================================
async function step7_ReorderTabs() {
  logTest('STEP 7: Reorder Tabs');
  
  // First, get all tabs
  logStep(1, 'Fetching current tabs');
  const tabsResult = await apiRequest('GET', '/tab-configs');
  
  if (!tabsResult.success) {
    logError('Failed to fetch tabs for reordering');
    return null;
  }
  
  // Filter to only custom tabs (can't reorder system tabs)
  const customTabs = tabsResult.data.filter(t => !t.isSystemDefault && t.scope === 'user');
  
  if (customTabs.length < 2) {
    logInfo('Need at least 2 custom tabs to test reordering.');
    logInfo(`Found ${customTabs.length} custom tabs. Skipping reorder test.`);
    return null;
  }
  
  logStep(2, `Reordering ${customTabs.length} custom tabs`);
  
  // Reverse the order
  const reorderData = {
    tabs: customTabs.map((tab, index) => ({
      id: tab.id,
      displayOrder: (customTabs.length - index) * 10
    }))
  };
  
  logInfo('Original order:');
  customTabs.forEach((tab, i) => {
    log(`  ${i + 1}. ${tab.label} (Order: ${tab.displayOrder})`, 'blue');
  });
  
  logInfo('New order:');
  reorderData.tabs.forEach((tab, i) => {
    const tabLabel = customTabs.find(t => t.id === tab.id)?.label || 'Unknown';
    log(`  ${i + 1}. ${tabLabel} (Order: ${tab.displayOrder})`, 'blue');
  });
  
  const result = await apiRequest('PATCH', '/tab-configs/reorder', reorderData);
  
  if (result.success) {
    logSuccess(`Tabs reordered successfully!`);
    logInfo(`Updated ${result.data.count} tabs`);
    
    // Verify the new order
    logStep(3, 'Verifying new order');
    const verifyResult = await apiRequest('GET', '/tab-configs');
    if (verifyResult.success) {
      const reorderedTabs = verifyResult.data.filter(t => 
        customTabs.some(ct => ct.id === t.id)
      ).sort((a, b) => a.displayOrder - b.displayOrder);
      
      logInfo('Verified order:');
      reorderedTabs.forEach((tab, i) => {
        log(`  ${i + 1}. ${tab.label} (Order: ${tab.displayOrder})`, 'green');
      });
    }
    
    return result.data;
  } else {
    logError(`Failed to reorder tabs: ${result.error?.error || result.error}`);
    return null;
  }
}

// ============================================================================
// STEP 8: Get Tab Presets
// ============================================================================
async function step8_GetPresets() {
  logTest('STEP 8: Get Tab Presets');
  
  const result = await apiRequest('GET', '/tab-presets');
  
  if (result.success) {
    const presets = result.data;
    logSuccess(`Retrieved ${presets.length} presets`);
    
    logInfo('\nPreset Summary:');
    presets.forEach((preset, index) => {
      const defaultBadge = preset.isDefault ? ' (Default)' : '';
      log(`  ${index + 1}. ${preset.name}${defaultBadge}`, 'blue');
      log(`     Scope: ${preset.scope}`, 'blue');
      if (preset.description) {
        log(`     Description: ${preset.description}`, 'blue');
      }
      
      // Store first preset ID for later tests
      if (!presetId) {
        presetId = preset.id;
      }
    });
    
    return presets;
  } else {
    logError(`Failed to get presets: ${result.error?.error || result.error}`);
    return null;
  }
}

// ============================================================================
// STEP 9: Preview Preset
// ============================================================================
async function step9_PreviewPreset() {
  logTest('STEP 9: Preview Preset');
  
  if (!presetId) {
    logError('No preset ID available. Skipping preview test.');
    return null;
  }
  
  logStep(1, `Previewing preset ID: ${presetId}`);
  
  const result = await apiRequest('GET', `/tab-presets/${presetId}/preview?targetScope=user`);
  
  if (result.success) {
    logSuccess(`Preset preview generated successfully!`);
    logInfo(`Preset: ${result.data.preset.name}`);
    logInfo(`Current tabs: ${result.data.current.length}`);
    logInfo(`Preview tabs: ${result.data.preview.length}`);
    
    if (result.data.diff) {
      logInfo(`\nChanges preview:`);
      if (result.data.diff.added?.length > 0) {
        log(`  Added: ${result.data.diff.added.length} tabs`, 'green');
      }
      if (result.data.diff.removed?.length > 0) {
        log(`  Removed: ${result.data.diff.removed.length} tabs`, 'red');
      }
      if (result.data.diff.modified?.length > 0) {
        log(`  Modified: ${result.data.diff.modified.length} tabs`, 'yellow');
      }
    }
    
    return result.data;
  } else {
    logError(`Failed to preview preset: ${result.error?.error || result.error}`);
    return null;
  }
}

// ============================================================================
// STEP 10: Apply Preset
// ============================================================================
async function step10_ApplyPreset() {
  logTest('STEP 10: Apply Preset');
  
  if (!presetId) {
    logError('No preset ID available. Skipping apply test.');
    return null;
  }
  
  logStep(1, `Applying preset ID: ${presetId} to user scope`);
  
  const result = await apiRequest('POST', `/tab-presets/${presetId}/apply`, {
    targetScope: 'user'
  });
  
  if (result.success) {
    logSuccess(`Preset applied successfully!`);
    logInfo(`Preset: ${result.data.preset}`);
    logInfo(`Applied tabs: ${result.data.tabs.length}`);
    
    logInfo('\nApplied tabs:');
    result.data.tabs.forEach((tab, index) => {
      log(`  ${index + 1}. ${tab.label} (Order: ${tab.displayOrder})`, 'green');
    });
    
    return result.data;
  } else {
    logError(`Failed to apply preset: ${result.error?.error || result.error}`);
    return null;
  }
}

// ============================================================================
// STEP 11: Reset Tabs
// ============================================================================
async function step11_ResetTabs() {
  logTest('STEP 11: Reset Tabs to Defaults');
  
  logStep(1, 'Resetting user-level tab overrides');
  
  // DELETE with body needs special handling
  try {
    const config = {
      method: 'DELETE',
      url: '/tab-configs/reset',
      data: { scope: 'user' },
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (sessionCookie) {
      config.headers['Cookie'] = sessionCookie;
    }
    
    const response = await axiosInstance(config);
    const result = { success: true, data: response.data, status: response.status };
    
    if (result.success) {
      logSuccess(`Tabs reset successfully!`);
      logInfo(`Deleted ${result.data.deletedCount} overrides`);
      logInfo(`Scope: ${result.data.scope}`);
      
      // Verify reset by fetching tabs
      logStep(2, 'Verifying reset');
      const verifyResult = await apiRequest('GET', '/tab-configs');
      if (verifyResult.success) {
        const userTabs = verifyResult.data.filter(t => t.scope === 'user' && !t.isSystemDefault);
        logInfo(`Remaining user tabs: ${userTabs.length}`);
        
        if (userTabs.length === 0) {
          logSuccess('All user overrides removed - back to system defaults');
        }
      }
      
      return result.data;
    } else {
      logError(`Failed to reset tabs: ${result.error?.error || result.error}`);
      return null;
    }
  } catch (error) {
    logError(`Failed to reset tabs: ${error.response?.data?.error || error.message}`);
    return null;
  }
  
  if (result.success) {
    logSuccess(`Tabs reset successfully!`);
    logInfo(`Deleted ${result.data.deletedCount} overrides`);
    logInfo(`Scope: ${result.data.scope}`);
    
    // Verify reset by fetching tabs
    logStep(2, 'Verifying reset');
    const verifyResult = await apiRequest('GET', '/tab-configs');
    if (verifyResult.success) {
      const userTabs = verifyResult.data.filter(t => t.scope === 'user' && !t.isSystemDefault);
      logInfo(`Remaining user tabs: ${userTabs.length}`);
      
      if (userTabs.length === 0) {
        logSuccess('All user overrides removed - back to system defaults');
      }
    }
    
    return result.data;
  } else {
    logError(`Failed to reset tabs: ${result.error?.error || result.error}`);
    return null;
  }
}

// ============================================================================
// STEP 12: Delete Custom Tab
// ============================================================================
async function step12_DeleteCustomTab() {
  logTest('STEP 12: Delete Custom Tab');
  
  if (!createdTabId) {
    logError('No custom tab ID available. Skipping delete test.');
    return null;
  }
  
  logStep(1, `Deleting tab ID: ${createdTabId}`);
  
  const result = await apiRequest('DELETE', `/tab-configs/${createdTabId}`);
  
  if (result.success) {
    logSuccess(`Tab deleted successfully!`);
    logInfo(`Message: ${result.data.message}`);
    
    // Verify deletion
    logStep(2, 'Verifying deletion');
    const verifyResult = await apiRequest('GET', '/tab-configs');
    if (verifyResult.success) {
      const deletedTab = verifyResult.data.find(t => t.id === createdTabId);
      if (!deletedTab) {
        logSuccess('Tab confirmed deleted');
      } else {
        logError('Tab still exists!');
      }
    }
    
    return result.data;
  } else {
    logError(`Failed to delete tab: ${result.error?.error || result.error}`);
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
  
  log('\n' + '='.repeat(60), 'cyan');
  log('🧪 COMPREHENSIVE TAB FUNCTIONS TEST SUITE', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`\nTesting against: ${BASE_URL}`, 'blue');
  log(`Username: ${username}\n`, 'blue');
  
  try {
    // Step 1: Login
    const loginSuccess = await step1_Login(username, password);
    if (!loginSuccess) {
      logError('\n❌ Login failed. Cannot proceed with tests.');
      process.exit(1);
    }
    
    // Step 2: Get all tabs
    await step2_GetAllTabs();
    
    // Step 3: Create custom tab
    await step3_CreateCustomTab();
    
    // Step 4: Update custom tab
    await step4_UpdateCustomTab();
    
    // Step 5: Toggle visibility
    await step5_ToggleVisibility();
    
    // Step 6: Toggle system tab visibility
    await step6_ToggleSystemTabVisibility();
    
    // Step 7: Reorder tabs
    await step7_ReorderTabs();
    
    // Step 8: Get presets
    await step8_GetPresets();
    
    // Step 9: Preview preset
    await step9_PreviewPreset();
    
    // Step 10: Apply preset
    await step10_ApplyPreset();
    
    // Step 11: Reset tabs
    await step11_ResetTabs();
    
    // Step 12: Delete custom tab (cleanup)
    await step12_DeleteCustomTab();
    
    // Final summary
    log('\n' + '='.repeat(60), 'green');
    log('✅ ALL TESTS COMPLETED!', 'green');
    log('='.repeat(60), 'green');
    
  } catch (error) {
    logError(`\n❌ Test suite failed with error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
runAllTests();

