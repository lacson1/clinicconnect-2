/**
 * Test script to verify clinical notes route is registered
 */

console.log('🔍 Checking Clinical Notes Route Registration...\n');

// Check route file
import { readFileSync } from 'fs';

const routeFile = 'server/routes/patients.ts';
const content = readFileSync(routeFile, 'utf-8');

// Find all /patients/:id routes
const routeMatches = content.matchAll(/router\.get\(["']([^"']+)["']/g);
const patientRoutes = [];

for (const match of routeMatches) {
  if (match[1].includes('/patients/:id')) {
    patientRoutes.push(match[1]);
  }
}

console.log('📋 Patient Routes Found (in order):');
patientRoutes.forEach((route, index) => {
  const isClinicalNotes = route.includes('clinical-notes');
  console.log(`${index + 1}. ${route} ${isClinicalNotes ? '✅ CLINICAL NOTES' : ''}`);
});

// Check route order
const clinicalNotesIndex = patientRoutes.findIndex(r => r.includes('clinical-notes'));
const generalIndex = patientRoutes.findIndex(r => r === '/patients/:id');

if (clinicalNotesIndex !== -1 && generalIndex !== -1) {
  if (clinicalNotesIndex < generalIndex) {
    console.log('\n✅ Route order is CORRECT - clinical-notes comes before /patients/:id');
  } else {
    console.log('\n❌ Route order is WRONG - /patients/:id comes before clinical-notes');
    console.log('   Clinical notes route must be registered BEFORE the general route!');
  }
} else {
  console.log('\n⚠️  Could not verify route order');
}

// Check if route is registered
const hasRoute = content.includes('/patients/:id/clinical-notes');
console.log(`\n${hasRoute ? '✅' : '❌'} Clinical notes route found in file: ${hasRoute ? 'YES' : 'NO'}`);

// Check route registration in index
const indexFile = 'server/routes/index.ts';
try {
  const indexContent = readFileSync(indexFile, 'utf-8');
  const hasSetup = indexContent.includes('setupPatientRoutes');
  const hasUse = indexContent.includes("app.use('/api', patientRouter)");
  
  console.log(`\n📦 Route Registration Check:`);
  console.log(`   ${hasSetup ? '✅' : '❌'} setupPatientRoutes called: ${hasSetup ? 'YES' : 'NO'}`);
  console.log(`   ${hasUse ? '✅' : '❌'} Patient router mounted at /api: ${hasUse ? 'YES' : 'NO'}`);
  
  if (hasSetup && hasUse) {
    console.log('\n✅ Route should be registered at: /api/patients/:id/clinical-notes');
  }
} catch (error) {
  console.log('\n⚠️  Could not check index.ts file');
}

console.log('\n💡 Next Steps:');
console.log('   1. Restart the development server: npm run dev');
console.log('   2. The route should now work at: /api/patients/6/clinical-notes');
console.log('   3. Check server logs for route registration');

