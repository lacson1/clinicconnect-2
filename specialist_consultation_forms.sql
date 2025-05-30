-- Specialist Consultation Forms for Common Clinical Conditions
-- These forms are based on evidence-based clinical guidelines

-- 1. Hypertensive Review Form
INSERT INTO consultation_forms (name, description, specialist_role, form_structure, is_active, created_at) VALUES
('Hypertensive Review Assessment', 'Comprehensive hypertension monitoring and management form following AHA/ESC guidelines', 'Doctor/Nurse', '{
  "fields": [
    {
      "id": "chief_complaint",
      "label": "Chief Complaint",
      "type": "textarea",
      "required": true,
      "section": "Presenting Complaint",
      "placeholder": "Current symptoms or concerns...",
      "medicalCategory": "symptoms"
    },
    {
      "id": "bp_current",
      "label": "Current Blood Pressure (mmHg)",
      "type": "text",
      "required": true,
      "section": "Vital Signs",
      "placeholder": "e.g., 140/90",
      "medicalCategory": "vitals"
    },
    {
      "id": "bp_trend",
      "label": "Recent BP Trend",
      "type": "select",
      "required": true,
      "section": "Vital Signs",
      "options": ["Improving", "Stable", "Worsening", "Variable"],
      "medicalCategory": "vitals"
    },
    {
      "id": "medication_compliance",
      "label": "Medication Adherence",
      "type": "select",
      "required": true,
      "section": "Treatment Review",
      "options": ["Excellent", "Good", "Fair", "Poor", "Not applicable"],
      "medicalCategory": "treatment"
    },
    {
      "id": "current_medications",
      "label": "Current Antihypertensive Medications",
      "type": "textarea",
      "required": true,
      "section": "Treatment Review",
      "placeholder": "List current medications, doses, and frequency...",
      "medicalCategory": "treatment"
    },
    {
      "id": "side_effects",
      "label": "Medication Side Effects",
      "type": "textarea",
      "required": false,
      "section": "Treatment Review",
      "placeholder": "Any adverse effects experienced...",
      "medicalCategory": "symptoms"
    },
    {
      "id": "lifestyle_diet",
      "label": "Dietary Compliance (DASH diet)",
      "type": "select",
      "required": true,
      "section": "Lifestyle Assessment",
      "options": ["Excellent", "Good", "Fair", "Poor"],
      "medicalCategory": "history"
    },
    {
      "id": "salt_intake",
      "label": "Estimated Daily Salt Intake",
      "type": "select",
      "required": true,
      "section": "Lifestyle Assessment",
      "options": ["<2g/day", "2-4g/day", "4-6g/day", ">6g/day"],
      "medicalCategory": "history"
    },
    {
      "id": "exercise_frequency",
      "label": "Exercise Frequency",
      "type": "select",
      "required": true,
      "section": "Lifestyle Assessment",
      "options": ["Daily", "4-6 times/week", "2-3 times/week", "1 time/week", "Rarely", "Never"],
      "medicalCategory": "history"
    },
    {
      "id": "complications_check",
      "label": "End-Organ Damage Assessment",
      "type": "checkbox",
      "required": false,
      "section": "Examination",
      "options": ["Heart failure symptoms", "Kidney dysfunction", "Retinal changes", "Stroke/TIA history", "Peripheral artery disease"],
      "medicalCategory": "examination"
    },
    {
      "id": "target_bp",
      "label": "Target Blood Pressure",
      "type": "text",
      "required": true,
      "section": "Management Plan",
      "placeholder": "e.g., <130/80 mmHg",
      "medicalCategory": "treatment"
    },
    {
      "id": "medication_changes",
      "label": "Medication Adjustments",
      "type": "textarea",
      "required": false,
      "section": "Management Plan",
      "placeholder": "Any changes to current regimen...",
      "medicalCategory": "treatment"
    },
    {
      "id": "next_review",
      "label": "Next Review Date",
      "type": "date",
      "required": true,
      "section": "Follow-up",
      "medicalCategory": "followup"
    }
  ]
}', true, NOW());

-- 2. Asthma Review Form
INSERT INTO consultation_forms (name, description, specialist_role, form_structure, is_active, created_at) VALUES
('Asthma Review Assessment', 'Comprehensive asthma control assessment based on GINA guidelines', 'Doctor/Nurse', '{
  "fields": [
    {
      "id": "asthma_control",
      "label": "Current Asthma Control Level",
      "type": "select",
      "required": true,
      "section": "Assessment",
      "options": ["Well-controlled", "Partly controlled", "Uncontrolled"],
      "medicalCategory": "diagnosis"
    },
    {
      "id": "symptoms_frequency",
      "label": "Daytime Symptoms Frequency",
      "type": "select",
      "required": true,
      "section": "Symptoms Review",
      "options": ["None", "≤2 times/week", "3-4 times/week", "Daily", "Continuous"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "night_symptoms",
      "label": "Night-time Awakening",
      "type": "select",
      "required": true,
      "section": "Symptoms Review",
      "options": ["None", "≤1 time/month", "2-3 times/month", "Weekly", "Nightly"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "reliever_use",
      "label": "Reliever Inhaler Use",
      "type": "select",
      "required": true,
      "section": "Treatment Review",
      "options": ["None", "≤2 times/week", "3-4 times/week", "Daily", "Multiple times daily"],
      "medicalCategory": "treatment"
    },
    {
      "id": "activity_limitation",
      "label": "Activity Limitation",
      "type": "select",
      "required": true,
      "section": "Functional Assessment",
      "options": ["None", "Minimal", "Moderate", "Severe"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "peak_flow",
      "label": "Current Peak Flow (L/min)",
      "type": "number",
      "required": false,
      "section": "Objective Measures",
      "placeholder": "Enter peak flow reading...",
      "medicalCategory": "vitals"
    },
    {
      "id": "best_peak_flow",
      "label": "Personal Best Peak Flow (L/min)",
      "type": "number",
      "required": false,
      "section": "Objective Measures",
      "placeholder": "Patient''s best recorded peak flow...",
      "medicalCategory": "vitals"
    },
    {
      "id": "inhaler_technique",
      "label": "Inhaler Technique Assessment",
      "type": "select",
      "required": true,
      "section": "Treatment Review",
      "options": ["Excellent", "Good", "Needs improvement", "Poor", "Not assessed"],
      "medicalCategory": "examination"
    },
    {
      "id": "current_controllers",
      "label": "Current Controller Medications",
      "type": "textarea",
      "required": true,
      "section": "Treatment Review",
      "placeholder": "List all preventive medications, doses, devices...",
      "medicalCategory": "treatment"
    },
    {
      "id": "triggers_identified",
      "label": "Known Triggers",
      "type": "checkbox",
      "required": false,
      "section": "Trigger Assessment",
      "options": ["Allergens", "Exercise", "Cold air", "Infections", "Stress", "Smoke", "Weather changes", "Occupational"],
      "medicalCategory": "history"
    },
    {
      "id": "exacerbations",
      "label": "Exacerbations in Past 12 Months",
      "type": "number",
      "required": true,
      "section": "Disease Severity",
      "placeholder": "Number of severe episodes...",
      "medicalCategory": "history"
    },
    {
      "id": "action_plan",
      "label": "Written Action Plan Status",
      "type": "select",
      "required": true,
      "section": "Management",
      "options": ["Has current plan", "Plan needs updating", "No plan - provided today", "Declined"],
      "medicalCategory": "treatment"
    },
    {
      "id": "step_adjustment",
      "label": "Treatment Step Adjustment",
      "type": "select",
      "required": true,
      "section": "Management Plan",
      "options": ["Step up", "Step down", "Maintain current", "Switch therapy", "Review technique only"],
      "medicalCategory": "treatment"
    }
  ]
}', true, NOW());

-- 3. Antenatal Review Form
INSERT INTO consultation_forms (name, description, specialist_role, form_structure, is_active, created_at) VALUES
('Antenatal Review Assessment', 'Comprehensive antenatal care assessment following WHO/NICE guidelines', 'Doctor/Midwife/Nurse', '{
  "fields": [
    {
      "id": "gestational_age",
      "label": "Gestational Age (weeks+days)",
      "type": "text",
      "required": true,
      "section": "Pregnancy Status",
      "placeholder": "e.g., 28+3",
      "medicalCategory": "vitals"
    },
    {
      "id": "lmp_edd",
      "label": "Expected Delivery Date (EDD)",
      "type": "date",
      "required": true,
      "section": "Pregnancy Status",
      "medicalCategory": "vitals"
    },
    {
      "id": "fetal_movements",
      "label": "Fetal Movements",
      "type": "select",
      "required": true,
      "section": "Fetal Assessment",
      "options": ["Normal and regular", "Reduced", "Absent", "Not yet felt"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "maternal_weight",
      "label": "Current Weight (kg)",
      "type": "number",
      "required": true,
      "section": "Maternal Vitals",
      "placeholder": "Current weight...",
      "medicalCategory": "vitals"
    },
    {
      "id": "blood_pressure",
      "label": "Blood Pressure (mmHg)",
      "type": "text",
      "required": true,
      "section": "Maternal Vitals",
      "placeholder": "e.g., 120/80",
      "medicalCategory": "vitals"
    },
    {
      "id": "proteinuria",
      "label": "Urine Protein",
      "type": "select",
      "required": true,
      "section": "Maternal Vitals",
      "options": ["Negative", "Trace", "+1", "+2", "+3", "Not tested"],
      "medicalCategory": "vitals"
    },
    {
      "id": "fundal_height",
      "label": "Symphysio-Fundal Height (cm)",
      "type": "number",
      "required": true,
      "section": "Clinical Examination",
      "placeholder": "Measurement in cm...",
      "medicalCategory": "examination"
    },
    {
      "id": "fetal_lie",
      "label": "Fetal Lie",
      "type": "select",
      "required": false,
      "section": "Clinical Examination",
      "options": ["Longitudinal", "Transverse", "Oblique", "Unable to determine"],
      "medicalCategory": "examination"
    },
    {
      "id": "fetal_presentation",
      "label": "Fetal Presentation",
      "type": "select",
      "required": false,
      "section": "Clinical Examination",
      "options": ["Vertex", "Breech", "Shoulder", "Unable to determine"],
      "medicalCategory": "examination"
    },
    {
      "id": "fetal_heart_rate",
      "label": "Fetal Heart Rate (bpm)",
      "type": "number",
      "required": true,
      "section": "Clinical Examination",
      "placeholder": "Fetal heart rate...",
      "medicalCategory": "vitals"
    },
    {
      "id": "edema_assessment",
      "label": "Edema Assessment",
      "type": "select",
      "required": true,
      "section": "Clinical Examination",
      "options": ["None", "Ankle only", "Ankle and leg", "Generalized", "Facial"],
      "medicalCategory": "examination"
    },
    {
      "id": "current_symptoms",
      "label": "Current Maternal Symptoms",
      "type": "checkbox",
      "required": false,
      "section": "Symptom Review",
      "options": ["Nausea/vomiting", "Heartburn", "Back pain", "Headaches", "Visual changes", "Abdominal pain", "Vaginal bleeding", "Discharge"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "supplements",
      "label": "Current Supplements/Medications",
      "type": "textarea",
      "required": true,
      "section": "Treatment Review",
      "placeholder": "Folic acid, iron, vitamins, other medications...",
      "medicalCategory": "treatment"
    },
    {
      "id": "lifestyle_advice",
      "label": "Lifestyle Counseling Provided",
      "type": "checkbox",
      "required": false,
      "section": "Health Promotion",
      "options": ["Nutrition guidance", "Exercise recommendations", "Smoking cessation", "Alcohol avoidance", "Sleep hygiene", "Mental health support"],
      "medicalCategory": "treatment"
    },
    {
      "id": "next_appointment",
      "label": "Next Appointment Date",
      "type": "date",
      "required": true,
      "section": "Follow-up Plan",
      "medicalCategory": "followup"
    },
    {
      "id": "investigations_ordered",
      "label": "Investigations Ordered",
      "type": "textarea",
      "required": false,
      "section": "Follow-up Plan",
      "placeholder": "Blood tests, scans, specialist referrals...",
      "medicalCategory": "followup"
    }
  ]
}', true, NOW());

-- 4. Diabetic Review Form
INSERT INTO consultation_forms (name, description, specialist_role, form_structure, is_active, created_at) VALUES
('Diabetic Review Assessment', 'Comprehensive diabetes management review following ADA/EASD guidelines', 'Doctor/Nurse', '{
  "fields": [
    {
      "id": "diabetes_type",
      "label": "Diabetes Type",
      "type": "select",
      "required": true,
      "section": "Background",
      "options": ["Type 1", "Type 2", "Gestational", "MODY", "Secondary"],
      "medicalCategory": "diagnosis"
    },
    {
      "id": "hba1c_current",
      "label": "Current HbA1c (%)",
      "type": "number",
      "required": true,
      "section": "Glycemic Control",
      "placeholder": "e.g., 7.2",
      "medicalCategory": "vitals"
    },
    {
      "id": "hba1c_target",
      "label": "HbA1c Target (%)",
      "type": "number",
      "required": true,
      "section": "Glycemic Control",
      "placeholder": "e.g., 7.0",
      "medicalCategory": "treatment"
    },
    {
      "id": "glucose_monitoring",
      "label": "Blood Glucose Monitoring Frequency",
      "type": "select",
      "required": true,
      "section": "Self-Management",
      "options": ["4+ times daily", "2-3 times daily", "Once daily", "Few times weekly", "Rarely", "Never"],
      "medicalCategory": "treatment"
    },
    {
      "id": "hypoglycemia_episodes",
      "label": "Hypoglycemic Episodes (past month)",
      "type": "number",
      "required": true,
      "section": "Glycemic Control",
      "placeholder": "Number of episodes...",
      "medicalCategory": "symptoms"
    },
    {
      "id": "severe_hypo",
      "label": "Severe Hypoglycemia (past year)",
      "type": "number",
      "required": true,
      "section": "Glycemic Control",
      "placeholder": "Episodes requiring assistance...",
      "medicalCategory": "symptoms"
    },
    {
      "id": "current_medications",
      "label": "Current Diabetes Medications",
      "type": "textarea",
      "required": true,
      "section": "Treatment Review",
      "placeholder": "List all diabetes medications, doses, timing...",
      "medicalCategory": "treatment"
    },
    {
      "id": "medication_adherence",
      "label": "Medication Adherence",
      "type": "select",
      "required": true,
      "section": "Treatment Review",
      "options": ["Excellent (>95%)", "Good (80-95%)", "Fair (60-80%)", "Poor (<60%)"],
      "medicalCategory": "treatment"
    },
    {
      "id": "diet_adherence",
      "label": "Dietary Plan Adherence",
      "type": "select",
      "required": true,
      "section": "Lifestyle Management",
      "options": ["Excellent", "Good", "Fair", "Poor", "No formal plan"],
      "medicalCategory": "history"
    },
    {
      "id": "exercise_routine",
      "label": "Exercise Routine",
      "type": "select",
      "required": true,
      "section": "Lifestyle Management",
      "options": ["Regular (5+ days/week)", "Moderate (3-4 days/week)", "Occasional (1-2 days/week)", "Sedentary"],
      "medicalCategory": "history"
    },
    {
      "id": "weight_current",
      "label": "Current Weight (kg)",
      "type": "number",
      "required": true,
      "section": "Anthropometry",
      "placeholder": "Current weight...",
      "medicalCategory": "vitals"
    },
    {
      "id": "bmi",
      "label": "BMI (kg/m²)",
      "type": "number",
      "required": true,
      "section": "Anthropometry",
      "placeholder": "Body Mass Index...",
      "medicalCategory": "vitals"
    },
    {
      "id": "complications_screening",
      "label": "Complications Screening",
      "type": "checkbox",
      "required": false,
      "section": "Complications Assessment",
      "options": ["Retinal screening up-to-date", "Foot examination done", "Kidney function checked", "Cardiovascular risk assessed"],
      "medicalCategory": "examination"
    },
    {
      "id": "diabetic_education",
      "label": "Diabetes Education Needs",
      "type": "checkbox",
      "required": false,
      "section": "Education",
      "options": ["Carbohydrate counting", "Insulin adjustment", "Hypoglycemia management", "Sick day rules", "Foot care"],
      "medicalCategory": "treatment"
    }
  ]
}', true, NOW());

-- 5. Mental Health Review Form
INSERT INTO consultation_forms (name, description, specialist_role, form_structure, is_active, created_at) VALUES
('Mental Health Review Assessment', 'Comprehensive mental health assessment and monitoring form', 'Doctor/Psychologist/Counselor', '{
  "fields": [
    {
      "id": "presenting_concern",
      "label": "Current Mental Health Concerns",
      "type": "textarea",
      "required": true,
      "section": "Presenting Issues",
      "placeholder": "Main concerns or symptoms...",
      "medicalCategory": "symptoms"
    },
    {
      "id": "mood_rating",
      "label": "Current Mood Rating (1-10)",
      "type": "number",
      "required": true,
      "section": "Mental State",
      "placeholder": "1=Very low, 10=Excellent",
      "validation": {"min": 1, "max": 10},
      "medicalCategory": "symptoms"
    },
    {
      "id": "anxiety_level",
      "label": "Current Anxiety Level (1-10)",
      "type": "number",
      "required": true,
      "section": "Mental State",
      "placeholder": "1=None, 10=Severe",
      "validation": {"min": 1, "max": 10},
      "medicalCategory": "symptoms"
    },
    {
      "id": "sleep_pattern",
      "label": "Sleep Pattern",
      "type": "select",
      "required": true,
      "section": "Functional Assessment",
      "options": ["Normal (7-9 hours)", "Difficulty falling asleep", "Frequent awakening", "Early morning waking", "Sleeping too much", "Irregular pattern"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "appetite_changes",
      "label": "Appetite Changes",
      "type": "select",
      "required": true,
      "section": "Functional Assessment",
      "options": ["Normal", "Decreased", "Increased", "Variable"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "concentration",
      "label": "Concentration and Focus",
      "type": "select",
      "required": true,
      "section": "Cognitive Assessment",
      "options": ["Normal", "Mildly impaired", "Moderately impaired", "Severely impaired"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "social_functioning",
      "label": "Social Functioning",
      "type": "select",
      "required": true,
      "section": "Functional Assessment",
      "options": ["Normal social interaction", "Slightly reduced", "Moderately isolated", "Severely withdrawn"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "work_functioning",
      "label": "Work/School Performance",
      "type": "select",
      "required": true,
      "section": "Functional Assessment",
      "options": ["Normal performance", "Slightly affected", "Moderately affected", "Severely impaired", "Unable to work/study"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "current_medications",
      "label": "Current Psychiatric Medications",
      "type": "textarea",
      "required": false,
      "section": "Treatment Review",
      "placeholder": "List medications, doses, duration...",
      "medicalCategory": "treatment"
    },
    {
      "id": "medication_adherence",
      "label": "Medication Adherence",
      "type": "select",
      "required": false,
      "section": "Treatment Review",
      "options": ["Excellent", "Good", "Fair", "Poor", "Not applicable"],
      "medicalCategory": "treatment"
    },
    {
      "id": "therapy_engagement",
      "label": "Therapy/Counseling Engagement",
      "type": "select",
      "required": false,
      "section": "Treatment Review",
      "options": ["Actively engaged", "Moderate engagement", "Poor engagement", "Not in therapy"],
      "medicalCategory": "treatment"
    },
    {
      "id": "coping_strategies",
      "label": "Current Coping Strategies",
      "type": "checkbox",
      "required": false,
      "section": "Self-Management",
      "options": ["Exercise", "Meditation/mindfulness", "Social support", "Hobbies", "Relaxation techniques", "Problem-solving", "Substance use"],
      "medicalCategory": "treatment"
    },
    {
      "id": "risk_assessment",
      "label": "Risk Assessment",
      "type": "checkbox",
      "required": true,
      "section": "Risk Evaluation",
      "options": ["Self-harm thoughts", "Suicide ideation", "Harm to others", "Substance abuse", "No current risks identified"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "support_system",
      "label": "Support System Quality",
      "type": "select",
      "required": true,
      "section": "Social Assessment",
      "options": ["Strong support network", "Moderate support", "Limited support", "Isolated"],
      "medicalCategory": "history"
    }
  ]
}', true, NOW());

-- 6. Elderly Care Comprehensive Review (Enhanced)
INSERT INTO consultation_forms (name, description, specialist_role, form_structure, is_active, created_at) VALUES
('Geriatric Comprehensive Assessment', 'Comprehensive geriatric assessment for elderly patients focusing on functional status and quality of life', 'Doctor/Geriatrician/Nurse', '{
  "fields": [
    {
      "id": "functional_status",
      "label": "Activities of Daily Living (ADL)",
      "type": "checkbox",
      "required": true,
      "section": "Functional Assessment",
      "options": ["Independent bathing", "Independent dressing", "Independent toileting", "Independent mobility", "Independent feeding", "Independent continence"],
      "medicalCategory": "examination"
    },
    {
      "id": "instrumental_adl",
      "label": "Instrumental ADL",
      "type": "checkbox",
      "required": true,
      "section": "Functional Assessment",
      "options": ["Managing finances", "Medication management", "Shopping", "Meal preparation", "Housekeeping", "Transportation", "Phone use"],
      "medicalCategory": "examination"
    },
    {
      "id": "mobility_assessment",
      "label": "Mobility Status",
      "type": "select",
      "required": true,
      "section": "Physical Assessment",
      "options": ["Fully mobile", "Walking with aid", "Wheelchair dependent", "Bedbound"],
      "medicalCategory": "examination"
    },
    {
      "id": "fall_risk",
      "label": "Fall Risk Assessment",
      "type": "select",
      "required": true,
      "section": "Safety Assessment",
      "options": ["Low risk", "Moderate risk", "High risk"],
      "medicalCategory": "examination"
    },
    {
      "id": "falls_history",
      "label": "Falls in Past 12 Months",
      "type": "number",
      "required": true,
      "section": "Safety Assessment",
      "placeholder": "Number of falls...",
      "medicalCategory": "history"
    },
    {
      "id": "cognitive_status",
      "label": "Cognitive Assessment",
      "type": "select",
      "required": true,
      "section": "Cognitive Assessment",
      "options": ["Normal cognition", "Mild cognitive impairment", "Moderate impairment", "Severe impairment"],
      "medicalCategory": "examination"
    },
    {
      "id": "mood_elderly",
      "label": "Mood and Depression Screening",
      "type": "select",
      "required": true,
      "section": "Mental Health",
      "options": ["No concerns", "Mild mood changes", "Moderate depression", "Severe depression"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "nutrition_status",
      "label": "Nutritional Status",
      "type": "select",
      "required": true,
      "section": "Nutritional Assessment",
      "options": ["Well-nourished", "At risk of malnutrition", "Malnourished"],
      "medicalCategory": "examination"
    },
    {
      "id": "polypharmacy",
      "label": "Number of Regular Medications",
      "type": "number",
      "required": true,
      "section": "Medication Review",
      "placeholder": "Total number of medications...",
      "medicalCategory": "treatment"
    },
    {
      "id": "medication_review",
      "label": "Medication Review Needed",
      "type": "checkbox",
      "required": false,
      "section": "Medication Review",
      "options": ["Duplicate therapies", "Drug interactions", "Inappropriate medications", "Adherence issues", "Side effects present"],
      "medicalCategory": "treatment"
    },
    {
      "id": "social_isolation",
      "label": "Social Isolation Assessment",
      "type": "select",
      "required": true,
      "section": "Social Assessment",
      "options": ["Well-connected", "Some isolation", "Moderately isolated", "Severely isolated"],
      "medicalCategory": "history"
    },
    {
      "id": "advance_directives",
      "label": "Advance Care Planning Status",
      "type": "select",
      "required": true,
      "section": "Care Planning",
      "options": ["Completed and current", "Needs updating", "Not completed", "Declined discussion"],
      "medicalCategory": "treatment"
    }
  ]
}', true, NOW());

-- 7. Pediatric Growth and Development Review
INSERT INTO consultation_forms (name, description, specialist_role, form_structure, is_active, created_at) VALUES
('Pediatric Growth & Development Review', 'Comprehensive pediatric assessment for growth, development, and preventive care', 'Doctor/Pediatrician/Nurse', '{
  "fields": [
    {
      "id": "child_age",
      "label": "Child Age",
      "type": "text",
      "required": true,
      "section": "Demographics",
      "placeholder": "e.g., 2 years 6 months",
      "medicalCategory": "vitals"
    },
    {
      "id": "weight_current",
      "label": "Current Weight (kg)",
      "type": "number",
      "required": true,
      "section": "Growth Parameters",
      "placeholder": "Current weight...",
      "medicalCategory": "vitals"
    },
    {
      "id": "height_current",
      "label": "Current Height (cm)",
      "type": "number",
      "required": true,
      "section": "Growth Parameters",
      "placeholder": "Current height...",
      "medicalCategory": "vitals"
    },
    {
      "id": "head_circumference",
      "label": "Head Circumference (cm)",
      "type": "number",
      "required": false,
      "section": "Growth Parameters",
      "placeholder": "For children <2 years...",
      "medicalCategory": "vitals"
    },
    {
      "id": "growth_percentiles",
      "label": "Growth Chart Percentiles",
      "type": "textarea",
      "required": true,
      "section": "Growth Assessment",
      "placeholder": "Weight, height, BMI percentiles...",
      "medicalCategory": "vitals"
    },
    {
      "id": "developmental_milestones",
      "label": "Developmental Milestones Assessment",
      "type": "checkbox",
      "required": true,
      "section": "Development",
      "options": ["Gross motor appropriate", "Fine motor appropriate", "Language appropriate", "Social skills appropriate", "Cognitive development appropriate"],
      "medicalCategory": "examination"
    },
    {
      "id": "feeding_habits",
      "label": "Feeding/Eating Habits",
      "type": "select",
      "required": true,
      "section": "Nutrition",
      "options": ["Excellent appetite", "Good appetite", "Poor appetite", "Selective eating", "Feeding difficulties"],
      "medicalCategory": "history"
    },
    {
      "id": "sleep_pattern_child",
      "label": "Sleep Pattern",
      "type": "select",
      "required": true,
      "section": "Sleep Assessment",
      "options": ["Age-appropriate sleep", "Difficulty falling asleep", "Frequent night waking", "Early morning waking", "Nap issues"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "immunization_status",
      "label": "Immunization Status",
      "type": "select",
      "required": true,
      "section": "Preventive Care",
      "options": ["Up to date", "Behind schedule", "Incomplete records", "Parental concerns"],
      "medicalCategory": "treatment"
    },
    {
      "id": "behavioral_concerns",
      "label": "Behavioral Concerns",
      "type": "checkbox",
      "required": false,
      "section": "Behavioral Assessment",
      "options": ["Attention difficulties", "Hyperactivity", "Aggression", "Anxiety", "Mood changes", "Social difficulties", "No concerns"],
      "medicalCategory": "symptoms"
    },
    {
      "id": "school_performance",
      "label": "School/Daycare Performance",
      "type": "select",
      "required": false,
      "section": "Academic Assessment",
      "options": ["Excellent", "Good", "Average", "Below average", "Significant concerns", "Not applicable"],
      "medicalCategory": "history"
    },
    {
      "id": "safety_counseling",
      "label": "Safety Counseling Provided",
      "type": "checkbox",
      "required": false,
      "section": "Preventive Counseling",
      "options": ["Car seat safety", "Poison prevention", "Fall prevention", "Water safety", "Bike helmet", "Screen time limits"],
      "medicalCategory": "treatment"
    }
  ]
}', true, NOW());

-- 8. Chronic Kidney Disease Review
INSERT INTO consultation_forms (name, description, specialist_role, form_structure, is_active, created_at) VALUES
('Chronic Kidney Disease Review', 'Comprehensive CKD monitoring and management assessment', 'Doctor/Nephrologist/Nurse', '{
  "fields": [
    {
      "id": "ckd_stage",
      "label": "Current CKD Stage",
      "type": "select",
      "required": true,
      "section": "Disease Status",
      "options": ["Stage 1 (eGFR >90)", "Stage 2 (eGFR 60-89)", "Stage 3a (eGFR 45-59)", "Stage 3b (eGFR 30-44)", "Stage 4 (eGFR 15-29)", "Stage 5 (eGFR <15)"],
      "medicalCategory": "diagnosis"
    },
    {
      "id": "egfr_current",
      "label": "Current eGFR (mL/min/1.73m²)",
      "type": "number",
      "required": true,
      "section": "Laboratory Values",
      "placeholder": "Estimated glomerular filtration rate...",
      "medicalCategory": "vitals"
    },
    {
      "id": "creatinine_current",
      "label": "Current Serum Creatinine (mg/dL)",
      "type": "number",
      "required": true,
      "section": "Laboratory Values",
      "placeholder": "Serum creatinine level...",
      "medicalCategory": "vitals"
    },
    {
      "id": "proteinuria_level",
      "label": "Proteinuria Assessment",
      "type": "select",
      "required": true,
      "section": "Laboratory Values",
      "options": ["Normal (<30 mg/g)", "Microalbuminuria (30-300 mg/g)", "Macroalbuminuria (>300 mg/g)", "Not tested"],
      "medicalCategory": "vitals"
    },
    {
      "id": "blood_pressure_ckd",
      "label": "Blood Pressure (mmHg)",
      "type": "text",
      "required": true,
      "section": "Cardiovascular Assessment",
      "placeholder": "e.g., 130/80",
      "medicalCategory": "vitals"
    },
    {
      "id": "bp_control",
      "label": "Blood Pressure Control",
      "type": "select",
      "required": true,
      "section": "Cardiovascular Assessment",
      "options": ["At target (<130/80)", "Above target", "Hypotensive episodes"],
      "medicalCategory": "treatment"
    },
    {
      "id": "current_medications_ckd",
      "label": "Current CKD Medications",
      "type": "textarea",
      "required": true,
      "section": "Treatment Review",
      "placeholder": "ACE inhibitors, ARBs, diuretics, phosphate binders...",
      "medicalCategory": "treatment"
    },
    {
      "id": "nephrotoxic_exposure",
      "label": "Nephrotoxic Medication Exposure",
      "type": "checkbox",
      "required": false,
      "section": "Risk Assessment",
      "options": ["NSAIDs", "Contrast agents", "Aminoglycosides", "Lithium", "None identified"],
      "medicalCategory": "history"
    },
    {
      "id": "mineral_bone_markers",
      "label": "Mineral and Bone Markers",
      "type": "textarea",
      "required": false,
      "section": "Complications Screening",
      "placeholder": "Calcium, phosphorus, PTH, vitamin D levels...",
      "medicalCategory": "vitals"
    },
    {
      "id": "anemia_status",
      "label": "Anemia Assessment",
      "type": "select",
      "required": true,
      "section": "Complications Screening",
      "options": ["Normal hemoglobin", "Mild anemia (10-12 g/dL)", "Moderate anemia (8-10 g/dL)", "Severe anemia (<8 g/dL)"],
      "medicalCategory": "vitals"
    },
    {
      "id": "renal_replacement_planning",
      "label": "Renal Replacement Therapy Planning",
      "type": "select",
      "required": false,
      "section": "Advanced Care Planning",
      "options": ["Not applicable yet", "Education initiated", "Modality selection", "Access planning", "Listed for transplant"],
      "medicalCategory": "treatment"
    },
    {
      "id": "dietary_compliance",
      "label": "Dietary Restriction Compliance",
      "type": "select",
      "required": true,
      "section": "Lifestyle Management",
      "options": ["Excellent", "Good", "Fair", "Poor", "No formal restrictions"],
      "medicalCategory": "treatment"
    }
  ]
}', true, NOW());