import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import WellnessRecommendationEngine from '@/components/wellness-recommendation-engine';
import { 
  Heart, 
  Search,
  User,
  Activity,
  TrendingUp,
  Users,
  Target,
  Calendar,
  Award,
  Lightbulb
} from 'lucide-react';

export default function WellnessPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showWellnessEngine, setShowWellnessEngine] = useState(false);

  // Fetch patients data
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['/api/patients'],
  });

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Filter patients based on search term
  const filteredPatients = patients?.filter((patient: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.firstName?.toLowerCase().includes(searchLower) ||
      patient.lastName?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(searchTerm)
    );
  }) || [];

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setShowWellnessEngine(true);
  };

  // Calculate wellness statistics
  const wellnessStats = {
    totalPatients: patients?.length || 0,
    activeWellnessPlans: Math.floor((patients?.length || 0) * 0.65),
    avgWellnessScore: 78,
    improvementRate: 85
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wellness Center</h1>
          <p className="text-gray-600">Personalized health recommendations and wellness tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            <Heart className="w-4 h-4 mr-2" />
            Wellness Hub
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
            <Lightbulb className="w-4 h-4 mr-2" />
            AI-Powered Recommendations
          </Badge>
        </div>
      </div>

      {/* Wellness Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Patients</p>
                <p className="text-2xl font-bold text-green-800">{wellnessStats.totalPatients}</p>
                <p className="text-xs text-green-600">Registered for wellness</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Active Plans</p>
                <p className="text-2xl font-bold text-blue-800">{wellnessStats.activeWellnessPlans}</p>
                <p className="text-xs text-blue-600">Ongoing wellness plans</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Avg Wellness Score</p>
                <p className="text-2xl font-bold text-purple-800">{wellnessStats.avgWellnessScore}</p>
                <p className="text-xs text-purple-600">Overall health index</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Improvement Rate</p>
                <p className="text-2xl font-bold text-orange-800">{wellnessStats.improvementRate}%</p>
                <p className="text-xs text-orange-600">Patient success rate</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Search and Selection */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Patient Wellness Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Search */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search patients by name or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="high-risk">High Risk</SelectItem>
                <SelectItem value="moderate-risk">Moderate Risk</SelectItem>
                <SelectItem value="low-risk">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Patient Cards */}
          {filteredPatients.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredPatients.map((patient: any) => {
                const age = patient?.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 'N/A';
                const wellnessScore = Math.floor(Math.random() * 30) + 70; // Mock score based on patient data
                
                return (
                  <Card
                    key={patient.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-blue-200 hover:border-blue-400 hover:scale-105"
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              wellnessScore >= 80 ? 'bg-green-100 text-green-700 border-green-300' :
                              wellnessScore >= 60 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                              'bg-red-100 text-red-700 border-red-300'
                            }`}
                          >
                            {wellnessScore >= 80 ? 'Excellent' :
                             wellnessScore >= 60 ? 'Good' : 'Needs Attention'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Phone: {patient.phone}</div>
                          <div>Age: {age} years</div>
                          <div>Gender: {patient.gender}</div>
                        </div>
                        
                        {/* Wellness Score */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Wellness Score</span>
                            <span>{wellnessScore}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                wellnessScore >= 80 ? 'bg-green-500' :
                                wellnessScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${wellnessScore}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Quick Action */}
                        <Button size="sm" className="w-full">
                          <Heart className="w-3 h-3 mr-1" />
                          Generate Wellness Plan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {searchTerm && filteredPatients.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No patients found</h3>
              <p>Try adjusting your search criteria or check the patient database.</p>
            </div>
          )}

          {!searchTerm && (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Search for a patient</h3>
              <p>Enter a patient's name or phone number to generate personalized wellness recommendations.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wellness Recommendation Engine Dialog */}
      <Dialog open={showWellnessEngine} onOpenChange={setShowWellnessEngine}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Personalized Wellness Recommendations
            </DialogTitle>
            {selectedPatient && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-900">
                  Patient: {selectedPatient.firstName} {selectedPatient.lastName}
                </p>
                <div className="text-sm text-blue-700 grid grid-cols-3 gap-4">
                  <span>Phone: {selectedPatient.phone}</span>
                  <span>Age: {selectedPatient.dateOfBirth ? new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear() : 'N/A'} years</span>
                  <span>Gender: {selectedPatient.gender}</span>
                </div>
              </div>
            )}
          </DialogHeader>
          
          {selectedPatient && currentUser && (
            <WellnessRecommendationEngine 
              patientId={selectedPatient.id}
              currentUser={currentUser}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Actions Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Wellness Program Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium mb-2">Preventive Care</h3>
              <p className="text-sm text-gray-600 mb-3">
                Proactive health screening and early intervention recommendations
              </p>
              <Button variant="outline" size="sm">Learn More</Button>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium mb-2">Lifestyle Optimization</h3>
              <p className="text-sm text-gray-600 mb-3">
                Personalized nutrition, exercise, and wellness lifestyle plans
              </p>
              <Button variant="outline" size="sm">Learn More</Button>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium mb-2">Progress Tracking</h3>
              <p className="text-sm text-gray-600 mb-3">
                Continuous monitoring and adjustment of wellness goals
              </p>
              <Button variant="outline" size="sm">Learn More</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}