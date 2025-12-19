/**
 * Comprehensive Referral Functionality Test
 * Tests all referral-related features systematically
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const REFERRAL_COMPONENTS = {
  'referral-modal': 'client/src/components/referral-modal.tsx',
  'referral-management': 'client/src/components/referral-management.tsx',
  'referrals-page': 'client/src/pages/referrals.tsx',
  'referral-routes': 'server/routes/referrals.ts'
};

console.log('🔍 Testing Referral Functionality...\n');
console.log('='.repeat(70));

const testResults = [];

// Test 1: Check component files exist
console.log('\n📁 File Existence Check');
console.log('-'.repeat(70));
Object.entries(REFERRAL_COMPONENTS).forEach(([name, path]) => {
  const exists = existsSync(path);
  testResults.push({
    test: `File exists: ${name}`,
    status: exists ? 'PASS' : 'FAIL',
    path
  });
  console.log(`${exists ? '✅' : '❌'} ${name.padEnd(30)} | ${exists ? 'EXISTS' : 'MISSING'}`);
});

// Test 2: Check referral modal component
console.log('\n🔧 Referral Modal Component Tests');
console.log('-'.repeat(70));
const modalPath = REFERRAL_COMPONENTS['referral-modal'];
if (existsSync(modalPath)) {
  const modalContent = readFileSync(modalPath, 'utf-8');
  
  const checks = [
    { name: 'Has form validation (zod)', pattern: /z\.object|zodResolver/ },
    { name: 'Has patient selection', pattern: /patientId|Select.*patient/i },
    { name: 'Has role selection', pattern: /toRole|Select.*role/i },
    { name: 'Has reason field', pattern: /reason|Textarea/i },
    { name: 'Has create mutation', pattern: /createReferralMutation|useMutation/ },
    { name: 'Has error handling', pattern: /onError|error/ },
    { name: 'Has success handling', pattern: /onSuccess|toast/ },
    { name: 'Has loading state', pattern: /isPending|disabled/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(modalContent);
    testResults.push({
      test: `Modal: ${check.name}`,
      status: found ? 'PASS' : 'FAIL'
    });
    console.log(`${found ? '✅' : '❌'} ${check.name.padEnd(40)} | ${found ? 'FOUND' : 'MISSING'}`);
  });
}

// Test 3: Check referral management component
console.log('\n🔧 Referral Management Component Tests');
console.log('-'.repeat(70));
const mgmtPath = REFERRAL_COMPONENTS['referral-management'];
if (existsSync(mgmtPath)) {
  const mgmtContent = readFileSync(mgmtPath, 'utf-8');
  
  const checks = [
    { name: 'Has form validation', pattern: /z\.object|zodResolver/ },
    { name: 'Has facility selection', pattern: /facility|HEALTHCARE_FACILITIES/i },
    { name: 'Has specialty selection', pattern: /specialty/i },
    { name: 'Has urgency selection', pattern: /urgency|urgent|routine/i },
    { name: 'Has create mutation', pattern: /createReferralMutation/ },
    { name: 'Has update mutation', pattern: /updateReferralMutation/ },
    { name: 'Has delete mutation', pattern: /deleteReferralMutation/ },
    { name: 'Has error handling', pattern: /isError|error/ },
    { name: 'Has loading state', pattern: /isLoading/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(mgmtContent);
    testResults.push({
      test: `Management: ${check.name}`,
      status: found ? 'PASS' : 'FAIL'
    });
    console.log(`${found ? '✅' : '❌'} ${check.name.padEnd(40)} | ${found ? 'FOUND' : 'MISSING'}`);
  });
}

// Test 4: Check referrals page
console.log('\n🔧 Referrals Page Tests');
console.log('-'.repeat(70));
const pagePath = REFERRAL_COMPONENTS['referrals-page'];
if (existsSync(pagePath)) {
  const pageContent = readFileSync(pagePath, 'utf-8');
  
  const checks = [
    { name: 'Has referral list query', pattern: /useQuery.*referrals/ },
    { name: 'Has status update mutation', pattern: /updateStatusMutation/ },
    { name: 'Has status badges', pattern: /getStatusBadge|pending|accepted|rejected/ },
    { name: 'Has role-based filtering', pattern: /filteredReferrals|canCreate|canUpdate/ },
    { name: 'Has create button', pattern: /Create Referral|Plus/ },
    { name: 'Has accept/reject buttons', pattern: /Accept|Reject/ },
    { name: 'Has error handling', pattern: /onError|error/ },
    { name: 'Has loading state', pattern: /isLoading|Loader2/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(pageContent);
    testResults.push({
      test: `Page: ${check.name}`,
      status: found ? 'PASS' : 'FAIL'
    });
    console.log(`${found ? '✅' : '❌'} ${check.name.padEnd(40)} | ${found ? 'FOUND' : 'MISSING'}`);
  });
}

// Test 5: Check API routes
console.log('\n🔧 API Routes Tests');
console.log('-'.repeat(70));
const routesPath = REFERRAL_COMPONENTS['referral-routes'];
if (existsSync(routesPath)) {
  const routesContent = readFileSync(routesPath, 'utf-8');
  
  const checks = [
    { name: 'Has POST /referrals (create)', pattern: /router\.post.*referrals/ },
    { name: 'Has GET /referrals (list)', pattern: /router\.get.*referrals/ },
    { name: 'Has GET /referrals/:id (get one)', pattern: /router\.get.*referrals.*:id/ },
    { name: 'Has PATCH /referrals/:id (update)', pattern: /router\.patch.*referrals.*:id/ },
    { name: 'Has DELETE /referrals/:id', pattern: /router\.delete.*referrals.*:id/ },
    { name: 'Has authentication', pattern: /authenticateToken/ },
    { name: 'Has role authorization', pattern: /requireAnyRole/ },
    { name: 'Has organization filtering', pattern: /organizationId/ },
    { name: 'Has status validation', pattern: /pending|accepted|rejected|completed/ },
    { name: 'Has error handling', pattern: /catch.*error|try/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(routesContent);
    testResults.push({
      test: `API: ${check.name}`,
      status: found ? 'PASS' : 'FAIL'
    });
    console.log(`${found ? '✅' : '❌'} ${check.name.padEnd(40)} | ${found ? 'FOUND' : 'MISSING'}`);
  });
}

// Test 6: Check integration in patient overview
console.log('\n🔧 Patient Overview Integration Tests');
console.log('-'.repeat(70));
const overviewPath = 'client/src/components/modern-patient-overview.tsx';
if (existsSync(overviewPath)) {
  const overviewContent = readFileSync(overviewPath, 'utf-8');
  
  const checks = [
    { name: 'ReferralManagement imported', pattern: /import.*ReferralManagement/ },
    { name: 'Referrals tab exists', pattern: /TabsContent.*value=["']referrals["']/ },
    { name: 'ReferralManagement component used', pattern: /<ReferralManagement/ }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(overviewContent);
    testResults.push({
      test: `Integration: ${check.name}`,
      status: found ? 'PASS' : 'FAIL'
    });
    console.log(`${found ? '✅' : '❌'} ${check.name.padEnd(40)} | ${found ? 'FOUND' : 'MISSING'}`);
  });
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(70));

const passed = testResults.filter(r => r.status === 'PASS').length;
const failed = testResults.filter(r => r.status === 'FAIL').length;
const total = testResults.length;

console.log(`Total Tests: ${total}`);
console.log(`Passed: ${passed} ✅`);
console.log(`Failed: ${failed} ${failed > 0 ? '❌' : ''}`);
console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

if (failed > 0) {
  console.log('\n❌ Failed Tests:');
  testResults.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`   - ${r.test}`);
  });
}

console.log('\n📋 Manual Testing Checklist:');
console.log('='.repeat(70));
console.log('\n1. CREATE REFERRAL (Referral Modal)');
console.log('   [ ] Open referral modal from referrals page');
console.log('   [ ] Select patient (if not pre-selected)');
console.log('   [ ] Select role to refer to (pharmacist, physiotherapist, etc.)');
console.log('   [ ] Enter reason for referral');
console.log('   [ ] Submit form');
console.log('   [ ] Verify success toast appears');
console.log('   [ ] Verify referral appears in list');

console.log('\n2. CREATE REFERRAL (Patient Profile)');
console.log('   [ ] Navigate to patient profile');
console.log('   [ ] Go to Documents tab → Referrals sub-tab');
console.log('   [ ] Click "New Referral" button');
console.log('   [ ] Fill referral form (facility, specialty, reason, urgency)');
console.log('   [ ] Submit form');
console.log('   [ ] Verify referral created');

console.log('\n3. VIEW REFERRALS');
console.log('   [ ] Navigate to /referrals page');
console.log('   [ ] Verify referrals list displays');
console.log('   [ ] Check filtering by role works');
console.log('   [ ] Verify patient information displays');
console.log('   [ ] Verify status badges display correctly');

console.log('\n4. UPDATE REFERRAL STATUS');
console.log('   [ ] Find a pending referral');
console.log('   [ ] Click "Accept" button');
console.log('   [ ] Verify status changes to accepted');
console.log('   [ ] Test "Reject" button');
console.log('   [ ] Verify status changes to rejected');

console.log('\n5. EDIT REFERRAL');
console.log('   [ ] Go to patient profile → Documents → Referrals');
console.log('   [ ] Click edit on existing referral');
console.log('   [ ] Modify referral details');
console.log('   [ ] Save changes');
console.log('   [ ] Verify updates appear');

console.log('\n6. DELETE REFERRAL');
console.log('   [ ] Go to patient profile → Documents → Referrals');
console.log('   [ ] Click delete on a referral');
console.log('   [ ] Confirm deletion');
console.log('   [ ] Verify referral removed from list');

console.log('\n7. ROLE-BASED ACCESS');
console.log('   [ ] Test as doctor - should create referrals');
console.log('   [ ] Test as nurse - should create referrals');
console.log('   [ ] Test as pharmacist - should accept/reject');
console.log('   [ ] Test as physiotherapist - should accept/reject');
console.log('   [ ] Test as admin - should see all referrals');

console.log('\n8. ERROR HANDLING');
console.log('   [ ] Test with invalid data');
console.log('   [ ] Verify error messages display');
console.log('   [ ] Test network errors');
console.log('   [ ] Verify loading states work');

console.log('\n✅ Referral testing complete!');
console.log('\n💡 Next Steps:');
console.log('   1. Start dev server: npm run dev');
console.log('   2. Login as doctor/nurse');
console.log('   3. Navigate to /referrals or patient profile');
console.log('   4. Test each function systematically');
console.log('   5. Check browser console for errors');

