# Print All Cards Functionality

## What Happens When You Click "Print All Cards"

### Step-by-Step Process

1. **Opens New Print Window**
   - Creates a new browser window/tab (`window.open('', '_blank')`)
   - If popup blocker prevents opening, function returns early

2. **Generates HTML for Each Card**
   - Loops through all `accessCards` in the state
   - For each card, generates HTML with:
     - **Patient Information**:
       - Patient name (first + last)
       - Patient ID (formatted as `PT000001`)
       - Phone number
       - Date of birth
     - **QR Code** (if enabled):
       - Scannable QR code linking to patient portal
       - Contains: portal URL, patient ID, phone, DOB, name
     - **Barcode** (if enabled):
       - CODE128 barcode with patient ID
     - **Portal Information**:
       - Portal URL
       - Features list: "Access: Appointments • Messages • Records • Lab Results"

3. **Applies Card Format**
   - Uses selected format (`standard`, `compact`, or `business`):
     - **Standard**: 85mm × 54mm (credit card size)
     - **Compact**: 70mm × 45mm (smaller)
     - **Business**: 90mm × 50mm (business card size)

4. **Creates Print-Ready HTML Document**
   - Writes complete HTML document to print window
   - Includes embedded CSS styles for:
     - Card layout and sizing
     - Typography (fonts, sizes, weights)
     - Colors (blue theme: #2563eb)
     - Print-specific styles (`@media print`)
   - Styles ensure:
     - Cards don't break across pages (`page-break-inside: avoid`)
     - Proper spacing and margins
     - Clean print output (removes shadows, adjusts margins)

5. **Opens Print Dialog**
   - Closes the document (`printWindow.document.close()`)
   - Immediately triggers browser print dialog (`printWindow.print()`)

### Card Layout Structure

```
┌─────────────────────────────┐
│      🏥                      │
│  Bluequee Patient Portal    │
├─────────────────────────────┤
│   Patient Name              │
│                              │
│  Patient ID: PT000001        │
│  Phone: +1234567890          │
│  DOB: 1990-01-01            │
│                              │
│      [QR Code]               │
│   Scan to Access Portal      │
│                              │
│  [Barcode]                   │
│                              │
│  portal-url/patient-portal   │
│  Access: Appointments • ...  │
└─────────────────────────────┘
```

### Features

✅ **Multi-Card Support**: Prints all selected patient cards  
✅ **QR Code Integration**: Each card includes scannable QR code  
✅ **Barcode Support**: Patient ID encoded as CODE128 barcode  
✅ **Print-Optimized**: CSS ensures clean print output  
✅ **Format Options**: Standard, compact, or business card sizes  
✅ **Page Break Handling**: Cards won't split across pages  

### Requirements

- **Patients Must Be Selected**: Only cards in `accessCards` state are printed
- **QR/Barcode Generation**: Must have been generated when adding patients
- **Browser Print Support**: Requires browser print dialog functionality

### Print Dialog Options

When print dialog opens, you can:
- Select printer
- Choose paper size (recommended: A4 or Letter)
- Set margins
- Preview before printing
- Save as PDF

### Use Cases

1. **Bulk Card Generation**: Print multiple patient access cards at once
2. **Patient Registration**: Give new patients their portal access cards
3. **Replacement Cards**: Re-print cards for existing patients
4. **Distribution**: Print cards for distribution at clinic front desk

### Code Location

**File**: `client/src/pages/patient-access-cards.tsx`  
**Function**: `printCards()` (lines 152-331)

### Related Functions

- `generateQRCode()`: Creates QR code for patient portal access
- `generateBarcode()`: Creates CODE128 barcode for patient ID
- `addPatient()`: Adds patient to card generation queue
- `removePatient()`: Removes patient from queue

### Notes

- Cards are generated client-side (no server request)
- QR codes contain JSON data with patient info and portal URL
- Barcodes use patient ID format: `PT000001`
- Print styles are optimized for standard printers
- Cards are sized for standard card stock (credit card size)

