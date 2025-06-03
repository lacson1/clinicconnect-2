import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { MedicalIcons } from '@/lib/medical-icons';
import { exportToPDF, printElement, generateClinicHeader, formatDocumentDate } from './print-export-utils';

interface Prescription {
  id: number;
  patientId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedBy: string;
  startDate: string;
  status: string;
  organizationId: number;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  title?: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
}

interface Organization {
  id: number;
  name: string;
  type: string;
  logoUrl?: string;
  themeColor: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

interface CustomPrescriptionPrintProps {
  prescriptions: Prescription[];
  patient: Patient;
  onClose: () => void;
}

export default function CustomPrescriptionPrint({ prescriptions, patient, onClose }: CustomPrescriptionPrintProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch active organization data
  const { data: organization } = useQuery<Organization>({
    queryKey: ['/api/print/organization'],
    retry: false,
  });

  const activePrescriptions = prescriptions.filter(p => p.status === 'active');

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      await printElement('prescription-print-content');
    } catch (error) {
      console.error('Print failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    setIsGenerating(true);
    try {
      await exportToPDF('prescription-print-content', {
        filename: `prescription_${patient.firstName}_${patient.lastName}_${new Date().toISOString().split('T')[0]}`,
        organization,
        format: 'a4',
        orientation: 'portrait'
      });
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!organization) {
    return (
      <Card className="p-6">
        <CardContent>
          <div className="text-center">
            <MedicalIcons.refresh className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading organization details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Prescription Print Preview</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint} disabled={isGenerating}>
                <MedicalIcons.print className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleExportPDF} disabled={isGenerating}>
                <MedicalIcons.download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Print Content */}
        <div id="prescription-print-content" className="bg-white p-8 print:p-0" style={{ minHeight: '297mm' }}>
        {/* Organization Header */}
        {generateClinicHeader(organization)}

        {/* Document Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: organization.themeColor }}>
            MEDICAL PRESCRIPTION
          </h2>
          <p className="text-sm text-gray-600">
            Date: {formatDocumentDate(new Date())}
          </p>
        </div>

        {/* Patient Information */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg print:bg-gray-100">
          <h3 className="text-lg font-semibold mb-4" style={{ color: organization.themeColor }}>
            Patient Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {patient.title} {patient.firstName} {patient.lastName}</p>
              <p><strong>Phone:</strong> {patient.phone}</p>
              {patient.email && <p><strong>Email:</strong> {patient.email}</p>}
            </div>
            <div>
              <p><strong>Date of Birth:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
              <p><strong>Gender:</strong> {patient.gender}</p>
              {patient.address && <p><strong>Address:</strong> {patient.address}</p>}
            </div>
          </div>
        </div>

        {/* Prescription Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4" style={{ color: organization.themeColor }}>
            Prescribed Medications
          </h3>
          
          {activePrescriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MedicalIcons.prescription className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active prescriptions found for this patient.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activePrescriptions.map((prescription, index) => (
                <div key={prescription.id} className="border-l-4 pl-4 py-3" style={{ borderLeftColor: organization.themeColor }}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold">{index + 1}. {prescription.medicationName}</h4>
                    <span className="text-sm text-gray-500">
                      Started: {new Date(prescription.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p><strong>Dosage:</strong> {prescription.dosage}</p>
                    </div>
                    <div>
                      <p><strong>Frequency:</strong> {prescription.frequency}</p>
                    </div>
                    <div>
                      <p><strong>Duration:</strong> {prescription.duration}</p>
                    </div>
                  </div>
                  
                  {prescription.instructions && (
                    <div className="mt-3 p-3 bg-blue-50 rounded print:bg-gray-100">
                      <p><strong>Instructions:</strong> {prescription.instructions}</p>
                    </div>
                  )}
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Prescribed by:</strong> Dr. {prescription.prescribedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-6 mt-12">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2" style={{ color: organization.themeColor }}>
                Prescribing Physician
              </h4>
              <div className="border-t border-gray-300 mt-8 pt-2">
                <p className="text-sm">Dr. {activePrescriptions[0]?.prescribedBy || 'N/A'}</p>
                <p className="text-sm text-gray-600">Signature & Date</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: organization.themeColor }}>
                Pharmacy Use
              </h4>
              <div className="border-t border-gray-300 mt-8 pt-2">
                <p className="text-sm text-gray-600">Dispensed by: ________________</p>
                <p className="text-sm text-gray-600 mt-2">Date: ________________</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="mt-8 text-xs text-gray-500 text-center border-t pt-4">
          <p>This prescription is valid only when issued by a licensed medical practitioner.</p>
          <p>Please follow the instructions carefully and consult your doctor if you experience any adverse effects.</p>
          <p className="mt-2">Generated on {new Date().toLocaleString()} | {organization.name}</p>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
}