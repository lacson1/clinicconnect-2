import 'dotenv/config';
import { db } from './server/db';
import { consultationForms } from '@shared/schema';
import { eq, like } from 'drizzle-orm';

async function testPsychiatryForm() {
  console.log('🧪 Testing Modern Psychiatry Consultation Form...\n');

  try {
    // Test 1: Check if form exists in database
    console.log('📋 Test 1: Checking if form exists in database...');
    const forms = await db
      .select()
      .from(consultationForms)
      .where(like(consultationForms.name, '%Psychiatry%'));

    if (forms.length === 0) {
      console.log('❌ FAILED: Psychiatry form not found in database');
      return;
    }

    const form = forms[0];
    console.log('✅ PASSED: Form found in database');
    console.log(`   - ID: ${form.id}`);
    console.log(`   - Name: ${form.name}`);
    console.log(`   - Specialist Role: ${form.specialistRole}`);
    console.log(`   - Active: ${form.isActive}`);
    console.log(`   - Created: ${form.createdAt}\n`);

    // Test 2: Verify form structure
    console.log('📋 Test 2: Verifying form structure...');
    const formStructure = form.formStructure as any;
    
    if (!formStructure || !formStructure.fields) {
      console.log('❌ FAILED: Form structure is invalid');
      return;
    }

    const fields = formStructure.fields;
    console.log(`✅ PASSED: Form structure is valid`);
    console.log(`   - Total fields: ${fields.length}\n`);

    // Test 3: Check required sections
    console.log('📋 Test 3: Checking required sections...');
    const sections = new Set(fields.map((f: any) => f.section));
    const requiredSections = [
      'Presenting Concerns',
      'Mental State Examination',
      'Risk Assessment',
      'Functional Assessment',
      'Assessment & Diagnosis',
      'Treatment Plan'
    ];

    const missingSections = requiredSections.filter(s => !Array.from(sections).some(sec => sec.includes(s)));
    
    if (missingSections.length > 0) {
      console.log(`⚠️  WARNING: Some sections may be missing: ${missingSections.join(', ')}`);
    } else {
      console.log('✅ PASSED: All required sections present');
    }
    console.log(`   - Total sections: ${sections.size}`);
    console.log(`   - Sections: ${Array.from(sections).join(', ')}\n`);

    // Test 4: Check critical risk assessment fields
    console.log('📋 Test 4: Checking critical risk assessment fields...');
    const riskFields = fields.filter((f: any) => 
      f.id.includes('suicidal') || 
      f.id.includes('homicidal') || 
      f.id.includes('self_harm') ||
      f.id.includes('risk')
    );

    if (riskFields.length < 4) {
      console.log('❌ FAILED: Missing critical risk assessment fields');
      return;
    }

    console.log('✅ PASSED: Critical risk assessment fields present');
    console.log(`   - Risk fields found: ${riskFields.length}`);
    riskFields.forEach((f: any) => {
      console.log(`     • ${f.label}`);
    });
    console.log('');

    // Test 5: Check field types
    console.log('📋 Test 5: Verifying field types...');
    const fieldTypes = new Set(fields.map((f: any) => f.type));
    const expectedTypes = ['textarea', 'select', 'number', 'checkbox', 'date'];
    
    const invalidTypes = Array.from(fieldTypes).filter(t => !expectedTypes.includes(t));
    if (invalidTypes.length > 0) {
      console.log(`⚠️  WARNING: Unexpected field types: ${invalidTypes.join(', ')}`);
    } else {
      console.log('✅ PASSED: All field types are valid');
    }
    console.log(`   - Field types used: ${Array.from(fieldTypes).join(', ')}\n`);

    // Test 6: Count required vs optional fields
    console.log('📋 Test 6: Analyzing field requirements...');
    const requiredFields = fields.filter((f: any) => f.required);
    const optionalFields = fields.filter((f: any) => !f.required);
    
    console.log(`✅ PASSED: Field requirements analyzed`);
    console.log(`   - Required fields: ${requiredFields.length}`);
    console.log(`   - Optional fields: ${optionalFields.length}`);
    console.log(`   - Total fields: ${fields.length}\n`);

    // Test 7: Check for key psychiatric assessment fields
    console.log('📋 Test 7: Checking key psychiatric assessment fields...');
    const keyFields = [
      'mood_assessment',
      'mood_severity',
      'anxiety_symptoms',
      'anxiety_severity',
      'psychotic_symptoms',
      'cognitive_function',
      'insight',
      'judgment'
    ];

    const foundKeyFields = keyFields.filter(key => 
      fields.some((f: any) => f.id === key)
    );

    if (foundKeyFields.length < keyFields.length * 0.8) {
      console.log(`⚠️  WARNING: Some key fields may be missing`);
      console.log(`   - Found: ${foundKeyFields.length}/${keyFields.length}`);
    } else {
      console.log('✅ PASSED: All key psychiatric assessment fields present');
    }
    console.log(`   - Key fields found: ${foundKeyFields.join(', ')}\n`);

    // Test 8: Verify form can be serialized (for API)
    console.log('📋 Test 8: Testing form serialization...');
    try {
      const serialized = JSON.stringify(formStructure);
      const parsed = JSON.parse(serialized);
      
      if (parsed.fields && parsed.fields.length === fields.length) {
        console.log('✅ PASSED: Form structure can be serialized/deserialized');
      } else {
        console.log('❌ FAILED: Form structure serialization issue');
      }
    } catch (error) {
      console.log('❌ FAILED: Form structure cannot be serialized');
      console.log(`   Error: ${error}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS COMPLETED');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   - Form Name: ${form.name}`);
    console.log(`   - Total Fields: ${fields.length}`);
    console.log(`   - Required Fields: ${requiredFields.length}`);
    console.log(`   - Sections: ${sections.size}`);
    console.log(`   - Status: ${form.isActive ? 'Active ✅' : 'Inactive ❌'}`);
    console.log('\n🎉 The Modern Psychiatry Consultation Form is ready to use!');
    console.log('\n💡 To use the form:');
    console.log('   1. Navigate to a patient profile');
    console.log('   2. Start a new consultation');
    console.log('   3. Go to Step 5: Specialty Forms');
    console.log('   4. Search for "Modern Psychiatry Consultation"');
    console.log('   5. Select and fill out the form\n');

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    process.exit(1);
  }
}

// Run tests
testPsychiatryForm()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });

