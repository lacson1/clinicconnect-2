# How to Record Vital Signs

## Quick Start

### Step 1: Start the Server
```bash
npm run dev
```
The server should start on `http://localhost:5001`

### Step 2: Access Patient Profile
1. Log in to the application
2. Navigate to any patient's profile
3. Click on the **"Vitals"** tab

### Step 3: Record Vital Signs
1. Click the **"Record Vitals"** or **"Add Vitals"** button
2. Fill in the vital signs form:
   - **Systolic BP**: e.g., 120
   - **Diastolic BP**: e.g., 80
   - **Heart Rate**: e.g., 72 bpm
   - **Temperature**: e.g., 36.5°C
   - **Respiratory Rate**: e.g., 16
   - **Oxygen Saturation**: e.g., 98%
   - **Weight**: e.g., 70.5 kg
   - **Height**: e.g., 175 cm
3. Click **"Save"** or **"Record"**

## API Endpoint

**POST** `/api/patients/:id/vitals`

**Request Body:**
```json
{
  "bloodPressureSystolic": 120,
  "bloodPressureDiastolic": 80,
  "heartRate": 72,
  "temperature": 36.5,
  "respiratoryRate": 16,
  "oxygenSaturation": 98,
  "weight": 70.5,
  "height": 175.0
}
```

**Response:**
```json
{
  "id": 1,
  "patientId": 5,
  "organizationId": 1,
  "bloodPressureSystolic": 120,
  "bloodPressureDiastolic": 80,
  "heartRate": 72,
  "temperature": "36.5",
  "respiratoryRate": 16,
  "oxygenSaturation": 98,
  "weight": "70.5",
  "height": "175.0",
  "recordedAt": "2024-12-18T21:30:00.000Z",
  "recordedBy": "admin"
}
```

## Features

✅ **Organization Isolation** - Vital signs are scoped to your organization  
✅ **Patient Verification** - System verifies patient belongs to your organization  
✅ **Role-Based Access** - Only doctors, nurses, and admins can record vitals  
✅ **Automatic Timestamping** - Records include timestamp and recorder name  
✅ **Data Validation** - All fields are validated before saving  

## Components

- **`patient-vital-signs-tracker.tsx`** - Main component for recording and viewing vitals
- **`enhanced-visit-recording.tsx`** - Includes vital signs in visit recording
- **`visit-recording-modal.tsx`** - Visit form with vital signs section
- **`nursing-assessment.tsx`** - Nursing workflow with vital signs

## Testing

Use the test script to verify recording works:

```bash
node test-vital-signs.mjs admin admin123 [patientId]
```

## Troubleshooting

### "Failed to record vital signs" Error
- ✅ **Fixed:** OrganizationId is now included in all inserts
- ✅ **Fixed:** Routes are properly registered
- **Solution:** Restart server if you see this error

### "Organization context required" Error
- Ensure you're logged in
- Check that your user account has an organization assigned
- Verify session is active

### Route Not Found Error
- Ensure server is restarted after route fixes
- Check that routes are loading: `curl http://localhost:5001/api/health`

## Status

✅ **All fixes applied:**
- OrganizationId added to database inserts
- Routes added to modular system (`server/routes/patients.ts`)
- Authentication and role checks in place
- Patient verification added
- Error handling improved

**Ready to use after server restart!**

