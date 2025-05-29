import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Brain, Heart, Activity,
  AlertTriangle, Calendar, Filter, Download, RefreshCw
} from "lucide-react";

export default function WellnessAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30");
  const [selectedMetric, setSelectedMetric] = useState("all");

  // Fetch patients data for analytics
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  // Calculate wellness metrics from patient data
  const calculateWellnessMetrics = () => {
    if (!patients || patients.length === 0) return null;

    // Age distribution analysis
    const ageGroups = {
      "18-30": 0,
      "31-45": 0,
      "46-60": 0,
      "60+": 0
    };

    // Gender distribution
    const genderDist = { male: 0, female: 0, other: 0 };

    // Risk categories (simulated based on patient data)
    const riskLevels = { low: 0, moderate: 0, high: 0 };

    patients.forEach((patient: any) => {
      // Calculate age
      const birthYear = new Date(patient.dateOfBirth).getFullYear();
      const age = new Date().getFullYear() - birthYear;
      
      if (age >= 18 && age <= 30) ageGroups["18-30"]++;
      else if (age >= 31 && age <= 45) ageGroups["31-45"]++;
      else if (age >= 46 && age <= 60) ageGroups["46-60"]++;
      else if (age > 60) ageGroups["60+"]++;

      // Gender distribution
      if (patient.gender?.toLowerCase() === 'male') genderDist.male++;
      else if (patient.gender?.toLowerCase() === 'female') genderDist.female++;
      else genderDist.other++;

      // Simulate risk assessment based on age and medical history
      if (age < 40 && !patient.medicalHistory) riskLevels.low++;
      else if (age >= 40 && age < 60) riskLevels.moderate++;
      else riskLevels.high++;
    });

    return {
      totalPatients: patients.length,
      ageGroups,
      genderDist,
      riskLevels
    };
  };

  const metrics = calculateWellnessMetrics();

  // Chart data preparation
  const ageChartData = metrics ? Object.entries(metrics.ageGroups).map(([age, count]) => ({
    age,
    count
  })) : [];

  const genderChartData = metrics ? Object.entries(metrics.genderDist).map(([gender, count]) => ({
    gender: gender.charAt(0).toUpperCase() + gender.slice(1),
    count
  })) : [];

  const riskChartData = metrics ? Object.entries(metrics.riskLevels).map(([risk, count]) => ({
    risk: risk.charAt(0).toUpperCase() + risk.slice(1),
    count,
    color: risk === 'low' ? '#10B981' : risk === 'moderate' ? '#F59E0B' : '#EF4444'
  })) : [];

  // Mental health trends (simulated data based on time periods)
  const mentalHealthTrends = [
    { month: 'Jan', depression: 12, anxiety: 18, wellbeing: 85 },
    { month: 'Feb', depression: 15, anxiety: 22, wellbeing: 82 },
    { month: 'Mar', depression: 18, anxiety: 25, wellbeing: 78 },
    { month: 'Apr', depression: 14, anxiety: 20, wellbeing: 83 },
    { month: 'May', depression: 11, anxiety: 16, wellbeing: 87 },
    { month: 'Jun', depression: 9, anxiety: 14, wellbeing: 89 }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wellness Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into patient wellness and mental health trends</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-blue-600">{metrics?.totalPatients || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wellness Score</p>
                <p className="text-3xl font-bold text-green-600">84%</p>
              </div>
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+5% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mental Health Screenings</p>
                <p className="text-3xl font-bold text-yellow-600">47</p>
              </div>
              <Brain className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+23% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Wellness Plans</p>
                <p className="text-3xl font-bold text-purple-600">32</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+8% engagement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="demographics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="mental-health">Mental Health</TabsTrigger>
          <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
        </TabsList>

        {/* Demographics Analytics */}
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({gender, count, percent}) => `${gender}: ${count} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {genderChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Mental Health Analytics */}
        <TabsContent value="mental-health" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mental Health Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mentalHealthTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="depression" stroke="#EF4444" strokeWidth={2} name="Depression" />
                    <Line type="monotone" dataKey="anxiety" stroke="#F59E0B" strokeWidth={2} name="Anxiety" />
                    <Line type="monotone" dataKey="wellbeing" stroke="#10B981" strokeWidth={2} name="Wellbeing Score" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mental Health Screening Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Normal Range</span>
                  <Badge className="bg-green-100 text-green-800">67%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium text-yellow-800">Mild Symptoms</span>
                  <Badge className="bg-yellow-100 text-yellow-800">23%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-red-800">Requires Attention</span>
                  <Badge className="bg-red-100 text-red-800">10%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Assessment */}
        <TabsContent value="risk-assessment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({risk, count, percent}) => `${risk}: ${count} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>High-Risk Patients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patients?.filter((p: any) => {
                  const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
                  return age >= 60 || p.medicalHistory;
                }).slice(0, 5).map((patient: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-red-600">
                        Age: {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
                      </p>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-8">No high-risk patients identified</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Outcomes */}
        <TabsContent value="outcomes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wellness Program Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mentalHealthTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="wellbeing" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-green-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Program Completion Rate</h3>
                <p className="text-3xl font-bold text-green-600">78%</p>
                <p className="text-sm text-gray-600 mt-1">of patients complete wellness programs</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Average Improvement</h3>
                <p className="text-3xl font-bold text-blue-600">24%</p>
                <p className="text-sm text-gray-600 mt-1">wellness score improvement</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Patient Satisfaction</h3>
                <p className="text-3xl font-bold text-purple-600">4.7/5</p>
                <p className="text-sm text-gray-600 mt-1">average rating</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}