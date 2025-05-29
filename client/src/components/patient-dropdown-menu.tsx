import React from 'react';
import { useLocation } from "wouter";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Edit,
  Stethoscope,
  Pill,
  FlaskRound,
  FileText,
  CalendarDays,
  Users,
  Monitor,
  Upload,
  Share,
  MessageSquare,
  Archive
} from 'lucide-react';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
}

interface PatientDropdownMenuProps {
  patient: Patient;
  children: React.ReactNode;
  onEditPatient?: () => void;
  onRecordVisit?: () => void;
  onAddPrescription?: () => void;
  onPrintRecord?: () => void;
  showHeader?: boolean;
  align?: "start" | "center" | "end";
}

export function PatientDropdownMenu({
  patient,
  children,
  onEditPatient,
  onRecordVisit,
  onAddPrescription,
  onPrintRecord,
  showHeader = true,
  align = "start"
}: PatientDropdownMenuProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-64">
        {showHeader && (
          <>
            <div className="px-3 py-2 border-b">
              <p className="text-sm font-medium">{patient.firstName} {patient.lastName}</p>
              <p className="text-xs text-gray-500">ID: HC{patient.id?.toString().padStart(6, "0")}</p>
            </div>
          </>
        )}
        <DropdownMenuItem onClick={onEditPatient}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Patient Info
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onAddPrescription}>
          <Pill className="mr-2 h-4 w-4" />
          Add Prescription
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/lab-orders?patientId=${patient.id}`)}>
          <FlaskRound className="mr-2 h-4 w-4" />
          Order Lab Tests
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/form-builder?patientId=${patient.id}`)}>
          <FileText className="mr-2 h-4 w-4" />
          Create Consultation Form
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/appointments?patientId=${patient.id}`)}>
          <CalendarDays className="mr-2 h-4 w-4" />
          Schedule Appointment
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/referrals?patientId=${patient.id}`)}>
          <Users className="mr-2 h-4 w-4" />
          Create Referral
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          // Switch to vitals tab in current patient view
          const vitalsTab = document.querySelector('[data-state="inactive"][value="vitals"]') as HTMLElement;
          if (vitalsTab) vitalsTab.click();
        }}>
          <Monitor className="mr-2 h-4 w-4" />
          Record Vital Signs
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/documents?patientId=${patient.id}`)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Documents
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onPrintRecord}>
          <Share className="mr-2 h-4 w-4" />
          Print/Export Records
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          // Switch to communication tab in current patient view
          const commTab = document.querySelector('[data-state="inactive"][value="communication"]') as HTMLElement;
          if (commTab) commTab.click();
        }}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Send Message
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600" 
          onClick={() => {
            if (confirm(`Are you sure you want to archive ${patient.firstName} ${patient.lastName}? This will hide the patient from active lists but preserve all medical records.`)) {
              // TODO: Implement patient archiving API call
              toast({
                title: 'Archive Patient',
                description: 'Patient archiving functionality will be implemented in the next update.',
              });
            }
          }}
        >
          <Archive className="mr-2 h-4 w-4" />
          Archive Patient
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}