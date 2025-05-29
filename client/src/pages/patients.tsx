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
  const { user } = useRole();

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Patient Management</h1>
          <p className="text-slate-600 mt-1">Advanced patient records, analytics, and appointment management</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse') && (
          <Button onClick={() => setShowPatientModal(true)} className="bg-primary hover:bg-primary/90">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Patient
          </Button>
        )}
      </div>

      {/* Enhanced Tabs */}
      <Tabs defaultValue="patients" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Patient Records
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Appointments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="mt-6">
          <EnhancedPatientManagementFixed user={user} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <PatientAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          <SmartAppointmentScheduler />
        </TabsContent>
      </Tabs>

      {/* Patient Registration Modal */}
      <PatientRegistrationModal 
        open={showPatientModal} 
        onOpenChange={setShowPatientModal} 
      />
    </div>
  );
}