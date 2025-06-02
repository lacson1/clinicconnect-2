import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from 'qrcode.react';
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle, 
  History, 
  Stethoscope, 
  FlaskRound,
  Plus,
  Pill,
  Activity,
  Heart,
  Clock,
  UserCheck,
  FileText,
  Edit,
  Brain,
  MessageCircle,
  CheckCircle,
  Eye,
  Thermometer,
  Ear,
  Search,
  X,
  Printer,
  ChevronDown,
  BarChart3,
  Settings,
  MoreHorizontal,
  QrCode,
  RefreshCw,
  Send,
  Ban,
  StopCircle,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  Droplets,
  Wind,
  Gauge
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VisitRecordingModal } from "@/components/visit-recording-modal";
import LabResultModal from "@/components/lab-result-modal";
import PrescriptionModal from "@/components/prescription-modal";
import { EditPatientModal } from "@/components/edit-patient-modal";
import PatientQRCard from "@/components/patient-qr-card";
import ConsultationHistoryDisplay from "@/components/consultation-history-display";
import PatientChat from "@/components/patient-chat";
import LabOrderForm from "@/components/lab-order-form";
import LabOrdersList from "@/components/lab-orders-list";
import ConsultationHistory from "@/components/consultation-history";
import ConsultationFormSelector from "@/components/consultation-form-selector";
import VaccinationManagement from "@/components/vaccination-management";
import AllergyManagement from "@/components/allergy-management";
import MedicalHistoryManagement from "@/components/medical-history-management";

import { PatientSummaryPrintable } from "@/components/patient-summary-printable";
import { FloatingActionMenu } from "@/components/floating-action-menu";
import { useRole } from "@/components/role-guard";
import PatientDocuments from "@/components/patient-documents";
import PatientLabResults from "@/components/patient-lab-results";
import PatientLabOrdersSummary from "@/components/patient-lab-orders-summary";
import MedicationManagementTabs from "@/components/MedicationManagementTabs";
import StandaloneVitalSignsRecorder from "@/components/standalone-vital-signs-recorder";
import VitalSignsTrends from "@/components/vital-signs-trends";
import VitalSignsAlerts from "@/components/vital-signs-alerts";
import PatientTimeline from "@/components/patient-timeline";
import DocumentActionButtons from "@/components/DocumentActionButtons";
import PrescriptionPrintModal from "@/components/PrescriptionPrintModal";
import type { Patient, Visit, LabResult, Prescription } from "@shared/schema";

interface Organization {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export default function PatientProfile() {
  const [, params] = useRoute("/patients/:id");
  const patientId = params?.id ? parseInt(params.id) : undefined;
  const { user } = useRole();
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string | null>(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [preSelectedFormId, setPreSelectedFormId] = useState<number | null>(null);
  const [assessmentSearchTerm, setAssessmentSearchTerm] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [showVisitDetails, setShowVisitDetails] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [showStandaloneVitals, setShowStandaloneVitals] = useState(false);
  const [showVitalsTrends, setShowVitalsTrends] = useState(false);
  const [showVitalsAlerts, setShowVitalsAlerts] = useState(false);
  const [vitalsTimeRange, setVitalsTimeRange] = useState('30'); // Days to show
  const [showPrescriptionPrintModal, setShowPrescriptionPrintModal] = useState(false);
  const [selectedPrescriptionForPrint, setSelectedPrescriptionForPrint] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQRCodeData] = useState('');

  // Handle lab orders navigation events
  useEffect(() => {
    const handleLabOrdersNavigation = () => {
      setActiveTab("lab-orders");
    };

    window.addEventListener('switchToLabOrdersTab', handleLabOrdersNavigation);
    window.addEventListener('switchToLabsTab', handleLabOrdersNavigation);

    return () => {
      window.removeEventListener('switchToLabOrdersTab', handleLabOrdersNavigation);
      window.removeEventListener('switchToLabsTab', handleLabOrdersNavigation);
    };
  }, []);

  const { data: patient, isLoading: patientLoading } = useQuery<Patient>({
    queryKey: [`/api/patients/${patientId}`],
    enabled: !!patientId,
  });

  const { data: visits, isLoading: visitsLoading } = useQuery<Visit[]>({
    queryKey: [`/api/patients/${patientId}/visits`],
    enabled: !!patientId,
  });

  const { data: labOrders, isLoading: labOrdersLoading } = useQuery({
    queryKey: [`/api/patients/${patientId}/lab-orders`],
    enabled: !!patientId,
  });

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery<Prescription[]>({
    queryKey: [`/api/patients/${patientId}/prescriptions`],
    enabled: !!patientId,
  });

  // Fetch standalone vital signs data
  const { data: vitalSigns = [], isLoading: vitalsLoading } = useQuery({
    queryKey: [`/api/patients/${patientId}/vitals`],
    enabled: !!patientId,
  });

  // Filter visits based on selected time range
  const filterVisitsByTimeRange = (visits: any[], days: string) => {
    if (!visits) return [];
    if (days === 'all') return visits;
    
    const daysToShow = parseInt(days);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToShow);
    
    return visits.filter(visit => {
      const visitDate = new Date(visit.visitDate);
      return visitDate >= cutoffDate;
    });
  };

  const filteredVisits = filterVisitsByTimeRange(visits, vitalsTimeRange);
  
  // Helper function to determine vital sign status and color
  const getVitalStatus = (type: string, value: any) => {
    if (!value || value === 'N/A') return { status: 'No Data', color: 'text-gray-500', bgColor: 'from-gray-50 to-gray-100', borderColor: 'border-gray-500' };
    
    switch (type) {
      case 'bloodPressure':
        if (typeof value === 'string' && value.includes('/')) {
          const [systolic, diastolic] = value.split('/').map(Number);
          // European Heart Association guidelines
          if (systolic >= 180 || diastolic >= 110) {
            return { status: 'Grade 3 Hypertension', color: 'text-red-800', bgColor: 'from-red-50 to-red-100', borderColor: 'border-red-500' };
          } else if (systolic >= 160 || diastolic >= 100) {
            return { status: 'Grade 2 Hypertension', color: 'text-red-700', bgColor: 'from-red-50 to-red-100', borderColor: 'border-red-400' };
          } else if (systolic >= 140 || diastolic >= 90) {
            return { status: 'Grade 1 Hypertension', color: 'text-orange-800', bgColor: 'from-orange-50 to-orange-100', borderColor: 'border-orange-500' };
          } else if (systolic >= 130 || diastolic >= 85) {
            return { status: 'High Normal', color: 'text-yellow-800', bgColor: 'from-yellow-50 to-yellow-100', borderColor: 'border-yellow-500' };
          } else if (systolic < 90 || diastolic < 60) {
            return { status: 'Low', color: 'text-blue-800', bgColor: 'from-blue-50 to-blue-100', borderColor: 'border-blue-500' };
          }
        }
        return { status: 'Optimal', color: 'text-green-800', bgColor: 'from-green-50 to-green-100', borderColor: 'border-green-500' };
      
      case 'heartRate':
        const hr = typeof value === 'string' ? parseInt(value) : value;
        if (hr < 60) {
          return { status: 'Low', color: 'text-orange-800', bgColor: 'from-orange-50 to-orange-100', borderColor: 'border-orange-500' };
        } else if (hr > 100) {
          return { status: 'High', color: 'text-red-800', bgColor: 'from-red-50 to-red-100', borderColor: 'border-red-500' };
        }
        return { status: 'Normal', color: 'text-green-800', bgColor: 'from-green-50 to-green-100', borderColor: 'border-green-500' };
      
      case 'temperature':
        const temp = typeof value === 'string' ? parseFloat(value) : value;
        if (temp < 36.1) {
          return { status: 'Low', color: 'text-blue-800', bgColor: 'from-blue-50 to-blue-100', borderColor: 'border-blue-500' };
        } else if (temp > 37.2) {
          return { status: 'High', color: 'text-red-800', bgColor: 'from-red-50 to-red-100', borderColor: 'border-red-500' };
        }
        return { status: 'Normal', color: 'text-green-800', bgColor: 'from-green-50 to-green-100', borderColor: 'border-green-500' };
      
      default:
        return { status: 'Normal', color: 'text-green-800', bgColor: 'from-green-50 to-green-100', borderColor: 'border-green-500' };
    }
  };

  // Calculate summary statistics for filtered data
  const calculateVitalStats = (visits: any[]) => {
    const visitsWithVitals = visits?.filter(v => v.bloodPressure || v.heartRate || v.temperature) || [];
    if (visitsWithVitals.length === 0) return null;
    
    const bpValues = visitsWithVitals.filter(v => v.bloodPressure).map(v => v.bloodPressure);
    const hrValues = visitsWithVitals.filter(v => v.heartRate).map(v => parseInt(v.heartRate));
    const tempValues = visitsWithVitals.filter(v => v.temperature).map(v => parseFloat(v.temperature));
    
    const avgBp = bpValues.length > 0 ? bpValues[0] : 'N/A';
    const avgHr = hrValues.length > 0 ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length) : 'N/A';
    const avgTemp = tempValues.length > 0 ? (tempValues.reduce((a, b) => a + b, 0) / tempValues.length).toFixed(1) : 'N/A';
    
    return {
      bloodPressure: {
        trend: getVitalStatus('bloodPressure', avgBp).status,
        average: avgBp,
        ...getVitalStatus('bloodPressure', avgBp)
      },
      heartRate: {
        trend: getVitalStatus('heartRate', avgHr).status,
        average: avgHr,
        ...getVitalStatus('heartRate', avgHr)
      },
      temperature: {
        trend: getVitalStatus('temperature', avgTemp).status,
        average: avgTemp,
        ...getVitalStatus('temperature', avgTemp)
      }
    };
  };

  const vitalStats = calculateVitalStats(filteredVisits);

  // Fetch organization data for branding
  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
  });

  // Get current user's organization
  const currentOrganization = Array.isArray(organizations) 
    ? organizations.find(org => org.id === (user as any)?.organizationId)
    : undefined;

  // Functional handlers for action buttons
  const handleViewVisit = (visit: any) => {
    setSelectedVisit(visit);
    setShowVisitDetails(true);
  };

  const handlePrintVisit = (visit: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Visit Record - ${patient?.firstName} ${patient?.lastName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Visit Record</h2>
              <p>Patient: ${patient?.firstName} ${patient?.lastName}</p>
              <p>Date: ${new Date(visit.visitDate).toLocaleDateString()}</p>
            </div>
            <div class="section">
              <div class="label">Visit Type:</div>
              <p>${visit.visitType}</p>
            </div>
            <div class="section">
              <div class="label">Chief Complaint:</div>
              <p>${visit.complaint || 'N/A'}</p>
            </div>
            <div class="section">
              <div class="label">Diagnosis:</div>
              <p>${visit.diagnosis || 'N/A'}</p>
            </div>
            <div class="section">
              <div class="label">Treatment:</div>
              <p>${visit.treatment || 'N/A'}</p>
            </div>
            <div class="section">
              <div class="label">Vital Signs:</div>
              <p>Blood Pressure: ${visit.bloodPressure || 'N/A'}</p>
              <p>Heart Rate: ${visit.heartRate || 'N/A'}</p>
              <p>Temperature: ${visit.temperature || 'N/A'}</p>
              <p>Weight: ${visit.weight || 'N/A'}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCompletePrescription = async (prescription: any) => {
    try {
      const response = await fetch(`/api/prescriptions/${prescription.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to complete prescription:', error);
    }
  };

  const handlePrintPrescription = (prescription: any) => {
    setSelectedPrescriptionForPrint(prescription);
    setShowPrescriptionPrintModal(true);
  };

  // Fetch consultation forms for specialty assessments
  const { data: consultationForms = [] } = useQuery({
    queryKey: ["/api/consultation-forms"],
  });

  // Handler for selecting an assessment form
  const handleAssessmentFormSelect = (assessmentType: string) => {
    // Enhanced matching logic for consultation forms
    const matchingForm = consultationForms.find((form: any) => {
      const formName = (form.name || form.templateName || '').toLowerCase();
      const assessmentLower = assessmentType.toLowerCase();
      
      // Direct name matches
      if (formName.includes(assessmentLower) || assessmentLower.includes(formName)) {
        return true;
      }
      
      // Specific mapping for common assessment types
      const mappings: Record<string, string[]> = {
        'dermatological': ['dermatology', 'skin', 'dermatological'],
        'ent': ['ent', 'ear nose throat', 'otolaryngology'],
        'cardiac': ['cardiac', 'cardiology', 'heart'],
        'respiratory': ['respiratory', 'pulmonary', 'lung'],
        'neurological': ['neurological', 'neurology', 'neuro'],
        'pediatric': ['pediatric', 'paediatric', 'child', 'kids'],
        'antenatal': ['antenatal', 'prenatal', 'pregnancy', 'maternal'],
        'mental-health': ['mental', 'psychiatric', 'psychology', 'psych'],
        'orthopedic': ['orthopedic', 'orthopaedic', 'bone', 'joint'],
        'pdcntss': ['pdcntss', 'diagnostic', 'screening'],
        'ophthalmology': ['ophthalmology', 'eye', 'vision', 'ophthalmic'],
        'endocrinology': ['endocrinology', 'hormone', 'endocrine', 'diabetes'],
        'gastroenterology': ['gastroenterology', 'gastro', 'digestive', 'gi'],
        'urology': ['urology', 'urological', 'kidney', 'bladder']
      };
      
      const keywords = mappings[assessmentLower] || [assessmentLower];
      return keywords.some(keyword => formName.includes(keyword));
    });
    
    if (matchingForm) {
      // Switch to visits tab and pre-select the form
      setActiveTab("visits");
      setPreSelectedFormId(matchingForm.id);
      
      // Clear the selection after a brief delay to allow form to load
      setTimeout(() => {
        setPreSelectedFormId(null);
      }, 2000);
    } else {
      // Switch to visits tab to show form selector for creating new assessment
      setActiveTab("visits");
      setPreSelectedFormId(null);
    }
  };

  // Define all available assessments for filtering
  const allAssessments = [
    { type: 'antenatal', name: 'Antenatal Assessment', description: 'Prenatal care evaluation', keywords: ['pregnancy', 'prenatal', 'maternal'] },
    { type: 'pediatric', name: 'Pediatric Assessment', description: 'Child health evaluation', keywords: ['child', 'kids', 'pediatric'] },
    { type: 'cardiac', name: 'Cardiac Assessment', description: 'Heart health evaluation', keywords: ['heart', 'cardiology', 'cardiovascular'] },
    { type: 'respiratory', name: 'Respiratory Assessment', description: 'Lung function evaluation', keywords: ['lung', 'breathing', 'pulmonary'] },
    { type: 'neurological', name: 'Neurological Assessment', description: 'Nervous system evaluation', keywords: ['brain', 'nerve', 'neuro'] },
    { type: 'mental-health', name: 'Mental Health Assessment', description: 'Psychological evaluation', keywords: ['mental', 'psychology', 'psychiatric'] },
    { type: 'dermatological', name: 'Dermatological Assessment', description: 'Skin health evaluation', keywords: ['skin', 'dermatology', 'rash'] },
    { type: 'orthopedic', name: 'Orthopedic Assessment', description: 'Bone and joint evaluation', keywords: ['bone', 'joint', 'orthopedic'] },
    { type: 'ent', name: 'ENT Assessment', description: 'Ear, nose, throat evaluation', keywords: ['ear', 'nose', 'throat'] },
    { type: 'pdcntss', name: 'PDCNTSS Assessment', description: 'Specialized diagnostic screening', keywords: ['diagnostic', 'screening', 'pdcntss'] },
    { type: 'ophthalmology', name: 'Ophthalmology Assessment', description: 'Eye health examination', keywords: ['eye', 'vision', 'sight'] },
    { type: 'endocrinology', name: 'Endocrinology Assessment', description: 'Hormone and gland evaluation', keywords: ['hormone', 'diabetes', 'thyroid'] },
    { type: 'gastroenterology', name: 'Gastroenterology Assessment', description: 'Digestive system evaluation', keywords: ['stomach', 'digestive', 'gastro'] },
    { type: 'urology', name: 'Urology Assessment', description: 'Urinary system evaluation', keywords: ['kidney', 'bladder', 'urinary'] }
  ];

  // Filter assessments based on search term
  const filteredAssessments = allAssessments.filter(assessment => {
    if (!assessmentSearchTerm) return true;
    const searchLower = assessmentSearchTerm.toLowerCase();
    return (
      assessment.name.toLowerCase().includes(searchLower) ||
      assessment.description.toLowerCase().includes(searchLower) ||
      assessment.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  });

  // Handler for creating a new assessment form


  // Handler for completing an assessment
  const handleAssessmentComplete = async (assessmentData: any) => {
    try {
      // Save the assessment as a consultation record
      const consultationData = {
        patientId: patientId,
        type: 'specialty_assessment',
        specialtyType: selectedAssessmentType,
        findings: assessmentData.findings || '',
        diagnosis: assessmentData.diagnosis || '',
        treatment: assessmentData.treatment || '',
        notes: JSON.stringify(assessmentData),
        followUpDate: assessmentData.followUpDate,
      };

      // This would integrate with your existing visit recording system
      console.log('Saving specialty assessment:', consultationData);
      setShowAssessmentModal(false);
      setSelectedAssessmentType(null);
      
      // Refresh consultation history
      // The consultation would appear in the visits tab
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  };

  if (patientLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">Patient not found</h3>
          <p className="mt-2 text-sm text-slate-500">The patient you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      {/* Premium Compact Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Patient Identity & Actions Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 ring-2 ring-blue-100 ring-offset-2">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-lg font-semibold">
                  {patient.firstName?.[0]?.toUpperCase()}{patient.lastName?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {patient.title ? `${patient.title} ` : ''}{patient.firstName} {patient.lastName}
                  </h1>
                  <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    HC{patient.id?.toString().padStart(6, "0")}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years
                  </span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {patient.gender}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-white/50">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuItem onClick={() => setActiveTab("overview")}>
                    <User className="w-4 h-4 mr-2" />
                    Patient Overview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("vitals")}>
                    <Thermometer className="w-4 h-4 mr-2" />
                    Vital Signs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("visits")}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Visits History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("specialty")}>
                    <Brain className="w-4 h-4 mr-2" />
                    Specialty Assessment
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("labs")}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Lab Results
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("medications")}>
                    <Pill className="w-4 h-4 mr-2" />
                    Medications
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("documents")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Documents
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("chat")}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Patient Chat
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Patient Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-xs px-3 py-1">
                Active Patient
              </Badge>
            </div>
          </div>

          {/* Contact & Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            {patient.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Phone:</span>
                <span>{patient.phone}</span>
              </div>
            )}
            {patient.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-green-500" />
                <span className="font-medium">Email:</span>
                <span>{patient.email}</span>
              </div>
            )}
            {patient.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="font-medium">Address:</span>
                <span className="truncate">{patient.address}</span>
              </div>
            )}
          </div>

          {/* Quick Stats & Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Total Visits:</span>
                <Badge variant="outline">{visits?.length || 0}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <FlaskRound className="w-4 h-4 text-green-500" />
                <span className="font-medium">Lab Results:</span>
                <Badge variant="outline">{labOrders?.length || 0}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-purple-500" />
                <span className="font-medium">Active Prescriptions:</span>
                <Badge variant="outline">{prescriptions?.filter(p => p.status === 'active')?.length || 0}</Badge>
              </div>
            </div>
            
            {/* Edit Button moved to bottom right */}
            {(user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse') && (
              <Button variant="outline" onClick={() => setShowEditPatientModal(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Patient Info
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-6 h-full">
          {/* Professional Compact Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl px-4 py-3 mb-6 shadow-sm">
              <TabsList className="grid w-full grid-cols-8 bg-slate-50/50 gap-1 h-11 p-1 rounded-lg">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm 
                           rounded-md transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-white/50
                           font-medium py-2 px-3 text-sm flex items-center justify-center gap-2 h-9"
                >
                  <User className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="timeline"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-blue-600 
                           rounded-lg transition-all duration-300 ease-in-out text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-transparent
                           font-medium py-3 px-4 text-sm flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Clock className="w-4 h-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger 
                  value="vitals"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-blue-600 
                           rounded-lg transition-all duration-300 ease-in-out text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-transparent
                           font-medium py-3 px-4 text-sm flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Activity className="w-4 h-4" />
                  Vitals
                </TabsTrigger>
                <TabsTrigger 
                  value="visits"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-blue-600 
                           rounded-lg transition-all duration-300 ease-in-out text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-transparent
                           font-medium py-3 px-4 text-sm flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Calendar className="w-4 h-4" />
                  Visits
                </TabsTrigger>
                <TabsTrigger 
                  value="specialty"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-blue-600 
                           rounded-lg transition-all duration-300 ease-in-out text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-transparent
                           font-medium py-3 px-4 text-sm flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Stethoscope className="w-4 h-4" />
                  Assessment
                </TabsTrigger>
                <TabsTrigger 
                  value="labs"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-blue-600 
                           rounded-lg transition-all duration-300 ease-in-out text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-transparent
                           font-medium py-3 px-4 text-sm flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <FlaskRound className="w-4 h-4" />
                  Lab Results
                </TabsTrigger>
                <TabsTrigger 
                  value="medications"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-blue-600 
                           rounded-lg transition-all duration-300 ease-in-out text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-transparent
                           font-medium py-3 px-4 text-sm flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Pill className="w-4 h-4" />
                  Medications
                </TabsTrigger>
                <TabsTrigger 
                  value="documents"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm 
                           rounded-md transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-white/50
                           font-medium py-2 px-3 text-sm flex items-center justify-center gap-2 h-9"
                >
                  <FileText className="w-4 h-4" />
                  Documents
                </TabsTrigger>
                <TabsTrigger 
                  value="chat"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm 
                           rounded-md transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-white/50
                           font-medium py-2 px-3 text-sm flex items-center justify-center gap-2 h-9"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="overview" className="flex-1 space-y-6 overflow-y-auto">
              {/* Compact Overview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Timeline Summary */}
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200/50 hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Timeline Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                        Visits
                      </span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        {visits?.length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <FlaskRound className="w-3.5 h-3.5 text-green-600" />
                        Lab Orders
                      </span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                        {labOrders?.length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <Pill className="w-3.5 h-3.5 text-purple-600" />
                        Prescriptions
                      </span>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                        {prescriptions?.length || 0}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-3 text-blue-600 hover:bg-blue-50 h-8"
                      onClick={() => setActiveTab("timeline")}
                    >
                      View Timeline
                    </Button>
                  </CardContent>
                </Card>

                {/* Lab Orders Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FlaskRound className="w-5 h-5 text-green-500" />
                      Lab Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PatientLabOrdersSummary patientId={patient.id} />
                  </CardContent>
                </Card>

                {/* Vital Signs Dashboard */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Latest Vitals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {vitalSigns && vitalSigns.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {vitalSigns[0].bloodPressureSystolic && vitalSigns[0].bloodPressureDiastolic && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                            <div className="text-red-600 text-xs font-medium">BP</div>
                            <div className="text-lg font-bold text-red-800">{vitalSigns[0].bloodPressureSystolic}/{vitalSigns[0].bloodPressureDiastolic}</div>
                          </div>
                        )}
                        {vitalSigns[0].heartRate && (
                          <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg text-center">
                            <div className="text-pink-600 text-xs font-medium">HR</div>
                            <div className="text-lg font-bold text-pink-800">{vitalSigns[0].heartRate}</div>
                          </div>
                        )}
                        {vitalSigns[0].temperature && (
                          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                            <div className="text-orange-600 text-xs font-medium">Temp</div>
                            <div className="text-lg font-bold text-orange-800">{vitalSigns[0].temperature}°C</div>
                          </div>
                        )}
                        {vitalSigns[0].weight && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                            <div className="text-blue-600 text-xs font-medium">Weight</div>
                            <div className="text-lg font-bold text-blue-800">{vitalSigns[0].weight}kg</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Heart className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">No vitals recorded</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-blue-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowVisitModal(true)}
                        className="justify-start btn-outline hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <Plus className="w-4 h-4 mr-2 icon-professional text-blue-600" />
                        Record Visit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveTab("lab-orders")}
                        className="justify-start btn-outline hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                      >
                        <FlaskRound className="w-4 h-4 mr-2 icon-professional text-emerald-600" />
                        Order Lab Test
                      </Button>
                      {(user?.role === 'doctor' || user?.role === 'admin') && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowPrescriptionModal(true)}
                          className="justify-start btn-outline hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                        >
                          <Pill className="w-4 h-4 mr-2 icon-professional text-purple-600" />
                          Prescribe Medication
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveTab('chat')}
                        className="justify-start btn-outline hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
                      >
                        <MessageCircle className="w-4 h-4 mr-2 icon-professional text-indigo-600" />
                        Send Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="visits" className="space-y-6">
              {/* Nursing Quick Actions Panel */}
              {(user?.role === 'nurse' || user?.role === 'admin') && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-green-600" />
                      Nursing Actions
                    </CardTitle>
                    <CardDescription>
                      Quick access to common nursing tasks and patient care activities.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowStandaloneVitals(true)}
                        className="justify-start btn-outline hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                      >
                        <Activity className="w-4 h-4 mr-2 text-green-600" />
                        Record Vitals
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveTab('prescriptions')}
                        className="justify-start btn-outline hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <Pill className="w-4 h-4 mr-2 text-blue-600" />
                        Check Medications
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveTab('lab')}
                        className="justify-start btn-outline hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                      >
                        <FlaskRound className="w-4 h-4 mr-2 text-purple-600" />
                        Lab Preparation
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveTab('chat')}
                        className="justify-start btn-outline hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                      >
                        <MessageCircle className="w-4 h-4 mr-2 text-orange-600" />
                        Patient Notes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Visit Recording Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-blue-500" />
                    Record Patient Visit
                  </CardTitle>
                  <CardDescription>
                    Record comprehensive visit details including vital signs, symptoms, diagnosis, and treatment plans.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowVisitModal(true)}
                    className="btn-primary shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Plus className="mr-2 h-4 w-4 icon-professional" />
                    Start New Visit Recording
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Visits & Consultations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-500" />
                    Recent Visits & Consultations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {visits && visits.length > 0 ? (
                    <div className="space-y-4">
                      {visits.map((visit: any) => (
                        <div key={visit.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-blue-600">
                                  consultation
                                </Badge>
                                <span className="text-sm text-gray-500">{visit.visitDate}</span>
                              </div>
                              <h4 className="font-semibold text-lg mb-1">{visit.reasonForVisit}</h4>
                              {visit.diagnosis && (
                                <p className="text-sm text-gray-600 mb-2">
                                  <strong>Diagnosis:</strong> {visit.diagnosis}
                                </p>
                              )}
                              {visit.vitalSigns && (
                                <div className="text-sm text-gray-600">
                                  <strong>Vitals:</strong> BP: {visit.vitalSigns.bloodPressure || 'N/A'} | HR: {visit.vitalSigns.heartRate || 'N/A'}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewVisit(visit)}
                                title="View Visit Details"
                                className="btn-icon-secondary hover:bg-blue-50 hover:border-blue-300"
                              >
                                <Eye className="w-4 h-4 icon-professional text-blue-600" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePrintVisit(visit)}
                                title="Print Visit Record"
                                className="btn-icon-secondary hover:bg-green-50 hover:border-green-300"
                              >
                                <FileText className="w-4 h-4 icon-professional text-green-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No visits recorded yet</p>
                      <p className="text-sm">Start by recording a new visit</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="labs" className="space-y-6">
              <PatientLabResults patientId={patient.id} />
            </TabsContent>

            <TabsContent value="medications">
              {/* Pharmacist Quick Actions Panel */}
              {(user?.role === 'pharmacist' || user?.role === 'admin') && (
                <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="w-5 h-5 text-purple-600" />
                      Pharmacy Actions
                    </CardTitle>
                    <CardDescription>
                      Quick access to pharmacy verification, dispensing, and patient counseling tools.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start btn-outline hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                      >
                        <CheckSquare className="w-4 h-4 mr-2 text-purple-600" />
                        Verify Prescriptions
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start btn-outline hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                      >
                        <Package className="w-4 h-4 mr-2 text-green-600" />
                        Mark Dispensed
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start btn-outline hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                        Check Interactions
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start btn-outline hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      >
                        <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                        Patient Counseling
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-purple-500" />
                    Medications & Prescriptions
                    </CardTitle>
                  </CardHeader>
                <CardContent>
                  <MedicationManagementTabs 
                    patient={{ id: patient.id, firstName: patient.firstName, lastName: patient.lastName }}
                    prescriptions={prescriptions || []}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vitals" className="space-y-6">
              <StandaloneVitalSignsRecorder patientId={patient.id} />
              <VitalSignsTrends patientId={patient.id} />
              <VitalSignsAlerts patientId={patient.id} />
            </TabsContent>

            <TabsContent value="specialty" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    Specialty Consultations & Assessments
                  </CardTitle>
                  <CardDescription>
                    Comprehensive specialty assessment forms and consultation history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ConsultationHistoryDisplay patientId={patient.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
