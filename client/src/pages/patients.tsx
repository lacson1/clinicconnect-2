import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, Users, Calendar, UserPlus
} from "lucide-react";
import PatientRegistrationModal from "@/components/patient-registration-modal";
import SmartAppointmentScheduler from "@/components/smart-appointment-scheduler";
import EnhancedPatientManagementFixed from "@/components/enhanced-patient-management-fixed";
import PatientAnalyticsDashboard from "@/components/patient-analytics-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/components/role-guard";

export default function Patients() {
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [activeTab, setActiveTab] = useState("patients");
  const { user } = useRole();

  return (
    <div className="fixed-layout-container">
      {/* Enhanced Fixed Header Section */}
      <div className="fixed-header-section">
        <div className="fixed-header-content healthcare-header">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-sm">Patient Management</h1>
              <p className="text-white/90 mt-1 font-medium">Manage patient records and coordinate care</p>
            </div>
            <div className="flex items-center space-x-3">
              {(user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse') && (
                <Button onClick={() => setShowPatientModal(true)} className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white shadow-lg transition-all duration-200">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Patient
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Fixed Tab Navigation */}
      <div className="fixed-tabs-container bg-white/95 backdrop-blur-md border-b border-border/60 shadow-sm sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-3.5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="inline-flex h-12 items-center justify-start rounded-xl bg-gradient-to-r from-slate-50/80 to-blue-50/50 backdrop-blur-sm border border-slate-200/60 p-1.5 text-muted-foreground shadow-inner w-full sm:w-auto gap-1">
              <TabsTrigger 
                value="patients" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/30 data-[state=active]:scale-[1.02] hover:bg-white/70 hover:text-foreground hover:scale-[1.01] relative"
              >
                <Users className="w-4 h-4 transition-transform data-[state=active]:scale-110" />
                <span className="hidden sm:inline">Patient Records</span>
                <span className="sm:hidden">Records</span>
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-200 data-[state=active]:w-3/4"></span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/30 data-[state=active]:scale-[1.02] hover:bg-white/70 hover:text-foreground hover:scale-[1.01] relative"
              >
                <BarChart3 className="w-4 h-4 transition-transform data-[state=active]:scale-110" />
                <span>Analytics</span>
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-200 data-[state=active]:w-3/4"></span>
              </TabsTrigger>
              <TabsTrigger 
                value="appointments" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/30 data-[state=active]:scale-[1.02] hover:bg-white/70 hover:text-foreground hover:scale-[1.01] relative"
              >
                <Calendar className="w-4 h-4 transition-transform data-[state=active]:scale-110" />
                <span className="hidden sm:inline">Appointments</span>
                <span className="sm:hidden">Appts</span>
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-200 data-[state=active]:w-3/4"></span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="scrollable-content bg-gradient-to-br from-slate-50/60 via-white to-blue-50/30">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="w-full max-w-7xl mx-auto">
            <TabsContent value="patients" className="mt-0">
              <EnhancedPatientManagementFixed user={user} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <PatientAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="appointments" className="mt-0">
              <SmartAppointmentScheduler />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Patient Registration Modal */}
      <PatientRegistrationModal 
        open={showPatientModal} 
        onOpenChange={setShowPatientModal} 
      />
    </div>
  );
}