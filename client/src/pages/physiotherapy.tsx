import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  Users, 
  Calendar, 
  FileText, 
  Search,
  Clock,
  Target,
  TrendingUp,
  User,
  BarChart3,
  Award,
  BookOpen,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Heart,
  Brain,
  Zap,
  Eye
} from "lucide-react";
import PhysiotherapyAssessment from "@/components/physiotherapy-assessment";
import EnhancedPhysiotherapyDashboard from "@/components/enhanced-physiotherapy-dashboard";
import PhysiotherapyCareCoordination from "@/components/physiotherapy-care-coordination";
import PhysiotherapyTreatmentIntegration from "@/components/physiotherapy-treatment-integration";
import { format } from "date-fns";

export default function PhysiotherapyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [showAssessmentViewDialog, setShowAssessmentViewDialog] = useState(false);

  // Fetch patients
  const { data: patients = [] } = useQuery({
    queryKey: ['/api/patients'],
  });

  // Fetch physiotherapy assessments
  const { data: assessments = [] } = useQuery({
    queryKey: ['/api/consultation-records'],
    select: (data: any[]) => data.filter(record => 
      record.formData?.type === 'physiotherapy_assessment'
    )
  });

  // Filter patients based on search
  const filteredPatients = patients.filter((patient: any) =>
    patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  // Get recent assessments
  const recentAssessments = assessments
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Latest assessment per patient (for quick "View" from the patient list)
  const latestAssessmentByPatientId = (() => {
    const map = new Map<number, any>();
    for (const a of assessments) {
      const patientId = Number(a.patientId);
      if (!Number.isFinite(patientId)) continue;
      const existing = map.get(patientId);
      if (!existing) {
        map.set(patientId, a);
        continue;
      }
      if (new Date(a.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
        map.set(patientId, a);
      }
    }
    return map;
  })();

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setShowAssessmentDialog(true);
  };

  const handleViewAssessment = (assessment: any) => {
    setSelectedAssessment(assessment);
    setShowAssessmentViewDialog(true);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Physiotherapy Center</h1>
          <p className="text-gray-600">Comprehensive assessment, treatment protocols & outcome tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
            <Activity className="w-4 h-4 mr-2" />
            Physiotherapy Department
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
            <Target className="w-4 h-4 mr-2" />
            Evidence-Based Practice
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Stats */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-purple-600">{patients.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-purple-600">{assessments.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {assessments.filter((a: any) => {
                    const today = new Date().toDateString();
                    return new Date(a.createdAt).toDateString() === today;
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold text-purple-600">45min</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patients">Patient Assessment</TabsTrigger>
          <TabsTrigger value="history">Assessment History</TabsTrigger>
          <TabsTrigger value="progress">Patient Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Patient Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patients by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid gap-4">
                  {filteredPatients.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? "No patients found matching your search." : "No patients available."}
                    </div>
                  ) : (
                    filteredPatients.map((patient: any) => (
                      <div 
                        key={patient.id} 
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {patient.firstName} {patient.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {patient.phone} • {patient.gender} • Age: {patient.dateOfBirth ? 
                                  new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              {latestAssessmentByPatientId.get(Number(patient.id)) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewAssessment(latestAssessmentByPatientId.get(Number(patient.id)));
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                              )}
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePatientSelect(patient);
                                }}
                              >
                                <Activity className="w-4 h-4 mr-2" />
                                New Assessment
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAssessments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No physiotherapy assessments found.
                  </div>
                ) : (
                  recentAssessments.map((assessment: any) => {
                    const patient = patients.find((p: any) => p.id === assessment.patientId);
                    const formData = assessment.formData || {};
                    
                    return (
                      <div key={assessment.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                              </h4>
                              <Badge variant="outline" className="bg-purple-100 text-purple-700">
                                Assessment
                              </Badge>
                            </div>
                            
                            {formData.goals && (
                              <div className="mb-2">
                                <span className="text-sm font-medium text-purple-700">Goals:</span>
                                <p className="text-sm text-gray-700">{formData.goals}</p>
                              </div>
                            )}
                            
                            {formData.treatmentPlan && (
                              <div className="mb-2">
                                <span className="text-sm font-medium text-purple-700">Treatment Plan:</span>
                                <p className="text-sm text-gray-700">{formData.treatmentPlan}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right text-sm text-gray-500">
                            <div className="flex items-center gap-1 mb-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(assessment.createdAt), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-xs">
                              {format(new Date(assessment.createdAt), 'hh:mm a')}
                            </div>
                            {formData.sessionDuration && (
                              <div className="text-xs mt-1">
                                Duration: {formData.sessionDuration} min
                              </div>
                            )}
                            <div className="mt-3 flex justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewAssessment(assessment)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Patient Progress Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Progress tracking features coming soon.</p>
                <p className="text-sm">Track patient improvements and treatment outcomes.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assessment Dialog */}
      <Dialog open={showAssessmentDialog} onOpenChange={setShowAssessmentDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Physiotherapy Assessment</DialogTitle>
            {selectedPatient && (
              <p className="text-sm text-gray-600">
                Patient: {selectedPatient.firstName} {selectedPatient.lastName} (ID: {selectedPatient.id})
              </p>
            )}
          </DialogHeader>
          
          {selectedPatient && (
            <PhysiotherapyAssessment 
              patientId={selectedPatient.id}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Assessment Dialog */}
      <Dialog open={showAssessmentViewDialog} onOpenChange={setShowAssessmentViewDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assessment Details</DialogTitle>
            {selectedAssessment && (
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  Patient: {(() => {
                    const p = patients.find((pt: any) => pt.id === selectedAssessment.patientId);
                    return p ? `${p.firstName} ${p.lastName}` : 'Unknown Patient';
                  })()}
                </div>
                <div className="text-xs">
                  Recorded: {format(new Date(selectedAssessment.createdAt), 'MMM dd, yyyy • hh:mm a')}
                </div>
              </div>
            )}
          </DialogHeader>

          {selectedAssessment ? (
            <div className="space-y-4">
              {(() => {
                const formData = selectedAssessment.formData || {};
                const fields: Array<{ key: string; label: string }> = [
                  { key: "mobilityAssessment", label: "Mobility Assessment" },
                  { key: "rangeOfMotion", label: "Range of Motion" },
                  { key: "strengthAssessment", label: "Strength Assessment" },
                  { key: "balanceCoordination", label: "Balance & Coordination" },
                  { key: "painAssessment", label: "Pain Assessment" },
                  { key: "functionalCapacity", label: "Functional Capacity" },
                  { key: "treatmentModalities", label: "Treatment Modalities" },
                  { key: "exercisesPrescribed", label: "Exercises Prescribed" },
                  { key: "homeExercises", label: "Home Exercise Program" },
                  { key: "assistiveDevices", label: "Assistive Devices" },
                  { key: "treatmentPlan", label: "Treatment Plan" },
                  { key: "progressNotes", label: "Progress Notes" },
                  { key: "goals", label: "Goals" },
                  { key: "precautions", label: "Precautions" },
                  { key: "nextSession", label: "Next Session" },
                  { key: "sessionDuration", label: "Session Duration (min)" }
                ];

                const visibleFields = fields.filter(f => {
                  const v = formData?.[f.key];
                  return v !== undefined && v !== null && String(v).trim() !== "";
                });

                if (visibleFields.length === 0) {
                  return (
                    <div className="text-sm text-gray-600">
                      No saved assessment details were found for this record.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleFields.map(({ key, label }) => (
                      <div key={key} className="rounded-lg border p-4 bg-gray-50">
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          {label}
                        </div>
                        <div className="text-sm text-gray-900 whitespace-pre-wrap">
                          {String(formData[key])}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}