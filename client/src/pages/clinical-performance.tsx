import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  Activity,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Heart,
  Stethoscope,
  Pill,
  FlaskRound,
  AlertCircle,
  CheckCircle,
  Target,
  Download,
  Filter
} from "lucide-react";

interface ClinicalMetrics {
  totalVisits: number;
  avgVisitDuration: number;
  patientSatisfaction: number;
  treatmentSuccess: number;
  followUpCompliance: number;
  diagnosisAccuracy: number;
}

interface PerformanceData {
  period: string;
  visits: number;
  successRate: number;
  avgDuration: number;
  satisfaction: number;
}

interface DiagnosisMetrics {
  condition: string;
  count: number;
  successRate: number;
  avgTreatmentDays: number;
  color: string;
}

interface StaffPerformance {
  staffId: number;
  name: string;
  role: string;
  visits: number;
  satisfaction: number;
  efficiency: number;
  specialization: string;
}

export default function ClinicalPerformance() {
  const [timeRange, setTimeRange] = useState("30");
  const [selectedMetric, setSelectedMetric] = useState("visits");
  
  // Fetch clinical performance data
  const { data: clinicalMetrics, isLoading: metricsLoading } = useQuery<ClinicalMetrics>({
    queryKey: ["/api/clinical/metrics", timeRange],
  });

  const { data: performanceData, isLoading: performanceLoading } = useQuery<PerformanceData[]>({
    queryKey: ["/api/clinical/performance", timeRange],
  });

  const { data: diagnosisData, isLoading: diagnosisLoading } = useQuery<DiagnosisMetrics[]>({
    queryKey: ["/api/clinical/diagnosis-metrics", timeRange],
  });

  const { data: staffPerformance, isLoading: staffLoading } = useQuery<StaffPerformance[]>({
    queryKey: ["/api/clinical/staff-performance", timeRange],
  });

  // Default data for development
  const defaultMetrics: ClinicalMetrics = {
    totalVisits: 156,
    avgVisitDuration: 18,
    patientSatisfaction: 4.6,
    treatmentSuccess: 89,
    followUpCompliance: 76,
    diagnosisAccuracy: 94
  };

  const defaultPerformanceData: PerformanceData[] = [
    { period: "Week 1", visits: 38, successRate: 92, avgDuration: 16, satisfaction: 4.7 },
    { period: "Week 2", visits: 42, successRate: 89, avgDuration: 19, satisfaction: 4.5 },
    { period: "Week 3", visits: 35, successRate: 91, avgDuration: 17, satisfaction: 4.6 },
    { period: "Week 4", visits: 41, successRate: 87, avgDuration: 20, satisfaction: 4.4 },
  ];

  const defaultDiagnosisData: DiagnosisMetrics[] = [
    { condition: "Hypertension", count: 28, successRate: 94, avgTreatmentDays: 30, color: "#8884d8" },
    { condition: "Diabetes T2", count: 22, successRate: 89, avgTreatmentDays: 45, color: "#82ca9d" },
    { condition: "Upper Respiratory", count: 35, successRate: 96, avgTreatmentDays: 7, color: "#ffc658" },
    { condition: "Malaria", count: 19, successRate: 98, avgTreatmentDays: 5, color: "#ff7300" },
    { condition: "Gastroenteritis", count: 15, successRate: 92, avgTreatmentDays: 3, color: "#00ff00" },
  ];

  const defaultStaffData: StaffPerformance[] = [
    { staffId: 1, name: "Dr. Ade", role: "Doctor", visits: 48, satisfaction: 4.8, efficiency: 92, specialization: "General Medicine" },
    { staffId: 2, name: "Dr. Rob", role: "Doctor", visits: 45, satisfaction: 4.6, efficiency: 88, specialization: "Internal Medicine" },
    { staffId: 3, name: "Nurse Syb", role: "Nurse", visits: 63, satisfaction: 4.7, efficiency: 95, specialization: "Patient Care" },
  ];

  const metrics = clinicalMetrics || defaultMetrics;
  const performance = performanceData || defaultPerformanceData;
  const diagnosis = diagnosisData || defaultDiagnosisData;
  const staff = staffPerformance || defaultStaffData;

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value >= threshold) return "text-green-600";
    if (value >= threshold * 0.8) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (value: number, threshold: number) => {
    if (value >= threshold) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (value >= threshold * 0.8) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Clinical Performance Analytics</h1>
          <p className="text-slate-600 mt-2">Track and analyze your clinic's medical outcomes and efficiency</p>
        </div>
        <div className="flex items-center space-x-4">
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
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Visits</p>
                <p className="text-2xl font-bold text-blue-800">{metrics.totalVisits}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              {getPerformanceBadge(metrics.totalVisits, 150)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Treatment Success</p>
                <p className="text-2xl font-bold text-green-800">{metrics.treatmentSuccess}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              {getPerformanceBadge(metrics.treatmentSuccess, 85)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Avg Visit Time</p>
                <p className="text-2xl font-bold text-purple-800">{metrics.avgVisitDuration}min</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              {getPerformanceBadge(25 - metrics.avgVisitDuration, 5)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Patient Satisfaction</p>
                <p className="text-2xl font-bold text-orange-800">{metrics.patientSatisfaction}/5</p>
              </div>
              <Heart className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              {getPerformanceBadge(metrics.patientSatisfaction, 4.5)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700">Follow-up Rate</p>
                <p className="text-2xl font-bold text-teal-800">{metrics.followUpCompliance}%</p>
              </div>
              <Target className="h-8 w-8 text-teal-600" />
            </div>
            <div className="mt-2">
              {getPerformanceBadge(metrics.followUpCompliance, 80)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-700">Diagnosis Accuracy</p>
                <p className="text-2xl font-bold text-indigo-800">{metrics.diagnosisAccuracy}%</p>
              </div>
              <Stethoscope className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="mt-2">
              {getPerformanceBadge(metrics.diagnosisAccuracy, 90)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnosis Analysis</TabsTrigger>
          <TabsTrigger value="staff">Staff Performance</TabsTrigger>
          <TabsTrigger value="outcomes">Patient Outcomes</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Visit Volume & Success Rate
                </CardTitle>
                <CardDescription>Weekly performance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="visits"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="successRate"
                      stroke="#82ca9d"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Efficiency Metrics
                </CardTitle>
                <CardDescription>Average visit duration and patient satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="avgDuration"
                      stroke="#ff7300"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="satisfaction"
                      stroke="#00ff00"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diagnosis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FlaskRound className="h-5 w-5 mr-2" />
                  Most Common Conditions
                </CardTitle>
                <CardDescription>Distribution of diagnoses in your clinic</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={diagnosis}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ condition, count }) => `${condition}: ${count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {diagnosis.map((entry, index) => (
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
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Treatment Success by Condition
                </CardTitle>
                <CardDescription>Success rates and treatment duration</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={diagnosis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="condition" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="successRate" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Diagnosis Metrics</CardTitle>
              <CardDescription>Comprehensive analysis of treatment outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Condition</th>
                      <th className="text-left p-2">Cases</th>
                      <th className="text-left p-2">Success Rate</th>
                      <th className="text-left p-2">Avg Treatment Days</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnosis.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-slate-50">
                        <td className="p-2 font-medium">{item.condition}</td>
                        <td className="p-2">{item.count}</td>
                        <td className={`p-2 font-semibold ${getPerformanceColor(item.successRate, 85)}`}>
                          {item.successRate}%
                        </td>
                        <td className="p-2">{item.avgTreatmentDays} days</td>
                        <td className="p-2">{getPerformanceBadge(item.successRate, 85)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Staff Performance Overview
              </CardTitle>
              <CardDescription>Individual performance metrics for healthcare providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map((member) => (
                  <Card key={member.staffId} className="border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-800">{member.name}</h3>
                          <p className="text-sm text-slate-600">{member.role}</p>
                        </div>
                        <Badge variant="outline">{member.specialization}</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Visits:</span>
                          <span className="font-medium">{member.visits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Satisfaction:</span>
                          <span className={`font-medium ${getPerformanceColor(member.satisfaction, 4.5)}`}>
                            {member.satisfaction}/5
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Efficiency:</span>
                          <span className={`font-medium ${getPerformanceColor(member.efficiency, 85)}`}>
                            {member.efficiency}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        {getPerformanceBadge(member.efficiency, 85)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staff Performance Comparison</CardTitle>
              <CardDescription>Comparative analysis of team performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={staff}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#8884d8" name="Visits" />
                  <Bar dataKey="efficiency" fill="#82ca9d" name="Efficiency %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Patient Recovery Trends
                </CardTitle>
                <CardDescription>Recovery rates and patient outcomes over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="successRate"
                      stroke="#82ca9d"
                      strokeWidth={3}
                      dot={{ fill: '#82ca9d', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Quality Indicators
                </CardTitle>
                <CardDescription>Key quality metrics for clinical care</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Readmission Rate</span>
                  <span className="text-green-600 font-bold">3.2%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-800">Medication Adherence</span>
                  <span className="text-blue-600 font-bold">87%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium text-purple-800">Preventive Care Completion</span>
                  <span className="text-purple-600 font-bold">92%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium text-orange-800">Patient Safety Score</span>
                  <span className="text-orange-600 font-bold">96%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Clinical Quality Metrics</CardTitle>
              <CardDescription>Comprehensive quality assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-b from-green-50 to-green-100 rounded-lg">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-800">Treatment Success</h3>
                  <p className="text-2xl font-bold text-green-600">{metrics.treatmentSuccess}%</p>
                  <p className="text-sm text-green-700 mt-1">Above target (85%)</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg">
                  <Target className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-800">Follow-up Rate</h3>
                  <p className="text-2xl font-bold text-blue-600">{metrics.followUpCompliance}%</p>
                  <p className="text-sm text-blue-700 mt-1">Target: 80%</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-purple-100 rounded-lg">
                  <Stethoscope className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-purple-800">Diagnosis Accuracy</h3>
                  <p className="text-2xl font-bold text-purple-600">{metrics.diagnosisAccuracy}%</p>
                  <p className="text-sm text-purple-700 mt-1">Excellent performance</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-b from-orange-50 to-orange-100 rounded-lg">
                  <Heart className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-orange-800">Patient Satisfaction</h3>
                  <p className="text-2xl font-bold text-orange-600">{metrics.patientSatisfaction}/5</p>
                  <p className="text-sm text-orange-700 mt-1">Very satisfied</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}