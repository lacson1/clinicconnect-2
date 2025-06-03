import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ChevronDown,
  Edit,
  Monitor,
  Share,
  MoreHorizontal,
  Heart,
  Clock,
  UserCheck,
  FileText
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EnhancedVisitRecording } from "@/components/enhanced-visit-recording";
import LabResultModal from "@/components/lab-result-modal";
import PrescriptionModal from "@/components/prescription-modal";
import { EditPatientModal } from "@/components/edit-patient-modal";
import PatientQRCard from "@/components/patient-qr-card";
import PatientChat from "@/components/patient-chat";
import LabOrderForm from "@/components/lab-order-form";
import LabOrdersList from "@/components/lab-orders-list";
import ConsultationHistory from "@/components/consultation-history";
import VaccinationManagement from "@/components/vaccination-management";
import AllergyManagement from "@/components/allergy-management";
import MedicalHistoryManagement from "@/components/medical-history-management";

import { PatientSummaryPrintable } from "@/components/patient-summary-printable";
import { ModernPatientOverview } from "@/components/modern-patient-overview";
import { FloatingActionMenu } from "@/components/floating-action-menu";
import { useRole } from "@/components/role-guard";
import { formatPatientName, getPatientInitials } from "@/lib/patient-utils";
import type { Patient, Visit, LabResult, Prescription } from "@shared/schema";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  CalendarDays,
  Users,
  Upload,
  MessageSquare,
  Archive
} from 'lucide-react';

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
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);

  const { data: patient, isLoading: patientLoading } = useQuery<Patient>({
    queryKey: [`/api/patients/${patientId}`],
    enabled: !!patientId,
  });

  const { data: visits, isLoading: visitsLoading } = useQuery<Visit[]>({
    queryKey: [`/api/patients/${patientId}/visits`],
    enabled: !!patientId,
  });

  const { data: labResults, isLoading: labsLoading } = useQuery<LabResult[]>({
    queryKey: ["/api/patients", patientId, "labs"],
    enabled: !!patientId,
  });

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery<Prescription[]>({
    queryKey: ["/api/patients", patientId, "prescriptions"],
    enabled: !!patientId,
  });

  // Fetch organization data for branding
  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
  });

  // Get current user's organization
  const currentOrganization = Array.isArray(organizations) 
    ? organizations.find(org => org.id === (user as any)?.organizationId)
    : undefined;

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Enhanced Professional Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between">
            {/* Patient Info Section */}
            <div className="flex items-start space-x-4">
              <Avatar className="w-16 h-16 ring-2 ring-blue-100">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-semibold">
                  {getPatientInitials(patient)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <h1 className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors flex items-center">
                        {formatPatientName(patient)}
                        <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                      </h1>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      <div className="px-3 py-2 border-b bg-gray-50">
                        <p className="text-sm font-semibold text-gray-900">{formatPatientName(patient)}</p>
                        <p className="text-xs text-gray-500 font-medium">ID: HC{patient.id?.toString().padStart(6, "0")}</p>
                      </div>
                      <DropdownMenuItem onClick={() => setShowEditPatientModal(true)} className="py-2">
                        <Edit className="mr-3 h-4 w-4 text-blue-600" />
                        <span className="font-medium">Edit Patient Info</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowVisitModal(true)} className="py-2">
                        <Monitor className="mr-3 h-4 w-4 text-green-600" />
                        <span className="font-medium">Record New Visit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowPrescriptionModal(true)} className="py-2">
                        <Pill className="mr-3 h-4 w-4 text-purple-600" />
                        <span className="font-medium">Add Prescription</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="py-2">
                        <FlaskRound className="mr-3 h-4 w-4 text-orange-600" />
                        <span className="font-medium">Order Lab Tests</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="py-2">
                        <Share className="mr-3 h-4 w-4 text-gray-600" />
                        <span className="font-medium">Print/Export Records</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Status Badge */}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active Patient
                  </span>
                </div>
                
                {/* Patient Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="font-medium text-gray-500 mr-1">ID:</span>
                    <span className="font-semibold">HC{patient.id?.toString().padStart(6, "0")}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium text-gray-500 mr-1">Age:</span>
                    <span className="font-semibold">{new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium text-gray-500 mr-1">Gender:</span>
                    <span className="font-semibold capitalize">{patient.gender}</span>
                  </div>
                  
                  {patient.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-semibold">{patient.phone}</span>
                    </div>
                  )}
                </div>
                
                {/* Secondary Info Row */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium text-gray-500 mr-1">Date of Birth:</span>
                    <span>{new Date(patient.dateOfBirth).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  
                  {patient.address && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="font-medium text-gray-500 mr-1">Address:</span>
                      <span className="break-words">{patient.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVisitModal(true)}
                className="hidden md:flex items-center bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Visit
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrescriptionModal(true)}
                className="hidden md:flex items-center bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
              >
                <Pill className="w-4 h-4 mr-2" />
                Prescribe
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowVisitModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Visit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPrescriptionModal(true)}>
                    <Pill className="mr-2 h-4 w-4" />
                    Prescribe
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-full">
        <div className="w-full max-w-none">
          <ModernPatientOverview
            patient={patient as Patient}
            visits={visits || []}
            recentLabs={labResults || []}
            activePrescriptions={prescriptions || []}
            onAddPrescription={() => setShowPrescriptionModal(true)}
          />
        </div>
        
        {/* Floating Action Menu */}
        <FloatingActionMenu
          onRecordVisit={() => setShowVisitModal(true)}
          onAddLabResult={() => setShowLabModal(true)}
          onAddPrescription={() => setShowPrescriptionModal(true)}
          onCreateConsultation={() => setShowVisitModal(true)}
          userRole={user?.role || 'guest'}
        />
      </main>

      {/* Modals */}
      <EnhancedVisitRecording
        open={showVisitModal}
        onOpenChange={setShowVisitModal}
        patientId={patientId || 0}
      />
      <LabResultModal
        open={showLabModal}
        onOpenChange={setShowLabModal}
        patientId={patientId}
      />
      <PrescriptionModal
        open={showPrescriptionModal}
        onOpenChange={setShowPrescriptionModal}
        patientId={patientId}
      />

      {/* Edit Patient Modal */}
      {patient && (
        <EditPatientModal
          open={showEditPatientModal}
          onOpenChange={setShowEditPatientModal}
          patient={patient as any}
          onPatientUpdated={() => {
            // Refresh patient data after update
            window.location.reload();
          }}
        />
      )}

      {/* Hidden Printable Patient Summary */}
      <div className="hidden">
        <PatientSummaryPrintable
          patient={patient as Patient}
          visits={visits || []}
          organization={currentOrganization}
        />
      </div>
    </div>
  );
}