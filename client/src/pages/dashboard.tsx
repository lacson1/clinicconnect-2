import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Stethoscope, Pill, FlaskRound, Search, Bell, ArrowUp, TriangleAlert, Clock, UserPlus, UserCheck, UserCog, Settings, Activity, TrendingUp, CheckCircle, Calendar, TestTube, User, AlertTriangle } from "lucide-react";
import PatientRegistrationModal from "@/components/patient-registration-modal";
import VisitRecordingModal from "@/components/visit-recording-modal";
import LabResultModal from "@/components/lab-result-modal";
import { Link } from "wouter";
import { useRole } from "@/components/role-guard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Patient, Medicine } from "@shared/schema";

interface DashboardStats {
  totalPatients: number;
  todayVisits: number;
  lowStockItems: number;
  pendingLabs: number;
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [reorderQuantity, setReorderQuantity] = useState("");
  const { user, isDoctor } = useRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentPatients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients/recent"],
  });

  const { data: lowStockMedicines, isLoading: medicinesLoading } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines/low-stock"],
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ medicineId, quantity }: { medicineId: number, quantity: number }) => {
      const response = await apiRequest("PATCH", `/api/medicines/${medicineId}`, {
        quantity: quantity
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines/low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Medicine Restocked",
        description: `${selectedMedicine?.name} has been restocked successfully.`,
      });
      setShowReorderModal(false);
      setReorderQuantity("");
      setSelectedMedicine(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to restock medicine. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleReorderMedicine = (medicine: any) => {
    setSelectedMedicine(medicine);
    setReorderQuantity("100"); // Default reorder quantity
    setShowReorderModal(true);
  };

  const handleConfirmReorder = () => {
    if (!selectedMedicine || !reorderQuantity) return;

    const newQuantity = parseInt(selectedMedicine.quantity) + parseInt(reorderQuantity);
    reorderMutation.mutate({
      medicineId: selectedMedicine.id,
      quantity: newQuantity
    });
  };

  // Doctor-specific data
  const { data: doctorReferrals, isLoading: referralsLoading } = useQuery({
    queryKey: ["/api/referrals", { toRole: "doctor" }],
    enabled: isDoctor,
  });

  const { data: allPatients, isLoading: allPatientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    enabled: isDoctor,
  });

  // Filter patients based on search query for doctors
  const filteredPatients = allPatients?.filter(patient => 
    patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getPatientInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getPatientAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <>
      {/* Top Bar */}
      <header className="bg-white shadow-sm border-b border-slate-200 px-4 md:px-6 py-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">Dashboard</h2>
            <p className="text-sm text-slate-500">Welcome back, monitor your clinic's performance</p>
          </div>
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search patients..."
                className="w-full md:w-80 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card stat-card-patients">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Total Patients
            </CardTitle>
            <Users className="h-5 w-5 text-white/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.totalPatients || 0}</div>
            <p className="text-xs text-white/70 mt-1">
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +20.1% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card stat-card-visits">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Today's Visits
            </CardTitle>
            <Calendar className="h-5 w-5 text-white/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.todayVisits || 0}</div>
            <p className="text-xs text-white/70 mt-1">
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +180.1% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card stat-card-pending">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Pending Lab Results
            </CardTitle>
            <TestTube className="h-5 w-5 text-white/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.pendingLabs || 0}</div>
            <p className="text-xs text-white/70 mt-1">
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +19% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card stat-card-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-white/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.lowStockItems || 0}</div>
            <p className="text-xs text-white/70 mt-1">
              <span className="inline-flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Requires attention
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

        {/* Nurse-Specific Dashboard */}
        {user?.role === 'nurse' && (
          <div className="mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-3 md:mb-4">Nurse Dashboard</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Today's Visits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Stethoscope className="mr-2 h-5 w-5" />
                    Today's Patient Visits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      onClick={() => setShowPatientModal(true)}
                      className="w-full"
                      variant="outline"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register New Patient
                    </Button>

                    <Button
                      onClick={() => setShowLabModal(true)}
                      className="w-full"
                    >
                      <FlaskRound className="mr-2 h-4 w-4" />
                      Add Lab Result
                    </Button>

                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium text-slate-600 mb-3">Quick Actions</p>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/visits">View All Visits</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Patient Referrals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="mr-2 h-5 w-5" />
                    Patient Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">Refer patients to specialists</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/referrals">To Pharmacist</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/referrals">To Physiotherapist</Link>
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/referrals">Manage All Referrals</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Pharmacist-Specific Dashboard */}
        {user?.role === 'pharmacist' && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Pharmacist Dashboard</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Medicine Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Pill className="mr-2 h-5 w-5" />
                    Medicine Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-red-800">Low Stock Alert</p>
                        <p className="text-sm text-red-600">
                          {stats?.lowStockItems || 0} items need attention
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/pharmacy">View Details</Link>
                      </Button>
                    </div>

                    <Button className="w-full" asChild>
                      <Link href="/pharmacy">
                        <Pill className="mr-2 h-4 w-4" />
                        Manage Pharmacy
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Prescription Referrals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="mr-2 h-5 w-5" />
                    Prescription Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">Referrals assigned to pharmacy</p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/referrals">View Pharmacy Referrals</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Enhanced Admin Dashboard */}
        {user?.role === 'admin' && (
          <div className="mb-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-800">Admin Control Center</h3>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Settings className="w-3 h-3 mr-1" />
                Administrator
              </Badge>
            </div>
            
            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/user-management">
                <Card className="admin-widget hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <UserCog className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">User Management</p>
                        <p className="text-sm text-slate-500">Manage staff accounts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/organization-management">
                <Card className="admin-widget hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <Settings className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Organizations</p>
                        <p className="text-sm text-slate-500">Clinic management</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/audit-logs">
                <Card className="admin-widget hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <Activity className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Audit Logs</p>
                        <p className="text-sm text-slate-500">System activity</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/clinical-performance">
                <Card className="admin-widget hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Analytics</p>
                        <p className="text-sm text-slate-500">Performance insights</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Detailed Admin Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* User Management Widget */}
              <Card className="admin-detail-widget">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <UserCog className="mr-2 h-5 w-5 text-blue-600" />
                      User Management
                    </span>
                    <Badge variant="outline">{stats?.totalPatients || 0} Users</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Doctors</p>
                        <p className="text-2xl font-bold text-blue-900">2</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Nurses</p>
                        <p className="text-2xl font-bold text-green-900">3</p>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline" asChild>
                      <Link href="/user-management">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Manage All Users
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Health Widget */}
              <Card className="admin-detail-widget">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Activity className="mr-2 h-5 w-5 text-green-600" />
                      System Health
                    </span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Healthy</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Database</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Online
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">API Services</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Storage</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Available
                        </Badge>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline" asChild>
                      <Link href="/audit-logs">
                        <Activity className="mr-2 h-4 w-4" />
                        View System Logs
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Widget */}
              <Card className="admin-detail-widget">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-orange-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-slate-600">New Patient Registration</span>
                        <span className="text-xs text-slate-500">2 hrs ago</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-slate-600">Lab Result Updated</span>
                        <span className="text-xs text-slate-500">4 hrs ago</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-slate-600">User Account Created</span>
                        <span className="text-xs text-slate-500">1 day ago</span>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline" asChild>
                      <Link href="/audit-logs">
                        <Clock className="mr-2 h-4 w-4" />
                        View All Activity
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Clinic Performance Widget */}
              <Card className="admin-performance-widget">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-indigo-600" />
                    Clinic Performance
                  </CardTitle>
                  <CardDescription>Key performance indicators for this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <p className="text-2xl font-bold text-indigo-700">{stats?.totalPatients || 0}</p>
                      <p className="text-sm text-indigo-600">Total Patients</p>
                      <p className="text-xs text-indigo-500 mt-1">+12% this month</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-700">{stats?.todayVisits || 0}</p>
                      <p className="text-sm text-emerald-600">Today's Visits</p>
                      <p className="text-xs text-emerald-500 mt-1">+8% from yesterday</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                      <p className="text-2xl font-bold text-amber-700">{stats?.pendingLabs || 0}</p>
                      <p className="text-sm text-amber-600">Pending Labs</p>
                      <p className="text-xs text-amber-500 mt-1">-15% from last week</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg">
                      <p className="text-2xl font-bold text-rose-700">{stats?.lowStockItems || 0}</p>
                      <p className="text-sm text-rose-600">Low Stock Items</p>
                      <p className="text-xs text-rose-500 mt-1">Needs attention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Widget */}
              <Card className="admin-actions-widget">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5 text-slate-600" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Frequently used administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    <Button className="justify-start h-12" variant="outline" asChild>
                      <Link href="/user-management">
                        <UserPlus className="mr-3 h-4 w-4" />
                        <div className="text-left">
                          <p className="font-medium">Add New Staff</p>
                          <p className="text-xs text-slate-500">Create user accounts</p>
                        </div>
                      </Link>
                    </Button>
                    
                    <Button className="justify-start h-12" variant="outline" asChild>
                      <Link href="/organization-management">
                        <Settings className="mr-3 h-4 w-4" />
                        <div className="text-left">
                          <p className="font-medium">Manage Clinics</p>
                          <p className="text-xs text-slate-500">Organization settings</p>
                        </div>
                      </Link>
                    </Button>
                    
                    <Button className="justify-start h-12" variant="outline" asChild>
                      <Link href="/clinical-performance">
                        <Activity className="mr-3 h-4 w-4" />
                        <div className="text-left">
                          <p className="font-medium">View Analytics</p>
                          <p className="text-xs text-slate-500">Performance reports</p>
                        </div>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Doctor Dashboard */}
        {isDoctor && (
          <div className="mb-8 space-y-6">
            <h3 className="text-xl font-semibold text-slate-800">Doctor's Overview</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Search & Recent Patients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Patient Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search patients..."
                        className="w-full pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>

                    {searchQuery && filteredPatients && filteredPatients.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filteredPatients.slice(0, 5).map((patient: any) => (
                          <div key={patient.id} className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                                {getPatientInitials(patient.firstName, patient.lastName)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{patient.firstName} {patient.lastName}</p>
                                <p className="text-xs text-slate-500">Age: {getPatientAge(patient.dateOfBirth)}</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setShowVisitModal(true)}
                            >
                              Record Visit
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery ? (
                      <p className="text-sm text-slate-500">No patients found</p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              {/* Referrals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="mr-2 h-5 w-5" />
                    Patient Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {referralsLoading ? (
                    <p className="text-sm text-slate-500">Loading referrals...</p>
                  ) : (
                    <div className="space-y-3">
                      {doctorReferrals && doctorReferrals.length > 0 ? (
                        doctorReferrals.slice(0, 3).map((referral: any) => (
                          <div key={referral.id} className="p-3 bg-slate-50 rounded">
                            <p className="font-medium text-sm">{referral.patient?.firstName} {referral.patient?.lastName}</p>
                            <p className="text-xs text-slate-600">{referral.reason}</p>
                            <p className="text-xs text-slate-500">Status: {referral.status}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No active referrals</p>
                      )}
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/referrals">View All Referrals</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Recent Patients - For all roles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPatients && recentPatients.length > 0 ? (
                  recentPatients.slice(0, 5).map((patient: any, index: number) => (
                    <div key={patient.id || index} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                        {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-slate-500">{patient.phone}</p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/patients/${patient.id}`}>View</Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No recent patients</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Medicines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TriangleAlert className="mr-2 h-5 w-5 text-red-500" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockMedicines && lowStockMedicines.length > 0 ? (
                  lowStockMedicines.slice(0, 5).map((medicine: any, index: number) => (
                    <div key={medicine.id || index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div>
                        <p className="font-medium text-sm text-red-800">{medicine.name}</p>
                        <p className="text-xs text-red-600">Stock: {medicine.quantity} {medicine.unit}</p>
                      </div>
                      {user?.role === 'pharmacist' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReorderMedicine(medicine)}
                          className="text-red-700 border-red-300 hover:bg-red-100"
                        >
                          Reorder
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">All medicines well stocked</p>
                )}
                {lowStockMedicines && lowStockMedicines.length > 5 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/pharmacy">View All ({lowStockMedicines.length} items)</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <PatientRegistrationModal
        open={showPatientModal}
        onOpenChange={setShowPatientModal}
      />

      <VisitRecordingModal
        open={showVisitModal}
        onOpenChange={setShowVisitModal}
      />

      <LabResultModal
        open={showLabModal}
        onOpenChange={setShowLabModal}
      />

      {/* Medicine Reorder Modal */}
      <Dialog open={showReorderModal} onOpenChange={setShowReorderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reorder Medicine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="font-medium">{selectedMedicine?.name}</p>
              <p className="text-sm text-slate-600">Current stock: {selectedMedicine?.quantity} {selectedMedicine?.unit}</p>
            </div>
            <div>
              <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
              <Input
                id="reorderQuantity"
                type="number"
                value={reorderQuantity}
                onChange={(e) => setReorderQuantity(e.target.value)}
                placeholder="Enter quantity to add"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleConfirmReorder}
                disabled={!selectedMedicine || !reorderQuantity || reorderMutation.isPending}
                className="flex-1"
              >
                {reorderMutation.isPending ? "Restocking..." : "Confirm Restock"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowReorderModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

        {/* Physiotherapist-Specific Dashboard */}
        {user?.role === 'physiotherapist' && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Physiotherapist Dashboard</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Patient Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search patients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>

                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/patients">View All Patients</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Assigned Referrals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="mr-2 h-5 w-5" />
                    Therapy Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">Referrals assigned to physiotherapy</p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/referrals">View Therapy Referrals</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Doctor-Specific Dashboard */}
        {user?.role === 'doctor' && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Doctor Dashboard</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Search & Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Patient Search & Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search patients by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>

                    {searchQuery && (
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {filteredPatients.slice(0, 5).map((patient) => (
                          <Link
                            key={patient.id}
                            href={`/patients/${patient.id}`}
                            className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {getPatientInitials(patient.firstName, patient.lastName)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-800">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-sm text-slate-500">
                                Age: {getPatientAge(patient.dateOfBirth)} | ID: HC{patient.id.toString().padStart(6, "0")}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    <Button
                      onClick={() => setShowVisitModal(true)}
                      className="w-full"
                    >
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Record New Visit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Doctor Referrals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="mr-2 h-5 w-5" />
                    Referrals Assigned to You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {referralsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : doctorReferrals && doctorReferrals.length > 0 ? (
                    <div className="space-y-3">
                      {doctorReferrals.slice(0, 3).map((referral: any) => (
                        <div key={referral.id} className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-slate-800">
                                Patient: {referral.patient?.firstName} {referral.patient?.lastName}
                              </p>
                              <p className="text-sm text-slate-600 mt-1">
                                From: {referral.fromUser?.username}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                Reason: {referral.reason}
                              </p>
                            </div>
                            <Badge variant={referral.status === 'pending' ? 'outline' : 'secondary'}>
                              {referral.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/referrals">View All Referrals</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <UserCheck className="mx-auto h-8 w-8 text-slate-400" />
                      <p className="mt-2 text-sm text-slate-500">No referrals assigned</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 medical-card animate-fade-in">
          <CardHeader className="medical-card-header">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5 text-blue-600" />
              Recent Patients
            </CardTitle>
          </CardHeader>
          <CardContent className="medical-card-content">
            <div className="space-y-4">
              {recentPatients?.map((patient, index) => (
                <div 
                  key={patient.id} 
                  className="flex items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                      {patient.firstName?.[0]}{patient.lastName?.[0]}
                    </div>
                  </div>
                  <div className="ml-4 flex-1 space-y-1">
                    <p className="text-sm font-semibold leading-none text-gray-900 dark:text-gray-100">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {patient.email}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Registered
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 medical-card animate-fade-in">
          <CardHeader className="medical-card-header">
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="medical-card-content">
            <div className="space-y-3">
              {lowStockMedicines?.slice(0, 5).map((medicine, index) => (
                <div 
                  key={medicine.id} 
                  className="flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-sm"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    borderColor: medicine.stockQuantity === 0 ? 'rgb(239 68 68)' : 'rgb(251 191 36)'
                  }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {medicine.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Stock: {medicine.quantity} {medicine.unit}
                    </p>
                  </div>
                  <div className="ml-3">
                    <Badge 
                      variant={medicine.stockQuantity === 0 ? "destructive" : "secondary"}
                      className={`${
                        medicine.stockQuantity === 0 
                          ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800" 
                          : "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800"
                      } font-medium`}
                    >
                      {medicine.stockQuantity === 0 ? "Out of Stock" : "Low Stock"}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!lowStockMedicines || lowStockMedicines.length === 0) && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">All items are well stocked</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </main>

      {/* Modals */}
      <PatientRegistrationModal
        open={showPatientModal}
        onOpenChange={setShowPatientModal}
      />
      <VisitRecordingModal
        open={showVisitModal}
        onOpenChange={setShowVisitModal}
      />
      <LabResultModal
        open={showLabModal}
        onOpenChange={setShowLabModal}
      />

      {/* Medicine Reorder Modal */}
      <Dialog open={showReorderModal} onOpenChange={setShowReorderModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restock Medicine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Medicine</Label>
              <p className="text-lg font-semibold text-slate-800">{selectedMedicine?.name}</p>
              <p className="text-sm text-slate-600">Current stock: {selectedMedicine?.quantity} {selectedMedicine?.unit}</p>
            </div>

            <div>
              <Label htmlFor="reorder-quantity" className="text-sm font-medium">
                Quantity to Add
              </Label>
              <Input
                id="reorder-quantity"
                type="number"
                value={reorderQuantity}
                onChange={(e) => setReorderQuantity(e.target.value)}
                placeholder="Enter quantity to add"
                className="mt-1"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm text-slate-600">New Total Stock:</p>
              <p className="text-lg font-semibold text-green-600">
                {selectedMedicine && reorderQuantity 
                  ? parseInt(selectedMedicine.quantity) + parseInt(reorderQuantity || "0")
                  : selectedMedicine?.quantity} {selectedMedicine?.unit}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowReorderModal(false)}
                disabled={reorderMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleConfirmReorder}
                disabled={!reorderQuantity || reorderMutation.isPending}
              >
                {reorderMutation.isPending ? "Restocking..." : "Confirm Restock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}