import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Calendar, 
  User, 
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

interface ClinicalNote {
  id: number;
  consultationId: number;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  pastMedicalHistory?: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    reasoning?: string;
  }>;
  vitalSigns?: {
    temperature?: string;
    bloodPressure?: string;
    heartRate?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
  };
  diagnosis?: string;
  differentialDiagnoses?: Array<{
    diagnosis: string;
    icdCode?: string;
    probability: number;
    reasoning: string;
  }>;
  icdCodes?: Array<{
    code: string;
    description: string;
    category: string;
  }>;
  suggestedLabTests?: Array<{
    test: string;
    reasoning: string;
    urgency: 'routine' | 'urgent' | 'stat';
  }>;
  clinicalWarnings?: Array<{
    type: 'contraindication' | 'drug_interaction' | 'allergy' | 'red_flag';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  confidenceScore?: number;
  recommendations?: string;
  followUpInstructions?: string;
  followUpDate?: string;
  addedToPatientRecord?: boolean;
  addedToRecordAt?: string;
  createdAt: string;
  updatedAt: string;
  consultation?: {
    id: number;
    patientId: number;
    providerId: number;
    status: string;
    chiefComplaint?: string;
    createdAt: string;
    completedAt?: string;
  };
}

interface PatientNotesTabProps {
  patient: {
    id: number;
  };
}

export function PatientNotesTab({ patient }: PatientNotesTabProps) {
  const { data: notes, isLoading, error, refetch } = useQuery<ClinicalNote[]>({
    queryKey: [`/api/patients/${patient.id}/clinical-notes`],
    retry: 1,
    enabled: !!patient?.id,
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading clinical notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400 font-medium mb-2">Failed to load clinical notes</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {error instanceof Error ? error.message : 'An error occurred while loading notes'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="p-8 text-center">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No clinical notes found</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Clinical notes will appear here after consultations are completed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clinical Notes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} found
          </p>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-6 pr-4">
          {notes.map((note) => (
            <Card key={note.id} className="border-2 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Clinical Note
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {note.createdAt ? format(new Date(note.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                      {note.consultation?.completedAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Completed: {format(new Date(note.consultation.completedAt), 'MMM dd, yyyy')}
                        </div>
                      )}
                      {note.addedToPatientRecord && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Added to Record
                        </Badge>
                      )}
                    </div>
                  </div>
                  {note.confidenceScore !== undefined && (
                    <Badge 
                      variant="outline" 
                      className={
                        note.confidenceScore >= 80 ? 'bg-green-50 text-green-700 border-green-200' :
                        note.confidenceScore >= 60 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }
                    >
                      {note.confidenceScore}% Confidence
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Chief Complaint */}
                {note.chiefComplaint && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <Stethoscope className="h-4 w-4" />
                      Chief Complaint
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                      {note.chiefComplaint}
                    </p>
                  </div>
                )}

                {/* SOAP Format */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Subjective */}
                  {note.subjective && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2 text-purple-700 dark:text-purple-300">
                        Subjective (S)
                      </h3>
                      <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {note.subjective}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Objective */}
                  {note.objective && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-300">
                        Objective (O)
                      </h3>
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {note.objective}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Assessment */}
                  {note.assessment && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2 text-indigo-700 dark:text-indigo-300">
                        Assessment (A)
                      </h3>
                      <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {note.assessment}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Plan */}
                  {note.plan && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-300">
                        Plan (P)
                      </h3>
                      <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {note.plan}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Diagnosis */}
                {note.diagnosis && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        Diagnosis
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-lg">
                        {note.diagnosis}
                      </p>
                    </div>
                  </>
                )}

                {/* Vital Signs */}
                {note.vitalSigns && Object.keys(note.vitalSigns).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Vital Signs</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {note.vitalSigns.temperature && (
                          <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            <span className="text-xs text-muted-foreground">Temperature</span>
                            <p className="text-sm font-medium">{note.vitalSigns.temperature}</p>
                          </div>
                        )}
                        {note.vitalSigns.bloodPressure && (
                          <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            <span className="text-xs text-muted-foreground">Blood Pressure</span>
                            <p className="text-sm font-medium">{note.vitalSigns.bloodPressure}</p>
                          </div>
                        )}
                        {note.vitalSigns.heartRate && (
                          <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            <span className="text-xs text-muted-foreground">Heart Rate</span>
                            <p className="text-sm font-medium">{note.vitalSigns.heartRate}</p>
                          </div>
                        )}
                        {note.vitalSigns.respiratoryRate && (
                          <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            <span className="text-xs text-muted-foreground">Respiratory Rate</span>
                            <p className="text-sm font-medium">{note.vitalSigns.respiratoryRate}</p>
                          </div>
                        )}
                        {note.vitalSigns.oxygenSaturation && (
                          <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            <span className="text-xs text-muted-foreground">O2 Saturation</span>
                            <p className="text-sm font-medium">{note.vitalSigns.oxygenSaturation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Medications */}
                {note.medications && note.medications.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Medications</h3>
                      <div className="space-y-2">
                        {note.medications.map((med, idx) => (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <p className="font-medium text-sm">{med.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </p>
                            {med.reasoning && (
                              <p className="text-xs text-muted-foreground mt-1">{med.reasoning}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Clinical Warnings */}
                {note.clinicalWarnings && note.clinicalWarnings.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                        <AlertTriangle className="h-4 w-4" />
                        Clinical Warnings
                      </h3>
                      <div className="space-y-2">
                        {note.clinicalWarnings.map((warning, idx) => (
                          <div 
                            key={idx} 
                            className={`p-3 rounded-lg border ${
                              warning.severity === 'critical' ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' :
                              warning.severity === 'high' ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' :
                              warning.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800' :
                              'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <Badge 
                                variant="outline"
                                className={
                                  warning.severity === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
                                  warning.severity === 'high' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                  warning.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                  'bg-blue-100 text-blue-800 border-blue-300'
                                }
                              >
                                {warning.type.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {warning.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm mt-2">{warning.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Recommendations */}
                {note.recommendations && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Recommendations</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg whitespace-pre-wrap">
                        {note.recommendations}
                      </p>
                    </div>
                  </>
                )}

                {/* Follow-up Instructions */}
                {note.followUpInstructions && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Follow-up Instructions</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg whitespace-pre-wrap">
                        {note.followUpInstructions}
                      </p>
                      {note.followUpDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Follow-up Date: {format(new Date(note.followUpDate), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

