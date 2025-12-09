# Modern Psychiatry Consultation Form

## Overview

A comprehensive, modern psychiatry consultation form has been added to the ClinicConnect system. This form follows evidence-based psychiatric assessment practices and includes structured mental state examination, comprehensive risk assessment, and treatment planning.

## Features

### 📋 Comprehensive Sections

1. **Presenting Concerns**
   - Chief complaint
   - History of presenting illness

2. **Mental State Examination**
   - Mood assessment (with 1-10 severity scale)
   - Affect assessment
   - Anxiety symptoms and severity
   - Psychotic symptoms screening
   - Cognitive function assessment
   - Attention and concentration
   - Memory assessment
   - Insight and judgment

3. **Risk Assessment** ⚠️
   - Suicidal ideation and plan details
   - Homicidal ideation
   - Self-harm behavior
   - Risk to others assessment
   - Protective factors

4. **Functional Assessment**
   - Sleep pattern
   - Appetite changes
   - Energy level
   - Social functioning
   - Occupational functioning

5. **Substance Use Assessment**
   - Substance use types
   - Frequency of use
   - Impact on mental health

6. **History**
   - Family psychiatric history
   - Past psychiatric history

7. **Treatment Review**
   - Current psychiatric medications
   - Medication adherence
   - Medication side effects
   - Psychotherapy history
   - Therapy types

8. **Social Assessment**
   - Support system quality
   - Coping strategies

9. **Assessment & Diagnosis**
   - Primary diagnosis (DSM-5/ICD-11)
   - Secondary diagnoses
   - Diagnostic confidence

10. **Treatment Plan**
    - Comprehensive treatment plan
    - Medication changes
    - Therapy recommendations
    - Lifestyle recommendations

11. **Risk Management**
    - Safety plan
    - Overall risk level
    - Disposition

12. **Follow-up**
    - Follow-up appointment date
    - Follow-up urgency

13. **Education**
    - Patient education provided

14. **Additional Notes**
    - Additional clinical observations

## How to Use

### Accessing the Form

1. Navigate to a patient's profile
2. Click on "Record Visit" or "New Consultation"
3. In the Modern Consultation Wizard, go to **Step 5: Specialty Forms**
4. Search for "Modern Psychiatry Consultation" or filter by "Psychiatrist/Doctor"
5. Select the form to fill it out

### Key Features

- **Structured Mental State Examination**: Comprehensive MSE following standard psychiatric practice
- **Risk Assessment**: Detailed suicide and violence risk assessment with safety planning
- **Evidence-Based**: Follows DSM-5 and ICD-11 diagnostic guidelines
- **Treatment Planning**: Integrated medication and therapy planning
- **Functional Assessment**: Evaluation of daily functioning across multiple domains

## Form Structure

The form includes **58 fields** organized into **14 sections**:

- **Required Fields**: 25
- **Optional Fields**: 33
- **Field Types**: 
  - Textarea (for detailed notes)
  - Select (for standardized options)
  - Number (for severity scales)
  - Checkbox (for multiple selections)
  - Date (for follow-up scheduling)

## Clinical Guidelines

This form is designed to support:

- **Initial psychiatric evaluations**
- **Follow-up psychiatric consultations**
- **Crisis assessments**
- **Treatment planning**
- **Risk management**
- **Documentation for legal/regulatory compliance**

## Integration

The form integrates seamlessly with:
- Patient records
- Visit documentation
- Medication management
- Appointment scheduling
- Follow-up tracking

## Database

The form is stored in the `consultation_forms` table with:
- **Name**: "Modern Psychiatry Consultation"
- **Specialist Role**: "Psychiatrist/Doctor"
- **Status**: Active
- **Structure**: JSON-based dynamic form structure

## Technical Details

- **Created**: December 9, 2025
- **Form ID**: Auto-generated
- **Schema**: Follows the consultation_forms table structure
- **Validation**: Client-side and server-side validation
- **Storage**: PostgreSQL database

## Next Steps

1. ✅ Form created and seeded
2. ✅ Available in consultation wizard
3. 🔄 Ready for clinical use
4. 📝 Consider adding:
   - PHQ-9 integration
   - GAD-7 integration
   - Other standardized assessment tools

## Support

For questions or issues with the psychiatry consultation form, contact the development team or refer to the main consultation form documentation.

