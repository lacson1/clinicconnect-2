-- Modern Psychiatry Consultation Form
-- Comprehensive psychiatric assessment following DSM-5 and ICD-11 guidelines
-- Includes structured mental state examination, risk assessment, and treatment planning

INSERT INTO consultation_forms (name, description, specialist_role, form_structure, is_active, created_at) VALUES
('Modern Psychiatry Consultation', 'Comprehensive psychiatric assessment with structured mental state examination, risk assessment, and evidence-based treatment planning', 'Psychiatrist/Doctor', '{
  "fields": [
    {
      "id": "chief_complaint",
      "label": "Chief Complaint / Presenting Problem",
      "type": "textarea",
      "required": true,
      "section": "Presenting Concerns",
      "placeholder": "Patient''s main concern in their own words...",
      "medicalCategory": "symptoms"
    },
    {
      "id": "history_presenting_illness",
      "label": "History of Presenting Illness",
      "type": "textarea",
      "required": true,
      "section": "Presenting Concerns",
      "placeholder": "Onset, duration, course, precipitating factors, associated symptoms...",
      "medicalCategory": "symptoms"
    },
    {
      "id": "mood_assessment",
      "label": "Mood Assessment",
      "type": "select",
      "required": true,
      "section": "Mental State Examination",
      "options": ["Euthymic", "Depressed", "Elevated", "Irritable", "Anxious", "Labile", "Flat", "Inappropriate"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "mood_severity",
      "label": "Mood Severity (1-10 scale)",
      "type": "number",
      "required": true,
      "section": "Mental State Examination",
      "placeholder": "1=Severely depressed, 10=Elevated/euphoric",
      "validation": {"min": 1, "max": 10},
      "medicalCategory": "symptoms"
    },
    {
      "id": "affect_assessment",
      "label": "Affect",
      "type": "select",
      "required": true,
      "section": "Mental State Examination",
      "options": ["Congruent", "Incongruent", "Restricted", "Blunted", "Flat", "Labile"],
      "medicalCategory": "examination"
    },
    {
      "id": "anxiety_symptoms",
      "label": "Anxiety Symptoms",
      "type": "checkbox",
      "required": false,
      "section": "Mental State Examination",
      "options": ["Generalized anxiety", "Panic attacks", "Social anxiety", "Specific phobias", "Obsessions", "Compulsions", "Trauma-related", "None"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "anxiety_severity",
      "label": "Anxiety Severity (1-10 scale)",
      "type": "number",
      "required": true,
      "section": "Mental State Examination",
      "placeholder": "1=None, 10=Severe/panic",
      "validation": {"min": 1, "max": 10},
      "medicalCategory": "symptoms"
    },
    {
      "id": "psychotic_symptoms",
      "label": "Psychotic Symptoms",
      "type": "checkbox",
      "required": true,
      "section": "Mental State Examination",
      "options": ["Delusions", "Hallucinations (auditory)", "Hallucinations (visual)", "Hallucinations (other)", "Thought disorder", "Disorganized behavior", "Negative symptoms", "None present"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "suicidal_ideation",
      "label": "Suicidal Ideation",
      "type": "select",
      "required": true,
      "section": "Risk Assessment",
      "options": ["None", "Passive thoughts", "Active thoughts without plan", "Active thoughts with plan", "Recent attempt", "Refuses to answer"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "suicidal_plan",
      "label": "Suicidal Plan Details",
      "type": "textarea",
      "required": false,
      "section": "Risk Assessment",
      "placeholder": "If plan exists, describe method, means, intent...",
      "medicalCategory": "symptoms"
    },
    {
      "id": "homicidal_ideation",
      "label": "Homicidal Ideation",
      "type": "select",
      "required": true,
      "section": "Risk Assessment",
      "options": ["None", "Passive thoughts", "Active thoughts without plan", "Active thoughts with plan", "Refuses to answer"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "self_harm",
      "label": "Self-Harm Behavior",
      "type": "select",
      "required": true,
      "section": "Risk Assessment",
      "options": ["None", "History only", "Recent (past month)", "Current", "Refuses to answer"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "risk_to_others",
      "label": "Risk to Others",
      "type": "select",
      "required": true,
      "section": "Risk Assessment",
      "options": ["Low risk", "Moderate risk", "High risk", "Immediate danger", "Not assessed"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "cognitive_function",
      "label": "Cognitive Function",
      "type": "select",
      "required": true,
      "section": "Mental State Examination",
      "options": ["Intact", "Mild impairment", "Moderate impairment", "Severe impairment", "Not assessed"],
      "medicalCategory": "examination"
    },
    {
      "id": "attention_concentration",
      "label": "Attention and Concentration",
      "type": "select",
      "required": true,
      "section": "Mental State Examination",
      "options": ["Normal", "Mildly impaired", "Moderately impaired", "Severely impaired"],
      "medicalCategory": "examination"
    },
    {
      "id": "memory_assessment",
      "label": "Memory Assessment",
      "type": "select",
      "required": true,
      "section": "Mental State Examination",
      "options": ["Intact (immediate, recent, remote)", "Mild impairment", "Moderate impairment", "Severe impairment", "Not assessed"],
      "medicalCategory": "examination"
    },
    {
      "id": "insight",
      "label": "Insight",
      "type": "select",
      "required": true,
      "section": "Mental State Examination",
      "options": ["Good insight", "Partial insight", "Poor insight", "No insight"],
      "medicalCategory": "examination"
    },
    {
      "id": "judgment",
      "label": "Judgment",
      "type": "select",
      "required": true,
      "section": "Mental State Examination",
      "options": ["Intact", "Mildly impaired", "Moderately impaired", "Severely impaired"],
      "medicalCategory": "examination"
    },
    {
      "id": "sleep_pattern",
      "label": "Sleep Pattern",
      "type": "select",
      "required": true,
      "section": "Functional Assessment",
      "options": ["Normal (7-9 hours)", "Insomnia (difficulty falling asleep)", "Insomnia (frequent awakening)", "Insomnia (early morning waking)", "Hypersomnia", "Irregular pattern", "Nightmares/night terrors"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "appetite_changes",
      "label": "Appetite Changes",
      "type": "select",
      "required": true,
      "section": "Functional Assessment",
      "options": ["Normal", "Decreased", "Increased", "Variable", "Binge eating"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "energy_level",
      "label": "Energy Level",
      "type": "select",
      "required": true,
      "section": "Functional Assessment",
      "options": ["Normal", "Mildly reduced", "Moderately reduced", "Severely reduced", "Increased/agitated"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "social_functioning",
      "label": "Social Functioning",
      "type": "select",
      "required": true,
      "section": "Functional Assessment",
      "options": ["Normal social interaction", "Slightly reduced", "Moderately isolated", "Severely withdrawn", "Socially inappropriate"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "occupational_functioning",
      "label": "Work/School Functioning",
      "type": "select",
      "required": true,
      "section": "Functional Assessment",
      "options": ["Normal performance", "Slightly affected", "Moderately affected", "Severely impaired", "Unable to work/study", "Not applicable"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "substance_use",
      "label": "Substance Use Assessment",
      "type": "checkbox",
      "required": true,
      "section": "Substance Use",
      "options": ["Alcohol", "Tobacco", "Cannabis", "Stimulants", "Opioids", "Sedatives", "Hallucinogens", "Other", "None"],
      "medicalCategory": "history"
    },
    {
      "id": "substance_use_frequency",
      "label": "Substance Use Frequency",
      "type": "select",
      "required": false,
      "section": "Substance Use",
      "options": ["Daily", "Several times/week", "Weekly", "Monthly", "Rarely", "Not applicable"],
      "medicalCategory": "history"
    },
    {
      "id": "substance_use_impact",
      "label": "Impact on Mental Health",
      "type": "select",
      "required": false,
      "section": "Substance Use",
      "options": ["No impact", "Mild impact", "Moderate impact", "Severe impact", "Not applicable"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "family_psychiatric_history",
      "label": "Family Psychiatric History",
      "type": "textarea",
      "required": false,
      "section": "Family History",
      "placeholder": "Mental health conditions in family members...",
      "medicalCategory": "history"
    },
    {
      "id": "past_psychiatric_history",
      "label": "Past Psychiatric History",
      "type": "textarea",
      "required": false,
      "section": "Past History",
      "placeholder": "Previous diagnoses, hospitalizations, treatments...",
      "medicalCategory": "history"
    },
    {
      "id": "current_psychiatric_medications",
      "label": "Current Psychiatric Medications",
      "type": "textarea",
      "required": false,
      "section": "Treatment Review",
      "placeholder": "List medications, doses, duration, response...",
      "medicalCategory": "treatment"
    },
    {
      "id": "medication_adherence",
      "label": "Medication Adherence",
      "type": "select",
      "required": false,
      "section": "Treatment Review",
      "options": ["Excellent (>95%)", "Good (80-95%)", "Fair (60-80%)", "Poor (<60%)", "Not applicable"],
      "medicalCategory": "treatment"
    },
    {
      "id": "medication_side_effects",
      "label": "Medication Side Effects",
      "type": "textarea",
      "required": false,
      "section": "Treatment Review",
      "placeholder": "Any adverse effects experienced...",
      "medicalCategory": "symptoms"
    },
    {
      "id": "psychotherapy_history",
      "label": "Psychotherapy/Counseling History",
      "type": "select",
      "required": false,
      "section": "Treatment Review",
      "options": ["Currently in therapy", "Past therapy (beneficial)", "Past therapy (not beneficial)", "Never received", "Declined"],
      "medicalCategory": "treatment"
    },
    {
      "id": "therapy_type",
      "label": "Type of Therapy",
      "type": "checkbox",
      "required": false,
      "section": "Treatment Review",
      "options": ["CBT", "DBT", "Psychodynamic", "Interpersonal", "Group therapy", "Family therapy", "Other", "Not applicable"],
      "medicalCategory": "treatment"
    },
    {
      "id": "support_system",
      "label": "Support System",
      "type": "select",
      "required": true,
      "section": "Social Assessment",
      "options": ["Strong support network", "Moderate support", "Limited support", "Isolated", "Hostile environment"],
      "medicalCategory": "history"
    },
    {
      "id": "coping_strategies",
      "label": "Coping Strategies",
      "type": "checkbox",
      "required": false,
      "section": "Self-Management",
      "options": ["Exercise", "Meditation/mindfulness", "Social support", "Hobbies", "Relaxation techniques", "Problem-solving", "Substance use", "None identified"],
      "medicalCategory": "treatment"
    },
    {
      "id": "protective_factors",
      "label": "Protective Factors",
      "type": "textarea",
      "required": false,
      "section": "Risk Assessment",
      "placeholder": "Reasons for living, support systems, treatment engagement...",
      "medicalCategory": "history"
    },
    {
      "id": "diagnosis_primary",
      "label": "Primary Diagnosis (DSM-5/ICD-11)",
      "type": "textarea",
      "required": true,
      "section": "Assessment & Diagnosis",
      "placeholder": "Primary psychiatric diagnosis with code if applicable...",
      "medicalCategory": "diagnosis"
    },
    {
      "id": "diagnosis_secondary",
      "label": "Secondary Diagnoses",
      "type": "textarea",
      "required": false,
      "section": "Assessment & Diagnosis",
      "placeholder": "Additional diagnoses, comorbidities...",
      "medicalCategory": "diagnosis"
    },
    {
      "id": "diagnostic_confidence",
      "label": "Diagnostic Confidence",
      "type": "select",
      "required": true,
      "section": "Assessment & Diagnosis",
      "options": ["High confidence", "Moderate confidence", "Provisional diagnosis", "Differential diagnosis"],
      "medicalCategory": "diagnosis"
    },
    {
      "id": "treatment_plan",
      "label": "Treatment Plan",
      "type": "textarea",
      "required": true,
      "section": "Treatment Plan",
      "placeholder": "Comprehensive treatment plan including medications, therapy, lifestyle changes...",
      "medicalCategory": "treatment"
    },
    {
      "id": "medication_changes",
      "label": "Medication Changes",
      "type": "textarea",
      "required": false,
      "section": "Treatment Plan",
      "placeholder": "New medications, dose adjustments, discontinuations...",
      "medicalCategory": "treatment"
    },
    {
      "id": "therapy_recommendations",
      "label": "Therapy Recommendations",
      "type": "textarea",
      "required": false,
      "section": "Treatment Plan",
      "placeholder": "Recommended psychotherapy type, frequency, goals...",
      "medicalCategory": "treatment"
    },
    {
      "id": "lifestyle_recommendations",
      "label": "Lifestyle Recommendations",
      "type": "textarea",
      "required": false,
      "section": "Treatment Plan",
      "placeholder": "Sleep hygiene, exercise, diet, stress management...",
      "medicalCategory": "treatment"
    },
    {
      "id": "safety_plan",
      "label": "Safety Plan",
      "type": "textarea",
      "required": false,
      "section": "Risk Management",
      "placeholder": "Safety measures, crisis contacts, warning signs, coping strategies...",
      "medicalCategory": "treatment"
    },
    {
      "id": "risk_level",
      "label": "Overall Risk Level",
      "type": "select",
      "required": true,
      "section": "Risk Management",
      "options": ["Low risk", "Moderate risk", "High risk", "Immediate intervention required"],
      "medicalCategory": "diagnosis"
    },
    {
      "id": "disposition",
      "label": "Disposition",
      "type": "select",
      "required": true,
      "section": "Disposition",
      "options": ["Outpatient follow-up", "Intensive outpatient", "Partial hospitalization", "Inpatient admission", "Emergency department", "Crisis intervention"],
      "medicalCategory": "treatment"
    },
    {
      "id": "follow_up_date",
      "label": "Follow-up Appointment Date",
      "type": "date",
      "required": true,
      "section": "Follow-up",
      "medicalCategory": "followup"
    },
    {
      "id": "follow_up_urgency",
      "label": "Follow-up Urgency",
      "type": "select",
      "required": true,
      "section": "Follow-up",
      "options": ["Routine (4-6 weeks)", "Soon (2-4 weeks)", "Urgent (1-2 weeks)", "Very urgent (3-7 days)", "Emergency (24-48 hours)"],
      "medicalCategory": "followup"
    },
    {
      "id": "patient_education",
      "label": "Patient Education Provided",
      "type": "checkbox",
      "required": false,
      "section": "Education",
      "options": ["Diagnosis explanation", "Medication education", "Therapy benefits", "Warning signs", "Crisis resources", "Support groups", "Lifestyle modifications"],
      "medicalCategory": "treatment"
    },
    {
      "id": "additional_notes",
      "label": "Additional Clinical Notes",
      "type": "textarea",
      "required": false,
      "section": "Additional Notes",
      "placeholder": "Any additional observations, concerns, or recommendations...",
      "medicalCategory": "symptoms"
    }
  ]
}', true, NOW());

