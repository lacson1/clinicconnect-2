import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, User, Activity, Pill, Calendar } from "lucide-react";

interface ConsultationHistoryDisplayProps {
  patientId: number;
}

export default function ConsultationHistoryDisplay({ patientId }: ConsultationHistoryDisplayProps) {
  // Fetch detailed consultation records with complete form data
  const { data: consultationHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['/api/patients', patientId, 'consultation-records'],
  });

  if (historyLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Consultation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Loading consultation history...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (consultationHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Consultation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No consultation history available</p>
            <p className="text-sm">Create the first consultation to see history here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="consultation-history">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Consultation History ({consultationHistory.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
          
          <div className="space-y-6">
            {(consultationHistory as any[]).map((consultation: any, index: number) => (
              <div key={consultation.id} className="relative flex items-start" data-testid="consultation-record">
                {/* Timeline dot */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                
                {/* Consultation content */}
                <div className="ml-4 flex-1">
                  <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg text-gray-900">
                          {consultation.formName || 'Consultation'}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            #{consultation.id}
                          </Badge>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {consultation.specialistRole || 'General'}
                          </Badge>
                          <Badge variant="secondary">
                            {new Date(consultation.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Conducted by information */}
                      <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 rounded-lg">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-800">
                          <strong>Conducted by:</strong> {consultation.conductedByName || consultation.conductedByUsername || 'Healthcare Staff'}
                        </span>
                        {consultation.conductedByRole && (
                          <Badge variant="outline" className="bg-white text-blue-700 border-blue-200 text-xs">
                            {consultation.conductedByRole}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Consultation details */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <span className="text-gray-600">
                            <strong>Date:</strong> {new Date(consultation.createdAt).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                          <span className="text-gray-600">
                            <strong>Time:</strong> {new Date(consultation.createdAt).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        {/* Vital Signs Section */}
                        {consultation.vitalSigns && (
                          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                            <h5 className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-2">
                              <Activity className="w-3 h-3" />
                              Vital Signs
                            </h5>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {consultation.vitalSigns.bloodPressure && (
                                <span className="text-gray-700">
                                  <strong>BP:</strong> {consultation.vitalSigns.bloodPressure}
                                </span>
                              )}
                              {consultation.vitalSigns.heartRate && (
                                <span className="text-gray-700">
                                  <strong>HR:</strong> {consultation.vitalSigns.heartRate} bpm
                                </span>
                              )}
                              {consultation.vitalSigns.temperature && (
                                <span className="text-gray-700">
                                  <strong>Temp:</strong> {consultation.vitalSigns.temperature}°C
                                </span>
                              )}
                              {consultation.vitalSigns.weight && (
                                <span className="text-gray-700">
                                  <strong>Weight:</strong> {consultation.vitalSigns.weight} kg
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Nursing Notes Section */}
                        {consultation.nursingNotes && (
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <h5 className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-2">
                              <User className="w-3 h-3" />
                              Nursing Assessment
                            </h5>
                            <div className="space-y-1 text-xs">
                              {consultation.nursingNotes.assessment && (
                                <div>
                                  <strong className="text-green-700">Assessment:</strong>
                                  <p className="text-gray-700 ml-2">{consultation.nursingNotes.assessment}</p>
                                </div>
                              )}
                              {consultation.nursingNotes.medications && (
                                <div>
                                  <strong className="text-green-700">Medications Administered:</strong>
                                  <p className="text-gray-700 ml-2">{consultation.nursingNotes.medications}</p>
                                </div>
                              )}
                              {consultation.nursingNotes.notes && (
                                <div>
                                  <strong className="text-green-700">Notes:</strong>
                                  <p className="text-gray-700 ml-2">{consultation.nursingNotes.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Physiotherapy Section */}
                        {consultation.physiotherapyNotes && (
                          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                            <h5 className="text-xs font-semibold text-purple-800 mb-2 flex items-center gap-2">
                              <Activity className="w-3 h-3" />
                              Physiotherapy Assessment
                            </h5>
                            <div className="space-y-1 text-xs">
                              {consultation.physiotherapyNotes.mobility && (
                                <div>
                                  <strong className="text-purple-700">Mobility:</strong>
                                  <p className="text-gray-700 ml-2">{consultation.physiotherapyNotes.mobility}</p>
                                </div>
                              )}
                              {consultation.physiotherapyNotes.exercises && (
                                <div>
                                  <strong className="text-purple-700">Prescribed Exercises:</strong>
                                  <p className="text-gray-700 ml-2">{consultation.physiotherapyNotes.exercises}</p>
                                </div>
                              )}
                              {consultation.physiotherapyNotes.progress && (
                                <div>
                                  <strong className="text-purple-700">Progress:</strong>
                                  <p className="text-gray-700 ml-2">{consultation.physiotherapyNotes.progress}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Pharmacy Section */}
                        {consultation.pharmacyNotes && (
                          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                            <h5 className="text-xs font-semibold text-orange-800 mb-2 flex items-center gap-2">
                              <Pill className="w-3 h-3" />
                              Pharmacy Review
                            </h5>
                            <div className="space-y-1 text-xs">
                              {consultation.pharmacyNotes.interactions && (
                                <div>
                                  <strong className="text-orange-700">Drug Interactions:</strong>
                                  <p className="text-gray-700 ml-2">{consultation.pharmacyNotes.interactions}</p>
                                </div>
                              )}
                              {consultation.pharmacyNotes.counseling && (
                                <div>
                                  <strong className="text-orange-700">Patient Counseling:</strong>
                                  <p className="text-gray-700 ml-2">{consultation.pharmacyNotes.counseling}</p>
                                </div>
                              )}
                              {consultation.pharmacyNotes.recommendations && (
                                <div>
                                  <strong className="text-orange-700">Recommendations:</strong>
                                  <p className="text-gray-700 ml-2">{consultation.pharmacyNotes.recommendations}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Continuity of Care */}
                        {consultation.followUp && (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <h5 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              Follow-up & Continuity
                            </h5>
                            <div className="space-y-1 text-xs">
                              {consultation.followUp.nextAppointment && (
                                <div>
                                  <strong className="text-blue-700">Next Appointment:</strong>
                                  <p className="text-gray-700 ml-2">{consultation.followUp.nextAppointment}</p>
                                </div>
                              )}
                              {consultation.followUp.instructions && (
                                <div>
                                  <strong className="text-blue-700">Care Instructions:</strong>
                                  <p className="text-gray-700 ml-2">{consultation.followUp.instructions}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {consultation.formDescription && (
                          <div className="text-xs text-gray-600">
                            <strong>Type:</strong> {consultation.formDescription}
                          </div>
                        )}
                        
                        {/* Complete Consultation Data Display */}
                        {consultation.formData && Object.keys(consultation.formData).length > 0 && (
                          <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Complete Consultation Details
                            </p>
                            <div className="space-y-3">
                              {Object.entries(consultation.formData).map(([key, value]: [string, any]) => (
                                <div key={key} className="bg-white p-3 rounded-md shadow-sm">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-medium text-gray-700 text-sm">
                                      {key.includes('field_') ? 'Clinical Notes' : key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                    </span>
                                    <div className="text-gray-900 text-sm">
                                      <span className="whitespace-pre-wrap">{String(value)}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
            
            {/* End of timeline indicator */}
            <div className="relative flex items-center mt-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              </div>
              <div className="ml-4 text-sm text-gray-500">
                Start of consultation history
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}