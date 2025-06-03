import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, Calendar, Activity, Search, UserPlus, Plus, 
  Eye, Settings
} from "lucide-react";
import { Link, useLocation } from "wouter";
import PatientRegistrationModal from "@/components/patient-registration-modal";
import { useRole } from "@/components/role-guard";
import { useGlobalShortcuts } from "@/hooks/use-keyboard-shortcuts";

interface DashboardStats {
  totalPatients: number;
  todayVisits: number;
  pendingLabs: number;
  lowStockItems: number;
}

export default function Dashboard() {
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useRole();
  const isAdmin = user?.role === 'admin';
  const [, setLocation] = useLocation();

  // Initialize global keyboard shortcuts
  useGlobalShortcuts();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: allPatients } = useQuery({
    queryKey: ['/api/patients'],
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Healthcare Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg border-b border-blue-800/20 px-6 py-5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h1 className="text-3xl font-bold tracking-tight">Clinical Dashboard</h1>
            <p className="text-blue-100 mt-1 text-lg">Comprehensive healthcare management & patient care overview</p>
          </div>
          <div className="flex items-center space-x-3">
            {(user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse') && (
              <Button 
                onClick={() => setShowPatientModal(true)} 
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                New Patient
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Healthcare Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0"
              onClick={() => setLocation('/patients')}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-2">Total Patients</p>
                    <div className="text-4xl font-bold text-white mb-1">{stats?.totalPatients || 1}</div>
                    <p className="text-emerald-100 text-xs">Registered in system</p>
                  </div>
                  <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center group-hover:bg-white/25 transition-colors">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12"></div>
              </CardHeader>
            </Card>

            <Card 
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0"
              onClick={() => setLocation('/appointments')}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-2">Today's Visits</p>
                    <div className="text-4xl font-bold text-white mb-1">{stats?.todayVisits || 1}</div>
                    <p className="text-blue-100 text-xs">Scheduled appointments</p>
                  </div>
                  <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center group-hover:bg-white/25 transition-colors">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12"></div>
              </CardHeader>
            </Card>

            <Card 
              className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0"
              onClick={() => setLocation('/lab-orders')}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-amber-100 text-sm font-medium uppercase tracking-wider mb-2">Pending Labs</p>
                    <div className="text-4xl font-bold text-white mb-1">{stats?.pendingLabs || 11}</div>
                    <p className="text-amber-100 text-xs">Awaiting results</p>
                  </div>
                  <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center group-hover:bg-white/25 transition-colors">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12"></div>
              </CardHeader>
            </Card>

            <Card 
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0"
              onClick={() => setLocation('/pharmacy')}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-purple-100 text-sm font-medium uppercase tracking-wider mb-2">Pharmacy Stock</p>
                    <div className="text-4xl font-bold text-white mb-1">{stats?.lowStockItems || 0}</div>
                    <p className="text-purple-100 text-xs">Inventory items</p>
                  </div>
                  <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center group-hover:bg-white/25 transition-colors">
                    <Settings className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12"></div>
              </CardHeader>
            </Card>
          </div>

          {/* Quick Actions & Patient Search */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Search */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                  <Search className="mr-3 h-5 w-5 text-blue-600" />
                  Patient Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search patients by name, phone, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                {searchQuery && allPatients && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {(allPatients as any[])
                      .filter((patient: any) => 
                        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        patient.phone?.includes(searchQuery)
                      )
                      .slice(0, 5)
                      .map((patient: any) => (
                        <div
                          key={patient.id}
                          className="p-3 bg-slate-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => setLocation(`/patients/${patient.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">
                                {patient.title} {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-sm text-slate-600">{patient.phone}</p>
                            </div>
                            <Eye className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center">
                  <Plus className="mr-3 h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/appointments" className="block">
                  <Button className="w-full justify-start h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Calendar className="mr-3 h-4 w-4" />
                    Schedule Appointment
                  </Button>
                </Link>
                <Link href="/lab-orders" className="block">
                  <Button variant="outline" className="w-full justify-start h-12 border-slate-200 hover:bg-slate-50">
                    <Activity className="mr-3 h-4 w-4 text-amber-600" />
                    Order Lab Test
                  </Button>
                </Link>
                <Link href="/prescriptions" className="block">
                  <Button variant="outline" className="w-full justify-start h-12 border-slate-200 hover:bg-slate-50">
                    <Plus className="mr-3 h-4 w-4 text-green-600" />
                    Write Prescription
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Patient Registration Modal */}
      <PatientRegistrationModal 
        open={showPatientModal} 
        onOpenChange={setShowPatientModal} 
      />
    </div>
  );
}