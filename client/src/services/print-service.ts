export interface PrintableDocument {
  type: 'prescription' | 'lab-order' | 'consultation';
  data: any;
  organizationInfo: {
    name: string;
    type: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
  };
  patientInfo: {
    id: number;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    address?: string;
  };
  staffInfo: {
    fullName: string;
    title?: string;
    role: string;
    username: string;
    phone?: string;
  };
  createdAt: string;
  recordId: string | number;
}

export class PrintService {
  static generatePrintHTML(document: PrintableDocument): string {
    const { organizationInfo, patientInfo, staffInfo, data, type, createdAt, recordId } = document;
    
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.getDocumentTitle(type)} - ${organizationInfo.name}</title>
    <style>
        @media print {
            @page {
                size: A4;
                margin: 0.5in;
            }
            body { margin: 0; }
            .no-print { display: none; }
        }
        
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.4;
            color: #000;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f0f8f0;
            min-height: 100vh;
        }
        
        .print-container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .org-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .org-type {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        
        .org-details {
            font-size: 12px;
            line-height: 1.2;
        }
        
        .document-title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
            text-transform: uppercase;
            border: 2px solid #000;
            padding: 10px;
        }
        
        .info-section {
            margin: 15px 0;
            border: 1px solid #ccc;
            padding: 10px;
        }
        
        .info-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 8px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 3px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 12px;
        }
        
        .info-item {
            margin-bottom: 5px;
        }
        
        .label {
            font-weight: bold;
            display: inline-block;
            min-width: 100px;
        }
        
        .content-section {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #000;
        }
        
        .content-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .medication-item {
            border-bottom: 1px solid #eee;
            padding: 10px 0;
            margin-bottom: 10px;
        }
        
        .medication-name {
            font-weight: bold;
            font-size: 14px;
        }
        
        .medication-details {
            margin-top: 5px;
            font-size: 12px;
        }
        
        .lab-test {
            margin: 8px 0;
            padding: 8px;
            border-left: 3px solid #007bff;
            background-color: #f8f9fa;
        }
        
        .consultation-field {
            margin: 10px 0;
            padding: 8px;
            border: 1px solid #ddd;
            background-color: #fafafa;
        }
        
        .field-label {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .field-value {
            margin-left: 10px;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ccc;
            font-size: 11px;
        }
        
        .signature-section {
            margin-top: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        
        .signature-box {
            text-align: center;
        }
        
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 40px;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="print-container">
        <div class="header">
            <div class="org-name">${organizationInfo.name}</div>
            <div class="org-type">${organizationInfo.type.toUpperCase()}</div>
        <div class="org-details">
            ${organizationInfo.address ? organizationInfo.address + '<br>' : ''}
            ${organizationInfo.phone ? 'Tel: ' + organizationInfo.phone : ''}
            ${organizationInfo.email ? ' | Email: ' + organizationInfo.email : ''}
            ${organizationInfo.website ? '<br>Web: ' + organizationInfo.website : ''}
        </div>
    </div>
    
    <div class="document-title">${this.getDocumentTitle(type)}</div>
    
    <div class="info-section">
        <div class="info-title">PATIENT INFORMATION</div>
        <div class="info-grid">
            <div class="info-item">
                <span class="label">Patient ID:</span> ${patientInfo.id}
            </div>
            <div class="info-item">
                <span class="label">Date:</span> ${new Date(createdAt).toLocaleDateString()}
            </div>
            <div class="info-item">
                <span class="label">Name:</span> ${patientInfo.fullName}
            </div>
            <div class="info-item">
                <span class="label">Time:</span> ${new Date(createdAt).toLocaleTimeString()}
            </div>
            <div class="info-item">
                <span class="label">Date of Birth:</span> ${patientInfo.dateOfBirth}
            </div>
            <div class="info-item">
                <span class="label">Record #:</span> ${recordId}
            </div>
            <div class="info-item">
                <span class="label">Gender:</span> ${patientInfo.gender}
            </div>
            <div class="info-item">
                <span class="label">Phone:</span> ${patientInfo.phone}
            </div>
        </div>
        ${patientInfo.address ? `<div class="info-item" style="margin-top: 10px;"><span class="label">Address:</span> ${patientInfo.address}</div>` : ''}
    </div>
    
    <div class="info-section">
        <div class="info-title">HEALTHCARE PROVIDER</div>
        <div class="info-grid">
            <div class="info-item">
                <span class="label">Provider:</span> ${staffInfo.title ? staffInfo.title + ' ' : ''}${staffInfo.fullName}
            </div>
            <div class="info-item">
                <span class="label">Role:</span> ${staffInfo.role}
            </div>
            <div class="info-item">
                <span class="label">Username:</span> ${staffInfo.username}
            </div>
            ${staffInfo.phone ? `<div class="info-item"><span class="label">Phone:</span> ${staffInfo.phone}</div>` : ''}
        </div>
    </div>
    
    ${this.generateContentSection(type, data)}
    
    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-line">Healthcare Provider Signature</div>
        </div>
        <div class="signature-box">
            <div class="signature-line">Date</div>
        </div>
    </div>
    
    <div class="footer">
        <div>Printed on: ${currentDate} at ${currentTime}</div>
        <div style="margin-top: 5px;">This document was generated electronically by ${organizationInfo.name} clinic management system.</div>
    </div>
    
    </div><!-- Close print-container -->
    
    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>
    `;
  }

  private static getDocumentTitle(type: string): string {
    switch (type) {
      case 'prescription':
        return 'PRESCRIPTION';
      case 'lab-order':
        return 'LABORATORY ORDER';
      case 'consultation':
        return 'CONSULTATION RECORD';
      default:
        return 'MEDICAL DOCUMENT';
    }
  }

  private static generateContentSection(type: string, data: any): string {
    switch (type) {
      case 'prescription':
        return this.generatePrescriptionContent(data);
      case 'lab-order':
        return this.generateLabOrderContent(data);
      case 'consultation':
        return this.generateConsultationContent(data);
      default:
        return '<div class="content-section">Content not available</div>';
    }
  }

  private static generatePrescriptionContent(prescription: any): string {
    let content = `
    <div class="content-section">
        <div class="content-title">PRESCRIBED MEDICATIONS</div>
    `;

    if (prescription.medications && prescription.medications.length > 0) {
      prescription.medications.forEach((med: any, index: number) => {
        content += `
        <div class="medication-item">
            <div class="medication-name">${index + 1}. ${med.name || med.medicationName || 'Medication'}</div>
            <div class="medication-details">
                <div><strong>Dosage:</strong> ${med.dosage || 'As prescribed'}</div>
                <div><strong>Frequency:</strong> ${med.frequency || 'As directed'}</div>
                <div><strong>Duration:</strong> ${med.duration || 'As prescribed'}</div>
                ${med.instructions ? `<div><strong>Instructions:</strong> ${med.instructions}</div>` : ''}
                ${med.quantity ? `<div><strong>Quantity:</strong> ${med.quantity}</div>` : ''}
            </div>
        </div>
        `;
      });
    } else {
      content += '<div>No medications prescribed.</div>';
    }

    if (prescription.notes) {
      content += `
      <div style="margin-top: 20px; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">
          <div class="field-label">ADDITIONAL NOTES:</div>
          <div class="field-value">${prescription.notes}</div>
      </div>
      `;
    }

    content += '</div>';
    return content;
  }

  private static generateLabOrderContent(labOrder: any): string {
    let content = `
    <div class="content-section">
        <div class="content-title">LABORATORY TESTS ORDERED</div>
    `;

    if (labOrder.tests && labOrder.tests.length > 0) {
      labOrder.tests.forEach((test: any, index: number) => {
        content += `
        <div class="lab-test">
            <div><strong>${index + 1}. ${test.name || test.testName || 'Laboratory Test'}</strong></div>
            ${test.category ? `<div><em>Category:</em> ${test.category}</div>` : ''}
            ${test.description ? `<div><em>Description:</em> ${test.description}</div>` : ''}
            ${test.instructions ? `<div><em>Instructions:</em> ${test.instructions}</div>` : ''}
        </div>
        `;
      });
    } else {
      content += '<div>No laboratory tests ordered.</div>';
    }

    if (labOrder.notes || labOrder.instructions) {
      content += `
      <div style="margin-top: 20px; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">
          <div class="field-label">ADDITIONAL INSTRUCTIONS:</div>
          <div class="field-value">${labOrder.notes || labOrder.instructions}</div>
      </div>
      `;
    }

    content += '</div>';
    return content;
  }

  private static generateConsultationContent(consultation: any): string {
    let content = `
    <div class="content-section">
        <div class="content-title">CONSULTATION DETAILS</div>
    `;

    if (consultation.formName) {
      content += `
      <div class="consultation-field">
          <div class="field-label">CONSULTATION TYPE:</div>
          <div class="field-value">${consultation.formName}</div>
      </div>
      `;
    }

    if (consultation.formData && typeof consultation.formData === 'object') {
      Object.entries(consultation.formData).forEach(([key, value]: [string, any]) => {
        if (value && value.toString().trim()) {
          const fieldName = key.includes('field_') ? 'Clinical Notes' : 
                           key.replace(/([A-Z])/g, ' $1')
                              .replace(/[_-]/g, ' ')
                              .replace(/^./, str => str.toUpperCase())
                              .trim();
          
          content += `
          <div class="consultation-field">
              <div class="field-label">${fieldName.toUpperCase()}:</div>
              <div class="field-value">${Array.isArray(value) ? value.join(', ') : value}</div>
          </div>
          `;
        }
      });
    }

    if (consultation.diagnosis) {
      content += `
      <div class="consultation-field">
          <div class="field-label">DIAGNOSIS:</div>
          <div class="field-value">${consultation.diagnosis}</div>
      </div>
      `;
    }

    if (consultation.treatment) {
      content += `
      <div class="consultation-field">
          <div class="field-label">TREATMENT PLAN:</div>
          <div class="field-value">${consultation.treatment}</div>
      </div>
      `;
    }

    content += '</div>';
    return content;
  }

  static async printDocument(document: PrintableDocument): Promise<void> {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(this.generatePrintHTML(document));
      printWindow.document.close();
    }
  }

  static async downloadPDF(document: PrintableDocument): Promise<void> {
    // Note: This requires html2pdf.js library
    const html = this.generatePrintHTML(document);
    const element = window.document.createElement('div');
    element.innerHTML = html;
    
    if ((window as any).html2pdf) {
      const filename = `${document.type}-${document.recordId}-${new Date().toISOString().split('T')[0]}.pdf`;
      (window as any).html2pdf().from(element).save(filename);
    } else {
      // Fallback to opening print dialog
      this.printDocument(document);
    }
  }
}