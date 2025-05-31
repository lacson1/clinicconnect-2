import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTube, Plus, FileText, Clock, User, Calendar, Eye, Printer } from "lucide-react";
import { format } from "date-fns";
import LabResultEntry from "@/components/lab-result-entry-fixed";
import LabOrderForm from "@/components/lab-order-form";
import { useRole } from "@/components/role-guard";

interface LabOrder {
  id: number;
  patientId: number;
  orderedBy: number;
  status: string;
  createdAt: string;
  patient?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  };
}

// Component for displaying pending lab orders
function PendingLabOrders() {
  const { data: pendingOrders = [], isLoading } = useQuery<LabOrder[]>({
    queryKey: ['/api/lab-orders/pending']
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 animate-spin" />
            Loading pending orders...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Lab Orders ({pendingOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending lab orders</p>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Order #{order.id}</Badge>
                        <Badge variant="secondary">{order.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {order.patient?.firstName} {order.patient?.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(order.createdAt), 'PPp')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="w-4 h-4 mr-1" />
                        Print
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Component for displaying completed lab results
function CompletedLabResults() {
  const { data: completedOrders = [], isLoading } = useQuery<LabOrder[]>({
    queryKey: ['/api/lab-orders/completed']
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 animate-spin" />
            Loading completed results...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Completed Lab Results ({completedOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No completed lab results</p>
          ) : (
            <div className="space-y-4">
              {completedOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Order #{order.id}</Badge>
                        <Badge variant="default">Completed</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {order.patient?.firstName} {order.patient?.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(order.createdAt), 'PPp')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Results
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="w-4 h-4 mr-1" />
                        Print Report
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LabResults() {
  const { user } = useRole();
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Fixed Header Section */}
      <div className="bg-gray-50 border-b border-gray-200 p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <TestTube className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Laboratory Results</h1>
            <p className="text-sm text-gray-600">
              Manage pending lab orders and enter test results
            </p>
          </div>
        </div>

        {user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse' ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Pending Orders
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Enter Results
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Completed Results
              </TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse' ? (
          <div className="w-full">
            <TabsContent value="pending">
              <PendingLabOrders />
            </TabsContent>
            
            <TabsContent value="results">
              <LabResultEntry />
            </TabsContent>
            
            <TabsContent value="completed">
              <CompletedLabResults />
            </TabsContent>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Access Restricted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You don't have permission to access the laboratory results management system. 
                Please contact your administrator if you need access.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}