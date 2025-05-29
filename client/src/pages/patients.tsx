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
      {/* Fixed Header Section */}
      <div className="fixed-header-section">
        <div className="fixed-header-content">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Patient Management</h1>
              <p className="text-slate-600 mt-1">Comprehensive patient records and healthcare management</p>
            </div>
            <div className="flex items-center space-x-3">
              {(user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse') && (
                <Button onClick={() => setShowPatientModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Patient
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Tab Navigation */}
      <div className="fixed-tabs-container">
        <div className="px-6 py-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100">
              <TabsTrigger value="patients" className="flex items-center gap-2 text-slate-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                <Users className="w-4 h-4" />
                Patient Records
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 text-slate-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-2 text-slate-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                <Calendar className="w-4 h-4" />
                Appointments
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="scrollable-content bg-slate-50">
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