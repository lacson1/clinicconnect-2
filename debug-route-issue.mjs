/**
 * Debug script to check route registration order
 */

import { readFileSync } from 'fs';

console.log('🔍 Debugging Route Registration Issue...\n');

// Check if route exists in patients.ts
const patientsFile = 'server/routes/patients.ts';
const patientsContent = readFileSync(patientsFile, 'utf-8');

const clinicalNotesRoute = patientsContent.match(/router\.get\(["']([^"']*clinical-notes[^"']*)["']/);
if (clinicalNotesRoute) {
  console.log(`✅ Found route in patients.ts: ${clinicalNotesRoute[1]}`);
  const lineNumber = patientsContent.substring(0, patientsContent.indexOf(clinicalNotesRoute[0])).split('\n').length;
  console.log(`   Line: ${lineNumber}`);
} else {
  console.log('❌ Route NOT found in patients.ts');
}

// Check if route exists in routes.ts (legacy)
const routesFile = 'server/routes.ts';
const routesContent = readFileSync(routesFile, 'utf-8');

const legacyRoute = routesContent.match(/app\.get\(["']([^"']*clinical-notes[^"']*)["']/);
if (legacyRoute) {
  console.log(`⚠️  Found DUPLICATE route in routes.ts: ${legacyRoute[1]}`);
  const lineNumber = routesContent.substring(0, routesContent.indexOf(legacyRoute[0])).split('\n').length;
  console.log(`   Line: ${lineNumber}`);
  console.log(`   ⚠️  This might be interfering!`);
} else {
  console.log('✅ No duplicate route in routes.ts');
}

// Check route order in patients.ts
const allPatientRoutes = [];
const routeRegex = /router\.get\(["']([^"']+)["']/g;
let match;
while ((match = routeRegex.exec(patientsContent)) !== null) {
  if (match[1].includes('/patients/:id')) {
    allPatientRoutes.push(match[1]);
  }
}

console.log('\n📋 Route Order in patients.ts:');
allPatientRoutes.forEach((route, i) => {
  const marker = route.includes('clinical-notes') ? ' 👈 CLINICAL NOTES' : '';
  const general = route === '/patients/:id' ? ' 👈 GENERAL ROUTE' : '';
  console.log(`   ${i + 1}. ${route}${marker}${general}`);
});

// Check if clinical-notes comes before /patients/:id
const clinicalIndex = allPatientRoutes.findIndex(r => r.includes('clinical-notes'));
const generalIndex = allPatientRoutes.findIndex(r => r === '/patients/:id');

if (clinicalIndex !== -1 && generalIndex !== -1) {
  if (clinicalIndex < generalIndex) {
    console.log('\n✅ Route order is CORRECT');
  } else {
    console.log('\n❌ Route order is WRONG - clinical-notes must come BEFORE /patients/:id');
  }
}

// Check server/index.ts for route registration order
const indexFile = 'server/index.ts';
const indexContent = readFileSync(indexFile, 'utf-8');

console.log('\n📦 Route Registration Order in server/index.ts:');
const setupRoutesMatch = indexContent.match(/setupRoutes\(app\)/);
const registerRoutesMatch = indexContent.match(/registerRoutes\(app\)/);

if (setupRoutesMatch && registerRoutesMatch) {
  const setupIndex = indexContent.indexOf('setupRoutes(app)');
  const registerIndex = indexContent.indexOf('registerRoutes(app)');
  
  if (setupIndex < registerIndex) {
    console.log('   ✅ setupRoutes() called BEFORE registerRoutes()');
    console.log('   ✅ Modular routes (with clinical-notes) registered first');
  } else {
    console.log('   ❌ registerRoutes() called BEFORE setupRoutes()');
    console.log('   ❌ Legacy routes might override modular routes!');
  }
}

console.log('\n💡 Possible Issues:');
console.log('   1. Server not restarted - restart with: npm run dev');
console.log('   2. Duplicate route in routes.ts might override');
console.log('   3. Route path mismatch');
console.log('   4. Middleware blocking the route');

