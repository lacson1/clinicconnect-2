import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Activity, Target, Zap, Clock } from 'lucide-react';

interface PhysiotherapyAssessmentProps {
  patientId: number;
  visitId?: number;
}

export default function PhysiotherapyAssessment({ patientId, visitId }: PhysiotherapyAssessmentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [assessmentData, setAssessmentData] = useState({
    mobilityAssessment: '',
    rangeOfMotion: '',
    strengthAssessment: '',
    balanceCoordination: '',
    painAssessment: '',
    functionalCapacity: '',
    exercisesPrescribed: '',
    treatmentPlan: '',
    homeExercises: '',
    assistiveDevices: '',
    progressNotes: '',
    goals: '',
    precautions: '',
    nextSession: '',
    sessionDuration: '',
    treatmentModalities: ''
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', `/api/patients/${patientId}/physiotherapy-assessment`, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Physiotherapy assessment saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patientId, 'consultation-records'] });
      setAssessmentData({
        mobilityAssessment: '',
        rangeOfMotion: '',
        strengthAssessment: '',
        balanceCoordination: '',
        painAssessment: '',
        functionalCapacity: '',
        exercisesPrescribed: '',
        treatmentPlan: '',
        homeExercises: '',
        assistiveDevices: '',
        progressNotes: '',
        goals: '',
        precautions: '',
        nextSession: '',
        sessionDuration: '',
        treatmentModalities: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save physiotherapy assessment",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...assessmentData,
      visitId,
      recordedAt: new Date().toISOString()
    });
  };

  const updateField = (field: string, value: string) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-purple-50 border-b border-purple-200">
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Activity className="w-5 h-5" />
          Physiotherapy Assessment
          <Badge variant="outline" className="ml-auto bg-purple-100 text-purple-700">
            Patient #{patientId}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Physical Assessment Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Physical Assessment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobilityAssessment" className="text-sm font-medium">Mobility Assessment</Label>
                <Textarea
                  id="mobilityAssessment"
                  placeholder="Gait pattern, walking distance, use of aids..."
                  value={assessmentData.mobilityAssessment}
                  onChange={(e) => updateField('mobilityAssessment', e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rangeOfMotion" className="text-sm font-medium">Range of Motion</Label>
                <Textarea
                  id="rangeOfMotion"
                  placeholder="Joint flexibility, limitations, measurements..."
                  value={assessmentData.rangeOfMotion}
                  onChange={(e) => updateField('rangeOfMotion', e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="strengthAssessment" className="text-sm font-medium">Strength Assessment</Label>
                <Textarea
                  id="strengthAssessment"
                  placeholder="Muscle strength grading, specific weaknesses..."
                  value={assessmentData.strengthAssessment}
                  onChange={(e) => updateField('strengthAssessment', e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="balanceCoordination" className="text-sm font-medium">Balance & Coordination</Label>
                <Textarea
                  id="balanceCoordination"
                  placeholder="Static/dynamic balance, coordination tests..."
                  value={assessmentData.balanceCoordination}
                  onChange={(e) => updateField('balanceCoordination', e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Clinical Assessment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Clinical Assessment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="painAssessment" className="text-sm font-medium">Pain Assessment</Label>
                <Textarea
                  id="painAssessment"
                  placeholder="Pain level, location, triggers, relief factors..."
                  value={assessmentData.painAssessment}
                  onChange={(e) => updateField('painAssessment', e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="functionalCapacity" className="text-sm font-medium">Functional Capacity</Label>
                <Textarea
                  id="functionalCapacity"
                  placeholder="ADL performance, work capacity, limitations..."
                  value={assessmentData.functionalCapacity}
                  onChange={(e) => updateField('functionalCapacity', e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Treatment Plan */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Treatment Plan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="treatmentModalities" className="text-sm font-medium">Treatment Modalities</Label>
                <Textarea
                  id="treatmentModalities"
                  placeholder="Heat, cold, electrical stimulation, manual therapy..."
                  value={assessmentData.treatmentModalities}
                  onChange={(e) => updateField('treatmentModalities', e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exercisesPrescribed" className="text-sm font-medium">Exercises Prescribed</Label>
                <Textarea
                  id="exercisesPrescribed"
                  placeholder="Specific exercises, sets, reps, progression..."
                  value={assessmentData.exercisesPrescribed}
                  onChange={(e) => updateField('exercisesPrescribed', e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="homeExercises" className="text-sm font-medium">Home Exercise Program</Label>
                <Textarea
                  id="homeExercises"
                  placeholder="Exercises to perform at home, frequency, duration..."
                  value={assessmentData.homeExercises}
                  onChange={(e) => updateField('homeExercises', e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assistiveDevices" className="text-sm font-medium">Assistive Devices</Label>
                <Input
                  id="assistiveDevices"
                  placeholder="Crutches, walker, brace, orthotics..."
                  value={assessmentData.assistiveDevices}
                  onChange={(e) => updateField('assistiveDevices', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Goals and Progress */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Goals & Progress</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goals" className="text-sm font-medium">Treatment Goals</Label>
                <Textarea
                  id="goals"
                  placeholder="Short-term and long-term goals, measurable outcomes..."
                  value={assessmentData.goals}
                  onChange={(e) => updateField('goals', e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="progressNotes" className="text-sm font-medium">Progress Notes</Label>
                <Textarea
                  id="progressNotes"
                  placeholder="Improvement noted, response to treatment..."
                  value={assessmentData.progressNotes}
                  onChange={(e) => updateField('progressNotes', e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Session Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionDuration" className="text-sm font-medium">Session Duration</Label>
                <Input
                  id="sessionDuration"
                  placeholder="45 minutes"
                  value={assessmentData.sessionDuration}
                  onChange={(e) => updateField('sessionDuration', e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nextSession" className="text-sm font-medium">Next Session</Label>
                <Input
                  id="nextSession"
                  placeholder="Date and time for next appointment"
                  value={assessmentData.nextSession}
                  onChange={(e) => updateField('nextSession', e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="precautions" className="text-sm font-medium">Precautions/Contraindications</Label>
                <Input
                  id="precautions"
                  placeholder="Safety considerations, limitations..."
                  value={assessmentData.precautions}
                  onChange={(e) => updateField('precautions', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAssessmentData({
                mobilityAssessment: '',
                rangeOfMotion: '',
                strengthAssessment: '',
                balanceCoordination: '',
                painAssessment: '',
                functionalCapacity: '',
                exercisesPrescribed: '',
                treatmentPlan: '',
                homeExercises: '',
                assistiveDevices: '',
                progressNotes: '',
                goals: '',
                precautions: '',
                nextSession: '',
                sessionDuration: '',
                treatmentModalities: ''
              })}
            >
              Clear Form
            </Button>
            <Button 
              type="submit" 
              disabled={saveMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Assessment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}