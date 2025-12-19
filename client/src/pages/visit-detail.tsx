import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Edit,
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  Scale,
  Calendar,
  Clock,
  User,
  FileText,
  Printer,
  Download,
  Clipboard,
  AlertCircle,
  CheckCircle2,
  Wind,
  Droplets,
  Ruler,
  Pill,
  FlaskRound,
  TrendingUp,
  TrendingDown,
  Minus,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Share2,
  History,
  Eye,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface Visit {
  id: number;
  patientId: number;
  visitDate: string;
  visitType: string;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  complaint?: string;
  diagnosis?: string;
  treatment?: string;
  followUpDate?: string;
  status: string;
  notes?: string;
  providerId?: number;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  bloodType?: string;
  allergies?: string;
}

interface Prescription {
  id: number;
  visitId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  status: string;
}

interface LabResult {
  id: number;
  patientId: number;
  testName: string;
  result: string;
  normalRange?: string;
  status: string;
  orderedDate: string;
}

// Vital Signs Component with visual gauge
function VitalCard({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  color, 
  normalRange,
  trend 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  unit?: string;
  color: string;
  normalRange?: string;
  trend?: 'up' | 'down' | 'stable';
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-amber-500' : trend === 'down' ? 'text-blue-500' : 'text-emerald-500';
  
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group`}>
      <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500" />
      <div className="absolute bottom-0 left-0 w-24 h-24 -mb-6 -ml-6 rounded-full bg-black/5 blur-xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trendColor} bg-white/90 px-2 py-1 rounded-full`}>
              <TrendIcon className="w-3 h-3" />
              <span className="capitalize">{trend}</span>
            </div>
          )}
        </div>
        
        <p className="text-white/80 text-sm font-medium mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
          {unit && <span className="text-white/70 text-sm font-medium">{unit}</span>}
        </div>
        
        {normalRange && (
          <p className="text-white/60 text-xs mt-2">Normal: {normalRange}</p>
        )}
      </div>
    </div>
  );
}

// Timeline item component
function TimelineItem({ visit, isActive }: { visit: Visit; isActive: boolean }) {
  const [, navigate] = useLocation();
  
  return (
    <button
      onClick={() => navigate(`/patients/${visit.patientId}/visits/${visit.id}`)}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 w-full text-left ${
        isActive 
          ? 'bg-primary/10 border-2 border-primary shadow-sm' 
          : 'hover:bg-muted/50 border-2 border-transparent'
      }`}
    >
      <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
          {visit.visitType || 'General Visit'}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(visit.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground/50'}`} />
    </button>
  );
}

export default function VisitDetail() {
  const { patientId, visitId } = useParams<{ patientId: string; visitId: string }>();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch patient data - FIXED: Use proper string URL format
  const { data: patient, isLoading: patientLoading } = useQuery<Patient>({
    queryKey: [`/api/patients/${patientId}`],
    enabled: !!patientId
  });

  // Fetch visit data - FIXED: Use proper string URL format
  const { data: visit, isLoading: visitLoading } = useQuery<Visit>({
    queryKey: [`/api/patients/${patientId}/visits/${visitId}`],
    enabled: !!patientId && !!visitId
  });

  // Fetch all patient visits for timeline
  const { data: allVisits } = useQuery<Visit[]>({
    queryKey: [`/api/patients/${patientId}/visits`],
    enabled: !!patientId
  });

  // Fetch prescriptions for this visit
  const { data: prescriptions } = useQuery<Prescription[]>({
    queryKey: [`/api/patients/${patientId}/prescriptions`],
    enabled: !!patientId
  });

  // Fetch lab results
  const { data: labResults } = useQuery<LabResult[]>({
    queryKey: [`/api/patients/${patientId}/lab-results`],
    enabled: !!patientId
  });

  const isLoading = patientLoading || visitLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Skeleton Header */}
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-32 bg-slate-200 rounded-lg" />
              <div className="h-8 w-48 bg-slate-200 rounded-lg" />
            </div>
            
            {/* Hero Skeleton */}
            <div className="h-64 bg-gradient-to-r from-slate-200 to-slate-100 rounded-3xl" />
            
            {/* Cards Skeleton */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!visit || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Visit Not Found</h2>
          <p className="text-slate-500 mb-6">The requested visit record could not be located in the system.</p>
          <Button
            onClick={() => navigate(`/patients/${patientId}`)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Patient Profile
          </Button>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'final':
      case 'completed':
        return { 
          bg: 'bg-emerald-500', 
          text: 'text-emerald-700',
          light: 'bg-emerald-50',
          border: 'border-emerald-200',
          label: 'Completed',
          icon: CheckCircle2 
        };
      case 'draft':
      case 'in-progress':
        return { 
          bg: 'bg-amber-500', 
          text: 'text-amber-700',
          light: 'bg-amber-50',
          border: 'border-amber-200',
          label: 'In Progress',
          icon: Clock 
        };
      case 'cancelled':
        return { 
          bg: 'bg-red-500', 
          text: 'text-red-700',
          light: 'bg-red-50',
          border: 'border-red-200',
          label: 'Cancelled',
          icon: AlertCircle 
        };
      default:
        return { 
          bg: 'bg-slate-500', 
          text: 'text-slate-700',
          light: 'bg-slate-50',
          border: 'border-slate-200',
          label: status || 'Unknown',
          icon: Clock 
        };
    }
  };

  const calculateBMI = () => {
    if (visit?.weight && visit?.height) {
      const heightInMeters = visit.height / 100;
      const bmi = visit.weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-blue-600', progress: 25 };
    if (bmi < 25) return { text: 'Normal', color: 'text-emerald-600', progress: 50 };
    if (bmi < 30) return { text: 'Overweight', color: 'text-amber-600', progress: 75 };
    return { text: 'Obese', color: 'text-red-600', progress: 100 };
  };

  const parseNotesJSON = (notes: string | undefined) => {
    if (!notes) return null;
    try {
      return JSON.parse(notes);
    } catch {
      return null;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const visitText = `
CLINICAL VISIT SUMMARY
${'='.repeat(50)}

PATIENT INFORMATION
Name: ${patient?.firstName} ${patient?.lastName}
Date of Birth: ${formatShortDate(patient?.dateOfBirth || '')}
Gender: ${patient?.gender || 'N/A'}
Contact: ${patient?.phone || 'N/A'}

VISIT DETAILS
Visit ID: #${visit.id}
Date: ${formatDate(visit.visitDate)}
Type: ${visit.visitType || 'General Consultation'}
Status: ${statusConfig.label}

VITAL SIGNS
${visit.bloodPressure ? `Blood Pressure: ${visit.bloodPressure} mmHg` : ''}
${visit.heartRate ? `Heart Rate: ${visit.heartRate} bpm` : ''}
${visit.temperature ? `Temperature: ${visit.temperature}°C` : ''}
${visit.weight ? `Weight: ${visit.weight} kg` : ''}
${visit.height ? `Height: ${visit.height} cm` : ''}
${bmi ? `BMI: ${bmi} (${getBMICategory(parseFloat(bmi)).text})` : ''}

CHIEF COMPLAINT
${visit.complaint || 'Not documented'}

DIAGNOSIS
${visit.diagnosis || 'Not documented'}

TREATMENT PLAN
${visit.treatment || 'Not documented'}

${visit.followUpDate ? `FOLLOW-UP: ${formatDate(visit.followUpDate)}` : ''}

${'='.repeat(50)}
Generated: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([visitText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visit-${visit.id}-${patient?.lastName || 'patient'}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bmi = calculateBMI();
  const parsedNotes = parseNotesJSON(visit?.notes);
  const statusConfig = getStatusConfig(visit.status);
  const StatusIcon = statusConfig.icon;

  // Get age from DOB
  const calculateAge = (dob: string) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Filter prescriptions for this visit
  const visitPrescriptions = prescriptions?.filter(p => p.visitId === parseInt(visitId || '0')) || [];
  
  // Sort visits by date for timeline
  const sortedVisits = [...(allVisits || [])].sort((a, b) => 
    new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Top Actions Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                onClick={() => navigate(`/patients/${patientId}`)}
                variant="ghost"
                size="sm"
                className="gap-2 text-slate-600 hover:text-slate-900 h-9 px-2.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Patient</span>
              </Button>
              
              <div className="hidden sm:block h-6 w-px bg-slate-300" />
              
              <nav className="flex items-center gap-1.5 text-sm min-w-0">
                <button
                  onClick={() => navigate('/patients')}
                  className="text-slate-500 hover:text-primary transition-colors flex-shrink-0"
                >
                  Patients
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <button
                  onClick={() => navigate(`/patients/${patientId}`)}
                  className="text-slate-500 hover:text-primary transition-colors min-w-0 truncate"
                  title={`${patient.firstName} ${patient.lastName}`}
                >
                  {patient.firstName} {patient.lastName}
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-900 font-medium flex-shrink-0">Visit #{visit.id}</span>
              </nav>
            </div>

            <div className="flex items-center gap-2 justify-end sm:justify-start">
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="gap-2 h-9 px-3 sm:px-4"
                title="Print"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                className="gap-2 h-9 px-3 sm:px-4"
                title="Export"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                onClick={() => navigate(`/patients/${patientId}/visits/${visitId}/edit`)}
                className="gap-2 h-9 px-3 sm:px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="sm"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Visit</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section with Patient + Visit Info */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 mb-8 shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mt-48 -mr-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -mb-32 -ml-32 blur-2xl" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-violet-400/20 rounded-full blur-xl" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-start gap-8">
              {/* Patient Info */}
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold text-white shadow-lg ring-4 ring-white/20">
                  {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <div className="flex items-center gap-4 text-blue-100">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      {calculateAge(patient.dateOfBirth)} yrs, {patient.gender || 'N/A'}
                    </span>
                    {patient.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />
                        {patient.phone}
                      </span>
                    )}
                    {patient.bloodType && (
                      <span className="flex items-center gap-1.5 bg-white/20 px-2.5 py-0.5 rounded-full text-sm font-medium">
                        <Droplets className="w-3.5 h-3.5" />
                        {patient.bloodType}
                      </span>
                    )}
                  </div>
                  {patient.allergies && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertTriangle className="w-4 h-4 text-amber-300" />
                      <span className="text-amber-200 text-sm">Allergies: {patient.allergies}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Visit Status Card */}
              <div className="lg:ml-auto bg-white/10 backdrop-blur-sm rounded-2xl p-5 min-w-[280px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${statusConfig.light}`}>
                    <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} />
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Visit Status</p>
                    <p className="text-white font-semibold">{statusConfig.label}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-blue-200" />
                    <div>
                      <p className="text-blue-200 text-xs">Visit Date</p>
                      <p className="text-white font-medium">{formatShortDate(visit.visitDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-4 h-4 text-blue-200" />
                    <div>
                      <p className="text-blue-200 text-xs">Visit Type</p>
                      <p className="text-white font-medium">{visit.visitType || 'General Consultation'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content - Left Side */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Vital Signs Grid */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Vital Signs</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visit.bloodPressure && (
                  <VitalCard
                    icon={Heart}
                    label="Blood Pressure"
                    value={visit.bloodPressure}
                    unit="mmHg"
                    color="from-rose-500 to-pink-600"
                    normalRange="120/80"
                    trend="stable"
                  />
                )}
                
                {visit.heartRate && (
                  <VitalCard
                    icon={Activity}
                    label="Heart Rate"
                    value={visit.heartRate}
                    unit="bpm"
                    color="from-fuchsia-500 to-purple-600"
                    normalRange="60-100"
                    trend="stable"
                  />
                )}
                
                {visit.temperature && (
                  <VitalCard
                    icon={Thermometer}
                    label="Temperature"
                    value={visit.temperature}
                    unit="°C"
                    color="from-orange-500 to-amber-600"
                    normalRange="36.5-37.5"
                    trend={visit.temperature > 37.5 ? 'up' : visit.temperature < 36 ? 'down' : 'stable'}
                  />
                )}
                
                {visit.weight && (
                  <VitalCard
                    icon={Scale}
                    label="Weight"
                    value={visit.weight}
                    unit="kg"
                    color="from-blue-500 to-cyan-600"
                  />
                )}

                {parsedNotes?.vitalSigns?.respiratoryRate && (
                  <VitalCard
                    icon={Wind}
                    label="Respiratory Rate"
                    value={parsedNotes.vitalSigns.respiratoryRate}
                    unit="/min"
                    color="from-teal-500 to-emerald-600"
                    normalRange="12-20"
                  />
                )}

                {parsedNotes?.vitalSigns?.oxygenSaturation && (
                  <VitalCard
                    icon={Droplets}
                    label="SpO₂"
                    value={parsedNotes.vitalSigns.oxygenSaturation}
                    unit="%"
                    color="from-indigo-500 to-blue-600"
                    normalRange="95-100"
                  />
                )}

                {visit.height && (
                  <VitalCard
                    icon={Ruler}
                    label="Height"
                    value={visit.height}
                    unit="cm"
                    color="from-violet-500 to-purple-600"
                  />
                )}

                {bmi && (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5">
                    <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                          <Scale className="w-5 h-5 text-white" />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/90 ${getBMICategory(parseFloat(bmi)).color}`}>
                          {getBMICategory(parseFloat(bmi)).text}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm font-medium mb-1">BMI</p>
                      <span className="text-3xl font-bold text-white tracking-tight">{bmi}</span>
                      <div className="mt-3">
                        <Progress value={getBMICategory(parseFloat(bmi)).progress} className="h-1.5 bg-white/20" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {!visit.bloodPressure && !visit.heartRate && !visit.temperature && !visit.weight && (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                  <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No vital signs recorded</p>
                  <p className="text-slate-400 text-sm mt-1">Vital signs will appear here when documented</p>
                </div>
              )}
            </div>

            {/* Tabs for Clinical Details */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="bg-slate-100/80 p-1 rounded-xl w-full justify-start gap-1">
                <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="examination" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Examination
                </TabsTrigger>
                <TabsTrigger value="prescriptions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Pill className="w-4 h-4 mr-2" />
                  Prescriptions
                </TabsTrigger>
                <TabsTrigger value="labs" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <FlaskRound className="w-4 h-4 mr-2" />
                  Lab Results
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Chief Complaint */}
                <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <Clipboard className="w-5 h-5 text-blue-600" />
                      </div>
                      Chief Complaint
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed">
                      {visit.complaint || (
                        <span className="text-slate-400 italic">No chief complaint documented</span>
                      )}
                    </p>
                  </CardContent>
                </Card>

                {/* History of Present Illness */}
                {parsedNotes?.historyOfPresentIllness && (
                  <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-lg bg-violet-50">
                          <History className="w-5 h-5 text-violet-600" />
                        </div>
                        History of Present Illness
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {parsedNotes.historyOfPresentIllness}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Diagnosis */}
                <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 rounded-lg bg-purple-50">
                        <Stethoscope className="w-5 h-5 text-purple-600" />
                      </div>
                      Diagnosis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Primary Diagnosis</p>
                      <p className="text-slate-800 font-medium text-lg">
                        {visit.diagnosis || (
                          <span className="text-slate-400 italic font-normal">No diagnosis recorded</span>
                        )}
                      </p>
                    </div>
                    {parsedNotes?.secondaryDiagnoses && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Secondary Diagnoses</p>
                        <p className="text-slate-600">{parsedNotes.secondaryDiagnoses}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Treatment Plan */}
                <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 rounded-lg bg-emerald-50">
                        <FileText className="w-5 h-5 text-emerald-600" />
                      </div>
                      Treatment Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {visit.treatment || (
                        <span className="text-slate-400 italic">No treatment plan documented</span>
                      )}
                    </p>
                  </CardContent>
                </Card>

                {/* Patient Instructions */}
                {parsedNotes?.patientInstructions && (
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-lg bg-amber-100">
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                        </div>
                        Patient Instructions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {parsedNotes.patientInstructions}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Examination Tab */}
              <TabsContent value="examination" className="space-y-4 mt-4">
                {parsedNotes?.physicalExamination && Object.values(parsedNotes.physicalExamination).some(v => v) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {parsedNotes.physicalExamination.generalAppearance && (
                      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-slate-600">General Appearance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-800">{parsedNotes.physicalExamination.generalAppearance}</p>
                        </CardContent>
                      </Card>
                    )}
                    {parsedNotes.physicalExamination.cardiovascularSystem && (
                      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-slate-600">Cardiovascular System</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-800">{parsedNotes.physicalExamination.cardiovascularSystem}</p>
                        </CardContent>
                      </Card>
                    )}
                    {parsedNotes.physicalExamination.respiratorySystem && (
                      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-slate-600">Respiratory System</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-800">{parsedNotes.physicalExamination.respiratorySystem}</p>
                        </CardContent>
                      </Card>
                    )}
                    {parsedNotes.physicalExamination.gastrointestinalSystem && (
                      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-slate-600">Gastrointestinal System</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-800">{parsedNotes.physicalExamination.gastrointestinalSystem}</p>
                        </CardContent>
                      </Card>
                    )}
                    {parsedNotes.physicalExamination.neurologicalSystem && (
                      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-slate-600">Neurological System</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-800">{parsedNotes.physicalExamination.neurologicalSystem}</p>
                        </CardContent>
                      </Card>
                    )}
                    {parsedNotes.physicalExamination.musculoskeletalSystem && (
                      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-slate-600">Musculoskeletal System</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-800">{parsedNotes.physicalExamination.musculoskeletalSystem}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                    <CardContent className="py-12 text-center">
                      <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No physical examination documented</p>
                      <p className="text-slate-400 text-sm mt-1">Examination findings will appear here when recorded</p>
                    </CardContent>
                  </Card>
                )}

                {/* Clinical Assessment */}
                {parsedNotes?.assessment && (
                  <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-lg bg-indigo-50">
                          <Sparkles className="w-5 h-5 text-indigo-600" />
                        </div>
                        Clinical Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {parsedNotes.assessment}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Prescriptions Tab */}
              <TabsContent value="prescriptions" className="mt-4">
                {visitPrescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {visitPrescriptions.map((prescription) => (
                      <Card key={prescription.id} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
                              <Pill className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800">{prescription.medicationName}</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="secondary">{prescription.dosage}</Badge>
                                <Badge variant="secondary">{prescription.frequency}</Badge>
                                <Badge variant="secondary">{prescription.duration}</Badge>
                              </div>
                              {prescription.instructions && (
                                <p className="text-sm text-slate-600 mt-2">{prescription.instructions}</p>
                              )}
                            </div>
                            <Badge className={prescription.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                              {prescription.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : parsedNotes?.medications ? (
                  <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-lg bg-orange-50">
                          <Pill className="w-5 h-5 text-orange-600" />
                        </div>
                        Prescribed Medications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {parsedNotes.medications.split(',').map((med: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" />
                            <span className="text-slate-700">{med.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                    <CardContent className="py-12 text-center">
                      <Pill className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No prescriptions for this visit</p>
                      <p className="text-slate-400 text-sm mt-1">Medications will appear here when prescribed</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Lab Results Tab */}
              <TabsContent value="labs" className="mt-4">
                {labResults && labResults.length > 0 ? (
                  <div className="space-y-3">
                    {labResults.slice(0, 5).map((lab) => (
                      <Card key={lab.id} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-cyan-500 to-teal-500" />
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500">
                                <FlaskRound className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800">{lab.testName}</h4>
                                <p className="text-sm text-slate-600 mt-1">Result: <span className="font-medium">{lab.result}</span></p>
                                {lab.normalRange && (
                                  <p className="text-xs text-slate-500 mt-0.5">Normal range: {lab.normalRange}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={lab.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                {lab.status}
                              </Badge>
                              <p className="text-xs text-slate-500 mt-1">{formatShortDate(lab.orderedDate)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                    <CardContent className="py-12 text-center">
                      <FlaskRound className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No lab results available</p>
                      <p className="text-slate-400 text-sm mt-1">Lab results will appear here when available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Right Side */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Follow-up Card */}
            {visit.followUpDate && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <Calendar className="w-5 h-5 text-amber-600" />
                    </div>
                    Follow-up Scheduled
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-slate-800">{formatDate(visit.followUpDate)}</p>
                  {parsedNotes?.followUpInstructions && (
                    <p className="text-sm text-slate-600 mt-2">{parsedNotes.followUpInstructions}</p>
                  )}
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Visit Timeline */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <History className="w-5 h-5 text-slate-600" />
                  </div>
                  Recent Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sortedVisits.length > 0 ? (
                  <div className="space-y-2">
                    {sortedVisits.map((v) => (
                      <TimelineItem 
                        key={v.id} 
                        visit={v} 
                        isActive={v.id === parseInt(visitId || '0')} 
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm text-center py-4">No visit history</p>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-3 text-primary"
                  onClick={() => navigate(`/patients/${patientId}`)}
                >
                  View All Visits
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/patients/${patientId}/visits/new`)}
                >
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Record New Visit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/patients/${patientId}/prescriptions/new`)}
                >
                  <Pill className="w-4 h-4 mr-2" />
                  Create Prescription
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/patients/${patientId}/lab-orders/new`)}
                >
                  <FlaskRound className="w-4 h-4 mr-2" />
                  Order Lab Test
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/appointments/new?patientId=${patientId}`)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Appointment
                </Button>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            {parsedNotes?.additionalNotes && (
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="p-2 rounded-lg bg-slate-100">
                      <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    Additional Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap">{parsedNotes.additionalNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
