/**
 * Code Validation Test for Patient Tabs
 * Checks for common code issues in each tab component
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const TAB_COMPONENTS = {
  'overview': 'modern-patient-overview.tsx',
  'medications': 'modern-patient-overview.tsx',
  'safety': 'modern-patient-overview.tsx',
  'timeline': 'modern-patient-overview.tsx',
  'vitals': 'patient-vital-signs-tracker.tsx',
  'record-visit': 'modern-patient-overview.tsx',
  'documents': 'modern-patient-overview.tsx',
  'labs': 'modern-patient-overview.tsx',
  'specialty': 'modern-patient-overview.tsx',
  'med-reviews': 'modern-patient-overview.tsx',
  'vaccinations': 'vaccination-management.tsx',
  'communication': 'patient-communication-hub.tsx',
  'appointments': 'patient-appointments-tab.tsx',
  'billing': 'patient-billing-tab.tsx',
  'insurance': 'patient-insurance-tab.tsx',
  'history': 'patient-history-tab.tsx',
  'imaging': 'patient-imaging.tsx',
  'allergies': 'patient-allergies.tsx',
  'immunizations': 'patient-immunizations.tsx',
  'procedures': 'patient-procedures.tsx',
  'care-plans': 'modern-patient-overview.tsx',
  'notes': 'patient-notes-tab.tsx'
};

const COMPONENT_DIR = 'client/src/components';

function validateComponent(tabName, fileName) {
  const filePath = join(COMPONENT_DIR, fileName);
  const issues = [];
  const warnings = [];
  
  if (!existsSync(filePath)) {
    return {
      tab: tabName,
      file: fileName,
      status: 'ERROR',
      issues: [`File not found: ${filePath}`],
      warnings: []
    };
  }
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Check 1: Component exports properly
    if (fileName === 'modern-patient-overview.tsx') {
      // Check if tab has TabsContent
      const tabContentPattern = new RegExp(`TabsContent\\s+value=["']${tabName}["']`, 'i');
      if (!tabContentPattern.test(content)) {
        warnings.push(`No TabsContent found for tab "${tabName}"`);
      }
    } else {
      // Check if component is exported
      const exportPattern = new RegExp(`export\\s+(default\\s+)?(function|const)\\s+\\w+`, 'i');
      if (!exportPattern.test(content)) {
        issues.push('Component not properly exported');
      }
    }
    
    // Check 2: React imports
    if (!content.includes("import") || (!content.includes("from 'react'") && !content.includes('from "react"'))) {
      if (content.includes('useState') || content.includes('useEffect') || content.includes('useQuery')) {
        issues.push('Missing React import but using React hooks');
      }
    }
    
    // Check 3: useQuery error handling
    if (content.includes('useQuery')) {
      const hasErrorHandling = content.includes('error') || content.includes('isError');
      if (!hasErrorHandling) {
        warnings.push('useQuery without error handling');
      }
    }
    
    // Check 4: TypeScript types
    if (fileName.endsWith('.tsx')) {
      const hasTypes = content.includes(':') && (content.includes('interface') || content.includes('type'));
      if (!hasTypes && content.includes('function')) {
        warnings.push('Component may be missing TypeScript types');
      }
    }
    
    // Check 5: Null/undefined checks for patient data
    if (content.includes('patient') && !content.includes('patient?.') && !content.includes('patient &&')) {
      if (content.includes('patient.id') || content.includes('patient.firstName')) {
        warnings.push('Direct patient property access without null check');
      }
    }
    
    // Check 6: Loading states
    if (content.includes('useQuery') && !content.includes('isLoading')) {
      warnings.push('useQuery without loading state check');
    }
    
    return {
      tab: tabName,
      file: fileName,
      status: issues.length > 0 ? 'ERROR' : 'OK',
      issues,
      warnings
    };
  } catch (error) {
    return {
      tab: tabName,
      file: fileName,
      status: 'ERROR',
      issues: [error.message],
      warnings: []
    };
  }
}

console.log('🔍 Starting Code Validation for Patient Tabs...\n');
console.log('='.repeat(70));

const results = [];
let totalIssues = 0;
let totalWarnings = 0;

Object.entries(TAB_COMPONENTS).forEach(([tabName, fileName]) => {
  const result = validateComponent(tabName, fileName);
  results.push(result);
  
  if (result.status === 'ERROR') {
    totalIssues += result.issues.length;
    console.log(`❌ ${tabName.padEnd(20)} | ${result.status.padEnd(6)} | Issues: ${result.issues.length}`);
    result.issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
  } else {
    console.log(`✅ ${tabName.padEnd(20)} | ${result.status.padEnd(6)} | Warnings: ${result.warnings.length}`);
  }
  
  if (result.warnings.length > 0) {
    totalWarnings += result.warnings.length;
    result.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
  }
});

console.log('\n' + '='.repeat(70));
console.log('\n📊 VALIDATION SUMMARY');
console.log('='.repeat(70));
console.log(`Total Tabs Validated: ${results.length}`);
console.log(`Tabs with Errors: ${results.filter(r => r.status === 'ERROR').length}`);
console.log(`Tabs with Warnings: ${results.filter(r => r.warnings.length > 0).length}`);
console.log(`Total Issues: ${totalIssues}`);
console.log(`Total Warnings: ${totalWarnings}`);

// Check for missing TabsContent in modern-patient-overview
console.log('\n🔍 Checking TabsContent in modern-patient-overview.tsx...');
const overviewPath = join(COMPONENT_DIR, 'modern-patient-overview.tsx');
if (existsSync(overviewPath)) {
  const overviewContent = readFileSync(overviewPath, 'utf-8');
  const tabsInOverview = Object.keys(TAB_COMPONENTS).filter(tab => 
    TAB_COMPONENTS[tab] === 'modern-patient-overview.tsx'
  );
  
  const missingTabs = tabsInOverview.filter(tab => {
    const pattern = new RegExp(`TabsContent\\s+value=["']${tab}["']`, 'i');
    return !pattern.test(overviewContent);
  });
  
  if (missingTabs.length > 0) {
    console.log(`⚠️  Missing TabsContent for: ${missingTabs.join(', ')}`);
  } else {
    console.log('✅ All tabs have TabsContent defined');
  }
}

console.log('\n✅ Code validation complete!');
console.log('\n💡 Recommendations:');
if (totalIssues > 0) {
  console.log('   - Fix all errors before testing');
}
if (totalWarnings > 0) {
  console.log('   - Review warnings and improve error handling');
}
console.log('   - Test each tab in browser to verify functionality');
console.log('   - Check browser console for runtime errors');

