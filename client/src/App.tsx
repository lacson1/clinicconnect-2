import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/top-bar";
import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import PatientProfile from "@/pages/patient-profile";
import Visits from "@/pages/visits";
import LabResults from "@/pages/lab-results";
import Pharmacy from "@/pages/pharmacy";
import Referrals from "@/pages/referrals";
import ProfilePage from "@/pages/profile";
import UserManagement from "@/pages/user-management";
import AuditLogs from "@/pages/audit-logs";
import FormBuilder from "@/pages/form-builder";
import ClinicalPerformance from "@/pages/clinical-performance";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-8">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/patients" component={Patients} />
              <Route path="/patients/:id" component={PatientProfile} />
              <Route path="/visits" component={Visits} />
              <Route path="/lab-results" component={LabResults} />
              <Route path="/pharmacy" component={Pharmacy} />
              <Route path="/referrals" component={Referrals} />
              <Route path="/form-builder" component={FormBuilder} />
              <Route path="/clinical-performance" component={ClinicalPerformance} />
              <Route path="/profile" component={ProfilePage} />
              <Route path="/user-management" component={UserManagement} />
              <Route path="/audit-logs" component={AuditLogs} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
